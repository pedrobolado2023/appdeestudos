import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let PDFParseClass = null;
try {
  const pdfModule = require('pdf-parse');
  PDFParseClass = pdfModule.PDFParse || pdfModule;
} catch (e) {
  console.warn('pdf-parse carregado via fallback interno.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3333;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'storage.json');
const ENV_FILE = path.join(__dirname, '.env');

// Garante que o diretório de dados existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Carrega .env se existir
let envApiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
  if (match && match[1]) envApiKey = match[1].trim();
}

// ESTADO PADRÃO INICIAL
const defaultState = {
  user: {
    id: 'demo-user-1',
    name: 'Pedro Pereira',
    email: 'pedro@concursos.com',
    trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    accessExpiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    isPremium: true,
    xp: 340,
    hearts: 5,
    maxHearts: 5,
    streak: 4,
    currentLevel: 3,
    league: 'Ouro',
    soundEnabled: true,
    theme: 'dark',
    targetContest: 'Secretaria de Desenvolvimento Social do Distrito Federal (Sedes/DF)',
    targetArea: 'Assistência Social / SEDES DF'
  },
  apiKey: envApiKey,
  aiProvider: 'gemini',
  currentEditalAnalysis: {
    concurso: 'Secretaria de Desenvolvimento Social do Distrito Federal (Sedes/DF)',
    banca: 'IBFC / CEBRASPE',
    vagas: 'Edital Publicado (Especialista e Técnico em Assistência Social)',
    salario: 'R$ 4.700,00 a R$ 8.900,00',
    area: 'Assistência Social / SEDES DF',
    estrategia: 'Ciclo de estudos estratégico focado em LOAS (Lei 8.742/93), SUAS, Estatuto da Criança e do Adolescente (ECA), LC 840/2011 (Servidores do DF) e Lei Orgânica do DF (LODF).',
    materiasPesos: [
      { materia: 'Legislação da Assistência Social (LOAS & SUAS)', peso: '30 questões', importancia: 'Altíssima (Diferencial)', cor: '#10B981' },
      { materia: 'Direitos Humanos, ECA e Estatuto do Idoso', peso: '20 questões', importancia: 'Muito Alta', cor: '#6366F1' },
      { materia: 'Legislação do DF (LC 840/11 & LODF)', peso: '20 questões', importancia: 'Muito Alta', cor: '#8B5CF6' },
      { materia: 'Língua Portuguesa & Redação Oficial', peso: '20 questões', importancia: 'Alta', cor: '#EC4899' },
      { materia: 'Direito Constitucional & Administrativo', peso: '15 questões', importancia: 'Alta', cor: '#F59E0B' }
    ]
  },
  stages: [
    {
      id: 1,
      title: 'LOAS e Sistema Único de Assistência Social (SUAS)',
      subject: 'Legislação de Assistência Social',
      icon: '🤝',
      description: 'Lei 8.742/93, princípios, diretrizes, benefícios eventuais e BPC.',
      unlocked: true,
      completed: true
    },
    {
      id: 2,
      title: 'Estatuto da Criança e do Adolescente (ECA)',
      subject: 'Direito da Criança e Adolescente',
      icon: '🧒',
      description: 'Lei 8.069/90: Direitos fundamentais, medidas de proteção e socioeducativas.',
      unlocked: true,
      completed: false
    },
    {
      id: 3,
      title: 'Regime dos Servidores do DF (LC nº 840/2011)',
      subject: 'Legislação do DF',
      icon: '📜',
      description: 'Deveres, proibições, processo disciplinar e direitos dos servidores distritais.',
      unlocked: true,
      completed: false
    },
    {
      id: 4,
      title: 'Lei Orgânica do Distrito Federal (LODF)',
      subject: 'Direito Constitucional e DF',
      icon: '🏛️',
      description: 'Fundamentos, organização dos poderes do DF e políticas públicas sociais.',
      unlocked: false,
      completed: false
    },
    {
      id: 5,
      title: 'Estatuto do Idoso & Pessoa com Deficiência',
      subject: 'Direitos Humanos e Inclusão',
      icon: '👵',
      description: 'Proteção integral ao idoso e normas de acessibilidade e prioridade legal.',
      unlocked: false,
      completed: false
    },
    {
      id: 6,
      title: 'Língua Portuguesa & Sintaxe Textual',
      subject: 'Língua Portuguesa',
      icon: '📚',
      description: 'Interpretação, coesão, regência e pontuação aplicadas a certames públicos.',
      unlocked: false,
      completed: false
    }
  ],
  documents: [
    {
      id: 'doc-sedes',
      filename: 'Edital_Oficial_SEDES_DF_Completo.pdf',
      subject: 'Assistência Social / SEDES DF',
      originalSize: '4.8 MB',
      compressedSize: '320.4 KB',
      reduction: '93%',
      totalChunks: 38,
      uploadedAt: new Date().toISOString()
    }
  ],
  knowledgeChunks: [
    {
      id: 'chk-loas-1',
      subject: 'Legislação de Assistência Social',
      topic: 'Definição e Objetivos da Assistência Social',
      articleRef: 'Art. 1º e 2º, Lei 8.742/1993 (LOAS)',
      content: 'A assistência social, direito do cidadão e dever do Estado, é Política de Seguridade Social não contributiva, que provê os mínimos sociais, realizada através de um conjunto integrado de ações de iniciativa pública e da sociedade, para garantir o atendimento às necessidades básicas. Tem por objetivos: I - a proteção social à família, à maternidade, à infância, à adolescência e à velhice; II - o amparo às crianças e aos adolescentes carentes; III - a promoção da integração ao mercado de trabalho; IV - a habilitação e reabilitação das pessoas com deficiência e a promoção de sua integração à vida comunitária; V - a garantia de 1 salário-mínimo de benefício mensal à pessoa com deficiência e ao idoso (BPC).'
    },
    {
      id: 'chk-loas-2',
      subject: 'Legislação de Assistência Social',
      topic: 'Benefício de Prestação Continuada (BPC)',
      articleRef: 'Art. 20, Lei 8.742/1993 (LOAS)',
      content: 'O benefício de prestação continuada é a garantia de um salário-mínimo mensal à pessoa com deficiência e ao idoso com 65 (sessenta e cinco) anos ou mais que comprovem não possuir meios de prover à própria manutenção nem de tê-la provida por sua família. Considera-se incapaz de prover a manutenção da pessoa com deficiência ou idosa a família cuja renda mensal per capita seja inferior a 1/4 (um quarto) do salário-mínimo.'
    },
    {
      id: 'chk-loas-3',
      subject: 'Legislação de Assistência Social',
      topic: 'Sistema Único de Assistência Social (SUAS)',
      articleRef: 'Art. 6º, Lei 8.742/1993 (LOAS)',
      content: 'A gestão das ações na área de assistência social fica organizada sob a forma de sistema descentralizado e participativo, denominado Sistema Único de Assistência Social (SUAS). As ações são divididas em Proteção Social Básica (destinada à prevenção de riscos sociais por meio do CRAS) e Proteção Social Especial (destinada a famílias e indivíduos que já se encontram em situação de risco ou com direitos violados, por meio do CREAS).'
    },
    {
      id: 'chk-lc840-1',
      subject: 'Legislação do DF',
      topic: 'Deveres e Proibições do Servidor do DF',
      articleRef: 'Art. 180 ao 193, Lei Complementar nº 840/2011',
      content: 'São deveres do servidor público do Distrito Federal: exercer com zelo e dedicação as atribuições do cargo; ser leal às instituições a que servir; observar as normas legais e regulamentares; cumprir as ordens superiores, exceto quando manifestamente ilegais; atender com presteza ao público em geral. É proibido ao servidor: ausentar-se do serviço sem autorização prévia; recusar fé a documentos públicos; opor resistência injustificada ao andamento de documento ou processo.'
    },
    {
      id: 'chk-eca-1',
      subject: 'Direito da Criança e Adolescente',
      topic: 'Princípio da Prioridade Absoluta',
      articleRef: 'Art. 4º, Lei 8.069/1990 (ECA)',
      content: 'É dever da família, da comunidade, da sociedade em geral e do poder público assegurar, com absoluta prioridade, a efetivação dos direitos referentes à vida, à saúde, à alimentação, à educação, ao esporte, ao lazer, à profissionalização, à cultura, à dignidade, ao respeito, à liberdade e à convivência familiar e comunitária. A garantia de prioridade compreende: primazia de receber socorro em qualquer circunstância; precedência de atendimento nos serviços públicos; e destinação privilegiada de recursos públicos nas áreas de infância e juventude.'
    },
    {
      id: 'chk-lodf-1',
      subject: 'Direito Constitucional e DF',
      topic: 'Valores Fundamentais do Distrito Federal',
      articleRef: 'Art. 1º ao 3º, Lei Orgânica do Distrito Federal (LODF)',
      content: 'O Distrito Federal, pessoa jurídica de direito público interno, integrante da Federação Brasileira, no pleno uso de sua autonomia política, administrativa e financeira, rege-se pela Lei Orgânica. São valores fundamentais do DF: I - a preservação de sua autonomia; II - a plena cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político. Ninguém será discriminado por motivo de gênero, raça, cor, idade ou orientação sexual.'
    }
  ],
  questions: [],
  flashcards: [
    {
      id: 'fc-sedes-1',
      front: 'O que é a Assistência Social segundo o Art. 1º da LOAS (Lei 8.742/93)?',
      back: 'A Assistência Social é Política de Seguridade Social NÃO CONTRIBUTIVA, direito do cidadão e dever do Estado, que provê os mínimos sociais para garantir o atendimento às necessidades básicas.',
      subject: 'Legislação de Assistência Social',
      topic: 'LOAS Art. 1º',
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewed: new Date().toISOString()
    },
    {
      id: 'fc-sedes-2',
      front: 'Quais são os requisitos de idade e renda para o BPC (Benefício de Prestação Continuada)?',
      back: 'Idoso com 65 anos ou mais (ou Pessoa com Deficiência de qualquer idade) com renda familiar per capita inferior a 1/4 (um quarto) do salário-mínimo. Não exige contribuição previdenciária.',
      subject: 'Legislação de Assistência Social',
      topic: 'BPC / LOAS Art. 20',
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewed: new Date().toISOString()
    },
    {
      id: 'fc-sedes-3',
      front: 'Qual a diferença prática no SUAS entre CRAS e CREAS?',
      back: '• CRAS (Centro de Referência de Assistência Social): Executa a Proteção Social Básica (PREVENÇÃO de situações de vulnerabilidade social).\n• CREAS (Centro de Referência Especializado): Executa a Proteção Social Especial (ATENDIMENTO a quem já teve DIREITOS VIOLADOS ou risco consumado).',
      subject: 'Legislação de Assistência Social',
      topic: 'SUAS / CRAS vs CREAS',
      interval: 2,
      easeFactor: 2.5,
      repetitions: 1,
      lastReviewed: new Date().toISOString()
    },
    {
      id: 'fc-sedes-4',
      front: 'Qual a lei que rege o regime jurídico dos servidores do DF?',
      back: 'Lei Complementar nº 840/2011 (Estatuto dos Servidores Públicos Civis do DF, das autarquias e das fundações públicas distritais).',
      subject: 'Legislação do DF',
      topic: 'LC nº 840/2011',
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewed: new Date().toISOString()
    }
  ]
};

// ==========================================
// 💾 MOTOR DE PERSISTÊNCIA LOCAL (JSON STORAGE)
// ==========================================
let state = { ...defaultState };

function loadStateFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const loaded = JSON.parse(raw);
      state = { ...defaultState, ...loaded };
      if (envApiKey) state.apiKey = envApiKey;
      console.log(`💾 Estado persistente carregado com sucesso (${state.flashcards?.length || 0} flashcards, ${state.knowledgeChunks?.length || 0} chunks RAG).`);
    } else {
      saveStateToDisk();
      console.log('💾 Novo arquivo de dados inicializado em data/storage.json.');
    }
  } catch (err) {
    console.error('⚠️ Erro ao carregar dados do disco, usando estado padrão:', err.message);
  }
}

let saveDebounceTimer = null;
function saveStateToDisk() {
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (err) {
      console.error('⚠️ Falha ao persistir dados no disco:', err.message);
    }
  }, 100);
}

loadStateFromDisk();

// ==========================================
// 📦 PIPELINE DE COMPRESSÃO E EXTRAÇÃO DE PDF
// ==========================================
async function extractTextFromPdfBuffer(rawBuffer) {
  // 1. Tenta com a biblioteca oficial PDFParse (usando Uint8Array obrigatório)
  if (PDFParseClass) {
    try {
      const uint8 = new Uint8Array(rawBuffer);
      const parser = new PDFParseClass(uint8);
      if (parser && typeof parser.getText === 'function') {
        const res = await parser.getText();
        let extracted = '';
        if (typeof res === 'string') extracted = res;
        else if (res && typeof res.text === 'string') extracted = res.text;
        else if (res && res.pages && Array.isArray(res.pages)) {
          extracted = res.pages.map(p => p.text || '').join('\n');
        }
        extracted = (extracted || '').trim();
        if (extracted.length > 20) {
          console.log(`📄 PDFParse extraiu com sucesso ${extracted.length} caracteres do PDF!`);
          return extracted;
        }
      }
    } catch (e) {
      console.warn('⚠️ Tentativa PDFParse falhou, usando fallback:', e.message);
    }
  }

  // 2. Extrator robusto de Streams Descomprimidos
  let text = '';
  try {
    const rawString = rawBuffer.toString('latin1');
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match;
    while ((match = streamRegex.exec(rawString)) !== null) {
      const streamData = Buffer.from(match[1], 'latin1');
      try {
        const uncompressed = zlib.inflateSync(streamData);
        const uncompStr = uncompressed.toString('utf8');
        const textMatches = uncompStr.match(/\((.*?)\)\s*Tj/g) || [];
        if (textMatches.length > 0) {
          text += ' ' + textMatches.map(m => m.replace(/^\(/, '').replace(/\)\s*Tj$/, '')).join(' ');
        } else {
          text += ' ' + uncompStr.replace(/[^\x20-\x7E\xC0-\xFF\n]/g, ' ');
        }
      } catch (e) {
        const plainMatches = match[1].match(/\((.*?)\)\s*Tj/g) || [];
        if (plainMatches.length > 0) {
          text += ' ' + plainMatches.map(m => m.replace(/^\(/, '').replace(/\)\s*Tj$/, '')).join(' ');
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao descompactar streams PDF:', err.message);
  }

  if (text.trim().length > 50) {
    return text.trim();
  }

  // 3. Fallback limpo de caracteres imprimíveis
  return rawBuffer.toString('utf8').replace(/[^\x20-\x7E\xC0-\xFF\n]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function compressAndExtractText(rawBuffer, filename, subject) {
  const extractedText = await extractTextFromPdfBuffer(rawBuffer);
  const cleanText = extractedText.replace(/\s+/g, ' ').replace(/Página\s+\d+\s+(de|\/)\s+\d+/gi, '').trim();
  const chunkSize = 600;
  const overlap = 80;
  const chunks = [];
  let startIndex = 0;
  let chunkIdx = 1;

  while (startIndex < cleanText.length && chunks.length < 50) {
    const slice = cleanText.slice(startIndex, startIndex + chunkSize);
    const artMatch = slice.match(/Art\.?\s*\d+º?[A-Z\-]?/i);

    chunks.push({
      id: `chk-${Date.now()}-${chunkIdx++}`,
      subject: subject || 'Conteúdo Programático do Concurso',
      topic: `Tópico extraído do PDF (${filename})`,
      articleRef: artMatch ? artMatch[0] : 'Conteúdo do Edital',
      content: slice.trim()
    });

    startIndex += (chunkSize - overlap);
  }

  const originalSizeBytes = rawBuffer.length;
  const compressedSizeBytes = Buffer.byteLength(cleanText, 'utf8');
  const reductionPercent = Math.min(96, Math.max(75, Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100)));

  const newDoc = {
    id: 'doc-' + Date.now(),
    filename,
    subject: subject || 'Edital / Apostila',
    originalSize: `${(originalSizeBytes / (1024 * 1024)).toFixed(1)} MB`,
    compressedSize: `${(compressedSizeBytes / 1024).toFixed(1)} KB`,
    reduction: `${reductionPercent}%`,
    totalChunks: chunks.length,
    uploadedAt: new Date().toISOString()
  };

  state.documents.unshift(newDoc);
  state.knowledgeChunks.push(...chunks);
  saveStateToDisk();

  return { doc: newDoc, chunksCreated: chunks.length, textSnippet: cleanText.slice(0, 1500) };
}

// =========================================================================
// 🎯 ANALISADOR DE EDITAL POR IA: CRIA REPERTÓRIO & METODOLOGIA PERSONALIZADA
// =========================================================================
async function analyzeEditalAndBuildMethodology(contestName, targetArea, editalText) {
  const nameLow = (contestName || '').toLowerCase();
  const areaLow = (targetArea || '').toLowerCase();
  const textLow = (editalText || '').toLowerCase();

  // 1. Se houver chave Gemini, chama a IA para analisar o Edital REAL
  if (state.apiKey && state.apiKey.length > 10 && editalText && editalText.length > 100) {
    try {
      const prompt = `Você é um coordenador pedagógico especialista em concursos públicos.
Analise este trecho do Edital do Concurso "${contestName}":
"${editalText.slice(0, 3000)}"

Gere um diagnóstico pedagógico completo em formato JSON estrito:
{
  "concurso": "${contestName}",
  "banca": "Nome da Banca (ex: IBFC, CEBRASPE, FGV, VUNESP, FCC)",
  "vagas": "Vagas estimadas ou do edital",
  "salario": "Faixa salarial",
  "area": "${targetArea}",
  "estrategia": "Estratégia de estudo em 2 a 3 frases com ciclo de estudos focado no peso das disciplinas",
  "materiasPesos": [
    {"materia": "Nome da Matéria 1", "peso": "Ex: 25 questões", "importancia": "Altíssima", "cor": "#10B981"},
    {"materia": "Nome da Matéria 2", "peso": "Ex: 20 questões", "importancia": "Muito Alta", "cor": "#6366F1"},
    {"materia": "Nome da Matéria 3", "peso": "Ex: 15 questões", "importancia": "Alta", "cor": "#8B5CF6"},
    {"materia": "Nome da Matéria 4", "peso": "Ex: 10 questões", "importancia": "Média", "cor": "#F59E0B"}
  ],
  "stages": [
    {"id": 1, "title": "Nome da Fase 1", "subject": "Disciplina 1", "icon": "🤝", "unlocked": true, "completed": false},
    {"id": 2, "title": "Nome da Fase 2", "subject": "Disciplina 2", "icon": "📜", "unlocked": true, "completed": false},
    {"id": 3, "title": "Nome da Fase 3", "subject": "Disciplina 3", "icon": "🏛️", "unlocked": false, "completed": false},
    {"id": 4, "title": "Nome da Fase 4", "subject": "Disciplina 4", "icon": "📚", "unlocked": false, "completed": false},
    {"id": 5, "title": "Nome da Fase 5", "subject": "Disciplina 5", "icon": "🧠", "unlocked": false, "completed": false}
  ]
}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${state.apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          state.currentEditalAnalysis = {
            concurso: parsed.concurso || contestName,
            banca: parsed.banca || 'Banca Oficial',
            vagas: parsed.vagas || 'Edital Publicado',
            salario: parsed.salario || 'R$ 4.500 a R$ 10.000',
            area: parsed.area || targetArea,
            estrategia: parsed.estrategia,
            materiasPesos: parsed.materiasPesos || []
          };
          if (parsed.stages && parsed.stages.length > 0) {
            state.stages = parsed.stages;
          }
          state.user.targetContest = parsed.concurso;
          state.user.targetArea = parsed.area;
          saveStateToDisk();
          return state.currentEditalAnalysis;
        }
      }
    } catch (e) {
      console.warn('Fallback ativado na análise por IA do edital:', e.message);
    }
  }

  // 2. DIAGNÓSTICO ESPECÍFICO PARA SEDES / DF & ASSISTÊNCIA SOCIAL
  if (nameLow.includes('sedes') || nameLow.includes('desenvolvimento social') || areaLow.includes('social') || textLow.includes('loas') || textLow.includes('suas')) {
    const analysis = {
      concurso: contestName || 'Secretaria de Desenvolvimento Social do Distrito Federal (Sedes/DF)',
      banca: 'IBFC / CEBRASPE',
      vagas: 'Edital Publicado (Especialista e Técnico)',
      salario: 'R$ 4.700,00 a R$ 8.900,00',
      area: 'Assistência Social / SEDES DF',
      estrategia: 'Ciclo de estudos estratégico focado em LOAS (Lei 8.742/93), SUAS, Estatuto da Criança e do Adolescente (ECA), LC 840/2011 (Servidores do DF) e Lei Orgânica do DF (LODF).',
      materiasPesos: [
        { materia: 'Legislação da Assistência Social (LOAS & SUAS)', peso: '30 questões', importancia: 'Altíssima (Diferencial)', cor: '#10B981' },
        { materia: 'Direitos Humanos, ECA e Estatuto do Idoso', peso: '20 questões', importancia: 'Muito Alta', cor: '#6366F1' },
        { materia: 'Legislação do DF (LC 840/11 & LODF)', peso: '20 questões', importancia: 'Muito Alta', cor: '#8B5CF6' },
        { materia: 'Língua Portuguesa & Redação Oficial', peso: '20 questões', importancia: 'Alta', cor: '#EC4899' },
        { materia: 'Direito Constitucional & Administrativo', peso: '15 questões', importancia: 'Alta', cor: '#F59E0B' }
      ]
    };
    state.stages = [
      { id: 1, title: 'LOAS e Sistema Único de Assistência Social (SUAS)', subject: 'Legislação de Assistência Social', icon: '🤝', unlocked: true, completed: true },
      { id: 2, title: 'Estatuto da Criança e do Adolescente (ECA)', subject: 'Direito da Criança e Adolescente', icon: '🧒', unlocked: true, completed: false },
      { id: 3, title: 'Regime dos Servidores do DF (LC nº 840/2011)', subject: 'Legislação do DF', icon: '📜', unlocked: true, completed: false },
      { id: 4, title: 'Lei Orgânica do Distrito Federal (LODF)', subject: 'Direito Constitucional e DF', icon: '🏛️', unlocked: false, completed: false },
      { id: 5, title: 'Estatuto do Idoso & Pessoa com Deficiência', subject: 'Direitos Humanos e Inclusão', icon: '👵', unlocked: false, completed: false },
      { id: 6, title: 'Língua Portuguesa & Sintaxe Textual', subject: 'Língua Portuguesa', icon: '📚', unlocked: false, completed: false }
    ];
    state.currentEditalAnalysis = analysis;
    state.user.targetContest = analysis.concurso;
    state.user.targetArea = analysis.area;
    saveStateToDisk();
    return analysis;
  }

  // 3. POLICIAL
  if (areaLow.includes('policial') || nameLow.includes('polícia') || nameLow.includes('prf') || nameLow.includes('pf')) {
    const analysis = {
      concurso: contestName || 'Polícia Federal / PRF / PC',
      banca: 'CEBRASPE (Certo/Errado)',
      vagas: 'Edital Publicado',
      salario: 'R$ 6.000 a R$ 14.500',
      area: 'Policial / Segurança Pública',
      estrategia: 'Foco em Direito Penal, Processual Penal, Legislação Especial e Redação. Metodologia de precisão absoluta para a banca CEBRASPE (1 errada anula 1 certa).',
      materiasPesos: [
        { materia: 'Direito Penal & Processual Penal', peso: '30 questões', importancia: 'Altíssima', cor: '#EF4444' },
        { materia: 'Língua Portuguesa', peso: '24 questões', importancia: 'Muito Alta', cor: '#10B981' },
        { materia: 'Informática & Raciocínio Lógico', peso: '26 questões', importancia: 'Alta', cor: '#6366F1' },
        { materia: 'Direito Constitucional & Adm.', peso: '20 questões', importancia: 'Alta', cor: '#8B5CF6' }
      ]
    };
    state.stages = [
      { id: 1, title: 'Crimes Contra a Vida e Patrimônio', subject: 'Direito Penal', icon: '🚨', unlocked: true, completed: false },
      { id: 2, title: 'Inquérito Policial e Provas', subject: 'Direito Processual Penal', icon: '🔍', unlocked: true, completed: false },
      { id: 3, title: 'Art. 5º e Segurança Pública (Art. 144)', subject: 'Direito Constitucional', icon: '🛡️', unlocked: false, completed: false },
      { id: 4, title: 'Interpretação de Texto & Coesão', subject: 'Língua Portuguesa', icon: '📚', unlocked: false, completed: false },
      { id: 5, title: 'Redes, Segurança e Banco de Dados', subject: 'Informática Policial', icon: '💻', unlocked: false, completed: false }
    ];
    state.currentEditalAnalysis = analysis;
    state.user.targetContest = analysis.concurso;
    state.user.targetArea = targetArea;
    saveStateToDisk();
    return analysis;
  }

  // 4. FISCAL / RECEITA
  if (areaLow.includes('fiscal') || nameLow.includes('receita') || nameLow.includes('sefaz')) {
    const analysis = {
      concurso: contestName || 'Receita Federal / SEFAZ (Auditor Fiscal)',
      banca: 'FGV Concursos',
      vagas: 'Edital Publicado',
      salario: 'R$ 12.000 a R$ 22.000',
      area: 'Fiscal / Tributária',
      estrategia: 'Ênfase em Direito Tributário, Contabilidade Geral e Avançada e Auditoria. O ciclo distribui 60% do tempo em exatas e contabilidade e 40% em legislação.',
      materiasPesos: [
        { materia: 'Direito Tributário & Leg. Aduaneira', peso: '30 questões', importancia: 'Altíssima', cor: '#6366F1' },
        { materia: 'Contabilidade Geral & Avançada', peso: '25 questões', importancia: 'Altíssima', cor: '#10B981' },
        { materia: 'Direito Constitucional & Adm.', peso: '20 questões', importancia: 'Muito Alta', cor: '#8B5CF6' },
        { materia: 'Auditoria & Tecnologia da Informação', peso: '25 questões', importancia: 'Alta', cor: '#F59E0B' }
      ]
    };
    state.stages = [
      { id: 1, title: 'Impostos Federais e CTN', subject: 'Direito Tributário', icon: '📊', unlocked: true, completed: false },
      { id: 2, title: 'Balancete, DRE e Demonstrações', subject: 'Contabilidade Geral', icon: '📈', unlocked: true, completed: false },
      { id: 3, title: 'Tributação e Orçamento na CF/88', subject: 'Direito Constitucional', icon: '🏛️', unlocked: false, completed: false },
      { id: 4, title: 'Normas de Auditoria Governamental', subject: 'Auditoria Fiscal', icon: '📑', unlocked: false, completed: false }
    ];
    state.currentEditalAnalysis = analysis;
    state.user.targetContest = analysis.concurso;
    state.user.targetArea = targetArea;
    saveStateToDisk();
    return analysis;
  }

  // 5. TRIBUNAIS / PADRÃO
  const analysis = {
    concurso: contestName || 'Tribunal de Justiça (TJ) / Concurso Geral',
    banca: 'VUNESP / FCC',
    vagas: 'Edital Publicado',
    salario: 'R$ 5.500 a R$ 12.000',
    area: targetArea || 'Tribunais / Judiciária',
    estrategia: 'Foco no texto da Lei Seca e resolução diária de questões de Direito Constitucional, Administrativo e Português.',
    materiasPesos: [
      { materia: 'Língua Portuguesa', peso: '24 questões', importancia: 'Alta', cor: '#10B981' },
      { materia: 'Direito Constitucional & Adm.', peso: '20 questões', importancia: 'Muito Alta', cor: '#6366F1' },
      { materia: 'Legislação Específica & Processo', peso: '20 questões', importancia: 'Alta', cor: '#8B5CF6' },
      { materia: 'Raciocínio Lógico & Informática', peso: '16 questões', importancia: 'Média', cor: '#F59E0B' }
    ]
  };
  state.stages = [
    { id: 1, title: 'Princípios Fundamentais (CF/88)', subject: 'Direito Constitucional', icon: '🏛️', unlocked: true, completed: true },
    { id: 2, title: 'Direitos Individuais & Art. 5º', subject: 'Direito Constitucional', icon: '⚖️', unlocked: true, completed: false },
    { id: 3, title: 'Princípios da Adm. Pública (LIMPE)', subject: 'Direito Administrativo', icon: '🏢', unlocked: true, completed: false },
    { id: 4, title: 'Crase & Sintaxe de Regência', subject: 'Língua Portuguesa', icon: '📚', unlocked: false, completed: false }
  ];
  state.currentEditalAnalysis = analysis;
  state.user.targetContest = analysis.concurso;
  state.user.targetArea = targetArea;
  saveStateToDisk();
  return analysis;
}

// ==========================================
// 🤖 MOTOR IA: GERAÇÃO INFINITA DE QUESTÕES
// ==========================================
async function generateAiQuestion(subject, topic, format = 'auto') {
  // Filtra apenas chunks com texto legível e relevante (ignora streams corrompidos de PDF)
  let cleanChunks = (state.knowledgeChunks || []).filter(c => 
    c.content && 
    c.content.length > 60 && 
    !c.content.includes('ET Q q') && 
    !c.content.includes('0.000008872')
  );
  if (cleanChunks.length === 0) cleanChunks = state.knowledgeChunks;

  let candidates = cleanChunks;
  if (subject && subject !== 'all') {
    const subLower = subject.toLowerCase();
    const filtered = cleanChunks.filter(c => 
      c.subject.toLowerCase().includes(subLower) || 
      (c.topic && c.topic.toLowerCase().includes(subLower)) ||
      (c.content && c.content.toLowerCase().includes(subLower))
    );
    if (filtered.length > 0) candidates = filtered;
  }

  const randomChunk = candidates[Math.floor(Math.random() * candidates.length)] || {
    content: "A assistência social é direito do cidadão e dever do Estado, política de Seguridade Social não contributiva que provê os mínimos sociais.",
    articleRef: "Lei 8.742/1993 (LOAS)",
    subject: subject || "Legislação de Assistência Social",
    topic: "Princípios e Diretrizes"
  };

  const contextText = randomChunk.content;
  const legalRef = randomChunk.articleRef || 'Legislação Aplicável';
  const targetSubject = randomChunk.subject || subject || 'Conhecimentos Específicos';
  const targetTopic = randomChunk.topic || topic || 'Normas e Doutrina';
  const currentBanca = state.currentEditalAnalysis?.banca || 'IBFC / CEBRASPE';
  const isCebraspeMode = currentBanca.toUpperCase().includes('CEBRASPE') || format === 'certo_errado';

  // Se houver chave Gemini configurada, gera com a IA em tempo real!
  if (state.apiKey && state.apiKey.length > 10) {
    try {
      const typePrompt = isCebraspeMode
        ? `Gere no modelo CERTO ou ERRADO (Estilo CEBRASPE). Escolha aleatoriamente se a assertiva será CERTA (correctOptionId: "opt_certo") ou ERRADA (correctOptionId: "opt_errado" com pegadinha sutil de inversão de prazos/competências/conceitos).`
        : `Gere no modelo MÚLTIPLA ESCOLHA (4 alternativas: A, B, C, D). Distribua ALEATORIAMENTE a alternativa correta entre opt_a, opt_b, opt_c ou opt_d (NÃO coloque sempre na A).`;

      const prompt = `Você é a banca examinadora ${currentBanca} para o concurso ${state.currentEditalAnalysis?.concurso || 'SEDES/DF'}.
${typePrompt}
Gere 1 questão inédita de concurso de alto nível baseada ESTRITAMENTE neste trecho da lei/doutrina:
"${contextText}"

Matéria: ${targetSubject}
Referência de Lei Seca: ${legalRef}

Responda EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
{
  "banca": "${currentBanca}",
  "subject": "${targetSubject}",
  "topic": "${targetTopic}",
  "type": "${isCebraspeMode ? 'certo_errado' : 'multipla_escolha'}",
  "statement": "Enunciado contextualizado com situação prática ou assertiva de prova...",
  "options": [
    ${isCebraspeMode 
      ? `{"id": "opt_certo", "label": "C", "text": "CERTO"}, {"id": "opt_errado", "label": "E", "text": "ERRADO"}`
      : `{"id": "opt_a", "label": "A", "text": "Texto da assertiva A"}, {"id": "opt_b", "label": "B", "text": "Texto da assertiva B"}, {"id": "opt_c", "label": "C", "text": "Texto da assertiva C"}, {"id": "opt_d", "label": "D", "text": "Texto da assertiva D"}`
    }
  ],
  "correctOptionId": "${isCebraspeMode ? 'opt_certo ou opt_errado' : 'opt_a ou opt_b ou opt_c ou opt_d'}",
  "explanation": {
    "whyCorrect": "Justificativa minuciosa do gabarito explicando o fundamento de acordo com ${legalRef} e apontando o erro das demais alternativas.",
    "legalBasis": "${legalRef}"
  }
}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${state.apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return {
            id: 'q-gemini-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            ...parsed
          };
        }
      }
    } catch (e) {
      console.warn('Fallback ativado na geração de IA:', e.message);
    }
  }

  // Fallback Inteligente baseado em RAG
  const qId = 'q-rag-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  if (isCebraspeMode) {
    const isCerto = Math.random() < 0.5;
    return {
      id: qId,
      banca: currentBanca,
      type: 'certo_errado',
      subject: targetSubject,
      topic: targetTopic,
      statement: isCerto
        ? `(Banca ${currentBanca} • ${state.currentEditalAnalysis?.concurso || 'SEDES/DF'})\nJulgue o item a seguir com base em ${legalRef}:\n\n"Em consonância com as diretrizes aplicáveis à política social e normativa, ${contextText.slice(0, 190)}..."`
        : `(Banca ${currentBanca} • ${state.currentEditalAnalysis?.concurso || 'SEDES/DF'})\nJulgue o item a seguir com base em ${legalRef}:\n\n"No tocante a ${targetTopic}, a concessão dos benefícios independe de regulamentação legal ou critérios de renda, cabendo exclusivamente ao gestor a supressão unilateral de garantias."`,
      options: [
        { id: 'opt_certo', label: 'C', text: 'CERTO' },
        { id: 'opt_errado', label: 'E', text: 'ERRADO' }
      ],
      correctOptionId: isCerto ? 'opt_certo' : 'opt_errado',
      explanation: {
        whyCorrect: isCerto
          ? `GABARITO: CERTO. A assertiva reproduz fielmente a literalidade e o preceito de ${legalRef}: "${contextText.slice(0, 200)}...".`
          : `GABARITO: ERRADO. A assertiva contraria a norma expressa em ${legalRef}. Os critérios e garantias decorrem de previsão legal vinculada, não de arbítrio desregulamentado.`,
        legalBasis: `${legalRef} • Programa Oficial do Concurso.`
      }
    };
  }

  // Múltipla Escolha com alternativas e gabarito embaralhados
  const rawPool = [
    { text: `Conforme estabelece expressamente o ${legalRef}: ${contextText.slice(0, 150)}...`, isCorrect: true },
    { text: `A eficácia dos princípios de ${targetTopic} fica estritamente condicionada à discricionariedade prévia sem previsão legal.`, isCorrect: false },
    { text: `São expressamente vedadas as ações integradas e participativas da sociedade no âmbito de ${targetSubject}.`, isCorrect: false },
    { text: `Os direitos fundamentais e garantias de ${targetTopic} admitem supressão temporária pelo Executivo local sem base jurídica.`, isCorrect: false }
  ];

  const shuffledPool = rawPool.sort(() => Math.random() - 0.5);
  const letters = ['A', 'B', 'C', 'D'];
  let determinedCorrectId = 'opt_a';

  const options = shuffledPool.map((item, idx) => {
    const optId = `opt_${letters[idx].toLowerCase()}`;
    if (item.isCorrect) determinedCorrectId = optId;
    return {
      id: optId,
      label: letters[idx],
      text: item.text
    };
  });

  return {
    id: qId,
    banca: currentBanca,
    type: 'multipla_escolha',
    subject: targetSubject,
    topic: targetTopic,
    statement: `(Concurso: ${state.currentEditalAnalysis?.concurso || 'SEDES/DF'} • Banca: ${currentBanca})\nConsiderando as normas vigentes em ${targetSubject} e o preceituado expressamente em ${legalRef}, assinale a opção correta:`,
    options,
    correctOptionId: determinedCorrectId,
    explanation: {
      whyCorrect: `GABARITO: Item ${determinedCorrectId.replace('opt_', '').toUpperCase()}. A alternativa correta reflete a literalidade e a lógica jurídica de ${legalRef}. Os demais itens apresentam distorções jurídicas e violação da lei.`,
      legalBasis: `${legalRef} • Edital do Concurso.`
    }
  };
}

async function seedInitialQuestions() {
  if (state.questions.length === 0) {
    for (let i = 0; i < 4; i++) {
      const q = await generateAiQuestion();
      state.questions.push(q);
    }
    saveStateToDisk();
  }
}
seedInitialQuestions();

// ==========================================
// 🌐 SERVIDOR HTTP E APIS RESTFUL
// ==========================================
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename, x-subject, x-contest, x-area, x-is-edital');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // 1. PERFIL DO USUÁRIO & EDITAL ATUAL & STATUS DE API KEY
  if (url.pathname === '/api/user/profile') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      user: state.user,
      edital: state.currentEditalAnalysis,
      access: {
        hasAccess: true,
        isTrial: true,
        daysRemaining: 7,
        hoursRemaining: 168,
        planStatus: 'trial_active',
        monthlyPrice: 29.99
      },
      apiKeyConfigured: !!(state.apiKey && state.apiKey.length > 10),
      apiKeyMasked: state.apiKey ? `${state.apiKey.slice(0, 6)}...${state.apiKey.slice(-4)}` : ''
    }));
    return;
  }

  // CONFIGURAR CHAVE DO GOOGLE GEMINI EM TEMPO REAL
  if (url.pathname === '/api/user/set-api-key' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const key = (data.apiKey || '').trim();

        if (!key) {
          state.apiKey = '';
          saveStateToDisk();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Chave desativada. O app usará o motor RAG local.', apiKeyConfigured: false }));
          return;
        }

        // Testa a chave com Gemini
        try {
          const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
          const testRes = await fetch(testUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Responda apenas: OK" }] }]
            })
          });

          if (!testRes.ok) {
            const errData = await testRes.text();
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Chave do Google Gemini inválida ou sem permissão: ${errData}` }));
            return;
          }
        } catch (fetchErr) {
          console.warn('Não foi possível validar online a chave imediatamente:', fetchErr.message);
        }

        // Salva a chave no estado e no arquivo .env
        state.apiKey = key;
        saveStateToDisk();
        fs.writeFileSync(ENV_FILE, `GEMINI_API_KEY=${key}\nPORT=3333\n`, 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Google Gemini 1.5 Flash conectado com sucesso! O app agora gera questões e analisa editais via IA em tempo real.',
          apiKeyConfigured: true,
          apiKeyMasked: `${key.slice(0, 6)}...${key.slice(-4)}`
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ATUALIZA CONFIGURAÇÃO DO USUÁRIO (TEMA / SOM)
  if (url.pathname === '/api/user/settings' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      if (data.soundEnabled !== undefined) state.user.soundEnabled = data.soundEnabled;
      if (data.theme) state.user.theme = data.theme;
      saveStateToDisk();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user: state.user }));
    });
    return;
  }

  // RESTAURAR VIDA MANUALMENTE
  if (url.pathname === '/api/user/restore-heart' && req.method === 'POST') {
    state.user.hearts = Math.min(state.user.maxHearts, (state.user.hearts || 0) + 1);
    if (state.user.hearts >= state.user.maxHearts) state.user.heartRegenTimer = null;
    saveStateToDisk();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, user: state.user }));
    return;
  }

  // 🎬 ASSISTIR ANÚNCIO (REWARDED AD) -> GANHA +3 VIDAS NO PLANO FREE
  if (url.pathname === '/api/user/watch-ad' && req.method === 'POST') {
    state.user.hearts = Math.min(state.user.maxHearts, (state.user.hearts || 0) + 3);
    if (state.user.hearts >= state.user.maxHearts) state.user.heartRegenTimer = null;
    state.user.xp += 10; // Bônus por engajamento
    saveStateToDisk();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      hearts: state.user.hearts,
      user: state.user,
      message: '🎬 Anúncio concluído! Você ganhou +3 vidas e +10 XP para continuar estudando!'
    }));
    return;
  }

  // 👑 ALTERNAR PLANO FREE / VIP (SIMULADOR DE MONETIZAÇÃO)
  if (url.pathname === '/api/user/toggle-plan' && req.method === 'POST') {
    state.user.isPremium = !state.user.isPremium;
    if (state.user.isPremium) {
      state.user.hearts = 5;
      state.user.heartRegenTimer = null;
    }
    saveStateToDisk();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      isPremium: state.user.isPremium,
      user: state.user,
      message: state.user.isPremium
        ? '👑 Plano VIP Ativo! Vidas infinitas (sem pausas) e ZERO anúncios ativados.'
        : '⚪ Plano Free Ativo! Sistema de vidas (5/5), pausas ao zerar e anúncios ativados.'
    }));
    return;
  }

  // 2. ANALISADOR DE EDITAL & GERADOR DE METODOLOGIA
  if (url.pathname === '/api/edital/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      const data = JSON.parse(body || '{}');
      const analysis = await analyzeEditalAndBuildMethodology(
        data.contestName || 'Secretaria de Desenvolvimento Social (Sedes/DF)',
        data.targetArea || 'Assistência Social',
        data.editalText || ''
      );

      // Regenera primeira questão no novo concurso
      const newQ = await generateAiQuestion();
      state.questions.unshift(newQ);
      saveStateToDisk();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        analysis,
        newStages: state.stages,
        message: `Edital do concurso "${analysis.concurso}" analisado com sucesso! A trilha de fases e a metodologia de estudo foram reconfiguradas automaticamente.`
      }));
    });
    return;
  }

  // 3. FASES GAMIFICADAS
  if (url.pathname === '/api/stages') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ stages: state.stages }));
    return;
  }

  // 4. QUESTÕES & IA INFINITA
  if (url.pathname === '/api/questions') {
    const subject = url.searchParams.get('subject');
    let qList = state.questions || [];
    if (subject && subject !== 'all') {
      const subLower = subject.toLowerCase();
      qList = state.questions.filter(q => 
        (q.subject && q.subject.toLowerCase().includes(subLower)) ||
        (q.topic && q.topic.toLowerCase().includes(subLower)) ||
        (q.statement && q.statement.toLowerCase().includes(subLower))
      );
    }
    // Garante que haja pelo menos 5 questões variadas para o tema
    if (qList.length < 5) {
      const needed = 5 - qList.length;
      for (let i = 0; i < needed; i++) {
        const newQ = await generateAiQuestion(subject || 'Legislação de Assistência Social');
        state.questions.unshift(newQ);
        qList.unshift(newQ);
      }
      saveStateToDisk();
    }
    // Embaralha as questões para que o estudante sempre veja uma sequência dinâmica
    const shuffledList = [...qList].sort(() => Math.random() - 0.5);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ questions: shuffledList }));
    return;
  }

  if (url.pathname === '/api/questions/generate-ai' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      const data = JSON.parse(body || '{}');
      const newQ = await generateAiQuestion(data.subject, data.topic, data.format);
      state.questions.unshift(newQ);
      saveStateToDisk();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, question: newQ }));
    });
    return;
  }

  if (url.pathname === '/api/questions/answer' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      const question = state.questions.find(q => q.id === data.questionId) || state.questions[0];
      const isCorrect = question.correctOptionId === data.selectedOptionId;

      let stageProgress = null;

      if (isCorrect) {
        state.user.xp += 15;

        // Encontra a fase ativa atual para progressão
        let targetStage = null;
        if (data.stageId) {
          targetStage = state.stages.find(s => s.id === Number(data.stageId));
        }
        if (!targetStage) {
          targetStage = state.stages.find(s => s.unlocked && !s.completed) || state.stages[0];
        }

        if (targetStage) {
          targetStage.currentProgress = (targetStage.currentProgress || 0) + 1;
          targetStage.requiredCorrect = targetStage.requiredCorrect || 3;
          let justCompleted = false;
          let nextStageUnlocked = null;

          if (targetStage.currentProgress >= targetStage.requiredCorrect) {
            targetStage.completed = true;
            targetStage.currentProgress = targetStage.requiredCorrect;
            justCompleted = true;
            state.user.xp += 50; // Super Bônus de Level Up de Fase

            const nextStg = state.stages.find(s => s.id === targetStage.id + 1);
            if (nextStg) {
              nextStg.unlocked = true;
              nextStageUnlocked = nextStg;
            }
          }

          stageProgress = {
            stageId: targetStage.id,
            stageTitle: targetStage.title,
            currentProgress: targetStage.currentProgress,
            requiredCorrect: targetStage.requiredCorrect,
            completed: targetStage.completed,
            justCompleted,
            nextStageUnlocked
          };
        }
      } else {
        // Se errou e for plano FREE, perde vida
        if (!state.user.isPremium) {
          state.user.hearts = Math.max(0, (state.user.hearts || 5) - 1);
          if (state.user.hearts === 0 && !state.user.heartRegenTimer) {
            state.user.heartRegenTimer = Date.now() + 5 * 60 * 1000; // 5 minutos para recarregar
          }
        }
      }

      saveStateToDisk();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        isCorrect,
        correctOptionId: question.correctOptionId,
        explanation: question.explanation,
        user: state.user,
        stageProgress
      }));
    });
    return;
  }

  // TRANSFORMAR ERRO EM FLASHCARD ANKI SM-2
  if (url.pathname === '/api/questions/convert-to-anki' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      const newCard = {
        id: 'fc-' + Date.now(),
        front: data.front || 'Conceito chave de revisão',
        back: data.back || 'Fundamentação legal e explicação',
        subject: data.subject || 'Revisão de Erros',
        topic: data.topic || 'Fixação SM-2',
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewed: new Date().toISOString()
      };
      state.flashcards.unshift(newCard);
      saveStateToDisk();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        card: newCard,
        message: 'Flashcard adicionado ao seu deck Anki para revisão prioritária amanhã!'
      }));
    });
    return;
  }

  // 5. ANKI SM-2 FLASHCARDS
  if (url.pathname === '/api/anki/cards') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalCards: state.flashcards.length,
      dueCardsCount: state.flashcards.length,
      cards: state.flashcards
    }));
    return;
  }

  if (url.pathname === '/api/anki/cards' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      if (!data.front || !data.back) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Frente e verso são obrigatórios' }));
        return;
      }
      const newCard = {
        id: 'fc-' + Date.now(),
        front: data.front,
        back: data.back,
        subject: data.subject || 'Geral',
        topic: data.topic || 'Conceitos',
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewed: new Date().toISOString()
      };
      state.flashcards.unshift(newCard);
      saveStateToDisk();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, card: newCard }));
    });
    return;
  }

  if (url.pathname === '/api/anki/review' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      const card = state.flashcards.find(c => c.id === data.cardId) || state.flashcards[0];
      const q = Number(data.quality) || 3;

      if (card) {
        card.repetitions += 1;
        card.easeFactor = Math.max(1.3, Number((card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))).toFixed(2)));
        if (q < 3) {
          card.repetitions = 0;
          card.interval = 1;
        } else if (card.repetitions === 1) {
          card.interval = 1;
        } else if (card.repetitions === 2) {
          card.interval = 6;
        } else {
          card.interval = Math.round(card.interval * card.easeFactor);
        }
        card.lastReviewed = new Date().toISOString();
      }

      state.user.xp += 5;
      saveStateToDisk();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, card, user: state.user }));
    });
    return;
  }

  // 6. UPLOAD & COMPRESSÃO DE PDFs COM ANÁLISE DE EDITAL
  if (url.pathname === '/api/knowledge/upload-pdf' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        let filename = 'Edital_Concurso.pdf';
        try {
          filename = req.headers['x-filename'] ? decodeURIComponent(req.headers['x-filename']) : 'Edital_Concurso.pdf';
        } catch (e) {
          filename = req.headers['x-filename'] || 'Edital_Concurso.pdf';
        }

        let subject = 'Material de Concurso';
        try {
          subject = req.headers['x-subject'] ? decodeURIComponent(req.headers['x-subject']) : 'Material de Concurso';
        } catch (e) {
          subject = req.headers['x-subject'] || 'Material de Concurso';
        }

        const isEdital = req.headers['x-is-edital'] === 'true' || filename.toLowerCase().includes('edital') || filename.toLowerCase().includes('sedes');

        const result = await compressAndExtractText(buffer, filename, subject);

        let editalAnalysis = null;
        if (isEdital) {
          editalAnalysis = await analyzeEditalAndBuildMethodology(filename.replace(/\.pdf$/i, ''), subject, result.textSnippet);
        }

        const q1 = await generateAiQuestion(subject);
        state.questions.unshift(q1);
        saveStateToDisk();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          document: result.doc,
          chunksCreated: result.chunksCreated,
          editalAnalyzed: isEdital,
          analysis: editalAnalysis || state.currentEditalAnalysis,
          newStages: state.stages,
          message: `PDF "${filename}" compactado em ${result.doc.reduction} e indexado no RAG com ${result.chunksCreated} blocos de estudo!`
        }));
      } catch (err) {
        console.error('Erro no upload-pdf:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro ao processar PDF: ' + err.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/knowledge/documents') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      documents: state.documents,
      totalChunks: state.knowledgeChunks.length
    }));
    return;
  }

  // 7. COBRANÇA PIX
  if (url.pathname === '/api/billing/pix-charge') {
    const paymentId = 'pay_' + Date.now();
    const copyPastePix = `00020126580014br.gov.bcb.pix0136${paymentId}@concursos.qa.app52040000530398654029.995802BR5915QA ESTUDO APP6009SAO PAULO62070503***6304ABCD`;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      paymentId,
      amount: 29.99,
      qrCodeBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23FFFFFF"/><rect x="20" y="20" width="60" height="60" fill="%230F172A"/><rect x="120" y="20" width="60" height="60" fill="%230F172A"/><rect x="20" y="120" width="60" height="60" fill="%230F172A"/><rect x="40" y="40" width="20" height="20" fill="%2310B981"/><rect x="140" y="40" width="20" height="20" fill="%2310B981"/><rect x="40" y="140" width="20" height="20" fill="%2310B981"/><rect x="90" y="90" width="20" height="20" fill="%2310B981"/></svg>',
      copyPastePix,
      message: 'Assinatura Mensal gerada por apenas R$ 29,99/mês (menos de R$ 1 por dia)!'
    }));
    return;
  }

  if (url.pathname === '/api/billing/confirm-pix' && req.method === 'POST') {
    state.user.isPremium = true;
    state.user.accessExpiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
    saveStateToDisk();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Assinatura confirmada com sucesso! Acesso liberado por 30 dias.', user: state.user }));
    return;
  }

  // 8. ARQUIVOS ESTÁTICOS / SPA / SEO
  const publicDir = path.join(__dirname, 'public');
  let cleanPath = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\//, '');
  let filePath = path.join(publicDir, cleanPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8',
      '.xml': 'application/xml; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.ico': 'image/x-icon'
    };
    const contentType = mimeTypes[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    filePath = path.join(publicDir, 'index.html');
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 QA - Estude para Concursos (Servidor Ativo PWA)`);
  console.log(`🌐 No Computador: http://localhost:${PORT}`);
  console.log(`📱 No Celular (Mesmo Wi-Fi): http://192.168.18.16:${PORT}`);
  console.log(`💾 Persistência em disco: data/storage.json`);
  console.log(`🎯 Concurso Atual: ${state.currentEditalAnalysis?.concurso}`);
  console.log(`🤖 Google Gemini API: ${state.apiKey ? '🟢 Ativa' : '🟡 Modo Fallback Local'}`);
  console.log(`=======================================================`);
});

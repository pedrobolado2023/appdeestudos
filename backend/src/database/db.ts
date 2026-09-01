import { UserProfile, Question, Flashcard, StudyStage, KnowledgeDocument, TextChunk } from '../types/index.js';

class InMemoryDB {
  public users: Map<string, UserProfile> = new Map();
  public questions: Question[] = [];
  public flashcards: Flashcard[] = [];
  public stages: StudyStage[] = [];
  public documents: KnowledgeDocument[] = [];
  public chunks: TextChunk[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // 1. Usuário padrão de demonstração
    const now = new Date();
    const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias de trial

    const defaultUser: UserProfile = {
      id: 'demo-user-1',
      name: 'Futuro Concursado',
      email: 'aluno@concursos.com',
      createdAt: now.toISOString(),
      trialEndsAt: trialEnds.toISOString(),
      accessExpiresAt: trialEnds.toISOString(),
      isPremium: true,
      xp: 340,
      hearts: 5,
      maxHearts: 5,
      streak: 4,
      lastStudyDate: now.toISOString().split('T')[0],
      currentLevel: 3,
      league: 'Ouro'
    };
    this.users.set(defaultUser.id, defaultUser);

    // 2. Fases da Trilha Gamificada (Estilo Duolingo)
    this.stages = [
      {
        id: 1,
        title: 'Princípios Fundamentais',
        subject: 'Direito Constitucional',
        icon: '🏛️',
        description: 'Fundamentos da República, Separação de Poderes e Objetivos Fundamentais (Art. 1º a 4º da CF/88).',
        requiredXp: 0,
        unlocked: true,
        completed: true,
        lessons: [
          { id: 'l1', title: 'Fundamentos e Soberania', description: 'SO-CI-DI-VA-PLU', questionsCount: 5, completed: true, score: 100 },
          { id: 'l2', title: 'Objetivos Fundamentais', description: 'CON-GA-ERRA-PRO', questionsCount: 5, completed: true, score: 90 },
          { id: 'l3', title: 'Relações Internacionais', description: 'Princípios do Art. 4º', questionsCount: 5, completed: true, score: 100 }
        ]
      },
      {
        id: 2,
        title: 'Direitos e Deveres Individuais',
        subject: 'Direito Constitucional',
        icon: '⚖️',
        description: 'Artigo 5º: Inviolabilidade de domicílio, remédios constitucionais e garantias fundamentais.',
        requiredXp: 150,
        unlocked: true,
        completed: false,
        lessons: [
          { id: 'l4', title: 'Direito à Vida e Igualdade', description: 'Garantias essenciais', questionsCount: 5, completed: true, score: 80 },
          { id: 'l5', title: 'Inviolabilidade do Domicílio', description: 'Regras de entrada dia/noite', questionsCount: 5, completed: false },
          { id: 'l6', title: 'Remédios Constitucionais', description: 'HC, HD, MS, MI e Ação Popular', questionsCount: 5, completed: false }
        ]
      },
      {
        id: 3,
        title: 'Princípios da Administração Pública',
        subject: 'Direito Administrativo',
        icon: '🏢',
        description: 'Princípios expressos (LIMPE) e implícitos da administração direta e indireta.',
        requiredXp: 300,
        unlocked: true,
        completed: false,
        lessons: [
          { id: 'l7', title: 'O Mnemônico LIMPE', description: 'Legalidade, Impessoalidade, Moralidade...', questionsCount: 5, completed: false },
          { id: 'l8', title: 'Administração Direta e Indireta', description: 'Autarquias, Fundações, EP e SEM', questionsCount: 5, completed: false }
        ]
      },
      {
        id: 4,
        title: 'Crase e Regência Verbal',
        subject: 'Língua Portuguesa',
        icon: '📚',
        description: 'Casos proibidos, obrigatórios e facultativos de crase e transitividade verbal.',
        requiredXp: 500,
        unlocked: false,
        completed: false,
        lessons: [
          { id: 'l9', title: 'Casos Proibidos de Crase', description: 'Antes de masculino, verbos e pronomes', questionsCount: 5, completed: false },
          { id: 'l10', title: 'Casos Facultativos', description: 'Nome de mulher, possessivo e até a', questionsCount: 5, completed: false }
        ]
      },
      {
        id: 5,
        title: 'Lógica Proposicional e Tabela-Verdade',
        subject: 'Raciocínio Lógico',
        icon: '🧩',
        description: 'Conectivos lógicos, equivalências de De Morgan e negações de proposições compostas.',
        requiredXp: 750,
        unlocked: false,
        completed: false,
        lessons: [
          { id: 'l11', title: 'Negação do "Se... Então"', description: 'Regra do MANÉ (Mantém e Nega)', questionsCount: 5, completed: false },
          { id: 'l12', title: 'Tabela Verdade e Equivalências', description: 'Conjunção, disjunção e condicional', questionsCount: 5, completed: false }
        ]
      }
    ];

    // 3. Questões Iniciais com Explicações Ricas e Base Legal
    this.questions = [
      {
        id: 'q-const-1',
        subject: 'Direito Constitucional',
        topic: 'Inviolabilidade de Domicílio',
        banca: 'CEBRASPE / CESPE',
        type: 'multiple_choice',
        statement: 'Segundo a Constituição Federal de 1988 (Art. 5º, XI), a casa é asilo inviolável do indivíduo. Em qual das situações abaixo é permitido o ingresso durante o período NOTURNO SEM o consentimento do morador?',
        options: [
          { id: 'opt_a', label: 'A', text: 'Por determinação judicial para busca e apreensão de provas de crime.' },
          { id: 'opt_b', label: 'B', text: 'Em caso de flagrante delito, desastre, ou para prestar socorro.' },
          { id: 'opt_c', label: 'C', text: 'Apenas com autorização escrita do delegado de polícia competente.' },
          { id: 'opt_d', label: 'D', text: 'Em qualquer horário, desde que haja suspeita fundada de irregularidade fiscal.' },
          { id: 'opt_e', label: 'E', text: 'Por ordem de comissão parlamentar de inquérito durante diligência oficial.' }
        ],
        correctOptionId: 'opt_b',
        explanation: {
          correctText: 'Alternativa B está correta.',
          whyCorrect: 'De acordo com o Art. 5º, inciso XI da CF/88, no período noturno só se pode entrar na casa sem consentimento em 3 casos: flagrante delito, desastre ou para prestar socorro.',
          distractorsExplanation: {
            opt_a: 'Incorreta. A determinação judicial (ordem judicial) só autoriza a entrada durante o DIA.',
            opt_c: 'Incorreta. Delegado de polícia não tem poder de violar domicílio fora das hipóteses constitucionais.',
            opt_d: 'Incorreta. Suspeita fiscal não autoriza invasão de domicílio à noite.',
            opt_e: 'Incorreta. CPIs possuem poderes instrutórios judiciais, mas também estão limitadas à reserva de jurisdição e ao período diurno.'
          },
          legalBasis: 'Art. 5º, XI, CF/88: "a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial".'
        },
        difficulty: 'medio'
      },
      {
        id: 'q-const-2',
        subject: 'Direito Constitucional',
        topic: 'Princípios Fundamentais',
        banca: 'FGV',
        type: 'multiple_choice',
        statement: 'São objetivos fundamentais da República Federativa do Brasil, expressamente previstos no Art. 3º da CF/88, EXCETO:',
        options: [
          { id: 'opt_a', label: 'A', text: 'Construir uma sociedade livre, justa e solidária.' },
          { id: 'opt_b', label: 'B', text: 'Garantir o desenvolvimento nacional.' },
          { id: 'opt_c', label: 'C', text: 'Erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais.' },
          { id: 'opt_d', label: 'D', text: 'Promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.' },
          { id: 'opt_e', label: 'E', text: 'A prevalência dos direitos humanos e a autodeterminação dos povos.' }
        ],
        correctOptionId: 'opt_e',
        explanation: {
          correctText: 'Alternativa E é a exceção (gabarito).',
          whyCorrect: 'A "prevalência dos direitos humanos" e a "autodeterminação dos povos" são PRINCÍPIOS NAS RELAÇÕES INTERNACIONAIS (Art. 4º da CF/88) e NÃO objetivos fundamentais (Art. 3º).',
          distractorsExplanation: {
            opt_a: 'Incorreta pois é objetivo fundamental (Art. 3º, I). Mnemônico: CON-GA-ERRA-PRO.',
            opt_b: 'Incorreta pois é objetivo fundamental (Art. 3º, II).',
            opt_c: 'Incorreta pois é objetivo fundamental (Art. 3º, III).',
            opt_d: 'Incorreta pois é objetivo fundamental (Art. 3º, IV).'
          },
          legalBasis: 'CF/88 Art. 3º (Objetivos Fundamentais) vs Art. 4º (Princípios das Relações Internacionais).'
        },
        difficulty: 'facil'
      },
      {
        id: 'q-adm-1',
        subject: 'Direito Administrativo',
        topic: 'Princípios da Administração Pública',
        banca: 'FCC',
        type: 'multiple_choice',
        statement: 'A vedação expressa à veiculação de nomes, símbolos ou imagens que caracterizem promoção pessoal de autoridades ou servidores públicos em publicidade institucional decorre diretamente de qual princípio constitucional?',
        options: [
          { id: 'opt_a', label: 'A', text: 'Princípio da Eficiência.' },
          { id: 'opt_b', label: 'B', text: 'Princípio da Impessoalidade.' },
          { id: 'opt_c', label: 'C', text: 'Princípio da Autotutela.' },
          { id: 'opt_d', label: 'D', text: 'Princípio da Continuidade dos Serviços Públicos.' },
          { id: 'opt_e', label: 'E', text: 'Princípio da Especialidade.' }
        ],
        correctOptionId: 'opt_b',
        explanation: {
          correctText: 'Alternativa B está correta.',
          whyCorrect: 'O princípio da impessoalidade veda a promoção pessoal de agentes públicos nas obras e atos estatais, pois os atos são atribuídos ao órgão e à administração, não à pessoa física do governante.',
          distractorsExplanation: {
            opt_a: 'Incorreta. Eficiência relaciona-se à produtividade, celeridade e melhor aproveitamento do dinheiro público.',
            opt_c: 'Incorreta. Autotutela é a capacidade da administração de anular atos ilegais e revogar atos inoportunos (Súmulas 346 e 473 do STF).',
            opt_d: 'Incorreta. Continuidade determina que os serviços públicos essenciais não sofram paralisações indevidas.',
            opt_e: 'Incorreta. Especialidade trata da vinculação de entidades da administração indireta à finalidade legal para a qual foram criadas.'
          },
          legalBasis: 'Art. 37, § 1º da CF/88: "A publicidade dos atos, programas, obras, serviços e campanhas dos órgãos públicos deverá ter caráter educativo, informativo ou de orientação social, dela não podendo constar nomes, símbolos ou imagens que caracterizem promoção pessoal de autoridades ou servidores públicos".'
        },
        difficulty: 'facil'
      }
    ];

    // 4. Flashcards Iniciais para o Modo Anki SM-2
    this.flashcards = [
      {
        id: 'fc-1',
        userId: 'demo-user-1',
        front: 'Quais são os 5 Fundamentos da República Federativa do Brasil? (Mnemônico)',
        back: 'SO-CI-DI-VA-PLU\n1. SOberania\n2. CIdadania\n3. DIgnidade da pessoa humana\n4. VAlores sociais do trabalho e da livre iniciativa\n5. PLUralismo político\n(Art. 1º da CF/88)',
        subject: 'Direito Constitucional',
        topic: 'Fundamentos',
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5,
        nextReviewDate: new Date(Date.now() + 86400000).toISOString()
      },
      {
        id: 'fc-2',
        userId: 'demo-user-1',
        front: 'Qual o mnemônico para a negação da condicional (Se P, então Q)?',
        back: 'Regra do MANÉ:\nMAntém a primeira (P) E (^) NEga a segunda (~Q).\n\nExemplo: ~(P -> Q) ≡ P ^ ~Q',
        subject: 'Raciocínio Lógico',
        topic: 'Lógica Proposicional',
        repetitions: 1,
        interval: 1,
        easeFactor: 2.4,
        nextReviewDate: new Date().toISOString()
      },
      {
        id: 'fc-3',
        userId: 'demo-user-1',
        front: 'Quais são os casos facultativos de crase? (Mnemônico)',
        back: 'ATÉ A MARIA NOMEIA A SUA:\n1. Diante da palavra ATÉ\n2. Diante de nome próprio feminino (MARIA)\n3. Diante de pronome possessivo feminino singular (MINHA/SUA)',
        subject: 'Língua Portuguesa',
        topic: 'Crase',
        repetitions: 3,
        interval: 15,
        easeFactor: 2.6,
        nextReviewDate: new Date(Date.now() + 4 * 86400000).toISOString()
      }
    ];
  }
}

export const db = new InMemoryDB();

# 🚀 PROMPT MESTRE: QA - ESTUDE PARA CONCURSOS
> **Guia Definitivo de Arquitetura, Engenharia, Gamificação e Inteligência Artificial**
> Nome Oficial da Aplicação: **QA - Estude para concursos**
> Plataformas: **Android / iOS (Mobile) + Backend Desacoplado na Nuvem / Servidor Local**

---

## 🎯 1. VISÃO GERAL E OBJETIVO DO PRODUTO

O **QA - Estude para concursos** é uma plataforma inteligente e gamificada projetada para acelerar a aprovação de candidatos em concursos públicos (federais, estaduais e municipais).

A plataforma combina três pilares de alta performance:
1. **Gamificação no Estilo Duolingo**: O estudante avança por trilhas temáticas organizadas em fases e módulos, ganha XP, mantém sequências de dias consecutivos (Streaks/Ofensivas), sobe de liga e gerencia corações/vidas.
2. **Motor de Repetição Espaçada (Estilo Anki - Algoritmo SM-2)**: Armazena e agenda revisões inteligentes com base no tempo de esquecimento de cada conceito e questão, garantindo retenção de longo prazo na memória.
3. **RAG Local e Geração de Questões com Base Confiável (Anti-Alucinação)**: O backend é alimentado por apostilas, editais, leis secas e doutrinas enviadas em PDF. Um compactador otimizado processa os documentos sem estressar a memória/disco do servidor, gerando questões inéditas e explicações didáticas com indicação precisa do artigo de lei ou jurisprudência.
4. **Modelo de Negócio e Monetização Transparente**:
   - **Período de Degustação Gratuito**: 7 dias corridos de acesso total para todo novo usuário.
   - **Assinatura Mensal Acessível**: R$ 29,99 por mês (equivalente a menos de R$ 1,00 por dia) ou R$ 249,90 no plano anual, com cobrança via PIX / Mercado Pago.

---

## 🏗️ 2. ARQUITETURA GERAL DO SISTEMA

```
+-----------------------------------------------------------------------+
|                       QA - ESTUDE PARA CONCURSOS                      |
+-----------------------------------------------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
    [📱 FRONTEND MOBILE / PWA]                 [⚙️ BACKEND API REST]
    (React Native / Expo / PWA)                (Node.js + TypeScript / Express)
    - Trilha estilo Duolingo                   - Motor Auth & Trial 7 Dias
    - Arena de Questões Interativa             - Motor Anki SM-2
    - Decks de Flashcards Anki                 - Motor de Gamificação (XP/Streak)
    - Visualizador de Explicação IA            - Compactador & Extrator de PDFs
    - Checkout PIX R$ 1/dia                    - Mecanismo RAG (Busca Vetorial)
    - Modo Escuro / Design Moderno             - Conector LLM (Gemini / OpenAI)
            |                                           |
            +---------------------+---------------------+
                                  |
                     [💾 BANCO DE DADOS & STORAGE]
                     (PostgreSQL + pgvector ou SQLite-vec)
                     - Usuários & Assinaturas
                     - Chunks e Embeddings dos PDFs
                     - Histórico de Resoluções & SM-2
```

---

## 🧠 3. MOTOR PEDAGÓGICO: REPETIÇÃO ESPAÇADA (ALGORITMO SM-2)

Para cada questão ou flashcard respondido, o backend calcula o próximo intervalo de revisão com base no algoritmo **SuperMemo SM-2**:

### Fórmulas Matemáticas:
1. **Fator de Facilidade ($EF$)**:
   $$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$
   *Onde $q \in [0, 5]$ é a nota da resposta (0: Errei, 3: Difícil, 4: Bom, 5: Muito Fácil). O $EF$ nunca fica abaixo de 1.3.*

2. **Intervalo em Dias ($I$)**:
   - Para $n = 1$: $I(1) = 1\text{ dia}$
   - Para $n = 2$: $I(2) = 6\text{ dias}$
   - Para $n > 2$: $I(n) = I(n-1) \times EF$
   *(Se $q < 3$, o usuário errou: reseta $n = 0$ e $I = 1\text{ dia}$).*

---

## 🎮 4. MOTOR DE GAMIFICAÇÃO: ESTILO DUOLINGO

1. **Trilha de Aprendizado (Nodes / Fases)**:
   - Fases divididas por disciplinas: *Direito Constitucional*, *Direito Administrativo*, *Português*, *Raciocínio Lógico*, *Informática*, *Direito Penal*, etc.
   - Cada fase possui 3 a 5 lições. O usuário só desbloqueia a fase seguinte se atingir ao menos 70% de acertos na anterior.
2. **Sistema de Vidas (❤️ Corações)**:
   - Máximo de 5 corações.
   - Errar uma questão consome 1 coração.
   - 1 coração regenera a cada 4 horas ou ao completar uma "sessão de revisão rápida" de flashcards Anki.
3. **Streak / Ofensiva (🔥 Dias Consecutivos)**:
   - Se o aluno estudar no mínimo 1 lição ou 10 questões por dia, a ofensiva aumenta em +1.
   - Notificações de incentivo para manter a rotina diária de concurseiro.
4. **Níveis de XP e Conquistas**:
   - +15 XP por questão acertada de primeira.
   - +30 XP por lição completada com 100% de acertos ("Perfeito!").
   - Ligas semanais: *Bronze, Prata, Ouro, Safira, Diamante e Concursado Titular*.

---

## 📄 5. MOTOR RAG & COMPACTADOR DE PDFs (OTIMIZADO PARA SERVIDOR LEVE)

### O Problema:
PDFs de editais e apostilas de concursos possuem 500+ páginas, imagens pesadas e textos redundantes que sobrecarregam a RAM do servidor e a cota de tokens.

### A Solução Implementada no Backend:
1. **Compressão e Higienização de Fluxo**:
   - O arquivo PDF é processado página por página em stream de memória (sem gravar gigabytes no disco).
   - Remoção de rodapés repetitivos, cabeçalhos de páginas, números de página e imagens irrelevantes.
2. **Chunking Semântico com Sobreposição Controlada**:
   - Divisão em blocos de texto coesos de 500 a 800 caracteres com 100 caracteres de sobreposição.
   - Metadados anexados a cada chunk: `{ materia, topico, pagina, lei_artigo }`.
3. **Geração de Embeddings e Armazenamento Vetorial**:
   - Os chunks são convertidos em vetores de alta dimensionalidade via Google Gemini Embedding (`text-embedding-004`) ou OpenAI (`text-embedding-3-small`).
   - Busca por similaridade de cosseno ($Cosine\ Similarity \ge 0.75$) para recuperar o trecho exato da lei ou teoria solicitada pelo estudante.
4. **Prompt Anti-Alucinação para a IA Geradora de Questões**:
   - A IA recebe o contexto recuperado do PDF e gera questões no padrão das principais bancas (CEBRASPE/CESPE, FGV, FCC, VUNESP).
   - Toda resposta acompanha:
     - Enunciado claro.
     - 4 ou 5 alternativas identificadas (A, B, C, D, E) ou estilo Certo/Errado.
     - Gabarito oficial.
     - **Justificativa Comentada**: Explicação detalhada explicando por que a alternativa correta está certa e por que cada uma das outras está incorreta, citando expressamente a fonte/artigo de lei.

---

## 💳 6. SISTEMA DE MONETIZAÇÃO E CONTROLE DE TRIAL (7 DIAS GRÁTIS + R$ 1,00/DIA)

### Regras de Negócio:
1. **No Cadastro do Usuário**:
   - `created_at = NOW()`
   - `trial_ends_at = NOW() + 7 days`
   - `is_premium = true` (enquanto `NOW() < trial_ends_at`)
2. **Ao Expirar os 7 Dias**:
   - Se `NOW() > trial_ends_at` e `subscription_active == false`:
     - Bloqueio de novas lições na trilha principal.
     - Apresentação do Paywall com opção: **"Apenas R$ 1,00 por dia"** ou **"R$ 29,90 por mês"**.
3. **Geração de PIX Dinâmico com Mercado Pago / Gerencianet**:
   - Geração instantânea de QR Code PIX e código "Copia e Cola" no valor de R$ 1,00.
   - Webhook automático de confirmação que adiciona +24 horas ao `access_expires_at` do usuário no mesmo segundo em que o pagamento é liquidado.

---

## 📱 7. ESPECIFICAÇÃO DE DESIGN & EXPERIÊNCIA DO USUÁRIO (UI/UX)

- **Paleta de Cores**:
  - Primária: Verde Duolingo / Esmeralda (`#10B981` / `#059669`) — transmite sensação de conquista e avanço.
  - Secundária: Azul Índigo (`#6366F1`) — foco e clareza para leitura de leis.
  - Acentos de Gamificação: Amarelo Ouro (`#F59E0B`) para XP/Streak e Vermelho Rubro (`#EF4444`) para Corações/Vidas.
  - Fundo: Dark Mode Moderno (`#0F172A` / `#1E293B`) e Light Mode Limpo (`#F8FAFC`).
- **Elementos Interativos**:
  - Botões táteis com sombra sólida 3D que "afundam" ao tocar (estilo Duolingo).
  - Micro-animações com efeitos sonoros suaves de acerto/erro.
  - Cartões de estudo estilo Anki com animação de flip 3D suave.

---

## 🛠️ 8. PASSO A PASSO PARA EXECUTAR O SISTEMA

### Pré-requisitos:
- Node.js 18+ ou 20+ instalado.
- Chave de API da IA (Google Gemini API Key ou OpenAI API Key).

### Executando o Backend:
```bash
cd "App de estudo/backend"
npm install
npm run dev
```

### Executando o App Mobile / Web PWA:
```bash
cd "App de estudo/app-mobile"
npm install
npm run dev
```
O app estará acessível em `http://localhost:5173` ou via emulador/dispositivo móvel na mesma rede Wi-Fi.

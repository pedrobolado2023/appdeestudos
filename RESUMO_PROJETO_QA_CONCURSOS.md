# 📘 QA - Estude para Concursos | Documentação Completa & Histórico de Desenvolvimento

> **Registro oficial consolidado das decisões de arquitetura, implementação técnica, modelo de negócios, monetização com Google AdMob/AdSense e deploy no EasyPanel / Google Play Store.**

---

## 📑 Sumário Executivo

1. [Visão Geral do Aplicativo](#1-visão-geral-do-aplicativo)
2. [Arquitetura & Tecnologias Utilizadas](#2-arquitetura--tecnologias-utilizadas)
3. [Evolução e Funcionalidades Implementadas](#3-evolução-e-funcionalidades-implementadas)
   - [3.1. Inteligência Artificial (Google Gemini 3.6 Flash)](#31-inteligência-artificial-google-gemini-36-flash)
   - [3.2. Motor RAG & Compactação de PDFs](#32-motor-rag--compactação-de-pdfs)
   - [3.3. Trilha Gamificada Estilo Duolingo & Level Up](#33-trilha-gamificada-estilo-duolingo--level-up)
   - [3.4. Motor de Repetição Espaçada Anki (Algoritmo SM-2)](#34-motor-de-repetição-espaçada-anki-algoritmo-sm-2)
   - [3.5. Sistema de Vidas & Economia do Jogo](#35-sistema-de-vidas--economia-do-jogo)
   - [3.6. Transformação em PWA (Instalação no Celular Android/iOS)](#36-transformação-em-pwa-instalação-no-celular-androidios)
4. [Monetização: Google AdMob, AdSense & Assinaturas VIP](#4-monetização-google-admob-adsense--assinaturas-vip)
   - [4.1. Como funciona a Receita com Anúncios (eCPM & Ganhos)](#41-como-funciona-a-receita-com-anúncios-ecpm--ganhos)
   - [4.2. Simulação de Faturamento (1.000 a 2.000 Alunos/Dia)](#42-simulação-de-faturamento-1000-a-2000-alunosdia)
   - [4.3. Configuração do Publisher ID (`pub-3709245247171200`)](#43-configuração-do-publisher-id-pub-3709245247171200)
5. [Guia de Deploy no Servidor com EasyPanel](#5-guia-de-deploy-no-servidor-com-easypanel)
6. [Guia de Publicação na Google Play Store](#6-guia-de-publicação-na-google-play-store)
7. [Repositório GitHub & Controle de Versão](#7-repositório-github--controle-de-versão)
8. [Mapa de Endpoints da API REST](#8-mapa-de-endpoints-da-api-rest)

---

## 1. Visão Geral do Aplicativo

O **QA - Estude para Concursos** é uma plataforma EdTech gamificada de alta retenção projetada para concurseiros. O app une a dinâmica viciante do **Duolingo** (fases, vidas, ofensivas, sons e confetes), a eficácia científica do **Anki SM-2** (repetição espaçada para memorização de lei seca) e a precisão de um motor **RAG com IA Anti-Alucinação** alimentado por editais e leis em PDF.

* **Concurso Alvo Inicial**: Secretaria de Desenvolvimento Social do Distrito Federal (**SEDES/DF**) - Cargos de Especialista e Técnico em Assistência Social (LOAS, SUAS, ECA, Estatuto do Idoso, LC 840/2011 e LODF).

---

## 2. Arquitetura & Tecnologias Utilizadas

```
[ Frontend: PWA Mobile-First ]
  ├── TailwindCSS Dark/Light Theme
  ├── Lucide Icons & Canvas Confetti
  ├── Web Audio API (Sintetizador Nativo)
  ├── Service Worker (sw.js) & Web Manifest
  └── AdMob / AdSense Bridge
            │ (HTTP REST / JSON)
            ▼
[ Backend: Node.js 22 LTS ES Modules ]
  ├── RAG Engine (Chunking Semântico + Busca Vetorial/Lexical)
  ├── Extrator de PDFs (pdf-parse com suporte a Uint8Array)
  ├── Google Gemini 3.6 Flash API
  ├── Anki SM-2 SuperMemo Engine
  └── Persistência Local em Disco (storage.json / Docker Volume)
```

---

## 3. Evolução e Funcionalidades Implementadas

### 3.1. Inteligência Artificial (Google Gemini 3.6 Flash)
- **Descoberta & Ajuste**: Atualizamos os endpoints da API do Google para o modelo `gemini-3.6-flash`, contornando a depreciação de versões antigas.
- **Modo Anti-Alucinação**: A IA só formula questões e justificativas baseadas nos chunks RAG extraídos do próprio PDF do edital e leis oficiais, citando o artigo de lei correspondente.

### 3.2. Motor RAG & Compactação de PDFs
- **Correção Técnica**: Adaptamos o `pdf-parse` v2.4.5 para receber `new Uint8Array(buffer)`, permitindo extrair documentos pesados sem estouro de memória.
- **Indexação**: O edital oficial da SEDES/DF foi processado com mais de **331.000 caracteres**, gerando 257 chunks semânticos indexados e prontos para consulta imediata.

### 3.3. Trilha Gamificada Estilo Duolingo & Level Up
- **Game Loop por Acertos**: Cada fase exige uma meta (ex: 3 acertos).
- **Animações Comemorativas**:
  - Barra de progresso visual em tempo real (`0/3 ➔ 3/3`).
  - Explosão de confetes multicoloridos (`canvas-confetti`).
  - Fanfarra de áudio sintetizada em tempo real via **Web Audio API**.
  - Modal de **Fase Concluída** com bônus de **+50 XP** e desbloqueio da próxima fase na trilha.

### 3.4. Motor de Repetição Espaçada Anki (Algoritmo SM-2)
- **Cards 3D Flip**: Toque para virar o card entre pergunta e resposta/fundamento de lei seca.
- **Algoritmo SM-2**: Calcula dinamicamente o Fator de Facilidade (*Ease Factor*), Repetições e Intervalo em dias com base na resposta do aluno (Errei, Difícil, Bom, Fácil).
- **Conversão Direta de Questões**: Botão `⚡ Salvar no Deck Anki` na arena de questões que transforma qualquer questão errada/comentada em flashcard automaticamente.

### 3.5. Sistema de Vidas & Economia do Jogo
- **Plano Gratuito (Free)**:
  - 5 Vidas (perde 1 coração ao errar uma questão).
  - Ao zerar as vidas (`0/5`), abre o modal de pausa.
  - Opções para continuar:
    1. 🎬 **Assistir Vídeo Premiado**: recupera **+3 Vidas** na hora após 5 segundos de anúncio.
    2. ⏳ **Aguardar Cronômetro**: recarga automática de 1 vida a cada 5 minutos.
    3. 👑 **Assinar o Plano VIP**: vidas infinitas.
- **Plano VIP**:
  - Vidas Infinitas (`∞`), não perde corações e estuda sem interrupções.

### 3.6. Transformação em PWA (Instalação no Celular Android/iOS)
- **Manifesto Web (`manifest.json`)**: Ícones personalizados, cores de tema (`#0F172A`), modo `standalone` e orientação vertical.
- **Service Worker (`sw.js`)**: Caching inteligente para abertura instantânea e suporte offline.
- **Acesso na Rede Local (Wi-Fi)**: O servidor foi configurado em `0.0.0.0`, permitindo acesso direto pelo celular no endereço `http://192.168.18.16:3333` ou via QR Code na tela.

---

## 4. Monetização: Google AdMob, AdSense & Assinaturas VIP

### 4.1. Como funciona a Receita com Anúncios (eCPM & Ganhos)
* **eCPM (*Effective Cost Per Mille*)**: Valor que o Google paga a cada 1.000 visualizações de anúncio.
* **Vídeos Premiados (Rewarded Ads)**: São os anúncios mais caros e lucrativos do mercado (eCPM de **R$ 20,00 a R$ 50,00**), pois o estudante assiste 100% do vídeo para ganhar vidas.
* **Banners Fixos**: Exibidos no rodapé do mapa e quiz (eCPM de **R$ 2,00 a R$ 5,00**).

### 4.2. Simulação de Faturamento (1.000 a 2.000 Alunos/Dia)

| Origem da Receita | Volume Estimado | Faturamento Mensal Estimado |
| :--- | :--- | :--- |
| **🎬 Anúncios no Plano Free (95% dos usuários)** | ~170.000 vídeos premiados assistidos | **R$ 5.100,00 / mês** *(Google AdMob/AdSense)* |
| **👑 Assinaturas VIP (5% dos usuários)** | 100 assinantes × R$ 29,99/mês | **R$ 2.999,00 / mês** *(Mercado Pago / PIX)* |
| **💰 TOTAL ESTIMADO** | **2.000 usuários ativos** | **~ R$ 8.099,00 / mês** |

### 4.3. Configuração do Publisher ID (`pub-3709245247171200`)
- **Arquivo `ads.txt` criado**: `google.com, pub-3709245247171200, DIRECT, f08c47fec0942fa0`
- **Página de Política de Privacidade**: Criada em `/privacy.html` em total conformidade com a LGPD e regras do Google Play Console e Google AdMob.
- **Regra de Ocultação VIP**: Assinantes VIP têm **100% dos anúncios e botões de propaganda removidos** da interface.

---

## 5. Guia de Deploy no Servidor com EasyPanel

O projeto já possui os arquivos prontos:
- [`Dockerfile`](Dockerfile): Node.js 22 LTS Alpine com volume `/app/data`.
- [`docker-compose.yml`](docker-compose.yml): Orquestração pronta com portas e variáveis.
- [`.dockerignore`](.dockerignore): Otimização de build.

### Passo a Passo no EasyPanel:
1. Crie um novo projeto: `qa-concursos`.
2. Crie um serviço **App** conectado ao repositório: `pedrobolado2023/appdeestudos`.
3. Na aba **Environment**, adicione:
   ```env
   NODE_ENV=production
   PORT=3333
   GEMINI_API_KEY=sua_chave_gemini_aqui
   GOOGLE_ADSENSE_PUB_ID=pub-3709245247171200
   ```
4. Na aba **Domains**, configure seu domínio (ex: `app.seusite.com.br`) na porta `3333` com SSL automático.
5. Na aba **Mounts**, crie o volume `qa_data` apontando para `/app/data`.
6. Clique em **Deploy**!

---

## 6. Guia de Publicação na Google Play Store

Depois que o app estiver rodando no seu domínio no EasyPanel (com HTTPS):

1. Acesse **[pwabuilder.com](https://www.pwabuilder.com)**.
2. Cole a URL do seu app (ex: `https://app.seusite.com.br`) e clique em **Start**.
3. Clique em **Package for Store** ➔ **Google Play**.
4. Baixe o arquivo **`.aab` (Android App Bundle)**.
5. No **Google Play Console** (taxa única de US$ 25):
   - Crie o aplicativo com o nome **QA - Estude para Concursos**.
   - Coloque o link da Política de Privacidade: `https://app.seusite.com.br/privacy.html`.
   - Faça o upload do arquivo `.aab` e envie para aprovação!

---

## 7. Repositório GitHub & Controle de Versão

- **Repositório Oficial**: **[https://github.com/pedrobolado2023/appdeestudos](https://github.com/pedrobolado2023/appdeestudos)**
- **Branch Principal**: `main`
- **Autenticação Configurada**: Chave SSH Ed25519 registrada na conta GitHub.

---

## 8. Mapa de Endpoints da API REST

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/user/profile` | Retorna dados do usuário, XP, streak, vidas, plano (Free/VIP) e edital |
| `POST` | `/api/user/toggle-plan` | Alterna entre Plano Free e Plano VIP para simulação |
| `POST` | `/api/user/watch-ad` | Credita +3 vidas e +10 XP ao término do anúncio premiado |
| `POST` | `/api/user/set-api-key` | Configura e valida a chave do Google Gemini |
| `GET` | `/api/stages` | Lista as fases da trilha gamificada com status de desbloqueio e progresso |
| `GET` | `/api/questions` | Retorna questões filtradas por matéria do edital |
| `POST` | `/api/questions/answer` | Valida resposta, calcula XP, deduz vidas no Free e avança progresso da fase |
| `POST` | `/api/questions/generate-ai` | Gera questão inédita pela IA Gemini usando chunks do PDF |
| `POST` | `/api/questions/convert-to-anki`| Converte questão comentada em flashcard Anki automaticamente |
| `GET` | `/api/anki/cards` | Retorna os flashcards do deck de repetição espaçada |
| `POST` | `/api/anki/review` | Processa a nota da revisão (1-5) e recalcula o algoritmo SM-2 |
| `POST` | `/api/knowledge/upload-pdf` | Recebe apostilas/editais em PDF, compacta e indexa no RAG |
| `POST` | `/api/billing/confirm-pix` | Simula confirmação de pagamento PIX de R$ 29,99 |

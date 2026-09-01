# 📱 QA - Estude para Concursos

Aplicativo completo para preparação de concursos públicos com **gamificação estilo Duolingo**, **repetição espaçada (Anki SM-2)**, **RAG com ingestão e compressão de PDFs próprios (anti-alucinação)** e **modelo de monetização com 7 dias grátis + R$ 1,00/dia**.

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Backend (Node.js / Express / TypeScript)
```bash
cd "backend"
npm install
npm run dev
```
*O servidor iniciará em `http://localhost:3333` com as APIs de RAG, Anki, Gamificação e Pagamentos ativas.*

---

### 2. Iniciar o App Mobile / Frontend (React + Vite + Tailwind + PWA)
```bash
cd "app-mobile"
npm install
npm run dev
```
*O aplicativo estará disponível em `http://localhost:5173` ou na sua rede local para testar diretamente pelo celular.*

---

## 🎯 Principais Módulos do Sistema

1. **PROMPT_MESTRE_SISTEMA.md**: O prompt mestre e especificação completa de engenharia para guiar e expandir o app.
2. **Trilha Duolingo**: Fases organizadas com nós desbloqueáveis, XP, vidas (❤️), ofensiva diária (🔥) e ligas.
3. **Arena de Questões**: Questões de bancas reais (CEBRASPE, FGV, FCC) com justificativa e fundamentação legal linha por linha.
4. **Anki SM-2**: Motor de repetição espaçada com cálculo matemático de retenção de memória e agendamento de revisões.
5. **Central de RAG & PDFs**: Pipeline de compressão de arquivos que reduz o peso em ~90% e gera questões fiéis sem sobrecarregar a memória do servidor.
6. **Monetização**: Trial de 7 dias grátis e cobrança de R$ 1,00 por dia via PIX com liberação instantânea.

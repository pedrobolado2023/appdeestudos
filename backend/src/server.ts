import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', apiRoutes);

// Rota de Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'QA - Estude para concursos API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 QA - Estude para concursos (Backend Engine)`);
  console.log(`📡 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📚 RAG, Anki SM-2, Duolingo Gamification e Billing Ativos!`);
  console.log(`====================================================`);
});

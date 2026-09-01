import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../database/db.js';
import { gamifyService } from '../services/gamifyService.js';
import { ankiService } from '../services/ankiService.js';
import { billingService } from '../services/billingService.js';
import { pdfService } from '../services/pdfService.js';
import { aiService } from '../services/aiService.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB max

// ID do usuário padrão para demonstração
const DEMO_USER_ID = 'demo-user-1';

// 1. PERFIL DO USUÁRIO & GAMIFICAÇÃO
router.get('/user/profile', (req: Request, res: Response) => {
  const user = db.users.get(DEMO_USER_ID);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const accessStatus = billingService.checkAccessStatus(DEMO_USER_ID);
  return res.json({
    user,
    access: accessStatus
  });
});

router.post('/user/restore-heart', (req: Request, res: Response) => {
  try {
    const updatedUser = gamifyService.restoreHeart(DEMO_USER_ID);
    return res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 2. FASES & TRILHA ESTILO DUOLINGO
router.get('/stages', (req: Request, res: Response) => {
  const stages = gamifyService.getStages();
  return res.json({ stages });
});

// 3. ARENA DE QUESTÕES
router.get('/questions', (req: Request, res: Response) => {
  const { subject } = req.query;
  const questions = aiService.getQuestionsBySubject(subject as string | undefined);
  return res.json({ questions });
});

router.post('/questions/generate', async (req: Request, res: Response) => {
  try {
    const { subject, topic } = req.body;
    const newQuestion = await aiService.generateQuestion(subject || 'Direito Constitucional', topic || 'Artigo 5º');
    db.questions.push(newQuestion);
    return res.json({ question: newQuestion });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/questions/answer', (req: Request, res: Response) => {
  try {
    const { questionId, selectedOptionId, stageId, lessonId } = req.body;
    const question = db.questions.find(q => q.id === questionId);
    if (!question) return res.status(404).json({ error: 'Questão não encontrada' });

    const isCorrect = question.correctOptionId === selectedOptionId;
    const gamifyResult = gamifyService.registerAnswer(DEMO_USER_ID, isCorrect, stageId, lessonId);

    return res.json({
      isCorrect,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation,
      gamify: gamifyResult
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/questions/convert-to-anki', (req: Request, res: Response) => {
  try {
    const { front, back, subject, topic } = req.body;
    const newCard = ankiService.createCard({
      userId: DEMO_USER_ID,
      front: front || 'Conceito chave',
      back: back || 'Fundamentação e resposta',
      subject: subject || 'Revisão de Erros',
      topic: topic || 'Fixação SM-2'
    });
    return res.json({ success: true, card: newCard, message: 'Flashcard adicionado ao Anki com sucesso!' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 4. FLASHCARDS & REPETIÇÃO ESPAÇADA ANKI SM-2
router.get('/anki/cards', (req: Request, res: Response) => {
  const { filter } = req.query;
  const cards = filter === 'due'
    ? ankiService.getDueCards(DEMO_USER_ID)
    : ankiService.getAllCards(DEMO_USER_ID);

  return res.json({
    totalCards: db.flashcards.length,
    dueCardsCount: ankiService.getDueCards(DEMO_USER_ID).length,
    cards
  });
});

router.post('/anki/review', (req: Request, res: Response) => {
  try {
    const { cardId, quality } = req.body;
    const updatedCard = ankiService.processReview(cardId, Number(quality));
    return res.json({ success: true, card: updatedCard });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/anki/cards', (req: Request, res: Response) => {
  try {
    const { front, back, subject, topic } = req.body;
    const newCard = ankiService.createCard({
      userId: DEMO_USER_ID,
      front,
      back,
      subject: subject || 'Geral',
      topic: topic || 'Conceitos'
    });
    return res.json({ success: true, card: newCard });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 5. INGESTÃO, COMPRESSÃO E RAG DE PDFs
router.post('/knowledge/upload-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const { subject } = req.body;
    const result = await pdfService.processAndCompressPdf(
      req.file.buffer,
      req.file.originalname,
      subject || 'Material Próprio de Concurso'
    );

    return res.json({
      success: true,
      document: result.doc,
      totalChunksCreated: result.chunksCount,
      message: `PDF compactado em ${result.doc.compressionRatioPercent}% com sucesso! Pronto para geração de questões.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/knowledge/documents', (req: Request, res: Response) => {
  const documents = pdfService.getDocuments();
  return res.json({ documents, totalChunks: db.chunks.length });
});

// 6. MONETIZAÇÃO, TRIAL 7 DIAS E PIX R$ 1,00/DIA
router.get('/billing/status', (req: Request, res: Response) => {
  const status = billingService.checkAccessStatus(DEMO_USER_ID);
  return res.json(status);
});

router.post('/billing/pix-charge', (req: Request, res: Response) => {
  try {
    const { planType } = req.body; // 'daily' (R$ 1,00) ou 'monthly' (R$ 29,90)
    const charge = billingService.createPixCharge(DEMO_USER_ID, planType || 'daily');
    return res.json(charge);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/billing/confirm-pix', (req: Request, res: Response) => {
  try {
    const { planType } = req.body;
    const updatedUser = billingService.confirmPayment(DEMO_USER_ID, planType || 'daily');
    return res.json({
      success: true,
      message: 'Pagamento confirmado com sucesso! Acesso liberado.',
      user: updatedUser,
      access: billingService.checkAccessStatus(DEMO_USER_ID)
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;

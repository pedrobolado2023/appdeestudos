import { UserProfile, AccessStatus, StudyStage, Question, Flashcard, KnowledgeDocument } from '../types';

const API_BASE_URL = 'http://localhost:3333/api';

export const api = {
  // 1. Perfil e Gamificação
  async getProfile(): Promise<{ user: UserProfile; access: AccessStatus }> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`);
      if (!res.ok) throw new Error('Falha ao obter perfil');
      return await res.json();
    } catch {
      // Fallback local se o backend não estiver ativo no momento
      return {
        user: {
          id: 'demo-user-1',
          name: 'Futuro Concursado',
          email: 'aluno@concursos.com',
          createdAt: new Date().toISOString(),
          trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          accessExpiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          isPremium: true,
          xp: 340,
          hearts: 5,
          maxHearts: 5,
          streak: 4,
          lastStudyDate: new Date().toISOString().split('T')[0],
          currentLevel: 3,
          league: 'Ouro'
        },
        access: {
          hasAccess: true,
          isTrial: true,
          daysRemaining: 7,
          hoursRemaining: 168,
          planStatus: 'trial_active'
        }
      };
    }
  },

  async restoreHeart(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/user/restore-heart`, { method: 'POST' });
    const data = await res.json();
    return data.user;
  },

  // 2. Fases / Trilha Duolingo
  async getStages(): Promise<StudyStage[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/stages`);
      const data = await res.json();
      return data.stages;
    } catch {
      return [];
    }
  },

  // 3. Questões & Respostas
  async getQuestions(subject?: string): Promise<Question[]> {
    try {
      const url = subject ? `${API_BASE_URL}/questions?subject=${encodeURIComponent(subject)}` : `${API_BASE_URL}/questions`;
      const res = await fetch(url);
      const data = await res.json();
      return data.questions;
    } catch {
      return [];
    }
  },

  async generateQuestion(subject: string, topic: string): Promise<Question> {
    const res = await fetch(`${API_BASE_URL}/questions/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic })
    });
    const data = await res.json();
    return data.question;
  },

  async submitAnswer(params: {
    questionId: string;
    selectedOptionId: string;
    stageId?: number;
    lessonId?: string;
  }): Promise<{
    isCorrect: boolean;
    correctOptionId: string;
    explanation: Question['explanation'];
    gamify: {
      user: UserProfile;
      xpGained: number;
      heartsLost: number;
      streakUpdated: boolean;
      unlockedNewStage: boolean;
    };
  }> {
    const res = await fetch(`${API_BASE_URL}/questions/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  },

  // 4. Anki SM-2
  async getCards(filter?: 'due' | 'all'): Promise<{ totalCards: number; dueCardsCount: number; cards: Flashcard[] }> {
    try {
      const url = filter ? `${API_BASE_URL}/anki/cards?filter=${filter}` : `${API_BASE_URL}/anki/cards`;
      const res = await fetch(url);
      return await res.json();
    } catch {
      return { totalCards: 0, dueCardsCount: 0, cards: [] };
    }
  },

  async reviewCard(cardId: string, quality: number): Promise<Flashcard> {
    const res = await fetch(`${API_BASE_URL}/anki/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, quality })
    });
    const data = await res.json();
    return data.card;
  },

  async createCard(card: { front: string; back: string; subject: string; topic: string }): Promise<Flashcard> {
    const res = await fetch(`${API_BASE_URL}/anki/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });
    const data = await res.json();
    return data.card;
  },

  // 5. Ingestão de PDFs e Compressão
  async uploadPdf(file: File, subject: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);

    const res = await fetch(`${API_BASE_URL}/knowledge/upload-pdf`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  },

  async getDocuments(): Promise<{ documents: KnowledgeDocument[]; totalChunks: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/documents`);
      return await res.json();
    } catch {
      return { documents: [], totalChunks: 0 };
    }
  },

  // 6. Cobrança e PIX
  async createPixCharge(planType: 'daily' | 'monthly'): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/billing/pix-charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType })
    });
    return await res.json();
  },

  async confirmPayment(planType: 'daily' | 'monthly'): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/billing/confirm-pix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType })
    });
    return await res.json();
  }
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  trialEndsAt: string;
  accessExpiresAt: string;
  isPremium: boolean;
  xp: number;
  hearts: number; // 0 a 5 corações
  maxHearts: number;
  streak: number; // Ofensiva em dias
  lastStudyDate: string;
  currentLevel: number;
  league: 'Bronze' | 'Prata' | 'Ouro' | 'Safira' | 'Diamante';
}

export interface QuestionOption {
  id: string;
  label: string; // "A", "B", "C", "D", "E"
  text: string;
}

export interface Question {
  id: string;
  subject: string; // Ex: "Direito Constitucional"
  topic: string; // Ex: "Artigo 5º e Direitos Fundamentais"
  banca?: string; // Ex: "CEBRASPE", "FGV", "FCC"
  type: 'multiple_choice' | 'right_wrong';
  statement: string; // Enunciado da questão
  options: QuestionOption[];
  correctOptionId: string; // ID da alternativa correta
  explanation: {
    correctText: string;
    whyCorrect: string;
    distractorsExplanation: Record<string, string>; // Explicação de cada alternativa errada
    legalBasis: string; // Base legal (ex: Art. 5º, inciso XI da CF/88)
  };
  difficulty: 'facil' | 'medio' | 'dificil';
}

export interface Flashcard {
  id: string;
  userId: string;
  front: string;
  back: string;
  subject: string;
  topic: string;
  repetitions: number;
  interval: number; // Em dias
  easeFactor: number; // Começa em 2.5
  nextReviewDate: string;
  lastReviewedAt?: string;
}

export interface StageLesson {
  id: string;
  title: string;
  description: string;
  questionsCount: number;
  completed: boolean;
  score?: number;
}

export interface StudyStage {
  id: number;
  title: string;
  subject: string;
  icon: string;
  description: string;
  requiredXp: number;
  unlocked: boolean;
  completed: boolean;
  lessons: StageLesson[];
}

export interface KnowledgeDocument {
  id: string;
  filename: string;
  subject: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatioPercent: number;
  totalChunks: number;
  uploadedAt: string;
}

export interface TextChunk {
  id: string;
  docId: string;
  subject: string;
  content: string;
  pageNumber: number;
  articleReference?: string;
}

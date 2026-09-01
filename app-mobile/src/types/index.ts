export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  trialEndsAt: string;
  accessExpiresAt: string;
  isPremium: boolean;
  xp: number;
  hearts: number;
  maxHearts: number;
  streak: number;
  lastStudyDate: string;
  currentLevel: number;
  league: 'Bronze' | 'Prata' | 'Ouro' | 'Safira' | 'Diamante';
}

export interface AccessStatus {
  hasAccess: boolean;
  isTrial: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  planStatus: 'trial_active' | 'trial_expired' | 'premium_active' | 'premium_expired';
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  banca?: string;
  type: 'multiple_choice' | 'right_wrong';
  statement: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: {
    correctText: string;
    whyCorrect: string;
    distractorsExplanation: Record<string, string>;
    legalBasis: string;
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
  interval: number;
  easeFactor: number;
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

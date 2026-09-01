import { Flashcard } from '../types/index.js';
import { db } from '../database/db.js';

export class AnkiService {
  /**
   * Atualiza o flashcard aplicando o algoritmo SuperMemo SM-2
   * @param cardId ID do flashcard
   * @param quality Nota de avaliação do usuário de 0 a 5:
   *   0 = Erro total (Blackout)
   *   1 = Erro parcial
   *   2 = Erro leve
   *   3 = Lembrou com dificuldade
   *   4 = Lembrou com hesitação
   *   5 = Perfeito / Fácil
   */
  public processReview(cardId: string, quality: number): Flashcard {
    const card = db.flashcards.find(c => c.id === cardId);
    if (!card) {
      throw new Error(`Flashcard com id ${cardId} não encontrado.`);
    }

    // Normaliza nota entre 0 e 5
    const q = Math.max(0, Math.min(5, quality));

    let { repetitions, interval, easeFactor } = card;

    if (q >= 3) {
      // Resposta correta
      if (repetitions === 0) {
        interval = 1; // 1 dia
      } else if (repetitions === 1) {
        interval = 6; // 6 dias
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      // Resposta errada: reseta repetições para reaprendizado
      repetitions = 0;
      interval = 1;
    }

    // Atualiza Fator de Facilidade (Ease Factor)
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easeFactor < 1.3) {
      easeFactor = 1.3; // Mínimo seguro do algoritmo SM-2
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    card.repetitions = repetitions;
    card.interval = interval;
    card.easeFactor = Number(easeFactor.toFixed(2));
    card.nextReviewDate = nextReview.toISOString();
    card.lastReviewedAt = new Date().toISOString();

    return card;
  }

  public getDueCards(userId: string): Flashcard[] {
    const now = new Date();
    return db.flashcards.filter(card => {
      if (card.userId !== userId) return false;
      const reviewDate = new Date(card.nextReviewDate);
      return reviewDate <= now;
    });
  }

  public getAllCards(userId: string): Flashcard[] {
    return db.flashcards.filter(c => c.userId === userId);
  }

  public createCard(cardData: Omit<Flashcard, 'id' | 'repetitions' | 'interval' | 'easeFactor' | 'nextReviewDate'>): Flashcard {
    const newCard: Flashcard = {
      id: 'fc-' + Date.now(),
      ...cardData,
      repetitions: 0,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString()
    };
    db.flashcards.push(newCard);
    return newCard;
  }
}

export const ankiService = new AnkiService();

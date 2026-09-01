import { UserProfile, StudyStage } from '../types/index.js';
import { db } from '../database/db.js';

export class GamifyService {
  /**
   * Processa o resultado de uma questão respondida pelo aluno
   */
  public registerAnswer(userId: string, isCorrect: boolean, stageId?: number, lessonId?: string): {
    user: UserProfile;
    xpGained: number;
    heartsLost: number;
    streakUpdated: boolean;
    unlockedNewStage: boolean;
  } {
    const user = db.users.get(userId);
    if (!user) throw new Error('Usuário não encontrado.');

    let xpGained = 0;
    let heartsLost = 0;
    let streakUpdated = false;
    let unlockedNewStage = false;

    const todayStr = new Date().toISOString().split('T')[0];

    // Atualiza Streak (Ofensiva diária)
    if (user.lastStudyDate !== todayStr) {
      user.streak += 1;
      user.lastStudyDate = todayStr;
      streakUpdated = true;
    }

    if (isCorrect) {
      xpGained = 15;
      user.xp += xpGained;
    } else {
      heartsLost = 1;
      user.hearts = Math.max(0, user.hearts - 1);
    }

    // Atualiza nível a cada 150 XP
    user.currentLevel = Math.floor(user.xp / 150) + 1;

    // Atualiza liga
    if (user.xp > 1000) user.league = 'Diamante';
    else if (user.xp > 600) user.league = 'Safira';
    else if (user.xp > 300) user.league = 'Ouro';
    else if (user.xp > 100) user.league = 'Prata';
    else user.league = 'Bronze';

    // Se completou lição
    if (stageId && lessonId) {
      const stage = db.stages.find(s => s.id === stageId);
      if (stage) {
        const lesson = stage.lessons.find(l => l.id === lessonId);
        if (lesson && isCorrect) {
          lesson.completed = true;
        }

        // Verifica se todas as lições da fase foram completadas
        const allCompleted = stage.lessons.every(l => l.completed);
        if (allCompleted) {
          stage.completed = true;
          // Desbloqueia próxima fase
          const nextStage = db.stages.find(s => s.id === stageId + 1);
          if (nextStage && !nextStage.unlocked) {
            nextStage.unlocked = true;
            unlockedNewStage = true;
          }
        }
      }
    }

    return {
      user,
      xpGained,
      heartsLost,
      streakUpdated,
      unlockedNewStage
    };
  }

  /**
   * Recupera vidas através de treino rápido ou tempo
   */
  public restoreHeart(userId: string): UserProfile {
    const user = db.users.get(userId);
    if (!user) throw new Error('Usuário não encontrado.');

    if (user.hearts < user.maxHearts) {
      user.hearts += 1;
    }
    return user;
  }

  public getStages(): StudyStage[] {
    return db.stages;
  }
}

export const gamifyService = new GamifyService();

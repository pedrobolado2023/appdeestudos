import { UserProfile } from '../types/index.js';
import { db } from '../database/db.js';

export interface PixChargeResponse {
  paymentId: string;
  amount: number;
  qrCodeBase64: string;
  copyPastePix: string;
  expiresInSeconds: number;
  message: string;
}

export class BillingService {
  /**
   * Checa se o usuário ainda possui dias de trial ou acesso pago válido
   */
  public checkAccessStatus(userId: string): {
    hasAccess: boolean;
    isTrial: boolean;
    daysRemaining: number;
    hoursRemaining: number;
    planStatus: 'trial_active' | 'trial_expired' | 'premium_active' | 'premium_expired';
  } {
    const user = db.users.get(userId);
    if (!user) throw new Error('Usuário não encontrado.');

    const now = new Date();
    const trialEnd = new Date(user.trialEndsAt);
    const accessExpires = new Date(user.accessExpiresAt);

    // Se ainda está dentro do período de 7 dias grátis
    if (now < trialEnd) {
      const diffMs = trialEnd.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.ceil(diffMs / (1000 * 60 * 60));
      return {
        hasAccess: true,
        isTrial: true,
        daysRemaining,
        hoursRemaining,
        planStatus: 'trial_active'
      };
    }

    // Se já passou do trial mas pagou e o acesso está vigente
    if (now < accessExpires) {
      const diffMs = accessExpires.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.ceil(diffMs / (1000 * 60 * 60));
      return {
        hasAccess: true,
        isTrial: false,
        daysRemaining,
        hoursRemaining,
        planStatus: 'premium_active'
      };
    }

    // Acesso expirado (necessário pagar R$ 1,00 por dia)
    user.isPremium = false;
    return {
      hasAccess: false,
      isTrial: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      planStatus: 'trial_expired'
    };
  }

  /**
   * Gera cobrança instantânea via PIX no valor de R$ 29,99 (Assinatura Mensal de 30 dias - equivalente a R$ 1/dia)
   */
  public createPixCharge(userId: string, planType: 'monthly' | 'annual' = 'monthly'): PixChargeResponse {
    const user = db.users.get(userId);
    if (!user) throw new Error('Usuário não encontrado.');

    const amount = planType === 'monthly' ? 29.99 : 249.90;
    const paymentId = 'pay_' + Date.now();

    // Código PIX Copia e Cola (Padrão BR Code formatado)
    const copyPastePix = `00020126580014br.gov.bcb.pix0136${paymentId}@concursos.qa.app520400005303986540${amount.toFixed(2)}5802BR5915QA ESTUDO APP6009SAO PAULO62070503***6304ABCD`;

    return {
      paymentId,
      amount,
      qrCodeBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23FFFFFF"/><rect x="20" y="20" width="60" height="60" fill="%230F172A"/><rect x="120" y="20" width="60" height="60" fill="%230F172A"/><rect x="20" y="120" width="60" height="60" fill="%230F172A"/><rect x="40" y="40" width="20" height="20" fill="%2310B981"/><rect x="140" y="40" width="20" height="20" fill="%2310B981"/><rect x="40" y="140" width="20" height="20" fill="%2310B981"/><rect x="90" y="90" width="20" height="20" fill="%2310B981"/></svg>',
      copyPastePix,
      expiresInSeconds: 900, // 15 minutos
      message: `Assinatura Mensal gerada com sucesso por apenas R$ ${amount.toFixed(2)} (menos de R$ 1 por dia)!`
    };
  }

  /**
   * Confirma pagamento PIX e adiciona tempo de acesso (30 dias para mensal, 365 dias para anual)
   */
  public confirmPayment(userId: string, planType: 'monthly' | 'annual' = 'monthly'): UserProfile {
    const user = db.users.get(userId);
    if (!user) throw new Error('Usuário não encontrado.');

    const now = new Date();
    let currentExpires = new Date(user.accessExpiresAt);
    if (currentExpires < now) {
      currentExpires = now;
    }

    const additionalDays = planType === 'monthly' ? 30 : 365;
    const newExpires = new Date(currentExpires.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    user.accessExpiresAt = newExpires.toISOString();
    user.isPremium = true;

    return user;
  }
}

export const billingService = new BillingService();

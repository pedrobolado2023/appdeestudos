import React, { useState } from 'react';
import { Crown, Check, ShieldCheck, QrCode, Copy, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { AccessStatus } from '../types';
import { api } from '../services/api';

interface PaywallModalProps {
  access: AccessStatus;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ access, onClose, onPaymentSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'monthly'>('daily');
  const [pixData, setPixData] = useState<{
    paymentId: string;
    amount: number;
    copyPastePix: string;
    qrCodeBase64: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  const handleGeneratePix = async (plan: 'daily' | 'monthly') => {
    setSelectedPlan(plan);
    setLoading(true);
    try {
      const data = await api.createPixCharge(plan);
      setPixData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.copyPastePix);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmMockPayment = async () => {
    setPaying(true);
    try {
      await api.confirmPayment(selectedPlan);
      onPaymentSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md max-h-[95vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg">
          <X className="w-5 h-5" />
        </button>

        {/* Header do Paywall */}
        <div className="text-center mb-6 pt-2">
          <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Crown className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="text-xl font-black text-white">Plano de Estudos QA Concursos</h3>
          <p className="text-xs text-slate-300 mt-1">
            {access.isTrial
              ? `Você está no período de teste gratuito (${access.daysRemaining} dias restantes)!`
              : 'Prepare-se com questões ilimitadas, Anki SM-2 e IA por um preço simbólico.'}
          </p>
        </div>

        {/* Benefícios */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span>Questões ilimitadas com gabarito comentado e base legal</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span>Repetição espaçada inteligente (Anki SM-2)</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span>Upload de PDFs próprios com RAG compacto e sem travar o servidor</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span>Sem mensalidades abusivas: pague só pelos dias que for estudar</span>
          </div>
        </div>

        {/* Opções de Planos */}
        {!pixData ? (
          <div className="space-y-3">
            {/* Plano Mensal Oficial: R$ 29,99/mês */}
            <div
              onClick={() => handleGeneratePix('monthly')}
              className="border-2 border-emerald-500/90 bg-emerald-950/30 hover:bg-emerald-950/50 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between shadow-sm active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-emerald-400">Assinatura Mensal</span>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">MAIS ESCOLHIDO</span>
                </div>
                <p className="text-[11px] text-emerald-300/90 font-semibold mt-0.5">Apenas ~R$ 0,99 por dia (30 dias de acesso)</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white">R$ 29,99</span>
                <span className="text-[10px] text-slate-400 block">/mês</span>
              </div>
            </div>

            {/* Plano Anual Promocional: R$ 249,90 */}
            <div
              onClick={() => handleGeneratePix('annual')}
              className="border border-slate-800 bg-slate-950 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between active:scale-[0.99]"
            >
              <div>
                <span className="text-xs font-black uppercase text-slate-300">Acesso Anual (12 Meses)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Economize 30% para o ano inteiro</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-white">R$ 249,90</span>
                <span className="text-[10px] text-slate-400 block">/ano</span>
              </div>
            </div>
          </div>
        ) : (
          /* Tela de Pagamento PIX Instantâneo */
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-4">
            <span className="inline-block bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full">
              PIX Gerado: R$ {pixData.amount.toFixed(2)}
            </span>

            <div className="flex justify-center my-2">
              <img
                src={pixData.qrCodeBase64}
                alt="QR Code PIX"
                className="w-40 h-40 rounded-xl border border-slate-700 bg-white p-2"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyPix}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'CÓDIGO COPIADO!' : 'COPIAR CÓDIGO PIX'}</span>
              </button>

              <button
                onClick={handleConfirmMockPayment}
                disabled={paying}
                className="w-full py-3 btn-duo-green text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{paying ? 'Confirmando...' : 'JÁ FIZ O PIX / SIMULAR LIBERAÇÃO'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

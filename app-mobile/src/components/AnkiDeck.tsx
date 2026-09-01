import React, { useState, useEffect } from 'react';
import { RotateCw, Brain, Sparkles, Plus, CheckCircle, Clock } from 'lucide-react';
import { Flashcard } from '../types';
import { api } from '../services/api';

interface AnkiDeckProps {
  onRefreshProfile: () => void;
}

export const AnkiDeck: React.FC<AnkiDeckProps> = ({ onRefreshProfile }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form novo flashcard
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newSubject, setNewSubject] = useState('Direito Constitucional');

  const loadCards = async () => {
    setLoading(true);
    try {
      const data = await api.getCards();
      setCards(data.cards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleReview = async (quality: number) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      await api.reviewCard(currentCard.id, quality);
      setIsFlipped(false);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Concluiu a rodada de revisões
        loadCards();
        setCurrentIndex(0);
      }
      onRefreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    try {
      await api.createCard({
        front: newFront,
        back: newBack,
        subject: newSubject,
        topic: 'Geral'
      });
      setNewFront('');
      setNewBack('');
      setShowCreateModal(false);
      loadCards();
    } catch (err) {
      console.error(err);
    }
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 min-h-screen flex flex-col justify-between">
      {/* Header do Deck */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-400" />
            <h2 className="text-lg font-black text-white">Anki: Repetição Espaçada</h2>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 rounded-xl hover:bg-indigo-600/30 flex items-center gap-1 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Card</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Algoritmo SM-2: o sistema calcula o intervalo exato para você revisar antes de esquecer.
        </p>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Carregando flashcards...</div>
        ) : !currentCard ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center my-8">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Revisões em dia!</h3>
            <p className="text-xs text-slate-400 mb-4">Você revisou todos os flashcards agendados para hoje.</p>
            <button onClick={loadCards} className="btn-duo-green px-5 py-2 text-xs">
              Recarregar Deck
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Indicador de progresso */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="bg-slate-800 px-2 py-0.5 rounded-md font-bold text-[10px] text-slate-300">
                {currentCard.subject}
              </span>
              <span>Card {currentIndex + 1} de {cards.length}</span>
            </div>

            {/* Flashcard 3D */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[300px] cursor-pointer perspective-1000 select-none"
            >
              <div
                className={`w-full min-h-[300px] relative transition-transform duration-500 transform-style-3d bg-slate-900 border-2 ${
                  isFlipped ? 'border-indigo-500/80 bg-indigo-950/30' : 'border-slate-800 hover:border-slate-700'
                } rounded-3xl p-6 flex flex-col justify-between shadow-lg ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {!isFlipped ? (
                  /* Frente do Card (Pergunta / Conceito) */
                  <div className="flex flex-col justify-between h-full space-y-6">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                      FRENTE • CONCEITO
                    </span>
                    <p className="text-base font-bold text-slate-100 leading-relaxed text-center my-auto">
                      {currentCard.front}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Toque para ver a resposta</span>
                    </div>
                  </div>
                ) : (
                  /* Verso do Card (Resposta / Mnemônico) */
                  <div className="flex flex-col justify-between h-full space-y-6 rotate-y-180">
                    <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">
                      VERSO • RESPOSTA & MNEMÔNICO
                    </span>
                    <div className="my-auto whitespace-pre-line text-sm font-semibold text-emerald-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                      {currentCard.back}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Intervalo atual: {currentCard.interval}d
                      </span>
                      <span>Facilidade: {currentCard.easeFactor}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botões de Avaliação SM-2 */}
      {currentCard && isFlipped && (
        <div className="grid grid-cols-4 gap-2 mt-6">
          <button
            onClick={() => handleReview(1)}
            className="btn-duo-red py-3 text-xs flex flex-col items-center"
          >
            <span>Errei</span>
            <span className="text-[9px] opacity-80 font-normal">1 dia</span>
          </button>
          <button
            onClick={() => handleReview(3)}
            className="btn-duo-yellow py-3 text-xs flex flex-col items-center"
          >
            <span>Difícil</span>
            <span className="text-[9px] opacity-80 font-normal">2 dias</span>
          </button>
          <button
            onClick={() => handleReview(4)}
            className="btn-duo-blue py-3 text-xs flex flex-col items-center"
          >
            <span>Bom</span>
            <span className="text-[9px] opacity-80 font-normal">{Math.round(currentCard.interval * 1.5) || 3}d</span>
          </button>
          <button
            onClick={() => handleReview(5)}
            className="btn-duo-green py-3 text-xs flex flex-col items-center"
          >
            <span>Fácil</span>
            <span className="text-[9px] opacity-80 font-normal">{Math.round(currentCard.interval * 2.5) || 6}d</span>
          </button>
        </div>
      )}

      {/* Modal de Criação de Card */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-base font-black text-white mb-4">Novo Flashcard Anki</h3>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Disciplina</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  placeholder="Ex: Direito Constitucional"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Frente (Pergunta/Conceito)</label>
                <textarea
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  placeholder="Ex: Qual o prazo do Mandado de Segurança?"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Verso (Resposta & Mnemônico)</label>
                <textarea
                  value={newBack}
                  onChange={e => setNewBack(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  placeholder="Ex: 120 dias a contar da ciência do ato impugnado (Art. 23 da Lei 12.016/09)."
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 btn-duo-green text-xs"
                >
                  Salvar Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

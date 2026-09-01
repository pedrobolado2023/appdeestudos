import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, BookOpen, Scale, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, StudyStage } from '../types';
import { api } from '../services/api';

interface QuizArenaProps {
  stage?: StudyStage | null;
  questions: Question[];
  onFinish: () => void;
  onRefreshProfile: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({ stage, questions, onFinish, onRefreshProfile }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    correctOptionId: string;
    explanation: Question['explanation'];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentIndex] || questions[0];

  if (!currentQuestion) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <p className="text-slate-400">Nenhuma questão disponível no momento.</p>
        <button onClick={onFinish} className="mt-4 btn-duo-green px-6 py-2">Voltar</button>
      </div>
    );
  }

  const handleSelectOption = (optId: string) => {
    if (hasAnswered) return;
    setSelectedOptionId(optId);
  };

  const handleCheckAnswer = async () => {
    if (!selectedOptionId || hasAnswered) return;
    setLoading(true);

    try {
      const res = await api.submitAnswer({
        questionId: currentQuestion.id,
        selectedOptionId,
        stageId: stage?.id,
        lessonId: stage?.lessons[0]?.id
      });

      setAnswerResult({
        isCorrect: res.isCorrect,
        correctOptionId: res.correctOptionId,
        explanation: res.explanation
      });
      setHasAnswered(true);

      if (res.isCorrect) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      }

      onRefreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setHasAnswered(false);
      setAnswerResult(null);
    } else {
      onFinish();
    }
  };

  // Progresso do Quiz
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-between px-4 py-4 pb-28">
      {/* Top Bar com barra de progresso */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onFinish} className="p-2 bg-slate-800 rounded-xl text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-400">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Metadados da Questão (Banca / Matéria) */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
            {currentQuestion.banca || 'Banca Concurso'}
          </span>
          <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
            {currentQuestion.subject}
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
            {currentQuestion.topic}
          </span>
        </div>

        {/* Enunciado */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-5 shadow-sm">
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            {currentQuestion.statement}
          </p>
        </div>

        {/* Alternativas */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrectOption = answerResult?.correctOptionId === opt.id;
            const isWrongChoice = hasAnswered && isSelected && !answerResult?.isCorrect;

            let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 shadow-[0_3px_0_#1E293B] hover:border-slate-700';

            if (isSelected && !hasAnswered) {
              btnStyle = 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-[0_3px_0_#4338CA]';
            } else if (hasAnswered) {
              if (isCorrectOption) {
                btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-[0_3px_0_#059669]';
              } else if (isWrongChoice) {
                btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 shadow-[0_3px_0_#BE123C]';
              } else {
                btnStyle = 'bg-slate-900/50 border-slate-800/40 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={opt.id}
                disabled={hasAnswered}
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 active:translate-y-0.5 ${btnStyle}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                    isSelected && !hasAnswered
                      ? 'bg-indigo-600 text-white'
                      : isCorrectOption
                      ? 'bg-emerald-500 text-white'
                      : isWrongChoice
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {opt.label}
                </div>
                <span className="text-xs font-medium leading-normal pt-1">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explicação & Gabarito Comentado da IA */}
      {hasAnswered && answerResult && (
        <div className="mt-5 space-y-3">
          <div
            className={`p-4 rounded-2xl border ${
              answerResult.isCorrect
                ? 'bg-emerald-950/80 border-emerald-500/50'
                : 'bg-rose-950/80 border-rose-500/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {answerResult.isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-extrabold text-emerald-300">Excelente! Resposta Correta (+15 XP)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="text-sm font-extrabold text-rose-300">Incorreto (-1 Coração)</span>
                </>
              )}
            </div>

            {/* Justificativa Detalhada */}
            <p className="text-xs text-slate-200 leading-relaxed font-medium mb-3">
              {answerResult.explanation.whyCorrect}
            </p>

            {/* Base Legal */}
            {answerResult.explanation.legalBasis && (
              <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl flex items-start gap-2 text-[11px] text-slate-300">
                <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-400 block mb-0.5">Fundamentação Jurídica / Lei Seca:</span>
                  <span>{answerResult.explanation.legalBasis}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botão de Ação Inferior Fixo */}
      <div className="mt-6">
        {!hasAnswered ? (
          <button
            disabled={!selectedOptionId || loading}
            onClick={handleCheckAnswer}
            className={`w-full py-4 text-base ${
              selectedOptionId ? 'btn-duo-green' : 'btn-duo-slate opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? 'Verificando com IA...' : 'VERIFICAR RESPOSTA'}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full py-4 text-base btn-duo-blue flex items-center justify-center gap-2"
          >
            <span>{currentIndex < questions.length - 1 ? 'PRÓXIMA QUESTÃO' : 'CONCLUIR LIÇÃO'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

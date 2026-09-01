import React from 'react';
import { Lock, Check, Star, Play, BookOpen } from 'lucide-react';
import { StudyStage } from '../types';

interface DuolingoMapProps {
  stages: StudyStage[];
  onStartStage: (stage: StudyStage) => void;
}

export const DuolingoMap: React.FC<DuolingoMapProps> = ({ stages, onStartStage }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      {/* Banner de Boas-vindas Concurso */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-indigo-950/70 border border-emerald-500/30 rounded-3xl p-5 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-20 text-7xl font-black">🏛️</div>
        <div className="inline-block bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
          Trilha de Aprovação
        </div>
        <h2 className="text-xl font-black text-white">QA - Estude para concursos</h2>
        <p className="text-xs text-slate-300 mt-1">
          Avance pelas fases, resolva questões de bancas reais e mantenha sua memória ativa!
        </p>
      </div>

      {/* Árvore de Fases no Estilo Duolingo */}
      <div className="flex flex-col items-center space-y-12 relative">
        {/* Linha conectora de fundo */}
        <div className="absolute top-8 bottom-8 w-2 bg-slate-800 rounded-full z-0" />

        {stages.map((stage, index) => {
          // Deslocamento zig-zag clássico do mapa Duolingo
          const xOffset = index % 2 === 0 ? '-translate-x-6' : 'translate-x-6';

          return (
            <div key={stage.id} className={`flex flex-col items-center z-10 transition-transform ${xOffset}`}>
              {/* Botão Nó da Fase */}
              <div className="relative group">
                <button
                  disabled={!stage.unlocked}
                  onClick={() => onStartStage(stage)}
                  className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all ${
                    stage.completed
                      ? 'bg-amber-500 border-4 border-amber-300 shadow-[0_6px_0_#D97706] hover:scale-105 active:translate-y-1'
                      : stage.unlocked
                      ? 'bg-emerald-500 border-4 border-emerald-300 shadow-[0_6px_0_#059669] hover:scale-105 active:translate-y-1 animate-pulse'
                      : 'bg-slate-800 border-4 border-slate-700 shadow-[0_6px_0_#0F172A] opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="text-3xl mb-0.5">{stage.icon}</span>
                  {stage.completed ? (
                    <div className="bg-amber-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-yellow-200 fill-yellow-200" />
                      <span className="text-[10px] font-black text-white">100%</span>
                    </div>
                  ) : stage.unlocked ? (
                    <div className="bg-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Play className="w-3 h-3 text-white fill-white" />
                      <span className="text-[10px] font-black text-white">Fase {stage.id}</span>
                    </div>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Tag de disciplina flutuante */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-xl shadow-md text-center">
                  <p className="text-[11px] font-black text-slate-200">{stage.title}</p>
                  <p className="text-[9px] text-emerald-400 font-semibold">{stage.subject}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

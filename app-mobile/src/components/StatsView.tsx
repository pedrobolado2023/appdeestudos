import React from 'react';
import { Trophy, Award, Target, Brain, Flame, Zap, CheckCircle2, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';

interface StatsViewProps {
  user: UserProfile;
}

export const StatsView: React.FC<StatsViewProps> = ({ user }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-5">
      {/* Header do Perfil */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-md">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-base font-black text-white">{user.name}</h2>
          <p className="text-xs text-slate-400">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Liga {user.league}
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black px-2 py-0.5 rounded-md">
              Nível {user.currentLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Estatísticas Rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Ofensiva Atual</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{user.streak}</span>
            <span className="text-xs text-slate-400 ml-1">dias seguidos</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Total de XP</span>
            <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{user.xp}</span>
            <span className="text-xs text-slate-400 ml-1">pontos</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Taxa de Acertos</span>
            <Target className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">88%</span>
            <span className="text-xs text-emerald-400 ml-1">▲ Alto</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Retenção Anki</span>
            <Brain className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">92%</span>
            <span className="text-xs text-slate-400 ml-1">SM-2</span>
          </div>
        </div>
      </div>

      {/* Conquistas Desbloqueadas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Conquistas de Concurseiro</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-2xl">🔥</div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">Constância de Ferro</h4>
              <p className="text-[10px] text-slate-400">Estude por 3 dias consecutivos</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-2xl">⚖️</div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">Mestre Constitucional</h4>
              <p className="text-[10px] text-slate-400">Acerte 10 questões de Art. 5º da CF/88</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 opacity-60">
            <div className="text-2xl">🏆</div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">Posse Garantida</h4>
              <p className="text-[10px] text-slate-400">Alcance 1.000 XP acumulados</p>
            </div>
            <span className="text-[10px] font-bold text-slate-500">340/1000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

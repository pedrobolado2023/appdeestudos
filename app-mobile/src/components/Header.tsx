import React from 'react';
import { Flame, Heart, Zap, Shield, Crown } from 'lucide-react';
import { UserProfile, AccessStatus } from '../types';

interface HeaderProps {
  user: UserProfile;
  access: AccessStatus;
  onOpenPaywall: () => void;
  onOpenKnowledge: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, access, onOpenPaywall, onOpenKnowledge }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Streak (Ofensiva) */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-2xl">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          <span className="text-sm font-extrabold text-amber-400">{user.streak}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-2xl">
          <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
          <span className="text-sm font-extrabold text-emerald-300">{user.xp}</span>
        </div>

        {/* Vidas (Corações) */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-2xl">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <span className="text-sm font-extrabold text-rose-400">{user.hearts}/{user.maxHearts}</span>
        </div>

        {/* Status de Trial / Premium (R$ 29,99/mês) */}
        <button
          onClick={onOpenPaywall}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-black transition-all ${
            access.isTrial
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
              : access.hasAccess
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-500/20 border-rose-500 text-rose-400 animate-bounce'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>
            {access.isTrial ? `${access.daysRemaining}d Grátis` : access.hasAccess ? 'VIP Ativo' : 'R$ 29,99/mês'}
          </span>
        </button>
      </div>
    </header>
  );
};

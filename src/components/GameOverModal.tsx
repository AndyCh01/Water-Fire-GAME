import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface GameOverModalProps {
  reason: string;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ reason, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">¡Misión Fallida!</h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
          {reason}
        </p>

        <button
          onClick={onRestart}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reintentar Nivel (Tecla R)</span>
        </button>
      </div>
    </div>
  );
};

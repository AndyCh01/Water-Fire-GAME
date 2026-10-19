import React from 'react';
import { Star, ArrowRight, RotateCcw, Award, CheckCircle } from 'lucide-react';

interface VictoryModalProps {
  levelId: number;
  levelTitle: string;
  timeSeconds: number;
  parTimeSeconds: number;
  gemsCollected: number;
  totalGems: number;
  stars: number;
  onNextLevel: () => void;
  onRestart: () => void;
  onSelectLevel: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelId,
  levelTitle,
  timeSeconds,
  parTimeSeconds,
  gemsCollected,
  totalGems,
  stars,
  onNextLevel,
  onRestart,
  onSelectLevel,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const isFinalLevel = levelId === 3;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center">
        {/* Victory Icon / Badge */}
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3">
          {isFinalLevel ? <Award className="w-9 h-9" /> : <CheckCircle className="w-9 h-9 text-emerald-400" />}
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">
          {isFinalLevel ? '¡GUARDIÁN DERROTADO!' : '¡NIVEL COMPLETADO!'}
        </h2>
        <p className="text-sm text-slate-400 mb-5">{levelTitle}</p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((starIndex) => (
            <div
              key={starIndex}
              className={`p-1.5 rounded-full ${
                starIndex <= stars
                  ? 'text-amber-400 bg-amber-500/10 scale-110'
                  : 'text-slate-600 bg-slate-800'
              } transition-transform`}
            >
              <Star className="w-7 h-7 fill-current" />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Diamantes</span>
            <span className="text-lg font-bold text-white font-mono tabular-nums">
              {gemsCollected} / {totalGems}
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Tiempo</span>
            <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {formatTime(timeSeconds)}
            </span>
            <span className="text-[10px] text-slate-500 block">Objetivo: {parTimeSeconds}s</span>
          </div>
        </div>

        {isFinalLevel && (
          <div className="w-full mb-6 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-cyan-500/15 border border-amber-500/30 text-amber-200 text-xs leading-relaxed text-center">
            🏆 ¡Increíble trabajo en equipo! Habéis sincronizado el Fuego y el Agua para sobrecargar los escudos del Titán Ancestral y escapar del santuario.
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {!isFinalLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
            >
              <span>Siguiente Nivel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onSelectLevel}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
            >
              <span>Volver al Menú de Niveles</span>
              <Award className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onRestart}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reintentar Nivel</span>
            </button>

            {!isFinalLevel && (
              <button
                onClick={onSelectLevel}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <span>Ver Niveles</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

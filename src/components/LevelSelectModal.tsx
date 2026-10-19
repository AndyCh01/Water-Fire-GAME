import React from 'react';
import { X, Star, Lock, ShieldAlert, Sparkles, Flame, Droplets } from 'lucide-react';
import { LevelProgress } from '../types/game';

interface LevelSelectModalProps {
  currentLevelId: number;
  levelProgress: { [id: number]: LevelProgress };
  onSelectLevel: (id: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  levelProgress,
  onSelectLevel,
  onClose,
}) => {
  const levels = [
    {
      id: 1,
      title: 'Nivel 1: Templo de los Elementos',
      subtitle: 'Aprende los fundamentos del agua, la lava y los interruptores.',
      badge: 'Básico',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      color: 'from-blue-600/20 to-orange-600/20',
      border: 'border-slate-700',
    },
    {
      id: 2,
      title: 'Nivel 2: Ruinas de Vapor y Ácido',
      subtitle: 'Pozos de ácido letal para ambos, plataformas móviles y cajas.',
      badge: 'Intermedio',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      color: 'from-emerald-600/20 to-lime-600/20',
      border: 'border-slate-700',
    },
    {
      id: 3,
      title: 'Nivel 3: La Guarida del Guardián',
      subtitle: '¡Jefe Titán! Salta sus ondas de choque y activa las 2 runas.',
      badge: 'Jefe Final',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      color: 'from-rose-600/20 via-amber-600/20 to-cyan-600/20',
      border: 'border-amber-500/50',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Selección de Niveles</h2>
              <p className="text-xs text-slate-400">Escoge el santuario a explorar en Water-Fire</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level List */}
        <div className="flex flex-col gap-3 my-5">
          {levels.map((lvl) => {
            const progress = levelProgress[lvl.id] || {
              unlocked: lvl.id === 1,
              completed: false,
              stars: 0,
              gemsCollected: 0,
              totalGems: 8,
            };
            const isCurrent = lvl.id === currentLevelId;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (progress.unlocked) {
                    onSelectLevel(lvl.id);
                    onClose();
                  }
                }}
                className={`relative flex items-center justify-between p-4 rounded-xl border transition-all ${
                  progress.unlocked
                    ? 'cursor-pointer hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/80 active:scale-[0.99]'
                    : 'opacity-50 cursor-not-allowed bg-slate-950/40 border-slate-800'
                } ${isCurrent ? 'ring-2 ring-cyan-500/80 border-cyan-500' : lvl.border}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${lvl.color} border border-slate-700/60 shrink-0`}>
                    {progress.unlocked ? lvl.icon : <Lock className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-white">{lvl.title}</span>
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {lvl.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-medium text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                          Actual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{lvl.subtitle}</p>

                    {/* Progress Info */}
                    {progress.unlocked && (
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= progress.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        {progress.completed && (
                          <span className="text-emerald-400 font-medium">Completado</span>
                        )}
                        {progress.bestTime && (
                          <span className="font-mono">Récord: {Math.floor(progress.bestTime)}s</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 ml-4">
                  <button
                    disabled={!progress.unlocked}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      progress.unlocked
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {progress.unlocked ? 'Jugar' : 'Bloqueado'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800">
          Supera cada nivel para desbloquear el siguiente y llegar hasta el Guardián final.
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { PlayerRole } from '../types/game';

interface OnScreenControlsProps {
  soloMode: boolean;
  activeSoloCharacter: 'fire' | 'water';
  isOnline: boolean;
  playerRole: PlayerRole | null;
  onInputDown: (action: string) => void;
  onInputUp: (action: string) => void;
  onSwitchSolo: () => void;
}

export const OnScreenControls: React.FC<OnScreenControlsProps> = ({
  soloMode,
  activeSoloCharacter,
  isOnline,
  playerRole,
  onInputDown,
  onInputUp,
  onSwitchSolo,
}) => {
  // Helpers for touch and mouse
  const bindEvents = (action: string) => ({
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      onInputDown(action);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      onInputUp(action);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      e.preventDefault();
      onInputUp(action);
    },
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onInputDown(action);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onInputUp(action);
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault();
      onInputUp(action);
    },
  });

  const showWaterControls = isOnline ? playerRole === 'water' : !soloMode || activeSoloCharacter === 'water';
  const showFireControls = isOnline ? playerRole === 'fire' : !soloMode || activeSoloCharacter === 'fire';

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-sm border-t border-slate-800/80 py-2 px-4 flex items-center justify-between select-none">
      {/* Water Controls */}
      {showWaterControls && (
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-cyan-400 mb-1 uppercase tracking-wider">
              {isOnline ? 'Tus Controles: Chica Agua (WASD)' : 'Chica Agua (WASD)'}
            </span>
            <div className="flex items-center gap-2">
              <button
                {...bindEvents('waterLeft')}
                className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 active:bg-cyan-600 active:text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 touch-none"
                aria-label="Agua Izquierda"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                {...bindEvents('waterDown')}
                className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 active:bg-cyan-600 active:text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 touch-none"
                aria-label="Agua Palanca/Bajar"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
              <button
                {...bindEvents('waterRight')}
                className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 active:bg-cyan-600 active:text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 touch-none"
                aria-label="Agua Derecha"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
              <button
                {...bindEvents('waterUp')}
                className="w-14 h-12 rounded-xl bg-cyan-600/90 border border-cyan-400 text-white font-bold active:bg-cyan-400 active:text-slate-950 flex items-center justify-center shadow-lg ml-2 transition-transform active:scale-95 touch-none"
                aria-label="Agua Saltar"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Solo Mode Switch Button (Offline Only) */}
      {!isOnline && soloMode && (
        <button
          onClick={onSwitchSolo}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 transition-all mx-auto"
        >
          Cambiar a {activeSoloCharacter === 'water' ? 'Fuego 🔥' : 'Agua 💧'} (Espacio)
        </button>
      )}

      {/* Fire Controls */}
      {showFireControls && (
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-orange-400 mb-1 uppercase tracking-wider">
              {isOnline ? 'Tus Controles: Chico Fuego (Flechas)' : 'Chico Fuego (Flechas)'}
            </span>
            <div className="flex items-center gap-2">
              <button
                {...bindEvents('fireLeft')}
                className="w-12 h-12 rounded-xl bg-orange-950/80 border border-orange-700/60 text-orange-300 active:bg-orange-600 active:text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 touch-none"
                aria-label="Fuego Izquierda"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                {...bindEvents('fireDown')}
                className="w-12 h-12 rounded-xl bg-orange-950/80 border border-orange-700/60 text-orange-300 active:bg-orange-600 active:text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 touch-none"
                aria-label="Fuego Palanca/Bajar"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
              <button
                {...bindEvents('fireRight')}
                className="w-12 h-12 rounded-xl bg-orange-950/80 border border-orange-700/60 text-orange-300 active:bg-orange-600 active:text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 touch-none"
                aria-label="Fuego Derecha"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
              <button
                {...bindEvents('fireUp')}
                className="w-14 h-12 rounded-xl bg-orange-600/90 border border-orange-400 text-white font-bold active:bg-orange-400 active:text-slate-950 flex items-center justify-center shadow-lg ml-2 transition-transform active:scale-95 touch-none"
                aria-label="Fuego Saltar"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Layers, Users, User, Flame, Droplets, LogOut } from 'lucide-react';
import { LevelConfig, PlayerRole } from '../types/game';

interface HUDProps {
  level: LevelConfig;
  elapsedSeconds: number;
  blueGemsCollected: number;
  blueGemsTotal: number;
  redGemsCollected: number;
  redGemsTotal: number;
  isMuted: boolean;
  soloMode: boolean;
  activeSoloCharacter: 'fire' | 'water';
  isOnline: boolean;
  roomCode: string | null;
  playerRole: PlayerRole | null;
  onToggleMute: () => void;
  onToggleSoloMode: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
  onOpenControls: () => void;
  onLeaveRoom: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  elapsedSeconds,
  blueGemsCollected,
  blueGemsTotal,
  redGemsCollected,
  redGemsTotal,
  isMuted,
  soloMode,
  activeSoloCharacter,
  isOnline,
  roomCode,
  playerRole,
  onToggleMute,
  onToggleSoloMode,
  onRestart,
  onOpenLevelSelect,
  onOpenControls,
  onLeaveRoom,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-200 px-4 py-2 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Zone 1: Brand & Level Title / Room Tag */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
          <span className="text-cyan-400">Water</span>
          <span className="text-slate-500">-</span>
          <span className="text-orange-500">Fire</span>
        </span>

        {isOnline && roomCode && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-slate-950 text-amber-400 rounded-md border border-amber-500/30">
            <span className="text-slate-500 font-sans font-normal text-[10px]">SALA:</span>
            <span>{roomCode}</span>
          </div>
        )}

        <button
          onClick={onOpenLevelSelect}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md border border-slate-700 transition-colors whitespace-nowrap"
          title="Seleccionar Nivel"
        >
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>{level.title.split(':')[0]}</span>
        </button>
      </div>

      {/* Zone 2: Mission Telemetry & Gem Counters */}
      <div className="flex items-center gap-4 text-xs">
        {/* Blue Gem count */}
        <div className="flex items-center gap-1.5 font-mono tabular-nums text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          <div className="w-2.5 h-2.5 bg-cyan-400 rotate-45 transform" />
          <span>
            {blueGemsCollected}/{blueGemsTotal}
          </span>
        </div>

        {/* Red Gem count */}
        <div className="flex items-center gap-1.5 font-mono tabular-nums text-orange-300 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-800/40">
          <div className="w-2.5 h-2.5 bg-orange-500 rotate-45 transform" />
          <span>
            {redGemsCollected}/{redGemsTotal}
          </span>
        </div>

        {/* Level Timer */}
        <div className="hidden sm:flex items-center gap-1.5 font-mono tabular-nums text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
          <span className="text-slate-400">Tiempo:</span>
          <span className="font-semibold text-white">{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Zone 3: Online Role Badge & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* If Online: Show Player Role Tag */}
        {isOnline && playerRole ? (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md border ${
              playerRole === 'fire'
                ? 'bg-orange-950/80 text-orange-400 border-orange-600/50'
                : 'bg-cyan-950/80 text-cyan-400 border-cyan-600/50'
            }`}
          >
            {playerRole === 'fire' ? (
              <>
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>TÚ: FUEGO (Flechas)</span>
              </>
            ) : (
              <>
                <Droplets className="w-3.5 h-3.5 fill-current" />
                <span>TÚ: AGUA (WASD)</span>
              </>
            )}
          </div>
        ) : (
          /* Offline: Solo / 2 Players Toggle */
          <button
            onClick={onToggleSoloMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
              soloMode
                ? activeSoloCharacter === 'water'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                  : 'bg-orange-950/80 text-orange-300 border-orange-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={soloMode ? 'Modo 1 Jugador (pulsa Espacio para alternar)' : 'Modo 2 Jugadores'}
          >
            {soloMode ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Controlando:</span>
                <span className="font-semibold">{activeSoloCharacter === 'water' ? 'Agua' : 'Fuego'}</span>
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">2 Jugadores</span>
              </>
            )}
          </button>
        )}

        {/* Audio Toggle */}
        <button
          onClick={onToggleMute}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
          title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Quick Restart */}
        <button
          onClick={onRestart}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
          title="Reiniciar Nivel (Tecla R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Controls Help */}
        <button
          onClick={onOpenControls}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
          title="Ver Controles y Reglas"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Leave Room / Return to Lobby Button */}
        {isOnline && (
          <button
            onClick={onLeaveRoom}
            className="p-1.5 text-rose-400 hover:text-white bg-slate-800 hover:bg-rose-900/60 rounded-md border border-slate-700 hover:border-rose-700 transition-colors"
            title="Salir al Lobby"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

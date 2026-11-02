import React, { useState, useEffect } from 'react';
import {
  Flame,
  Droplets,
  Users,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Gamepad2,
} from 'lucide-react';
import { network } from '../game/network';
import { PlayerRole } from '../types/game';

interface LobbyProps {
  onGameStart: (roomCode: string | null, role: PlayerRole | null, isOnline: boolean) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onGameStart }) => {
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState<string>('');
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const socket = network.init();

    // Event: Room successfully created
    const handleRoomCreated = (data: { roomCode: string; role: PlayerRole }) => {
      setCreatedRoomCode(data.roomCode);
      setIsWaiting(true);
      setErrorMessage(null);
      network.setRoomInfo(data.roomCode, data.role);
    };

    // Event: Room joined as Water
    const handleRoomJoined = (data: { roomCode: string; role: PlayerRole }) => {
      setIsJoining(false);
      setErrorMessage(null);
      network.setRoomInfo(data.roomCode, data.role);
    };

    // Event: Error on joining
    const handleJoinError = (data: { message: string }) => {
      setErrorMessage(data.message);
      setIsJoining(false);
    };

    // Event: Both players ready in room -> Start Game!
    const handleGameStart = (data: { roomCode: string; level: number; players: unknown[] }) => {
      const myRole = network.getRole() || 'fire';
      onGameStart(data.roomCode, myRole, true);
    };

    socket.on('roomCreated', handleRoomCreated);
    socket.on('roomJoined', handleRoomJoined);
    socket.on('joinError', handleJoinError);
    socket.on('gameStart', handleGameStart);

    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('roomJoined', handleRoomJoined);
      socket.off('joinError', handleJoinError);
      socket.off('gameStart', handleGameStart);
    };
  }, [onGameStart]);

  const handleCreateRoom = () => {
    setErrorMessage(null);
    network.createRoom();
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim().toUpperCase();
    if (cleanCode.length < 3) {
      setErrorMessage('Por favor introduce un código de sala válido.');
      return;
    }
    setErrorMessage(null);
    setIsJoining(true);
    network.joinRoom(cleanCode);
  };

  const handleCancelWait = () => {
    network.leaveRoom();
    setCreatedRoomCode(null);
    setIsWaiting(false);
  };

  const handleCopyCode = () => {
    if (createdRoomCode) {
      navigator.clipboard.writeText(createdRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePlayLocal = () => {
    onGameStart(null, null, false);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 overflow-hidden select-none font-sans">
      {/* Background Decorative Temple Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        {/* Header / Brand Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-400 mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Multijugador Online en Tiempo Real (Socket.io)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center justify-center gap-2 drop-shadow-md">
            <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">WATER</span>
            <span className="text-slate-600">-</span>
            <span className="text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">FIRE</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Elige crear una sala para jugar como <strong>Fuego</strong> o únete con un código para ser <strong>Agua</strong>.
          </p>
        </div>

        {/* Roles Explanatory Banner */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/40">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold text-orange-400 block tracking-wider">
                Creador de Sala
              </span>
              <span className="text-sm font-bold text-white">Chico Fuego</span>
              <span className="text-[11px] text-orange-300/80 block">Teclas: Flechas (↑, ↓, ←, →)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/40">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold text-cyan-400 block tracking-wider">
                Invitado a Sala
              </span>
              <span className="text-sm font-bold text-white">Chica Agua</span>
              <span className="text-[11px] text-cyan-300/80 block">Teclas: WASD</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-center gap-2.5 text-rose-200 text-xs shadow-lg animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MAIN INTERACTIVE CARD */}
        <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* STATE A: WAITING FOR PLAYER 2 (ROOM CREATOR) */}
          {isWaiting && createdRoomCode ? (
            <div className="flex flex-col items-center text-center py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mb-4">
                <Flame className="w-7 h-7" />
              </div>

              <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase mb-1">
                Tu Rol: Chico Fuego 🔥
              </span>
              <h2 className="text-xl font-bold text-white mb-2">Código de Sala Generado</h2>
              <p className="text-xs text-slate-400 mb-4 max-w-sm">
                Comparte este código con tu amigo para que se una como Chica Agua:
              </p>

              {/* Large Room Code Display with Copy Button */}
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-700/80 rounded-xl px-6 py-3 mb-5 shadow-inner">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-[0.25em] text-amber-400 select-all">
                  {createdRoomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-medium"
                  title="Copiar código al portapapeles"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-300" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Waiting Radar Pulse */}
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300 mb-6 bg-slate-800/60 px-4 py-2 rounded-full border border-slate-700">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Esperando al segundo jugador (Chica Agua)...</span>
              </div>

              {/* Cancel Button */}
              <button
                onClick={handleCancelWait}
                className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-colors border border-slate-700"
              >
                Cancelar y Salir
              </button>
            </div>
          ) : (
            /* STATE B: LOBBY ACTIONS (CREAR SALA / UNIRSE A SALA) */
            <div className="flex flex-col gap-6">
              {/* Option 1: Create Room */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Opción 1: Crear Nueva Sala
                </span>
                <button
                  onClick={handleCreateRoom}
                  className="w-full py-4 px-5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Flame className="w-5 h-5 fill-current" />
                  <span>Crear Sala (Jugar como Fuego)</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  o bien
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {/* Option 2: Join Room with Code */}
              <form onSubmit={handleJoinRoom} className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Opción 2: Unirse a Sala Existente
                </span>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Código (ej. 7B9X2)"
                    maxLength={6}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isJoining || !inputCode.trim()}
                    className="py-3 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all active:scale-[0.99] cursor-pointer whitespace-nowrap"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <>
                        <Droplets className="w-4 h-4 fill-current" />
                        <span>Entrar (Agua)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer / Local Offline Practice Mode */}
        <div className="mt-6 flex items-center justify-between w-full text-xs text-slate-500 px-2">
          <span>Water-Fire v2.0 Online</span>
          <button
            onClick={handlePlayLocal}
            className="text-slate-400 hover:text-white underline underline-offset-4 flex items-center gap-1.5 transition-colors"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Jugar en Modo Local (Mismo Teclado)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

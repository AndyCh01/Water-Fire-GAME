import { useState } from 'react';
import { Lobby } from './components/Lobby';
import { GameCanvas } from './components/GameCanvas';
import { PlayerRole } from './types/game';
import { network } from './game/network';

export default function App() {
  const [gameState, setGameState] = useState<'lobby' | 'playing'>('lobby');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerRole, setPlayerRole] = useState<PlayerRole | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const [initialLevel, setInitialLevel] = useState<number>(1);

  const handleStartGame = (code: string | null, role: PlayerRole | null, online: boolean, level = 1) => {
    setRoomCode(code);
    setPlayerRole(role);
    setIsOnline(online);
    setInitialLevel(level);
    setGameState('playing');
  };

  const handleExitToLobby = () => {
    network.leaveRoom();
    setRoomCode(null);
    setPlayerRole(null);
    setGameState('lobby');
  };

  if (gameState === 'lobby') {
    return <Lobby onGameStart={handleStartGame} />;
  }

  return (
    <GameCanvas
      isOnline={isOnline}
      roomCode={roomCode}
      playerRole={playerRole}
      initialLevel={initialLevel}
      onExitToLobby={handleExitToLobby}
    />
  );
}

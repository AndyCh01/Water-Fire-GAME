import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  LevelConfig,
  Player,
  LevelProgress,
  PlayerRole,
} from '../types/game';
import { getLevelConfig } from '../game/levels';
import { GamePhysicsEngine, GameInputs } from '../game/physics';
import { GameRenderer } from '../game/renderer';
import { sound } from '../game/audio';
import { network } from '../game/network';
import { HUD } from './HUD';
import { OnScreenControls } from './OnScreenControls';
import { GameOverModal } from './GameOverModal';
import { VictoryModal } from './VictoryModal';
import { LevelSelectModal } from './LevelSelectModal';
import { ControlsModal } from './ControlsModal';
import { LogOut, WifiOff } from 'lucide-react';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 576;

interface GameCanvasProps {
  isOnline: boolean;
  roomCode: string | null;
  playerRole: PlayerRole | null;
  onExitToLobby: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isOnline,
  roomCode,
  playerRole,
  onExitToLobby,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Level & Game State
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => getLevelConfig(1));
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [soloMode, setSoloMode] = useState<boolean>(false);
  const [activeSoloCharacter, setActiveSoloCharacter] = useState<'fire' | 'water'>('water');
  const [opponentDisconnected, setOpponentDisconnected] = useState<string | null>(null);

  // Modals
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [showGuardianAlert, setShowGuardianAlert] = useState<boolean>(false);

  // Progress in localStorage
  const [levelProgress, setLevelProgress] = useState<{ [id: number]: LevelProgress }>(() => {
    try {
      const saved = localStorage.getItem('water_fire_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      1: { unlocked: true, completed: false, stars: 0, gemsCollected: 0, totalGems: 8 },
      2: { unlocked: false, completed: false, stars: 0, gemsCollected: 0, totalGems: 10 },
      3: { unlocked: false, completed: false, stars: 0, gemsCollected: 0, totalGems: 10 },
    };
  });

  // Game Instances
  const physicsRef = useRef<GamePhysicsEngine>(new GamePhysicsEngine());
  const rendererRef = useRef<GameRenderer>(new GameRenderer());

  // Players ref
  const firePlayerRef = useRef<Player>({
    id: 'fire',
    name: 'Chico Fuego',
    x: 50,
    y: 460,
    vx: 0,
    vy: 0,
    width: 22,
    height: 30,
    isGrounded: false,
    facing: 'right',
    isDead: false,
    hasReachedDoor: false,
    animFrame: 0,
    particlesSpawnTimer: 0,
  });

  const waterPlayerRef = useRef<Player>({
    id: 'water',
    name: 'Chica Agua',
    x: 90,
    y: 460,
    vx: 0,
    vy: 0,
    width: 22,
    height: 30,
    isGrounded: false,
    facing: 'right',
    isDead: false,
    hasReachedDoor: false,
    animFrame: 0,
    particlesSpawnTimer: 0,
  });

  // Key inputs state
  const keysRef = useRef<{ [code: string]: boolean }>({});
  const touchInputsRef = useRef<{ [action: string]: boolean }>({});

  // Reset / Load Level
  const loadLevel = useCallback((lvlId: number) => {
    const config = getLevelConfig(lvlId);
    setLevelConfig(config);
    setCurrentLevelId(lvlId);
    setElapsedSeconds(0);
    setIsGameOver(false);
    setIsVictory(false);
    setGameOverReason('');

    // Reset players
    firePlayerRef.current = {
      id: 'fire',
      name: 'Chico Fuego',
      x: config.fireSpawn.x,
      y: config.fireSpawn.y,
      vx: 0,
      vy: 0,
      width: 22,
      height: 30,
      isGrounded: false,
      facing: 'right',
      isDead: false,
      hasReachedDoor: false,
      animFrame: 0,
      particlesSpawnTimer: 0,
    };

    waterPlayerRef.current = {
      id: 'water',
      name: 'Chica Agua',
      x: config.waterSpawn.x,
      y: config.waterSpawn.y,
      vx: 0,
      vy: 0,
      width: 22,
      height: 30,
      isGrounded: false,
      facing: 'right',
      isDead: false,
      hasReachedDoor: false,
      animFrame: 0,
      particlesSpawnTimer: 0,
    };

    physicsRef.current.particles = [];
    physicsRef.current.screenShake = 0;

    // Show alert on Level 3
    if (lvlId === 3) {
      setShowGuardianAlert(true);
      setTimeout(() => setShowGuardianAlert(false), 4000);
      sound.playGuardianRoar();
    }
  }, []);

  // Save progress
  const saveProgress = useCallback(
    (lvlId: number, timeSecs: number, collected: number, total: number) => {
      setLevelProgress((prev) => {
        let earnedStars = 1;
        if (collected >= total * 0.8) earnedStars = 2;
        if (collected === total && timeSecs <= levelConfig.parTimeSeconds * 1.25) earnedStars = 3;

        const currentProg = prev[lvlId] || { unlocked: true, completed: false, stars: 0, gemsCollected: 0, totalGems: total };
        const updated = {
          ...prev,
          [lvlId]: {
            unlocked: true,
            completed: true,
            bestTime: currentProg.bestTime ? Math.min(currentProg.bestTime, timeSecs) : timeSecs,
            gemsCollected: Math.max(currentProg.gemsCollected, collected),
            totalGems: total,
            stars: Math.max(currentProg.stars, earnedStars),
          },
          ...(lvlId < 3 ? { [lvlId + 1]: { ...prev[lvlId + 1], unlocked: true } } : {}),
        };

        try {
          localStorage.setItem('water_fire_progress', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [levelConfig.parTimeSeconds]
  );

  // Network Event Listeners (Multiplayer Sync)
  useEffect(() => {
    if (!isOnline) return;
    const socket = network.getSocket();
    if (!socket) return;

    // 1. Remote Player Movement
    const handleRemoteMove = (data: {
      role: PlayerRole;
      x: number;
      y: number;
      vx: number;
      vy: number;
      facing: 'left' | 'right';
      isGrounded: boolean;
      animFrame: number;
    }) => {
      const target = data.role === 'fire' ? firePlayerRef.current : waterPlayerRef.current;
      target.x = data.x;
      target.y = data.y;
      target.vx = data.vx;
      target.vy = data.vy;
      target.facing = data.facing;
      target.isGrounded = data.isGrounded;
      target.animFrame = data.animFrame;
    };

    // 2. Remote Gem Collection
    const handleRemoteGem = (data: { gemId: string; element: 'fire' | 'water' }) => {
      const g = levelConfig.gems.find((gem) => gem.id === data.gemId);
      if (g && !g.collected) {
        g.collected = true;
        sound.playGem(data.element);
        physicsRef.current.spawnParticles(
          g.x + g.width / 2,
          g.y + g.height / 2,
          12,
          data.element === 'fire' ? '#ef4444' : '#3b82f6',
          data.element === 'fire' ? 'spark' : 'bubble',
          2
        );
      }
    };

    // 3. Remote Lever Toggle
    const handleRemoteLever = (data: { leverId: string; isOn: boolean }) => {
      const l = levelConfig.levers.find((lever) => lever.id === data.leverId);
      if (l) {
        l.isOn = data.isOn;
        sound.playSwitch();
      }
    };

    // 4. Remote Plate State
    const handleRemotePlate = (data: { plateId: string; isPressed: boolean }) => {
      const p = levelConfig.plates.find((plate) => plate.id === data.plateId);
      if (p) {
        p.isPressed = data.isPressed;
      }
    };

    // 5. Remote Box Move
    const handleRemoteBox = (data: { boxId: string; x: number; y: number; vx: number; vy: number }) => {
      const b = levelConfig.boxes.find((box) => box.id === data.boxId);
      if (b) {
        b.x = data.x;
        b.y = data.y;
        b.vx = data.vx;
        b.vy = data.vy;
      }
    };

    // 6. Remote Player Death
    const handleRemoteDeath = (data: { reason: string }) => {
      setIsGameOver(true);
      setGameOverReason(data.reason);
      sound.playDeath('sizzle');
    };

    // 7. Synchronized Restart
    const handleRemoteRestart = () => {
      loadLevel(currentLevelId);
    };

    // 8. Synchronized Level Change
    const handleRemoteLevelChange = (data: { levelId: number }) => {
      loadLevel(data.levelId);
    };

    // 9. Remote Victory
    const handleRemoteVictory = () => {
      setIsVictory(true);
      sound.playVictory();
    };

    // 10. Partner Left / Disconnected
    const handlePlayerLeft = (data: { message: string }) => {
      setOpponentDisconnected(data?.message || 'El compañero de equipo se ha desconectado.');
    };

    socket.on('playerMove', handleRemoteMove);
    socket.on('gemCollect', handleRemoteGem);
    socket.on('leverToggle', handleRemoteLever);
    socket.on('plateState', handleRemotePlate);
    socket.on('boxMove', handleRemoteBox);
    socket.on('playerDeath', handleRemoteDeath);
    socket.on('levelRestart', handleRemoteRestart);
    socket.on('levelChange', handleRemoteLevelChange);
    socket.on('levelVictory', handleRemoteVictory);
    socket.on('playerLeft', handlePlayerLeft);

    return () => {
      socket.off('playerMove', handleRemoteMove);
      socket.off('gemCollect', handleRemoteGem);
      socket.off('leverToggle', handleRemoteLever);
      socket.off('plateState', handleRemotePlate);
      socket.off('boxMove', handleRemoteBox);
      socket.off('playerDeath', handleRemoteDeath);
      socket.off('levelRestart', handleRemoteRestart);
      socket.off('levelChange', handleRemoteLevelChange);
      socket.off('levelVictory', handleRemoteVictory);
      socket.off('playerLeft', handlePlayerLeft);
    };
  }, [isOnline, levelConfig, currentLevelId, loadLevel]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      // Prevent scroll for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      // Quick restart (sync if online)
      if (e.code === 'KeyR') {
        if (isOnline) {
          network.emitRestart();
        } else {
          loadLevel(currentLevelId);
        }
      }

      // Solo mode switch (offline only)
      if (e.code === 'Space' && !isOnline) {
        setActiveSoloCharacter((prev) => (prev === 'fire' ? 'water' : 'fire'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentLevelId, isOnline, loadLevel]);

  // Main Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let secondAccumulator = 0;
    let networkSyncFrame = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Timer
      if (!isGameOver && !isVictory) {
        secondAccumulator += dt;
        if (secondAccumulator >= 1) {
          setElapsedSeconds((prev) => prev + 1);
          secondAccumulator -= 1;
        }
      }

      // Inputs assembly
      const keys = keysRef.current;
      const touch = touchInputsRef.current;

      const isFireAllowed = isOnline ? playerRole === 'fire' : !soloMode || activeSoloCharacter === 'fire';
      const isWaterAllowed = isOnline ? playerRole === 'water' : !soloMode || activeSoloCharacter === 'water';

      const inputs: GameInputs = {
        // Fireboy (Arrows)
        fireLeft: isFireAllowed && (Boolean(keys['ArrowLeft']) || Boolean(touch['fireLeft'])),
        fireRight: isFireAllowed && (Boolean(keys['ArrowRight']) || Boolean(touch['fireRight'])),
        fireUp: isFireAllowed && (Boolean(keys['ArrowUp']) || Boolean(touch['fireUp'])),
        fireDown: isFireAllowed && (Boolean(keys['ArrowDown']) || Boolean(touch['fireDown'])),

        // Watergirl (WASD)
        waterLeft: isWaterAllowed && (Boolean(keys['KeyA']) || Boolean(touch['waterLeft'])),
        waterRight: isWaterAllowed && (Boolean(keys['KeyD']) || Boolean(touch['waterRight'])),
        waterUp: isWaterAllowed && (Boolean(keys['KeyW']) || Boolean(touch['waterUp'])),
        waterDown: isWaterAllowed && (Boolean(keys['KeyS']) || Boolean(touch['waterDown'])),
      };

      // Physics update
      if (!isGameOver && !isVictory) {
        physicsRef.current.update(
          levelConfig,
          firePlayerRef.current,
          waterPlayerRef.current,
          inputs,
          (reason: string) => {
            setIsGameOver(true);
            setGameOverReason(reason);
            if (isOnline) {
              network.emitDeath(reason);
            }
          },
          () => {
            setIsVictory(true);
            sound.playVictory();
            const blueCollected = levelConfig.gems.filter((g) => g.element === 'water' && g.collected).length;
            const redCollected = levelConfig.gems.filter((g) => g.element === 'fire' && g.collected).length;
            const totalCollected = blueCollected + redCollected;
            saveProgress(currentLevelId, elapsedSeconds, totalCollected, levelConfig.gems.length);
            if (isOnline) {
              network.emitVictory(elapsedSeconds, totalCollected, levelConfig.gems.length);
            }
          },
          isOnline ? playerRole || undefined : undefined,
          (gemId, element) => {
            if (isOnline) {
              network.emitGemCollect(gemId, element);
            }
          },
          (leverId, isOn) => {
            if (isOnline) {
              network.emitLeverToggle(leverId, isOn);
            }
          },
          (plateId, isPressed) => {
            if (isOnline) {
              network.emitPlateState(plateId, isPressed);
            }
          }
        );

        // Network: Broadcast local player's updated position & motion
        if (isOnline && playerRole) {
          networkSyncFrame++;
          if (networkSyncFrame % 2 === 0) {
            const localP = playerRole === 'fire' ? firePlayerRef.current : waterPlayerRef.current;
            network.emitMove({
              x: localP.x,
              y: localP.y,
              vx: localP.vx,
              vy: localP.vy,
              facing: localP.facing,
              isGrounded: localP.isGrounded,
              animFrame: localP.animFrame,
            });
          }
        }
      }

      // Canvas Rendering
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          rendererRef.current.render(
            ctx,
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
            levelConfig,
            firePlayerRef.current,
            waterPlayerRef.current,
            physicsRef.current.particles,
            physicsRef.current.screenShake
          );
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    levelConfig,
    isGameOver,
    isVictory,
    currentLevelId,
    soloMode,
    activeSoloCharacter,
    isOnline,
    playerRole,
    elapsedSeconds,
    saveProgress,
  ]);

  // Touch control callbacks
  const handleTouchDown = (action: string) => {
    touchInputsRef.current[action] = true;
  };
  const handleTouchUp = (action: string) => {
    touchInputsRef.current[action] = false;
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const handleRestart = () => {
    if (isOnline) {
      network.emitRestart();
    } else {
      loadLevel(currentLevelId);
    }
  };

  const handleNextLevel = () => {
    const nextLvl = currentLevelId + 1;
    if (isOnline) {
      network.emitLevelChange(nextLvl);
    } else {
      loadLevel(nextLvl);
    }
  };

  const handleSelectLevel = (id: number) => {
    if (isOnline) {
      network.emitLevelChange(id);
    } else {
      loadLevel(id);
    }
  };

  // Gem stats
  const blueGemsTotal = levelConfig.gems.filter((g) => g.element === 'water').length;
  const blueGemsCollected = levelConfig.gems.filter((g) => g.element === 'water' && g.collected).length;
  const redGemsTotal = levelConfig.gems.filter((g) => g.element === 'fire').length;
  const redGemsCollected = levelConfig.gems.filter((g) => g.element === 'fire' && g.collected).length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top HUD */}
      <HUD
        level={levelConfig}
        elapsedSeconds={elapsedSeconds}
        blueGemsCollected={blueGemsCollected}
        blueGemsTotal={blueGemsTotal}
        redGemsCollected={redGemsCollected}
        redGemsTotal={redGemsTotal}
        isMuted={isMuted}
        soloMode={soloMode}
        activeSoloCharacter={activeSoloCharacter}
        isOnline={isOnline}
        roomCode={roomCode}
        playerRole={playerRole}
        onToggleMute={handleToggleMute}
        onToggleSoloMode={() => setSoloMode((prev) => !prev)}
        onRestart={handleRestart}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onOpenControls={() => setShowControls(true)}
        onLeaveRoom={onExitToLobby}
      />

      {/* Main Game Arena Container */}
      <main className="flex-1 relative flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden">
        {/* Canvas Frame with subtle border and shadow */}
        <div className="relative w-full max-w-[1080px] aspect-[5/3] max-h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-black flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full object-contain"
          />

          {/* Level 3 Guardian Awakening Banner Alert */}
          {showGuardianAlert && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-950/90 border border-rose-600/80 px-6 py-2.5 rounded-xl shadow-2xl text-center animate-bounce z-30">
              <span className="text-xs uppercase font-bold tracking-widest text-rose-400 block">
                ¡ALERTA DE JEFE!
              </span>
              <span className="text-sm font-extrabold text-white">
                ¡EL GUARDIÁN ANCESTRAL BLOQUEA EL PASO!
              </span>
            </div>
          )}

          {/* Level Hint banner at start */}
          {elapsedSeconds < 6 && !showGuardianAlert && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-4 py-1.5 rounded-lg text-xs text-slate-300 text-center pointer-events-none shadow-lg max-w-lg transition-opacity duration-500">
              {levelConfig.hint}
            </div>
          )}
        </div>
      </main>

      {/* Touch / Virtual On-Screen Controls */}
      <OnScreenControls
        soloMode={soloMode}
        activeSoloCharacter={activeSoloCharacter}
        isOnline={isOnline}
        playerRole={playerRole}
        onInputDown={handleTouchDown}
        onInputUp={handleTouchUp}
        onSwitchSolo={() => setActiveSoloCharacter((prev) => (prev === 'fire' ? 'water' : 'fire'))}
      />

      {/* Modals */}
      {isGameOver && (
        <GameOverModal
          reason={gameOverReason}
          onRestart={handleRestart}
        />
      )}

      {isVictory && (
        <VictoryModal
          levelId={currentLevelId}
          levelTitle={levelConfig.title}
          timeSeconds={elapsedSeconds}
          parTimeSeconds={levelConfig.parTimeSeconds}
          gemsCollected={blueGemsCollected + redGemsCollected}
          totalGems={levelConfig.gems.length}
          stars={
            blueGemsCollected + redGemsCollected === levelConfig.gems.length &&
            elapsedSeconds <= levelConfig.parTimeSeconds * 1.25
              ? 3
              : blueGemsCollected + redGemsCollected >= levelConfig.gems.length * 0.8
              ? 2
              : 1
          }
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
          onSelectLevel={() => {
            setIsVictory(false);
            setShowLevelSelect(true);
          }}
        />
      )}

      {showLevelSelect && (
        <LevelSelectModal
          currentLevelId={currentLevelId}
          levelProgress={levelProgress}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {showControls && (
        <ControlsModal onClose={() => setShowControls(false)} />
      )}

      {/* Opponent Disconnected Modal */}
      {opponentDisconnected && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center shadow-2xl flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4">
              <WifiOff className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Compañero Desconectado</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {opponentDisconnected}
            </p>
            <button
              onClick={onExitToLobby}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Volver a la Pantalla de Salas (Lobby)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

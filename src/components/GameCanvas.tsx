import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  LevelConfig,
  Player,
  LevelProgress,
} from '../types/game';
import { getLevelConfig } from '../game/levels';
import { GamePhysicsEngine, GameInputs } from '../game/physics';
import { GameRenderer } from '../game/renderer';
import { sound } from '../game/audio';
import { HUD } from './HUD';
import { OnScreenControls } from './OnScreenControls';
import { GameOverModal } from './GameOverModal';
import { VictoryModal } from './VictoryModal';
import { LevelSelectModal } from './LevelSelectModal';
import { ControlsModal } from './ControlsModal';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 576;

export const GameCanvas: React.FC = () => {
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
        // Calculate stars: 1 star for completing, 2 stars for gems >= 80%, 3 stars for all gems + within par time
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
          // Unlock next level
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

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      // Prevent scroll for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      // Quick restart
      if (e.code === 'KeyR') {
        loadLevel(currentLevelId);
      }

      // Solo mode switch
      if (e.code === 'Space') {
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
  }, [currentLevelId, loadLevel]);

  // Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let secondAccumulator = 0;

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

      const inputs: GameInputs = {
        // Fireboy
        fireLeft:
          (!soloMode || activeSoloCharacter === 'fire') &&
          (Boolean(keys['ArrowLeft']) || Boolean(touch['fireLeft'])),
        fireRight:
          (!soloMode || activeSoloCharacter === 'fire') &&
          (Boolean(keys['ArrowRight']) || Boolean(touch['fireRight'])),
        fireUp:
          (!soloMode || activeSoloCharacter === 'fire') &&
          (Boolean(keys['ArrowUp']) || Boolean(touch['fireUp'])),
        fireDown:
          (!soloMode || activeSoloCharacter === 'fire') &&
          (Boolean(keys['ArrowDown']) || Boolean(touch['fireDown'])),

        // Watergirl
        waterLeft:
          (!soloMode || activeSoloCharacter === 'water') &&
          (Boolean(keys['KeyA']) || Boolean(touch['waterLeft'])),
        waterRight:
          (!soloMode || activeSoloCharacter === 'water') &&
          (Boolean(keys['KeyD']) || Boolean(touch['waterRight'])),
        waterUp:
          (!soloMode || activeSoloCharacter === 'water') &&
          (Boolean(keys['KeyW']) || Boolean(touch['waterUp'])),
        waterDown:
          (!soloMode || activeSoloCharacter === 'water') &&
          (Boolean(keys['KeyS']) || Boolean(touch['waterDown'])),
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
          },
          () => {
            setIsVictory(true);
            sound.playVictory();
            const blueCollected = levelConfig.gems.filter((g) => g.element === 'water' && g.collected).length;
            const redCollected = levelConfig.gems.filter((g) => g.element === 'fire' && g.collected).length;
            saveProgress(
              currentLevelId,
              elapsedSeconds,
              blueCollected + redCollected,
              levelConfig.gems.length
            );
          }
        );
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
        onToggleMute={handleToggleMute}
        onToggleSoloMode={() => setSoloMode((prev) => !prev)}
        onRestart={() => loadLevel(currentLevelId)}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onOpenControls={() => setShowControls(true)}
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
        onInputDown={handleTouchDown}
        onInputUp={handleTouchUp}
        onSwitchSolo={() => setActiveSoloCharacter((prev) => (prev === 'fire' ? 'water' : 'fire'))}
      />

      {/* Modals */}
      {isGameOver && (
        <GameOverModal
          reason={gameOverReason}
          onRestart={() => loadLevel(currentLevelId)}
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
          onNextLevel={() => loadLevel(currentLevelId + 1)}
          onRestart={() => loadLevel(currentLevelId)}
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
          onSelectLevel={(id) => loadLevel(id)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {showControls && (
        <ControlsModal onClose={() => setShowControls(false)} />
      )}
    </div>
  );
};

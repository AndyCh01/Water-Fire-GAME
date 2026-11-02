import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { X, Play, Lock, Star, Sparkles as SparklesIcon, Flame, ShieldAlert, RotateCw } from 'lucide-react';
import { LevelProgress } from '../types/game';

interface LevelSelect3DProps {
  currentLevelId: number;
  levelProgress: { [id: number]: LevelProgress };
  onSelectLevel: (id: number) => void;
  onClose: () => void;
}

interface LevelInfo {
  id: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  theme: 'water' | 'acid' | 'boss';
  color: string;
  lightColor: string;
  glowColor: string;
  position: [number, number, number];
}

const LEVELS: LevelInfo[] = [
  {
    id: 1,
    title: 'Nivel 1: Templo de los Elementos',
    shortTitle: 'NIVEL 1',
    subtitle: 'Aprende los fundamentos del agua, la lava y los interruptores elementales.',
    theme: 'water',
    color: '#0284c7', // Sky / Cyan
    lightColor: '#38bdf8',
    glowColor: '#00f0ff',
    position: [-3.8, 0, 0],
  },
  {
    id: 2,
    title: 'Nivel 2: Ruinas de Vapor y Ácido',
    shortTitle: 'NIVEL 2',
    subtitle: 'Pozos de ácido letal para ambos, plataformas móviles y cajas pesadas.',
    theme: 'acid',
    color: '#16a34a', // Emerald / Lime
    lightColor: '#4ade80',
    glowColor: '#a3e635',
    position: [0, 0.4, 0],
  },
  {
    id: 3,
    title: 'Nivel 3: La Guarida del Guardián',
    shortTitle: 'NIVEL 3',
    subtitle: '¡Jefe Titán! Salta sus ondas de choque y activa las dos runas arcanas.',
    theme: 'boss',
    color: '#dc2626', // Crimson / Orange
    lightColor: '#f97316',
    glowColor: '#ef4444',
    position: [3.8, 0, 0],
  },
];

// Single 3D Island / Temple Pillar Component
interface TemplePillarProps {
  level: LevelInfo;
  progress: LevelProgress;
  isCurrent: boolean;
  isHovered: boolean;
  onHover: (id: number | null) => void;
  onSelect: (id: number) => void;
}

const TemplePillar: React.FC<TemplePillarProps> = ({
  level,
  progress,
  isCurrent,
  isHovered,
  onHover,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const isUnlocked = progress.unlocked;

  // Animation frame: elevation & rotation
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Target Y: slightly raised when hovered or selected
    const targetY = (isHovered && isUnlocked ? 0.45 : 0) + (isCurrent ? 0.2 : 0);
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetY,
      8,
      delta
    );

    // Floating crystal spin
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * (isHovered ? 2.0 : 0.8);
      crystalRef.current.rotation.x = Math.sin(Date.now() * 0.002) * 0.15;
    }

    // Rune ring counter-rotation
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * (isHovered ? 1.5 : 0.5);
    }
  });

  const stoneColor = isUnlocked ? '#334155' : '#1e293b';
  const stoneTopColor = isUnlocked ? '#475569' : '#0f172a';
  const emissiveColor = isUnlocked ? level.glowColor : '#000000';
  const emissiveIntensity = isUnlocked ? (isHovered ? 1.4 : isCurrent ? 0.9 : 0.4) : 0;

  return (
    <group
      ref={groupRef}
      position={level.position}
      onClick={(e) => {
        e.stopPropagation();
        if (isUnlocked) onSelect(level.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(level.id);
        document.body.style.cursor = isUnlocked ? 'pointer' : 'not-allowed';
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = 'default';
      }}
    >
      {/* --- Floating Base Island / Lower Pillar Section --- */}
      {/* Bottom inverted cone for floating island feeling */}
      <mesh position={[0, -2.4, 0]}>
        <cylinderGeometry args={[1.5, 0.1, 1.8, 8]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Main Stepped Temple Pedestal (Cylinder / Box Layers) */}
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.7, 1.9, 0.7, 8]} />
        <meshStandardMaterial
          color={stoneColor}
          roughness={0.7}
          metalness={0.2}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.15}
        />
      </mesh>

      {/* Mid Temple Stone Slab */}
      <mesh position={[0, -0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.4, 2.5]} />
        <meshStandardMaterial
          color={stoneTopColor}
          roughness={0.6}
          metalness={0.2}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.25}
        />
      </mesh>

      {/* Altar Top Platform */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[1.4, 1.5, 0.4, 16]} />
        <meshStandardMaterial
          color={isUnlocked ? '#64748b' : '#1e293b'}
          roughness={0.5}
          metalness={0.3}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.35}
        />
      </mesh>

      {/* 4 Decorative Corner Temple Obelisks */}
      {[-0.95, 0.95].map((x, xi) =>
        [-0.95, 0.95].map((z, zi) => (
          <mesh key={`${xi}-${zi}`} position={[x, 0.35, z]} castShadow>
            <boxGeometry args={[0.24, 0.9, 0.24]} />
            <meshStandardMaterial
              color={stoneColor}
              roughness={0.6}
              metalness={0.2}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity * 0.3}
            />
          </mesh>
        ))
      )}

      {/* Rotating Rune Ring on the floor */}
      {isUnlocked && (
        <mesh ref={ringRef} position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.25, 24]} />
          <meshBasicMaterial
            color={level.lightColor}
            transparent
            opacity={isHovered ? 0.9 : 0.55}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* --- Central Elemental Focus (Crystals / Relics) --- */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        {isUnlocked ? (
          <group position={[0, 0.85, 0]}>
            {/* Main Crystal Geometries */}
            <mesh ref={crystalRef} castShadow>
              <octahedronGeometry args={[0.62, 0]} />
              <meshStandardMaterial
                color={level.color}
                emissive={level.glowColor}
                emissiveIntensity={isHovered ? 1.6 : 1.0}
                roughness={0.15}
                metalness={0.7}
                wireframe={false}
              />
            </mesh>

            {/* Inner Core Light */}
            <pointLight
              color={level.lightColor}
              intensity={isHovered ? 3.5 : 1.8}
              distance={4.5}
              decay={2}
            />
          </group>
        ) : (
          /* Locked Dark Monolith with Padlock Sigil */
          <group position={[0, 0.8, 0]}>
            <mesh>
              <boxGeometry args={[0.45, 0.75, 0.25]} />
              <meshStandardMaterial
                color="#090d16"
                roughness={0.8}
                metalness={0.4}
                wireframe={false}
              />
            </mesh>
            {/* Shackle hoop */}
            <mesh position={[0, 0.45, 0]}>
              <torusGeometry args={[0.22, 0.06, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.8} />
            </mesh>
          </group>
        )}
      </Float>

      {/* --- Floating 3D Text Badges --- */}
      <group position={[0, 2.05, 0]}>
        {/* Level Short Title */}
        <Text
          fontSize={0.34}
          color={isUnlocked ? (isHovered ? '#ffffff' : level.lightColor) : '#64748b'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#020617"
        >
          {level.shortTitle}
        </Text>

        {/* Status / Level Name subtitle */}
        <Text
          position={[0, -0.32, 0]}
          fontSize={0.18}
          color={isUnlocked ? '#cbd5e1' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#020617"
        >
          {isUnlocked
            ? isCurrent
              ? '✦ Nivel Actual ✦'
              : progress.completed
              ? '★ Completado'
              : 'Desbloqueado'
            : '🔒 Bloqueado'}
        </Text>
      </group>

      {/* Active Selection Beacon / Ground Ring */}
      {isCurrent && (
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.35, 1.48, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export const LevelSelect3D: React.FC<LevelSelect3DProps> = ({
  currentLevelId,
  levelProgress,
  onSelectLevel,
  onClose,
}) => {
  const [hoveredLevelId, setHoveredLevelId] = useState<number | null>(null);

  // Active level data for details drawer
  const activeLevelId = hoveredLevelId ?? currentLevelId;
  const activeLevel = LEVELS.find((l) => l.id === activeLevelId) || LEVELS[0];
  const activeProgress = levelProgress[activeLevel.id] || {
    unlocked: activeLevel.id === 1,
    completed: false,
    stars: 0,
    gemsCollected: 0,
    totalGems: 8,
  };

  const handleStartLevel = (id: number) => {
    const prog = levelProgress[id];
    if (prog?.unlocked || id === 1) {
      onSelectLevel(id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md select-none overflow-hidden animate-in fade-in duration-300">
      {/* Top Bar Overlay */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-orange-500/20 border border-slate-700/80 shadow-inner">
            <SparklesIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-2">
              <span>Santuario Elemental 3D</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-medium">
                Three.js
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Selecciona un pilar místico o arrastra con el ratón para rotar el templo
            </p>
          </div>
        </div>

        {/* Orbit Hint & Close Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click + Arrastrar para rotar</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar selección de nivel"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 transition-all shadow-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Center: Interactive 3D Canvas */}
      <div className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          shadows
          camera={{ position: [0, 2.8, 7.8], fov: 46 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Ambient Lighting */}
          <ambientLight intensity={0.5} />

          {/* Main Key Temple Light */}
          <directionalLight
            position={[5, 10, 6]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Cyan / Water Shrine Point Light */}
          <pointLight position={[-4, 3, 2]} color="#00d8ff" intensity={2.5} distance={10} />

          {/* Orange / Fire Shrine Point Light */}
          <pointLight position={[4, 3, 2]} color="#ff6600" intensity={2.5} distance={10} />

          {/* Mystical Floating Dust / Temple Energy Sparkles */}
          <Sparkles count={70} scale={[12, 6, 8]} size={2.5} speed={0.4} opacity={0.5} color="#38bdf8" />
          <Sparkles count={50} scale={[12, 6, 8]} size={2.2} speed={0.5} opacity={0.45} color="#f97316" />

          {/* Temple Pillars */}
          {LEVELS.map((lvl) => {
            const progress = levelProgress[lvl.id] || {
              unlocked: lvl.id === 1,
              completed: false,
              stars: 0,
              gemsCollected: 0,
              totalGems: 8,
            };

            return (
              <TemplePillar
                key={lvl.id}
                level={lvl}
                progress={progress}
                isCurrent={lvl.id === currentLevelId}
                isHovered={lvl.id === activeLevelId}
                onHover={setHoveredLevelId}
                onSelect={handleStartLevel}
              />
            );
          })}

          {/* Orbit Controls (Restricted for majestic temple perspective) */}
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            minDistance={4.5}
            maxDistance={12}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2 - 0.08}
            minAzimuthAngle={-Math.PI / 3}
            maxAzimuthAngle={Math.PI / 3}
          />
        </Canvas>

        {/* Quick Island Selector Buttons (Desktop/Mobile fallback) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 pointer-events-auto">
          {LEVELS.map((lvl) => {
            const prog = levelProgress[lvl.id] || { unlocked: lvl.id === 1 };
            const isSelected = lvl.id === activeLevelId;

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  setHoveredLevelId(lvl.id);
                  if (prog.unlocked) handleStartLevel(lvl.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-lg shadow-cyan-950/50 scale-105'
                    : prog.unlocked
                    ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-slate-950/60 text-slate-600 border-slate-800 opacity-60'
                }`}
              >
                {!prog.unlocked ? (
                  <Lock className="w-3 h-3 text-slate-500" />
                ) : lvl.id === 3 ? (
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                ) : lvl.id === 2 ? (
                  <Flame className="w-3 h-3 text-orange-400" />
                ) : (
                  <SparklesIcon className="w-3 h-3 text-cyan-400" />
                )}
                <span>Nivel {lvl.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Panel Overlay: Selected Level Details */}
      <footer className="relative z-10 w-full px-6 py-4 border-t border-slate-800/80 bg-slate-900/85 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Level Details Info */}
        <div className="flex items-center gap-4 text-left w-full md:w-auto">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-inner"
            style={{
              backgroundColor: `${activeLevel.color}25`,
              borderColor: `${activeLevel.color}60`,
            }}
          >
            {activeLevel.id === 3 ? (
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            ) : activeLevel.id === 2 ? (
              <Flame className="w-6 h-6 text-orange-400" />
            ) : (
              <SparklesIcon className="w-6 h-6 text-cyan-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{activeLevel.title}</h3>
              {activeLevel.id === currentLevelId && (
                <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-950/90 border border-cyan-700 px-2 py-0.5 rounded">
                  En Curso
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-xl line-clamp-1">{activeLevel.subtitle}</p>

            {/* Stars & Record Stats */}
            {activeProgress.unlocked && (
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= (activeProgress.stars || 0)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-[11px] font-semibold text-slate-300">
                    {activeProgress.stars || 0}/3 estrellas
                  </span>
                </div>
                {activeProgress.completed && (
                  <span className="text-emerald-400 font-semibold text-[11px]">
                    ✓ Superado
                  </span>
                )}
                {activeProgress.bestTime && (
                  <span className="font-mono text-[11px] text-slate-300">
                    Récord: {Math.floor(activeProgress.bestTime)}s
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Enter Temple Level Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => handleStartLevel(activeLevel.id)}
            disabled={!activeProgress.unlocked}
            className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              activeProgress.unlocked
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white cursor-pointer active:scale-95 shadow-cyan-950/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            {activeProgress.unlocked ? (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Explorar Templo (Nivel {activeLevel.id})</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Nivel Bloqueado</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

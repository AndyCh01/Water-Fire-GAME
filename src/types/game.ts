export type ElementType = 'fire' | 'water';

export enum TileType {
  EMPTY = 0,
  SOLID = 1,          // Stone temple wall / solid block
  PLATFORM = 2,       // One-way jump-through or thin stone ledge
  WATER_POOL = 3,     // Blue pool: Safe for Water, lethal to Fire
  LAVA_POOL = 4,      // Red pool: Safe for Fire, lethal to Water
  ACID_POOL = 5,      // Green pool: Lethal to both
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Player {
  id: ElementType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  isDead: boolean;
  deathReason?: string;
  hasReachedDoor: boolean;
  animFrame: number;
  particlesSpawnTimer: number;
}

export interface Door {
  id: string;
  element: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean;
  openProgress: number; // 0 to 1
}

export interface Gem {
  id: string;
  element: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  bobOffset: number;
}

export interface PressurePlate {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetGateId: string;
  isPressed: boolean;
  color: string;
}

export interface Lever {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetGateId: string;
  isOn: boolean;
  color: string;
}

export interface Gate {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  openOffsetX: number; // Delta x when open
  openOffsetY: number; // Delta y when open
  currentProgress: number; // 0 (closed) to 1 (fully open)
  color?: string;
  label?: string;
}

export interface PushableBox {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
}

export interface RunePillar {
  id: string;
  element: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  activated: boolean;
  activationProgress: number; // 0 to 1
  label: string;
}

export interface Shockwave {
  x: number;
  y: number;
  vx: number;
  radius: number;
  maxDistance: number;
  distanceTraveled: number;
  platformY: number;
}

export interface EnergyOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  element: 'fire' | 'water' | 'energy';
  life: number;
}

export interface GuardianBoss {
  x: number;
  y: number;
  width: number;
  height: number;
  state: 'idle' | 'charging' | 'slam' | 'beam' | 'stunned';
  health: number; // 0 to 100
  stateTimer: number;
  targetX: number;
  eyeGazeAngle: number;
  isStunned: boolean;
  shieldActive: boolean;
  shockwaves: Shockwave[];
  orbs: EnergyOrb[];
  slamCooldown: number;
  beamCooldown: number;
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  hint: string;
  gridCols: number;
  gridRows: number;
  tileSize: number;
  tiles: number[][];
  fireSpawn: Vector2D;
  waterSpawn: Vector2D;
  doors: Door[];
  gems: Gem[];
  plates: PressurePlate[];
  levers: Lever[];
  gates: Gate[];
  boxes: PushableBox[];
  runes?: RunePillar[];
  guardian?: GuardianBoss;
  parTimeSeconds: number;
}

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  bestTime?: number;
  gemsCollected: number;
  totalGems: number;
  stars: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  type?: 'spark' | 'bubble' | 'smoke' | 'shockwave' | 'rune';
}

export type PlayerRole = 'fire' | 'water';

export interface MultiplayerState {
  isOnline: boolean;
  roomCode: string | null;
  role: PlayerRole | null;
  opponentConnected: boolean;
}


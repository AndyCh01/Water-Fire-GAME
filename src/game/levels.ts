import { LevelConfig, TileType } from '../types/game';

// Helper to create empty grid: 30 cols x 18 rows
const createEmptyGrid = (cols = 30, rows = 18): number[][] => {
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      // Border walls
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        row.push(TileType.SOLID);
      } else {
        row.push(TileType.EMPTY);
      }
    }
    grid.push(row);
  }
  return grid;
};

// ==========================================
// LEVEL 1: EL TEMPLO DE LOS ELEMENTOS
// ==========================================
const createLevel1 = (): LevelConfig => {
  const grid = createEmptyGrid(30, 18);

  // 1. PISO 1 (Suelo inferior en r=16 y r=17)
  for (let c = 1; c < 29; c++) {
    grid[16][c] = TileType.SOLID;
    grid[17][c] = TileType.SOLID;
  }

  // Pozos compactos en Piso 1 (2 bloques)
  for (let c = 9; c <= 10; c++) grid[16][c] = TileType.WATER_POOL;
  for (let c = 17; c <= 18; c++) grid[16][c] = TileType.LAVA_POOL;

  // ESCALONES CON ESPACIO ABIERTO (Cols 2-4 y 25-27 tienen techo despejado)
  // Repisa izquierda para subir a Piso 2 (r=14, cols 2 a 4)
  for (let c = 2; c <= 4; c++) {
    grid[14][c] = TileType.PLATFORM;
  }
  // Repisa derecha para subir a Piso 2 (r=14, cols 25 a 27)
  for (let c = 25; c <= 27; c++) {
    grid[14][c] = TileType.PLATFORM;
  }

  // 2. PISO 2 (r=12) - Inicia en col 5 a 12 (ala izq) y col 17 a 24 (ala der),
  // dejando cols 1-4 y 25-28 totalmente despejadas arriba para saltar con holgura.
  for (let c = 5; c <= 12; c++) {
    grid[12][c] = TileType.SOLID;
    grid[13][c] = TileType.SOLID;
  }
  // Pozo de lava en ala izquierda (cols 8 y 9)
  for (let c = 8; c <= 9; c++) {
    grid[12][c] = TileType.LAVA_POOL;
  }

  // Ala derecha Piso 2 (cols 17 a 24)
  for (let c = 17; c <= 24; c++) {
    grid[12][c] = TileType.SOLID;
    grid[13][c] = TileType.SOLID;
  }
  // Pozo de agua en ala derecha (cols 19 y 20)
  for (let c = 19; c <= 20; c++) {
    grid[12][c] = TileType.WATER_POOL;
  }

  // ESCALONES PARA SUBIR DE PISO 2 A PISO 3 (r=10)
  // Repisa izquierda en r=10 (cols 2 a 4) - Techo totalmente libre arriba!
  for (let c = 2; c <= 4; c++) {
    grid[10][c] = TileType.PLATFORM;
  }
  // Repisa central en r=10 (cols 13 a 16)
  for (let c = 13; c <= 16; c++) {
    grid[10][c] = TileType.PLATFORM;
  }
  // Repisa derecha en r=10 (cols 25 a 27) - Techo totalmente libre arriba!
  for (let c = 25; c <= 27; c++) {
    grid[10][c] = TileType.PLATFORM;
  }

  // 3. PISO 3 (r=8) - Plataformas intermedias
  for (let c = 5; c <= 10; c++) {
    grid[8][c] = TileType.SOLID;
  }
  for (let c = 12; c <= 17; c++) {
    grid[8][c] = TileType.SOLID;
  }
  for (let c = 19; c <= 24; c++) {
    grid[8][c] = TileType.SOLID;
  }

  // ESCALONES PARA SUBIR DE PISO 3 A PISO 4 / SANTUARIO (r=6)
  for (let c = 13; c <= 16; c++) {
    grid[6][c] = TileType.PLATFORM;
  }
  for (let c = 8; c <= 11; c++) {
    grid[6][c] = TileType.PLATFORM;
  }

  // 4. PISO 4 - Santuario de las Puertas (r=4)
  for (let c = 17; c <= 28; c++) {
    grid[4][c] = TileType.SOLID;
    grid[5][c] = TileType.SOLID;
  }
  // Plataforma de paso superior en r=4
  for (let c = 12; c <= 16; c++) {
    grid[4][c] = TileType.PLATFORM;
  }

  return {
    id: 1,
    title: 'Nivel 1: Templo de los Elementos',
    subtitle: 'Aprende a coordinar el Fuego y el Agua',
    hint: 'Sube por las repisas abiertas hacia el Piso 2 y 3. Activa la placa azul en el piso medio para abrir la Gran Puerta.',
    gridCols: 30,
    gridRows: 18,
    tileSize: 32,
    tiles: grid,
    fireSpawn: { x: 50, y: 460 },
    waterSpawn: { x: 90, y: 460 },
    doors: [
      { id: 'door_fire', element: 'fire', x: 22 * 32, y: 2 * 32 + 10, width: 34, height: 48, isOpen: false, openProgress: 0 },
      { id: 'door_water', element: 'water', x: 26 * 32, y: 2 * 32 + 10, width: 34, height: 48, isOpen: false, openProgress: 0 },
    ],
    gems: [
      // Gemas Azules (Agua)
      { id: 'w1', element: 'water', x: 9.5 * 32, y: 15 * 32, width: 18, height: 18, collected: false, bobOffset: 0 },
      { id: 'w2', element: 'water', x: 19.5 * 32, y: 11 * 32, width: 18, height: 18, collected: false, bobOffset: 1 },
      { id: 'w3', element: 'water', x: 6 * 32, y: 7 * 32, width: 18, height: 18, collected: false, bobOffset: 2 },
      { id: 'w4', element: 'water', x: 24 * 32, y: 3 * 32, width: 18, height: 18, collected: false, bobOffset: 3 },
      // Gemas Rojas (Fuego)
      { id: 'f1', element: 'fire', x: 17.5 * 32, y: 15 * 32, width: 18, height: 18, collected: false, bobOffset: 0 },
      { id: 'f2', element: 'fire', x: 8.5 * 32, y: 11 * 32, width: 18, height: 18, collected: false, bobOffset: 1 },
      { id: 'f3', element: 'fire', x: 22 * 32, y: 7 * 32, width: 18, height: 18, collected: false, bobOffset: 2 },
      { id: 'f4', element: 'fire', x: 20 * 32, y: 3 * 32, width: 18, height: 18, collected: false, bobOffset: 3 },
    ],
    plates: [
      // Placa en Piso 3 central (r=8, col 14) abre gate1 hacia las puertas
      { id: 'plate1', x: 14.5 * 32, y: 8 * 32 - 6, width: 26, height: 8, targetGateId: 'gate1', isPressed: false, color: '#3b82f6' },
      // Placa en Piso 2 derecho
      { id: 'plate2', x: 23 * 32, y: 12 * 32 - 6, width: 26, height: 8, targetGateId: 'gate2', isPressed: false, color: '#f59e0b' },
    ],
    levers: [
      { id: 'lever1', x: 5.5 * 32, y: 12 * 32 - 20, width: 16, height: 20, targetGateId: 'gate_elevator', isOn: false, color: '#10b981' },
    ],
    gates: [
      // Puerta que bloquea el santuario superior
      { id: 'gate1', x: 17 * 32, y: 2 * 32, width: 14, height: 64, openOffsetX: 0, openOffsetY: -64, currentProgress: 0, color: '#3b82f6', label: 'A' },
      // Puerta lateral
      { id: 'gate2', x: 27 * 32 + 16, y: 8 * 32, width: 14, height: 64, openOffsetX: 0, openOffsetY: -64, currentProgress: 0, color: '#f59e0b', label: 'B' },
      // Ascensor central móvil
      { id: 'gate_elevator', x: 14 * 32, y: 13 * 32, width: 56, height: 12, openOffsetX: 0, openOffsetY: -96, currentProgress: 0, color: '#10b981', label: 'E' },
    ],
    boxes: [
      { id: 'box1', x: 21 * 32, y: 11 * 32, vx: 0, vy: 0, width: 28, height: 28, isGrounded: true },
    ],
    parTimeSeconds: 60,
  };
};

// ==========================================
// LEVEL 2: LAS RUINAS DE VAPOR Y ÁCIDO
// ==========================================
const createLevel2 = (): LevelConfig => {
  const grid = createEmptyGrid(30, 18);

  // Piso 1: Suelo inferior en r=16 y r=17
  for (let c = 1; c < 29; c++) {
    grid[16][c] = TileType.SOLID;
    grid[17][c] = TileType.SOLID;
  }

  // Pozos en Piso 1
  for (let c = 7; c <= 8; c++) grid[16][c] = TileType.WATER_POOL;
  for (let c = 13; c <= 15; c++) grid[16][c] = TileType.ACID_POOL;
  for (let c = 21; c <= 22; c++) grid[16][c] = TileType.LAVA_POOL;

  // Escalones abiertos Piso 1 -> Piso 2
  for (let c = 2; c <= 4; c++) grid[14][c] = TileType.PLATFORM;
  for (let c = 25; c <= 27; c++) grid[14][c] = TileType.PLATFORM;

  // Piso 2 (r=12): Dejando cols 1-4 y 25-28 despejadas arriba
  for (let c = 5; c <= 11; c++) {
    grid[12][c] = TileType.SOLID;
    grid[13][c] = TileType.SOLID;
  }
  for (let c = 13; c <= 17; c++) {
    grid[12][c] = TileType.SOLID;
    grid[13][c] = TileType.SOLID;
  }
  for (let c = 19; c <= 24; c++) {
    grid[12][c] = TileType.SOLID;
    grid[13][c] = TileType.SOLID;
  }
  for (let c = 14; c <= 15; c++) grid[12][c] = TileType.ACID_POOL;

  // Escalones abiertos Piso 2 -> Piso 3
  for (let c = 2; c <= 4; c++) grid[10][c] = TileType.PLATFORM;
  for (let c = 25; c <= 27; c++) grid[10][c] = TileType.PLATFORM;

  // Piso 3 (r=8)
  for (let c = 2; c <= 4; c++) grid[8][c] = TileType.PLATFORM;
  for (let c = 5; c <= 11; c++) {
    grid[8][c] = TileType.SOLID;
    grid[9][c] = TileType.SOLID;
  }
  for (let c = 7; c <= 8; c++) grid[8][c] = TileType.LAVA_POOL;

  for (let c = 18; c <= 24; c++) {
    grid[8][c] = TileType.SOLID;
    grid[9][c] = TileType.SOLID;
  }
  for (let c = 20; c <= 21; c++) grid[8][c] = TileType.WATER_POOL;
  for (let c = 25; c <= 27; c++) grid[8][c] = TileType.PLATFORM;

  // ESCALONES PARA SUBIR AL PISO 4 / PUERTAS DE SALIDA
  // Repisa del lado izquierdo (r=6, cols 2 a 5) con techo totalmente libre arriba
  for (let c = 2; c <= 5; c++) {
    grid[6][c] = TileType.PLATFORM;
  }
  // Repisa del lado derecho (r=6, cols 24 a 27)
  for (let c = 24; c <= 27; c++) {
    grid[6][c] = TileType.PLATFORM;
  }

  // Piso 4 (r=4): Puertas de salida en el centro, accesible desde la repisa izquierda
  for (let c = 5; c <= 24; c++) {
    grid[4][c] = TileType.SOLID;
    grid[5][c] = TileType.SOLID;
  }

  return {
    id: 2,
    title: 'Nivel 2: Ruinas de Vapor y Ácido',
    subtitle: '¡Cuidado con el ácido verde, daña a ambos!',
    hint: 'El ácido verde es letal para ambos. Sube por las repisas abiertas y coordina los interruptores.',
    gridCols: 30,
    gridRows: 18,
    tileSize: 32,
    tiles: grid,
    fireSpawn: { x: 50, y: 460 },
    waterSpawn: { x: 90, y: 460 },
    doors: [
      { id: 'door_fire', element: 'fire', x: 13 * 32, y: 2 * 32 + 10, width: 34, height: 48, isOpen: false, openProgress: 0 },
      { id: 'door_water', element: 'water', x: 16 * 32, y: 2 * 32 + 10, width: 34, height: 48, isOpen: false, openProgress: 0 },
    ],
    gems: [
      // Gemas Azules
      { id: 'w1', element: 'water', x: 7.5 * 32, y: 15 * 32, width: 18, height: 18, collected: false, bobOffset: 0 },
      { id: 'w2', element: 'water', x: 20.5 * 32, y: 7 * 32, width: 18, height: 18, collected: false, bobOffset: 1 },
      { id: 'w3', element: 'water', x: 5 * 32, y: 11 * 32, width: 18, height: 18, collected: false, bobOffset: 2 },
      { id: 'w4', element: 'water', x: 10 * 32, y: 7 * 32, width: 18, height: 18, collected: false, bobOffset: 3 },
      { id: 'w5', element: 'water', x: 17 * 32, y: 3 * 32, width: 18, height: 18, collected: false, bobOffset: 4 },
      // Gemas Rojas
      { id: 'f1', element: 'fire', x: 21.5 * 32, y: 15 * 32, width: 18, height: 18, collected: false, bobOffset: 0 },
      { id: 'f2', element: 'fire', x: 7.5 * 32, y: 7 * 32, width: 18, height: 18, collected: false, bobOffset: 1 },
      { id: 'f3', element: 'fire', x: 23 * 32, y: 11 * 32, width: 18, height: 18, collected: false, bobOffset: 2 },
      { id: 'f4', element: 'fire', x: 18 * 32, y: 7 * 32, width: 18, height: 18, collected: false, bobOffset: 3 },
      { id: 'f5', element: 'fire', x: 12 * 32, y: 3 * 32, width: 18, height: 18, collected: false, bobOffset: 4 },
    ],
    plates: [
      { id: 'plate1', x: 23 * 32, y: 12 * 32 - 6, width: 26, height: 8, targetGateId: 'gate_center', isPressed: false, color: '#ec4899' },
      { id: 'plate2', x: 5.5 * 32, y: 8 * 32 - 6, width: 26, height: 8, targetGateId: 'gate_top', isPressed: false, color: '#8b5cf6' },
    ],
    levers: [
      { id: 'lever_bridge', x: 2 * 32, y: 14 * 32 - 20, width: 16, height: 20, targetGateId: 'bridge_acid', isOn: false, color: '#10b981' },
      { id: 'lever_top', x: 23 * 32, y: 8 * 32 - 20, width: 16, height: 20, targetGateId: 'platform_top', isOn: false, color: '#f59e0b' },
    ],
    gates: [
      { id: 'bridge_acid', x: 13 * 32, y: 15 * 32 + 10, width: 3 * 32, height: 12, openOffsetX: 0, openOffsetY: -4, currentProgress: 0, color: '#10b981', label: 'Puente' },
      { id: 'gate_center', x: 14 * 32, y: 11 * 32, width: 60, height: 12, openOffsetX: 0, openOffsetY: -96, currentProgress: 0, color: '#ec4899', label: 'Ascensor' },
      { id: 'gate_top', x: 8 * 32, y: 2 * 32, width: 14, height: 64, openOffsetX: 0, openOffsetY: -64, currentProgress: 0, color: '#8b5cf6', label: 'Muro' },
      { id: 'platform_top', x: 22 * 32, y: 6 * 32, width: 56, height: 12, openOffsetX: -64, openOffsetY: 0, currentProgress: 0, color: '#f59e0b', label: 'Repisa' },
    ],
    boxes: [
      { id: 'box1', x: 10 * 32, y: 11 * 32, vx: 0, vy: 0, width: 28, height: 28, isGrounded: true },
      { id: 'box2', x: 21 * 32, y: 7 * 32, vx: 0, vy: 0, width: 28, height: 28, isGrounded: true },
    ],
    parTimeSeconds: 85,
  };
};

// ==========================================
// LEVEL 3: LA GUARIDA DEL GUARDIÁN
// ==========================================
const createLevel3 = (): LevelConfig => {
  const grid = createEmptyGrid(30, 18);

  // Piso 1: Suelo inferior en r=16 y r=17
  for (let c = 1; c < 29; c++) {
    grid[16][c] = TileType.SOLID;
    grid[17][c] = TileType.SOLID;
  }

  // Pozos en Piso 1
  for (let c = 4; c <= 5; c++) grid[16][c] = TileType.WATER_POOL;
  for (let c = 24; c <= 25; c++) grid[16][c] = TileType.LAVA_POOL;

  // Escalones Piso 1 -> Piso 2 (despejados arriba)
  for (let c = 2; c <= 4; c++) grid[14][c] = TileType.PLATFORM;
  for (let c = 9; c <= 11; c++) grid[14][c] = TileType.PLATFORM;
  for (let c = 18; c <= 20; c++) grid[14][c] = TileType.PLATFORM;
  for (let c = 25; c <= 27; c++) grid[14][c] = TileType.PLATFORM;

  // Estrado central del Guardián (r=13 y r=14)
  for (let c = 11; c <= 18; c++) {
    grid[13][c] = TileType.SOLID;
    grid[14][c] = TileType.SOLID;
  }

  // Ala de Agua izquierda (r=12) - cols 5 a 10 (dejando cols 1-4 despejadas)
  for (let c = 5; c <= 10; c++) {
    grid[12][c] = TileType.SOLID;
    grid[13][c] = TileType.SOLID;
  }
  for (let c = 7; c <= 8; c++) grid[12][c] = TileType.WATER_POOL;

  // Ala de Fuego derecha (r=12) - cols 19 a 24 (dejando cols 25-28 despejadas)
  for (let c = 19; c <= 24; c++) {
    grid[12][c] = TileType.SOLID;
    grid[13][c] = TileType.SOLID;
  }
  for (let c = 21; c <= 22; c++) grid[12][c] = TileType.LAVA_POOL;

  // Escalones hacia las torres de runas (r=10 y r=8) con espacio amplio
  for (let c = 2; c <= 4; c++) grid[10][c] = TileType.PLATFORM;
  for (let c = 5; c <= 7; c++) grid[8][c] = TileType.PLATFORM;

  for (let c = 25; c <= 27; c++) grid[10][c] = TileType.PLATFORM;
  for (let c = 22; c <= 24; c++) grid[8][c] = TileType.PLATFORM;

  // Torres superiores de las Runas (r=7 y r=8)
  for (let c = 1; c <= 4; c++) {
    grid[7][c] = TileType.SOLID;
    grid[8][c] = TileType.SOLID;
  }
  for (let c = 25; c <= 28; c++) {
    grid[7][c] = TileType.SOLID;
    grid[8][c] = TileType.SOLID;
  }

  // Escalones hacia el Santuario Superior (r=6)
  for (let c = 8; c <= 11; c++) grid[6][c] = TileType.PLATFORM;
  for (let c = 18; c <= 21; c++) grid[6][c] = TileType.PLATFORM;

  // Santuario Superior central (r=4 y r=5)
  for (let c = 9; c <= 20; c++) {
    grid[4][c] = TileType.SOLID;
    grid[5][c] = TileType.SOLID;
  }
  for (let c = 14; c <= 15; c++) grid[4][c] = TileType.ACID_POOL;

  return {
    id: 3,
    title: 'Nivel 3: La Guarida del Guardián',
    subtitle: '¡Derrota el escudo del Titán Ancestral!',
    hint: 'Sube por los costados para activar las 2 runas. ¡Salta cuando el Guardián golpee el suelo!',
    gridCols: 30,
    gridRows: 18,
    tileSize: 32,
    tiles: grid,
    fireSpawn: { x: 13 * 32, y: 15 * 32 - 10 },
    waterSpawn: { x: 16 * 32, y: 15 * 32 - 10 },
    doors: [
      { id: 'door_fire', element: 'fire', x: 11 * 32, y: 2 * 32 + 10, width: 34, height: 48, isOpen: false, openProgress: 0 },
      { id: 'door_water', element: 'water', x: 17 * 32, y: 2 * 32 + 10, width: 34, height: 48, isOpen: false, openProgress: 0 },
    ],
    gems: [
      // Gemas Azules
      { id: 'w1', element: 'water', x: 4.5 * 32, y: 15 * 32, width: 18, height: 18, collected: false, bobOffset: 0 },
      { id: 'w2', element: 'water', x: 7.5 * 32, y: 11 * 32, width: 18, height: 18, collected: false, bobOffset: 1 },
      { id: 'w3', element: 'water', x: 2 * 32, y: 5 * 32, width: 18, height: 18, collected: false, bobOffset: 2 },
      { id: 'w4', element: 'water', x: 9 * 32, y: 9 * 32, width: 18, height: 18, collected: false, bobOffset: 3 },
      { id: 'w5', element: 'water', x: 18 * 32, y: 3 * 32, width: 18, height: 18, collected: false, bobOffset: 4 },
      // Gemas Rojas
      { id: 'f1', element: 'fire', x: 24.5 * 32, y: 15 * 32, width: 18, height: 18, collected: false, bobOffset: 0 },
      { id: 'f2', element: 'fire', x: 21.5 * 32, y: 11 * 32, width: 18, height: 18, collected: false, bobOffset: 1 },
      { id: 'f3', element: 'fire', x: 27 * 32, y: 5 * 32, width: 18, height: 18, collected: false, bobOffset: 2 },
      { id: 'f4', element: 'fire', x: 20 * 32, y: 9 * 32, width: 18, height: 18, collected: false, bobOffset: 3 },
      { id: 'f5', element: 'fire', x: 11 * 32, y: 3 * 32, width: 18, height: 18, collected: false, bobOffset: 4 },
    ],
    plates: [
      { id: 'plate_left_aid', x: 6 * 32, y: 12 * 32 - 6, width: 26, height: 8, targetGateId: 'gate_left_wing', isPressed: false, color: '#06b6d4' },
      { id: 'plate_right_aid', x: 23 * 32, y: 12 * 32 - 6, width: 26, height: 8, targetGateId: 'gate_right_wing', isPressed: false, color: '#f97316' },
    ],
    levers: [],
    gates: [
      { id: 'gate_left_wing', x: 4 * 32 + 20, y: 6 * 32, width: 12, height: 32, openOffsetX: 0, openOffsetY: -32, currentProgress: 0, color: '#06b6d4', label: 'Runa Agua' },
      { id: 'gate_right_wing', x: 25 * 32, y: 6 * 32, width: 12, height: 32, openOffsetX: 0, openOffsetY: -32, currentProgress: 0, color: '#f97316', label: 'Runa Fuego' },
      { id: 'gate_master', x: 14.5 * 32, y: 2 * 32, width: 32, height: 64, openOffsetX: 0, openOffsetY: -64, currentProgress: 0, color: '#fbbf24', label: 'Santuario' },
    ],
    boxes: [],
    runes: [
      { id: 'rune_water', element: 'water', x: 2 * 32, y: 5 * 32 + 28, width: 30, height: 36, activated: false, activationProgress: 0, label: 'Runa de Agua' },
      { id: 'rune_fire', element: 'fire', x: 26 * 32, y: 5 * 32 + 28, width: 30, height: 36, activated: false, activationProgress: 0, label: 'Runa de Fuego' },
    ],
    guardian: {
      x: 14.5 * 32 - 28,
      y: 13 * 32 - 76,
      width: 64,
      height: 76,
      state: 'idle',
      health: 100,
      stateTimer: 0,
      targetX: 14.5 * 32,
      eyeGazeAngle: 0,
      isStunned: false,
      shieldActive: true,
      shockwaves: [],
      orbs: [],
      slamCooldown: 180,
      beamCooldown: 300,
    },
    parTimeSeconds: 100,
  };
};

export const getLevelConfig = (levelId: number): LevelConfig => {
  switch (levelId) {
    case 1:
      return createLevel1();
    case 2:
      return createLevel2();
    case 3:
      return createLevel3();
    default:
      return createLevel1();
  }
};

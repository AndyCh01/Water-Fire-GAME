import {
  Player,
  LevelConfig,
  TileType,
  Particle,
  PushableBox,
  Gate,
} from '../types/game';
import { sound } from './audio';

export interface GameInputs {
  // Fireboy (Arrows)
  fireLeft: boolean;
  fireRight: boolean;
  fireUp: boolean;
  fireDown: boolean;
  // Watergirl (WASD)
  waterLeft: boolean;
  waterRight: boolean;
  waterUp: boolean;
  waterDown: boolean;
}

const GRAVITY = 0.48;
const MAX_FALL_SPEED = 11;
const MOVE_SPEED = 4.4;
const JUMP_FORCE = -10.0;

// Check AABB overlap
export const rectOverlap = (
  r1: { x: number; y: number; width: number; height: number },
  r2: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
};

// Check if a tile is solid
const isSolidTile = (tile: number): boolean => {
  return tile === TileType.SOLID;
};

// Check horizontal tile collisions
const resolveTileCollisionX = (
  entity: { x: number; y: number; vx: number; width: number; height: number },
  tiles: number[][],
  tileSize: number
) => {
  entity.x += entity.vx;

  const minC = Math.max(0, Math.floor(entity.x / tileSize));
  const maxC = Math.min(tiles[0].length - 1, Math.floor((entity.x + entity.width - 0.01) / tileSize));
  const minR = Math.max(0, Math.floor(entity.y / tileSize));
  const maxR = Math.min(tiles.length - 1, Math.floor((entity.y + entity.height - 0.01) / tileSize));

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (isSolidTile(tiles[r][c])) {
        if (entity.vx > 0) {
          entity.x = c * tileSize - entity.width;
          entity.vx = 0;
        } else if (entity.vx < 0) {
          entity.x = (c + 1) * tileSize;
          entity.vx = 0;
        }
      }
    }
  }
};

// Check vertical tile collisions
const resolveTileCollisionY = (
  entity: { x: number; y: number; vy: number; width: number; height: number; isGrounded: boolean },
  tiles: number[][],
  tileSize: number
) => {
  entity.y += entity.vy;
  entity.isGrounded = false;

  const minC = Math.max(0, Math.floor((entity.x + 2) / tileSize));
  const maxC = Math.min(tiles[0].length - 1, Math.floor((entity.x + entity.width - 2.01) / tileSize));
  const minR = Math.max(0, Math.floor(entity.y / tileSize));
  const maxR = Math.min(tiles.length - 1, Math.floor((entity.y + entity.height - 0.01) / tileSize));

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const tile = tiles[r][c];

      // Solid blocks
      if (isSolidTile(tile)) {
        if (entity.vy > 0) {
          entity.y = r * tileSize - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;
        } else if (entity.vy < 0) {
          entity.y = (r + 1) * tileSize;
          entity.vy = 0;
        }
      }
      // Pool basin floors (Water, Lava, Acid) - solid floor so characters never fall through!
      else if (
        tile === TileType.WATER_POOL ||
        tile === TileType.LAVA_POOL ||
        tile === TileType.ACID_POOL
      ) {
        // Pool floor is at the bottom of the tile
        const poolFloorTop = r * tileSize + 6;
        if (entity.vy > 0 && entity.y + entity.height - entity.vy <= poolFloorTop + 8) {
          if (entity.y + entity.height >= poolFloorTop) {
            entity.y = poolFloorTop - entity.height;
            entity.vy = 0;
            entity.isGrounded = true;
          }
        } else if (entity.vy < 0) {
          // If jumping up into pool bottom from below, treat as solid ceiling
          entity.y = (r + 1) * tileSize;
          entity.vy = 0;
        }
      }
      // Jump-through platform
      else if (tile === TileType.PLATFORM) {
        const platformTop = r * tileSize;
        // Only land if previously above and falling down
        if (entity.vy > 0 && entity.y + entity.height - entity.vy <= platformTop + 6) {
          if (entity.y + entity.height >= platformTop) {
            entity.y = platformTop - entity.height;
            entity.vy = 0;
            entity.isGrounded = true;
          }
        }
      }
    }
  }
};

// Check gate collision (solid door / elevator platform)
const resolveGateCollisions = (
  entity: { x: number; y: number; vx: number; vy: number; width: number; height: number; isGrounded: boolean },
  gates: Gate[]
) => {
  for (const gate of gates) {
    const curX = gate.x + gate.openOffsetX * gate.currentProgress;
    const curY = gate.y + gate.openOffsetY * gate.currentProgress;
    const gateBox = { x: curX, y: curY, width: gate.width, height: gate.height };

    if (rectOverlap(entity, gateBox)) {
      // If landing on top of gate
      const prevBottom = entity.y + entity.height - entity.vy;
      if (prevBottom <= curY + 8 && entity.vy >= 0) {
        entity.y = curY - entity.height;
        entity.vy = 0;
        entity.isGrounded = true;
      } else {
        // Push sideways out of gate
        if (entity.vx > 0) {
          entity.x = curX - entity.width;
          entity.vx = 0;
        } else if (entity.vx < 0) {
          entity.x = curX + gate.width;
          entity.vx = 0;
        }
      }
    }
  }
};

export class GamePhysicsEngine {
  public particles: Particle[] = [];
  public screenShake: number = 0;

  public spawnParticles(
    x: number,
    y: number,
    count: number,
    color: string,
    type: 'spark' | 'bubble' | 'smoke' | 'shockwave' | 'rune' = 'spark',
    speed = 2
  ) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.8 + 0.2) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd + (type === 'smoke' || type === 'spark' ? -0.5 : 0),
        size: Math.random() * 3 + 2,
        alpha: 1,
        color,
        life: 0,
        maxLife: Math.floor(Math.random() * 20 + 20),
        type,
      });
    }
  }

  public updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.alpha = 1 - p.life / p.maxLife;

      if (p.type === 'shockwave') {
        p.size += 0.8;
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public update(
    level: LevelConfig,
    firePlayer: Player,
    waterPlayer: Player,
    inputs: GameInputs,
    onPlayerDeath: (reason: string) => void,
    onLevelComplete: () => void,
    localRole?: 'fire' | 'water',
    onLocalGemCollected?: (gemId: string, element: 'fire' | 'water') => void,
    onLocalLeverToggled?: (leverId: string, isOn: boolean) => void,
    onLocalPlateChanged?: (plateId: string, isPressed: boolean) => void
  ) {
    if (this.screenShake > 0) {
      this.screenShake *= 0.9;
      if (this.screenShake < 0.1) this.screenShake = 0;
    }

    // 1. Update Boxes physics
    for (const box of level.boxes) {
      box.vy += GRAVITY;
      if (box.vy > MAX_FALL_SPEED) box.vy = MAX_FALL_SPEED;
      box.vx *= 0.8; // friction

      resolveTileCollisionX(box, level.tiles, level.tileSize);
      resolveTileCollisionY(box, level.tiles, level.tileSize);
      resolveGateCollisions(box, level.gates);
    }

    // 2. Update Players movement & physics
    const updatePlayer = (
      p: Player,
      left: boolean,
      right: boolean,
      up: boolean,
      down: boolean
    ) => {
      if (p.isDead) return;

      // Horizontal acceleration
      if (left) {
        p.vx = -MOVE_SPEED;
        p.facing = 'left';
      } else if (right) {
        p.vx = MOVE_SPEED;
        p.facing = 'right';
      } else {
        p.vx *= 0.7; // friction
        if (Math.abs(p.vx) < 0.1) p.vx = 0;
      }

      // Jump
      if (up && p.isGrounded) {
        p.vy = JUMP_FORCE;
        p.isGrounded = false;
        sound.playJump(p.id);
        this.spawnParticles(
          p.x + p.width / 2,
          p.y + p.height,
          4,
          p.id === 'fire' ? '#f97316' : '#38bdf8',
          p.id === 'fire' ? 'spark' : 'bubble',
          1.5
        );
      }

      // Gravity
      p.vy += GRAVITY;
      if (p.vy > MAX_FALL_SPEED) p.vy = MAX_FALL_SPEED;

      // Push boxes check before tile collision
      for (const box of level.boxes) {
        if (rectOverlap({ ...p, x: p.x + p.vx }, box)) {
          // Push horizontally
          if (p.vx > 0 && p.x + p.width <= box.x + 8) {
            box.vx = MOVE_SPEED * 0.7;
          } else if (p.vx < 0 && p.x >= box.x + box.width - 8) {
            box.vx = -MOVE_SPEED * 0.7;
          }
        }
      }

      // Resolve tile collisions
      resolveTileCollisionX(p, level.tiles, level.tileSize);
      resolveTileCollisionY(p, level.tiles, level.tileSize);
      resolveGateCollisions(p, level.gates);

      // Check standing on top of boxes
      for (const box of level.boxes) {
        if (rectOverlap(p, box)) {
          const prevY = p.y + p.height - p.vy;
          if (prevY <= box.y + 8 && p.vy >= 0) {
            p.y = box.y - p.height;
            p.vy = 0;
            p.isGrounded = true;
          }
        }
      }

      // Trail particles
      p.particlesSpawnTimer++;
      if (p.particlesSpawnTimer >= 5) {
        p.particlesSpawnTimer = 0;
        this.spawnParticles(
          p.x + p.width / 2 + (Math.random() * 8 - 4),
          p.y + p.height - 4,
          1,
          p.id === 'fire' ? '#fb923c' : '#7dd3fc',
          p.id === 'fire' ? 'spark' : 'bubble',
          0.8
        );
      }

      // Animation frame
      if (Math.abs(p.vx) > 0.5) {
        p.animFrame += 0.2;
      } else {
        p.animFrame = 0;
      }
    };

    if (!localRole || localRole === 'fire') {
      updatePlayer(
        firePlayer,
        inputs.fireLeft,
        inputs.fireRight,
        inputs.fireUp,
        inputs.fireDown
      );
    }
    if (!localRole || localRole === 'water') {
      updatePlayer(
        waterPlayer,
        inputs.waterLeft,
        inputs.waterRight,
        inputs.waterUp,
        inputs.waterDown
      );
    }

    // 3. Pool hazard checks
    const checkLiquidHazards = (p: Player) => {
      if (p.isDead) return;

      const minC = Math.max(0, Math.floor((p.x + 4) / level.tileSize));
      const maxC = Math.min(level.gridCols - 1, Math.floor((p.x + p.width - 4) / level.tileSize));
      const minR = Math.max(0, Math.floor((p.y + 8) / level.tileSize));
      const maxR = Math.min(level.gridRows - 1, Math.floor((p.y + p.height - 2) / level.tileSize));

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const tile = level.tiles[r][c];

          // Water hazard
          if (tile === TileType.WATER_POOL) {
            if (p.id === 'fire') {
              p.isDead = true;
              p.deathReason = '¡El agua extinguió a Chico Fuego!';
              sound.playDeath('sizzle');
              this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, 20, '#94a3b8', 'smoke', 2.5);
              onPlayerDeath(p.deathReason);
              return;
            } else {
              // Water character safely wading in water
              if (Math.random() < 0.3) {
                this.spawnParticles(p.x + p.width / 2, p.y + p.height - 2, 2, '#38bdf8', 'bubble', 1);
              }
            }
          }

          // Lava hazard
          if (tile === TileType.LAVA_POOL) {
            if (p.id === 'water') {
              p.isDead = true;
              p.deathReason = '¡La lava evaporó a Chica Agua!';
              sound.playDeath('lava');
              this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, 20, '#cbd5e1', 'smoke', 2.5);
              onPlayerDeath(p.deathReason);
              return;
            } else {
              // Fire character safely wading in lava
              if (Math.random() < 0.3) {
                this.spawnParticles(p.x + p.width / 2, p.y + p.height - 2, 2, '#f97316', 'spark', 1);
              }
            }
          }

          // Toxic Acid hazard (both die)
          if (tile === TileType.ACID_POOL) {
            p.isDead = true;
            p.deathReason = '¡El ácido verde tóxico disolvió a tu personaje!';
            sound.playDeath('acid');
            this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, 25, '#84cc16', 'bubble', 3);
            onPlayerDeath(p.deathReason);
            return;
          }
        }
      }
    };

    if (!localRole || localRole === 'fire') {
      checkLiquidHazards(firePlayer);
    }
    if (!localRole || localRole === 'water') {
      checkLiquidHazards(waterPlayer);
    }

    // 4. Pressure plates
    for (const plate of level.plates) {
      let isPressed = false;

      // Check if Fire or Water on plate
      if (rectOverlap(plate, firePlayer) || rectOverlap(plate, waterPlayer)) {
        isPressed = true;
      }

      // Check if any box on plate
      for (const box of level.boxes) {
        if (rectOverlap(plate, box)) {
          isPressed = true;
          break;
        }
      }

      if (isPressed !== plate.isPressed) {
        plate.isPressed = isPressed;
        sound.playSwitch();
        onLocalPlateChanged?.(plate.id, isPressed);
      }
    }

    // 5. Levers check
    for (const lever of level.levers) {
      const leverTouchArea = { x: lever.x - 6, y: lever.y - 6, width: lever.width + 12, height: lever.height + 12 };
      const fireNear = rectOverlap(leverTouchArea, firePlayer);
      const waterNear = rectOverlap(leverTouchArea, waterPlayer);

      const canToggle = !localRole || (localRole === 'fire' ? fireNear : waterNear);
      if (canToggle && ((fireNear && inputs.fireDown) || (waterNear && inputs.waterDown))) {
        lever.isOn = !lever.isOn;
        sound.playSwitch();
        onLocalLeverToggled?.(lever.id, lever.isOn);
      }
    }

    // 6. Update Gates progress towards open or closed
    for (const gate of level.gates) {
      // Find triggering plate or lever
      let triggered = false;
      const connectedPlate = level.plates.find((p) => p.targetGateId === gate.id);
      if (connectedPlate && connectedPlate.isPressed) triggered = true;

      const connectedLever = level.levers.find((l) => l.targetGateId === gate.id);
      if (connectedLever && connectedLever.isOn) triggered = true;

      // Special Level 3 Master Gate: opened if both runes are active
      if (gate.id === 'gate_master' && level.runes) {
        const allRunesActive = level.runes.every((r) => r.activated);
        if (allRunesActive) triggered = true;
      }

      const targetProgress = triggered ? 1 : 0;
      if (gate.currentProgress !== targetProgress) {
        const speed = 0.05;
        if (gate.currentProgress < targetProgress) {
          gate.currentProgress = Math.min(targetProgress, gate.currentProgress + speed);
        } else {
          gate.currentProgress = Math.max(targetProgress, gate.currentProgress - speed);
        }
      }
    }

    // 7. Rune Pillars (Level 3 Guardian puzzle)
    if (level.runes) {
      for (const rune of level.runes) {
        if (rune.activated) continue;

        const playerToCharge = rune.element === 'water' ? waterPlayer : firePlayer;
        if (rectOverlap(rune, playerToCharge)) {
          rune.activationProgress = Math.min(1, rune.activationProgress + 0.025);
          if (Math.random() < 0.4) {
            this.spawnParticles(
              rune.x + rune.width / 2,
              rune.y + rune.height / 2,
              2,
              rune.element === 'water' ? '#38bdf8' : '#fb923c',
              'rune',
              1.2
            );
          }
          if (rune.activationProgress >= 1) {
            rune.activated = true;
            sound.playRuneActivate();
            this.screenShake = 6;
            this.spawnParticles(
              rune.x + rune.width / 2,
              rune.y + rune.height / 2,
              30,
              rune.element === 'water' ? '#06b6d4' : '#ea580c',
              'rune',
              3
            );
          }
        } else {
          rune.activationProgress = Math.max(0, rune.activationProgress - 0.015);
        }
      }

      // Check if both runes active to stun Guardian
      if (level.guardian) {
        const allRunesActive = level.runes.every((r) => r.activated);
        if (allRunesActive && !level.guardian.isStunned) {
          level.guardian.isStunned = true;
          level.guardian.shieldActive = false;
          level.guardian.state = 'stunned';
          this.screenShake = 12;
          this.spawnParticles(
            level.guardian.x + level.guardian.width / 2,
            level.guardian.y + level.guardian.height / 2,
            40,
            '#fbbf24',
            'spark',
            4
          );
        }
      }
    }

    // 8. Guardian AI (Level 3)
    if (level.guardian && !level.guardian.isStunned) {
      const g = level.guardian;
      g.stateTimer++;

      // Slam attack cooldown
      g.slamCooldown--;
      if (g.slamCooldown <= 0 && g.state === 'idle') {
        g.state = 'charging';
        g.stateTimer = 0;
        sound.playGuardianRoar();
      }

      if (g.state === 'charging') {
        // Gathering power
        if (Math.random() < 0.5) {
          this.spawnParticles(
            g.x + g.width / 2 + (Math.random() * 40 - 20),
            g.y + 20,
            2,
            '#f59e0b',
            'spark',
            2
          );
        }

        if (g.stateTimer > 70) {
          // Slam!
          g.state = 'slam';
          g.stateTimer = 0;
          this.screenShake = 10;
          sound.playGuardianSlam();

          // Spawn ground shockwaves left and right along dais and floor
          const daisY = 13 * level.tileSize;
          g.shockwaves.push({
            x: g.x + 10,
            y: daisY - 6,
            vx: -3.8,
            radius: 12,
            maxDistance: 380,
            distanceTraveled: 0,
            platformY: daisY,
          });
          g.shockwaves.push({
            x: g.x + g.width - 10,
            y: daisY - 6,
            vx: 3.8,
            radius: 12,
            maxDistance: 380,
            distanceTraveled: 0,
            platformY: daisY,
          });

          // Also bottom ground shockwaves
          const floorY = 16 * level.tileSize;
          g.shockwaves.push({
            x: 15 * level.tileSize,
            y: floorY - 6,
            vx: -3.4,
            radius: 14,
            maxDistance: 450,
            distanceTraveled: 0,
            platformY: floorY,
          });
          g.shockwaves.push({
            x: 15 * level.tileSize,
            y: floorY - 6,
            vx: 3.4,
            radius: 14,
            maxDistance: 450,
            distanceTraveled: 0,
            platformY: floorY,
          });
        }
      } else if (g.state === 'slam') {
        if (g.stateTimer > 40) {
          g.state = 'idle';
          g.slamCooldown = 220; // reset cooldown
        }
      }

      // Update shockwaves
      for (let i = g.shockwaves.length - 1; i >= 0; i--) {
        const sw = g.shockwaves[i];
        sw.x += sw.vx;
        sw.distanceTraveled += Math.abs(sw.vx);

        if (Math.random() < 0.5) {
          this.spawnParticles(sw.x, sw.y, 1, '#f59e0b', 'shockwave', 1);
        }

        // Check player collision with shockwave
        const checkShockHit = (p: Player) => {
          if (p.isDead) return;
          const dist = Math.hypot(p.x + p.width / 2 - sw.x, p.y + p.height - sw.y);
          if (dist < sw.radius + 8 && p.isGrounded) {
            p.isDead = true;
            p.deathReason = '¡El impacto del Guardián te ha alcanzado! Salta cuando golpee el suelo.';
            sound.playDeath('slam');
            this.screenShake = 8;
            onPlayerDeath(p.deathReason);
          }
        };

        if (!localRole || localRole === 'fire') {
          checkShockHit(firePlayer);
        }
        if (!localRole || localRole === 'water') {
          checkShockHit(waterPlayer);
        }

        if (sw.distanceTraveled >= sw.maxDistance || sw.x < 32 || sw.x > 29 * level.tileSize) {
          g.shockwaves.splice(i, 1);
        }
      }
    }

    // 9. Gem collection
    for (const gem of level.gems) {
      if (gem.collected) continue;
      gem.bobOffset += 0.05;

      // Fire collects red gems
      if (gem.element === 'fire' && !firePlayer.isDead && rectOverlap(gem, firePlayer)) {
        gem.collected = true;
        sound.playGem('fire');
        this.spawnParticles(gem.x + gem.width / 2, gem.y + gem.height / 2, 12, '#ef4444', 'spark', 2);
        if (!localRole || localRole === 'fire') {
          onLocalGemCollected?.(gem.id, 'fire');
        }
      }
      // Water collects blue gems
      if (gem.element === 'water' && !waterPlayer.isDead && rectOverlap(gem, waterPlayer)) {
        gem.collected = true;
        sound.playGem('water');
        this.spawnParticles(gem.x + gem.width / 2, gem.y + gem.height / 2, 12, '#3b82f6', 'bubble', 2);
        if (!localRole || localRole === 'water') {
          onLocalGemCollected?.(gem.id, 'water');
        }
      }
    }

    // 10. Exit doors & level completion
    let bothInDoors = true;
    for (const door of level.doors) {
      const player = door.element === 'fire' ? firePlayer : waterPlayer;
      const inDoor = rectOverlap(
        { x: door.x + 8, y: door.y + 10, width: door.width - 16, height: door.height - 10 },
        player
      );

      door.isOpen = inDoor;
      if (inDoor) {
        door.openProgress = Math.min(1, door.openProgress + 0.1);
        player.hasReachedDoor = true;
      } else {
        door.openProgress = Math.max(0, door.openProgress - 0.1);
        player.hasReachedDoor = false;
        bothInDoors = false;
      }
    }

    if (bothInDoors && !firePlayer.isDead && !waterPlayer.isDead) {
      onLevelComplete();
    }

    this.updateParticles();
  }
}

import {
  LevelConfig,
  Player,
  TileType,
  Particle,
} from '../types/game';

export class GameRenderer {
  private time = 0;

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    level: LevelConfig,
    firePlayer: Player,
    waterPlayer: Player,
    particles: Particle[],
    screenShake: number
  ) {
    this.time += 0.03;

    ctx.save();

    // Screen shake
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 2;
      const shakeY = (Math.random() - 0.5) * screenShake * 2;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Background: Ancient Temple Chamber
    this.drawBackground(ctx, width, height, level);

    // 2. Draw Level Tiles (Walls, Platforms, Pools)
    this.drawTiles(ctx, level);

    // 3. Draw Interactive Elements (Plates, Levers, Gates, Boxes, Doors, Gems, Runes)
    this.drawInteractables(ctx, level);

    // 4. Draw Guardian (Level 3)
    if (level.guardian) {
      this.drawGuardian(ctx, level);
    }

    // 5. Draw Players
    this.drawPlayer(ctx, firePlayer);
    this.drawPlayer(ctx, waterPlayer);

    // 6. Draw Particles & Shockwaves
    this.drawParticles(ctx, particles);

    // 7. Atmospheric Lighting & Ambient Glow (Torches & Elemental Halos)
    this.drawAtmosphericLighting(ctx, width, height, level, firePlayer, waterPlayer);

    ctx.restore();
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    level: LevelConfig
  ) {
    // Deep temple gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0c111d');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant stone masonry bricks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const brickW = 64;
    const brickH = 32;

    for (let y = 0; y < height; y += brickH) {
      const offsetX = (Math.floor(y / brickH) % 2) * (brickW / 2);
      for (let x = -offsetX; x < width; x += brickW) {
        ctx.strokeRect(x, y, brickW, brickH);
      }
    }

    // Ancient temple wall pillars in background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(80, 0, 48, height);
    ctx.fillRect(width - 128, 0, 48, height);
    ctx.fillRect(width / 2 - 24, 0, 48, height);

    // Wall carvings / hieroglyphs hints
    ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
    ctx.beginPath();
    ctx.arc(width / 2, 80, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTiles(ctx: CanvasRenderingContext2D, level: LevelConfig) {
    const ts = level.tileSize;

    for (let r = 0; r < level.gridRows; r++) {
      for (let c = 0; c < level.gridCols; c++) {
        const tile = level.tiles[r][c];
        const x = c * ts;
        const y = r * ts;

        // SOLID STONE BLOCKS
        if (tile === TileType.SOLID) {
          // Base stone block
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, ts, ts);

          // Top highlight edge
          ctx.fillStyle = '#334155';
          ctx.fillRect(x, y, ts, 2);

          // Dark bottom & right bevel
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y + ts - 2, ts, 2);
          ctx.fillRect(x + ts - 2, y, 2, ts);

          // Subtle stone glyph texture
          if ((r + c) % 3 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.fillRect(x + 6, y + 6, ts - 12, ts - 12);
          }
        }

        // PLATFORM (THIN JUMP-THROUGH STONE)
        else if (tile === TileType.PLATFORM) {
          ctx.fillStyle = '#475569';
          ctx.fillRect(x, y, ts, 8);
          // Highlight
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x, y, ts, 2);
          // Platform brackets
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 4, y + 8, 4, 6);
          ctx.fillRect(x + ts - 8, y + 8, 4, 6);
        }

        // WATER POOL (BLUE)
        else if (tile === TileType.WATER_POOL) {
          // Stone basin bottom foundation
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y + ts - 4, ts, 4);

          // Base water
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(x, y + 6, ts, ts - 10);

          // Shimmering surface waves
          ctx.fillStyle = '#38bdf8';
          const wave = Math.sin(this.time * 4 + c * 0.8) * 2;
          ctx.fillRect(x, y + 6 + wave, ts, 3);

          // Inner water caustics
          ctx.fillStyle = 'rgba(224, 242, 254, 0.25)';
          const bubbleX = x + ((this.time * 20 + c * 10) % ts);
          ctx.beginPath();
          ctx.arc(bubbleX, y + 16, 2, 0, Math.PI * 2);
          ctx.fill();

          // Basin stone lips at edges
          if (c > 0 && level.tiles[r][c - 1] !== TileType.WATER_POOL) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(x, y + 4, 3, ts - 4);
          }
          if (c < level.gridCols - 1 && level.tiles[r][c + 1] !== TileType.WATER_POOL) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(x + ts - 3, y + 4, 3, ts - 4);
          }
        }

        // LAVA POOL (RED / ORANGE)
        else if (tile === TileType.LAVA_POOL) {
          // Stone basin bottom foundation
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y + ts - 4, ts, 4);

          // Base fiery magma
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(x, y + 6, ts, ts - 10);

          // Bright glowing crust
          const lavaGrad = ctx.createLinearGradient(x, y, x, y + ts);
          lavaGrad.addColorStop(0, '#fbbf24');
          lavaGrad.addColorStop(0.4, '#ea580c');
          lavaGrad.addColorStop(1, '#991b1b');
          ctx.fillStyle = lavaGrad;
          const crustWave = Math.sin(this.time * 3 + c * 0.9) * 1.5;
          ctx.fillRect(x, y + 6 + crustWave, ts, 4);

          // Glowing hot spots
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + ((Math.floor(this.time * 10) + c * 8) % ts), y + 12, 3, 3);

          // Basin stone lips at edges
          if (c > 0 && level.tiles[r][c - 1] !== TileType.LAVA_POOL) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(x, y + 4, 3, ts - 4);
          }
          if (c < level.gridCols - 1 && level.tiles[r][c + 1] !== TileType.LAVA_POOL) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(x + ts - 3, y + 4, 3, ts - 4);
          }
        }

        // ACID POOL (GREEN TOXIC SLIME)
        else if (tile === TileType.ACID_POOL) {
          // Stone basin bottom foundation
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y + ts - 4, ts, 4);

          // Base toxic green
          ctx.fillStyle = '#4d7c0f';
          ctx.fillRect(x, y + 6, ts, ts - 10);

          // Radiant slime surface
          ctx.fillStyle = '#84cc16';
          const slimeWave = Math.sin(this.time * 2.5 + c * 0.7) * 2;
          ctx.fillRect(x, y + 6 + slimeWave, ts, 3);

          // Bubbling spots
          ctx.fillStyle = '#bef264';
          const bY = y + 12 - Math.sin(this.time * 3 + c) * 3;
          ctx.beginPath();
          ctx.arc(x + ts / 2, bY, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Basin stone lips at edges
          if (c > 0 && level.tiles[r][c - 1] !== TileType.ACID_POOL) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(x, y + 4, 3, ts - 4);
          }
          if (c < level.gridCols - 1 && level.tiles[r][c + 1] !== TileType.ACID_POOL) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(x + ts - 3, y + 4, 3, ts - 4);
          }
        }
      }
    }
  }

  private drawInteractables(ctx: CanvasRenderingContext2D, level: LevelConfig) {
    // 1. Gates / Moving Platforms
    for (const gate of level.gates) {
      const curX = gate.x + gate.openOffsetX * gate.currentProgress;
      const curY = gate.y + gate.openOffsetY * gate.currentProgress;

      ctx.save();
      // Metallic door/platform body
      ctx.fillStyle = gate.color || '#64748b';
      ctx.fillRect(curX, curY, gate.width, gate.height);

      // Border and inner pattern
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(curX + 1, curY + 1, gate.width - 2, gate.height - 2);

      // Warning stripes or energy lines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 4; i < Math.max(gate.width, gate.height) - 4; i += 12) {
        if (gate.height > gate.width) {
          ctx.fillRect(curX + 3, curY + i, gate.width - 6, 2);
        } else {
          ctx.fillRect(curX + i, curY + 3, 2, gate.height - 6);
        }
      }
      ctx.restore();
    }

    // 2. Pressure Plates
    for (const plate of level.plates) {
      const depressed = plate.isPressed ? 4 : 0;
      ctx.save();
      // Base frame
      ctx.fillStyle = '#334155';
      ctx.fillRect(plate.x - 2, plate.y + plate.height - 2, plate.width + 4, 3);

      // Active plate pad
      ctx.fillStyle = plate.isPressed ? '#10b981' : plate.color;
      ctx.fillRect(plate.x, plate.y + depressed, plate.width, plate.height - depressed);

      // Glowing light strip
      ctx.fillStyle = plate.isPressed ? '#a7f3d0' : '#ffffff';
      ctx.fillRect(plate.x + 4, plate.y + depressed + 1, plate.width - 8, 2);
      ctx.restore();
    }

    // 3. Levers
    for (const lever of level.levers) {
      ctx.save();
      // Base mount
      ctx.fillStyle = '#475569';
      ctx.fillRect(lever.x + 2, lever.y + lever.height - 4, lever.width - 4, 4);

      // Stick angle
      const angle = lever.isOn ? 0.6 : -0.6;
      ctx.translate(lever.x + lever.width / 2, lever.y + lever.height - 4);
      ctx.rotate(angle);

      // Lever rod
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-2, -lever.height + 4, 4, lever.height - 4);

      // Lever knob (glowing)
      ctx.fillStyle = lever.isOn ? '#10b981' : lever.color;
      ctx.beginPath();
      ctx.arc(0, -lever.height + 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Pushable Stone Boxes
    for (const box of level.boxes) {
      ctx.save();
      // Stone body
      ctx.fillStyle = '#475569';
      ctx.fillRect(box.x, box.y, box.width, box.height);

      // Bronze corner braces
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(box.x + 2, box.y + 2, box.width - 4, box.height - 4);

      // Center cross / glyph
      ctx.beginPath();
      ctx.moveTo(box.x + 5, box.y + 5);
      ctx.lineTo(box.x + box.width - 5, box.y + box.height - 5);
      ctx.moveTo(box.x + box.width - 5, box.y + 5);
      ctx.lineTo(box.x + 5, box.y + box.height - 5);
      ctx.strokeStyle = 'rgba(202, 138, 4, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Exit Doors (Water Door & Fire Door)
    for (const door of level.doors) {
      ctx.save();
      const isFire = door.element === 'fire';
      const mainColor = isFire ? '#ef4444' : '#3b82f6';
      const glowColor = isFire ? '#f97316' : '#60a5fa';

      // Stone door arch frame
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(door.x - 3, door.y - 3, door.width + 6, door.height + 3);
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(door.x - 2, door.y - 2, door.width + 4, door.height + 2);

      // Inner door void / portal
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(door.x, door.y, door.width, door.height);

      // Energy portal swirl if openProgress > 0
      if (door.openProgress > 0.05) {
        ctx.fillStyle = `rgba(${isFire ? '239, 68, 68' : '59, 130, 246'}, ${door.openProgress * 0.7})`;
        ctx.fillRect(door.x + 2, door.y + 2, door.width - 4, door.height - 2);

        // Swirling magic rings
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const portalY = door.y + door.height / 2;
        const rx = (door.width / 2 - 4) * door.openProgress;
        const ry = (door.height / 2 - 6) * door.openProgress;
        ctx.ellipse(door.x + door.width / 2, portalY, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Arch crown symbol (Flame or Water drop glyph)
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      const symX = door.x + door.width / 2;
      const symY = door.y - 8;
      if (isFire) {
        // Flame glyph
        ctx.arc(symX, symY, 5, 0, Math.PI * 2);
      } else {
        // Water drop glyph
        ctx.arc(symX, symY, 5, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.restore();
    }

    // 6. Diamonds / Gems
    for (const gem of level.gems) {
      if (gem.collected) continue;
      ctx.save();
      const isFire = gem.element === 'fire';
      const bob = Math.sin(this.time * 3 + gem.bobOffset) * 3;
      const gx = gem.x + gem.width / 2;
      const gy = gem.y + gem.height / 2 + bob;

      // Outer glow
      ctx.fillStyle = isFire ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';
      ctx.beginPath();
      ctx.arc(gx, gy, 12, 0, Math.PI * 2);
      ctx.fill();

      // Diamond polygon
      ctx.fillStyle = isFire ? '#ef4444' : '#0284c7';
      ctx.beginPath();
      ctx.moveTo(gx, gy - 8);
      ctx.lineTo(gx + 8, gy);
      ctx.lineTo(gx, gy + 8);
      ctx.lineTo(gx - 8, gy);
      ctx.closePath();
      ctx.fill();

      // Specular highlight facet
      ctx.fillStyle = isFire ? '#fca5a5' : '#bae6fd';
      ctx.beginPath();
      ctx.moveTo(gx - 4, gy - 3);
      ctx.lineTo(gx, gy - 8);
      ctx.lineTo(gx + 4, gy - 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 7. Rune Pillars (Level 3)
    if (level.runes) {
      for (const rune of level.runes) {
        ctx.save();
        const isWater = rune.element === 'water';
        const color = isWater ? '#0284c7' : '#ea580c';
        const activeColor = isWater ? '#38bdf8' : '#fbbf24';

        // Stone pillar base
        ctx.fillStyle = '#334155';
        ctx.fillRect(rune.x, rune.y + 10, rune.width, rune.height - 10);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rune.x, rune.y + 10, rune.width, rune.height - 10);

        // Floating elemental crystal atop pillar
        const bob = Math.sin(this.time * 4 + (isWater ? 0 : 2)) * 3;
        const cx = rune.x + rune.width / 2;
        const cy = rune.y - 4 + bob;

        // Activation progress fill or active glow
        if (rune.activated) {
          // Fully ignited rune
          ctx.fillStyle = `rgba(${isWater ? '56, 189, 248' : '251, 191, 36'}, 0.4)`;
          ctx.beginPath();
          ctx.arc(cx, cy, 18, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = activeColor;
          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Charging state indicator
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fill();

          if (rune.activationProgress > 0) {
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rune.activationProgress);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }
  }

  private drawGuardian(ctx: CanvasRenderingContext2D, level: LevelConfig) {
    const g = level.guardian;
    if (!g) return;

    ctx.save();
    const gx = g.x;
    const gy = g.y;

    // 1. Forcefield Shield (if active)
    if (g.shieldActive) {
      const shieldPulse = Math.sin(this.time * 3) * 0.1 + 0.35;
      ctx.fillStyle = `rgba(245, 158, 11, ${shieldPulse})`;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(gx + g.width / 2, gy + g.height / 2, g.width / 2 + 18, g.height / 2 + 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shield rune circles
      ctx.strokeStyle = 'rgba(254, 243, 199, 0.4)';
      ctx.beginPath();
      ctx.ellipse(gx + g.width / 2, gy + g.height / 2, g.width / 2 + 12, g.height / 2 + 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Stone Guardian Body
    // Torso / Dais anchor
    ctx.fillStyle = g.isStunned ? '#334155' : '#1e293b';
    ctx.fillRect(gx + 12, gy + 24, g.width - 24, g.height - 24);

    // Stone Pauldrons (Shoulders)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(gx + 10, gy + 20, 14, 0, Math.PI * 2);
    ctx.arc(gx + g.width - 10, gy + 20, 14, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headBob = g.isStunned ? 10 : Math.sin(this.time * 2) * 2;
    ctx.fillStyle = '#334155';
    ctx.fillRect(gx + 16, gy + headBob, g.width - 32, 24);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(gx + 16, gy + headBob, g.width - 32, 24);

    // Horns / Crown crest
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(gx + 16, gy + headBob);
    ctx.lineTo(gx + 10, gy + headBob - 14);
    ctx.lineTo(gx + 22, gy + headBob);
    ctx.moveTo(gx + g.width - 16, gy + headBob);
    ctx.lineTo(gx + g.width - 10, gy + headBob - 14);
    ctx.lineTo(gx + g.width - 22, gy + headBob);
    ctx.fill();

    // Cyclopean Eye
    const eyeX = gx + g.width / 2;
    const eyeY = gy + headBob + 12;

    if (g.isStunned) {
      // Dim offline eye
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Stunned stars swirling
      for (let i = 0; i < 3; i++) {
        const starAngle = this.time * 4 + (i * Math.PI * 2) / 3;
        const sx = eyeX + Math.cos(starAngle) * 20;
        const sy = gy - 10 + Math.sin(starAngle) * 8;
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Menacing glowing eye
      const eyeGlow = g.state === 'charging' ? '#ef4444' : '#f59e0b';
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, g.state === 'charging' ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();

      // Slit pupil
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(eyeX - 1, eyeY - 4, 2, 8);
    }

    // Heavy Fists
    const fistY = g.state === 'charging' ? gy + 6 : gy + 38;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(gx - 4, fistY, 14, 18);
    ctx.fillRect(gx + g.width - 10, fistY, 14, 18);
    ctx.strokeStyle = g.state === 'charging' ? '#ef4444' : '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gx - 4, fistY, 14, 18);
    ctx.strokeRect(gx + g.width - 10, fistY, 14, 18);

    // Draw active shockwaves
    for (const sw of g.shockwaves) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, Math.PI, 0, false);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, p: Player) {
    if (p.isDead) return;

    ctx.save();
    const isFire = p.id === 'fire';
    const px = p.x;
    const py = p.y;
    const w = p.width;
    const h = p.height;
    const runBounce = p.isGrounded && Math.abs(p.vx) > 0.5 ? Math.abs(Math.sin(p.animFrame * 2)) * 3 : 0;

    ctx.translate(0, -runBounce);

    if (isFire) {
      // ==========================================
      // CHICO FUEGO (FIREBOY)
      // ==========================================
      // Legs
      ctx.fillStyle = '#b91c1c';
      const legOffset = Math.sin(p.animFrame * 3) * 3;
      ctx.fillRect(px + 4, py + h - 6 + legOffset, 5, 6 - legOffset);
      ctx.fillRect(px + w - 9, py + h - 6 - legOffset, 5, 6 + legOffset);

      // Torso
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(px + 3, py + 12, w - 6, h - 18);

      // Flame Head
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(px + w / 2, py + 10, 10, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Flame Crown Tips
      const tip1 = Math.sin(this.time * 8) * 3;
      const tip2 = Math.cos(this.time * 7) * 4;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(px + 4, py + 8);
      ctx.quadraticCurveTo(px + w / 2 + tip1, py - 6 + tip2, px + w - 4, py + 8);
      ctx.closePath();
      ctx.fill();

      // Expressive Eyes
      const eyeLookX = p.facing === 'left' ? -2 : 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + w / 2 - 4 + eyeLookX, py + 8, 3, 4);
      ctx.fillRect(px + w / 2 + 1 + eyeLookX, py + 8, 3, 4);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px + w / 2 - 3 + eyeLookX, py + 9, 2, 3);
      ctx.fillRect(px + w / 2 + 2 + eyeLookX, py + 9, 2, 3);
    } else {
      // ==========================================
      // CHICA AGUA (WATERGIRL)
      // ==========================================
      // Legs
      ctx.fillStyle = '#0369a1';
      const legOffset = Math.sin(p.animFrame * 3) * 3;
      ctx.fillRect(px + 4, py + h - 6 + legOffset, 5, 6 - legOffset);
      ctx.fillRect(px + w - 9, py + h - 6 - legOffset, 5, 6 + legOffset);

      // Torso / Dress
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(px + 2, py + h - 6);
      ctx.lineTo(px + 5, py + 12);
      ctx.lineTo(px + w - 5, py + 12);
      ctx.lineTo(px + w - 2, py + h - 6);
      ctx.closePath();
      ctx.fill();

      // Round Head
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(px + w / 2, py + 10, 10, 0, Math.PI * 2);
      ctx.fill();

      // Flowing Droplet Hair Curl
      const hairSway = (p.facing === 'left' ? 4 : -4) + Math.sin(this.time * 6) * 2;
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(px + 3, py + 6);
      ctx.quadraticCurveTo(px + w / 2, py - 8, px + w / 2 + hairSway, py - 4);
      ctx.quadraticCurveTo(px + w - 3, py + 4, px + w - 3, py + 10);
      ctx.closePath();
      ctx.fill();

      // Expressive Eyes
      const eyeLookX = p.facing === 'left' ? -2 : 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + w / 2 - 4 + eyeLookX, py + 8, 3, 4);
      ctx.fillRect(px + w / 2 + 1 + eyeLookX, py + 8, 3, 4);
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(px + w / 2 - 3 + eyeLookX, py + 9, 2, 3);
      ctx.fillRect(px + w / 2 + 2 + eyeLookX, py + 9, 2, 3);
    }

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    ctx.save();
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawAtmosphericLighting(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    level: LevelConfig,
    firePlayer: Player,
    waterPlayer: Player
  ) {
    // Subtle vignette & radial glow composition
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Warm glow from Chico Fuego
    if (!firePlayer.isDead) {
      const fGlow = ctx.createRadialGradient(
        firePlayer.x + firePlayer.width / 2,
        firePlayer.y + firePlayer.height / 2,
        4,
        firePlayer.x + firePlayer.width / 2,
        firePlayer.y + firePlayer.height / 2,
        80
      );
      fGlow.addColorStop(0, 'rgba(249, 115, 22, 0.28)');
      fGlow.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = fGlow;
      ctx.fillRect(
        firePlayer.x - 80,
        firePlayer.y - 80,
        firePlayer.width + 160,
        firePlayer.height + 160
      );
    }

    // Cool azure glow from Chica Agua
    if (!waterPlayer.isDead) {
      const wGlow = ctx.createRadialGradient(
        waterPlayer.x + waterPlayer.width / 2,
        waterPlayer.y + waterPlayer.height / 2,
        4,
        waterPlayer.x + waterPlayer.width / 2,
        waterPlayer.y + waterPlayer.height / 2,
        80
      );
      wGlow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      wGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = wGlow;
      ctx.fillRect(
        waterPlayer.x - 80,
        waterPlayer.y - 80,
        waterPlayer.width + 160,
        waterPlayer.height + 160
      );
    }

    // Guardian glow in Level 3
    if (level.guardian && !level.guardian.isStunned) {
      const g = level.guardian;
      const gGlow = ctx.createRadialGradient(
        g.x + g.width / 2,
        g.y + g.height / 2,
        10,
        g.x + g.width / 2,
        g.y + g.height / 2,
        120
      );
      gGlow.addColorStop(0, 'rgba(245, 158, 11, 0.2)');
      gGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = gGlow;
      ctx.fillRect(g.x - 120, g.y - 120, g.width + 240, g.height + 240);
    }

    ctx.restore();
  }
}

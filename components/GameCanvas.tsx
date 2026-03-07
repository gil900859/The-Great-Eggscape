
import React, { useRef, useEffect } from 'react';
import {
  EggEvolutionStage,
  Level,
  Player,
} from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, MAX_HEALTH, GROUND_Y } from '../constants';

interface GameCanvasProps {
  currentLevel: Level;
  player: Player;
  eggStage: EggEvolutionStage;
  damage: number;
  cameraX: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  currentLevel,
  player,
  eggStage,
  damage,
  cameraX,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentLevel) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    // 1. Base Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    if (currentLevel.id <= 2) { gradient.addColorStop(0, '#87CEEB'); gradient.addColorStop(1, '#B0E2FF'); }
    else if (currentLevel.id <= 5) { gradient.addColorStop(0, '#3d2b1f'); gradient.addColorStop(1, '#5d4037'); }
    else if (currentLevel.id <= 8) { gradient.addColorStop(0, '#1a202c'); gradient.addColorStop(1, '#2d3748'); }
    else if (currentLevel.id <= 10) { gradient.addColorStop(0, '#0f172a'); gradient.addColorStop(1, '#1e293b'); }
    else { gradient.addColorStop(0, '#450a0a'); gradient.addColorStop(1, '#7f1d1d'); }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 2. Detailed Background Designs (Environment Specific)
    if (currentLevel.id <= 2) {
      // Distant Mountains (Parallax Layer 1)
      ctx.fillStyle = '#48bb78';
      for (let i = 0; i < 6; i++) {
        const mX = (i * 800 - (cameraX * 0.1)) % 4800;
        ctx.beginPath();
        ctx.moveTo(mX - 200, GAME_HEIGHT);
        ctx.lineTo(mX + 200, GAME_HEIGHT - 250);
        ctx.lineTo(mX + 600, GAME_HEIGHT);
        ctx.fill();
      }

      // Rolling Hills (Parallax Layer 2)
      ctx.fillStyle = '#68d391';
      for (let i = 0; i < 8; i++) {
        const hillX = (i * 500 - (cameraX * 0.2)) % 4000;
        ctx.beginPath();
        ctx.arc(hillX, GAME_HEIGHT + 150, 450, 0, Math.PI * 2);
        ctx.fill();
      }

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 10; i++) {
        const cx = (i * 400 - (cameraX * 0.05)) % 4000;
        const cy = 50 + (i * 37) % 100;
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.arc(cx + 25, cy - 10, 25, 0, Math.PI * 2);
        ctx.arc(cx + 50, cy, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant Trees
      ctx.fillStyle = '#276749';
      for (let i = 0; i < 12; i++) {
        const tx = (i * 350 - (cameraX * 0.15)) % 4200;
        ctx.beginPath();
        ctx.moveTo(tx, GAME_HEIGHT - 40);
        ctx.lineTo(tx + 25, GAME_HEIGHT - 120);
        ctx.lineTo(tx + 50, GAME_HEIGHT - 40);
        ctx.fill();
      }
    } else if (currentLevel.id <= 5) {
      // Barn Structure - more detailed
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 20;
      for (let i = 0; i < 15; i++) {
        const bx = (i * 300 - (cameraX * 0.3)) % 4500;
        ctx.beginPath();
        ctx.moveTo(bx, 0); ctx.lineTo(bx, GAME_HEIGHT); ctx.stroke();
        
        // Cross beams
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(bx - 150, 100); ctx.lineTo(bx + 150, 300); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx - 150, 300); ctx.lineTo(bx + 150, 100); ctx.stroke();
        ctx.lineWidth = 20;

        // Dust motes
        ctx.fillStyle = 'rgba(255, 255, 200, 0.1)';
        const moteX = (bx + Math.sin(Date.now() / 1000 + i) * 50) % GAME_WIDTH;
        const moteY = (i * 100 + Date.now() / 50) % GAME_HEIGHT;
        ctx.beginPath();
        ctx.arc(moteX, moteY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (currentLevel.id <= 8) {
      // Kitchen Tiles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const tileSize = 50;
      const offsetX = (cameraX * 0.5) % tileSize;
      for (let x = -offsetX; x < GAME_WIDTH; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, GAME_HEIGHT); ctx.stroke();
      }
      for (let y = 0; y < GAME_HEIGHT; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(GAME_WIDTH, y); ctx.stroke();
      }
      // Kitchen Appliances silhouettes with more detail
      for (let i = 0; i < 4; i++) {
        const kx = (i * 800 - (cameraX * 0.4)) % 3200;
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(kx, 150, 200, 250); // Fridge/Cabinet
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(kx + 10, 160, 180, 100); // Top door
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(kx + 160, 220, 10, 40); // Handle
      }
    } else if (currentLevel.id <= 10) {
      // Industrial Vents & Pipes - more detailed
      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < 8; i++) {
        const px = (i * 400 - (cameraX * 0.25)) % 3200;
        ctx.fillRect(px, 0, 60, GAME_HEIGHT);
        ctx.fillStyle = '#334155';
        ctx.fillRect(px + 10, 0, 5, GAME_HEIGHT); // Pipe highlight
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, px % GAME_HEIGHT, GAME_WIDTH, 30);
        
        // Steam effects
        if (i % 3 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          const steamY = (px + Date.now() / 20) % GAME_HEIGHT;
          ctx.beginPath();
          ctx.arc(px + 30, steamY, 20 + Math.sin(Date.now() / 200) * 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Wind Zones (No Leaves, just streaks)
    if (currentLevel.windZones) {
        currentLevel.windZones.forEach(w => {
            const wx = w[0] - cameraX;
            if (wx + w[2] < 0 || wx > GAME_WIDTH) return;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.fillRect(wx, w[1], w[2], w[3]);

            // Draw air streaks
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            const windDir = Math.sign(w[4]);
            for(let i=0; i<20; i++) {
                const speed = Math.abs(w[4]) * 200;
                const particleX = (Date.now() * windDir * speed / 10 + i * 200) % w[2];
                const finalX = particleX < 0 ? w[2] + particleX : particleX;
                const particleY = (i * 47) % w[3];
                const streakLen = 30 + Math.abs(w[4]) * 100;

                ctx.beginPath();
                ctx.moveTo(wx + finalX, w[1] + particleY);
                ctx.lineTo(wx + finalX + streakLen * windDir, w[1] + particleY);
                ctx.stroke();
            }
        });
    }

    // 3b. Speed Orbs
    if (currentLevel.speedOrbs) {
      currentLevel.speedOrbs.forEach(orb => {
        const ox = orb[0] - cameraX;
        if (ox + orb[2] < 0 || ox > GAME_WIDTH) return;

        const time = Date.now() / 300;
        const hover = Math.sin(time) * 10;
        const centerX = ox + orb[2] / 2;
        const centerY = orb[1] + orb[3] / 2 + hover;

        // Outer Glow
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Rings
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15 + Math.cos(time) * 3, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // 4. Water Zones
    if (currentLevel.waterZones) {
      ctx.fillStyle = 'rgba(56, 178, 255, 0.45)';
      currentLevel.waterZones.forEach((w) => {
        const wx = w[0] - cameraX;
        ctx.fillRect(wx, w[1], w[2], w[3]);
        // Surface sparkles
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for(let s=0; s<10; s++) {
            const sx = (Date.now() / 10 + s * 100) % w[2];
            ctx.fillRect(wx + sx, w[1], 10, 2);
        }
      });
    }

    // 5. Platforms (Including Roofs and Walls)
    currentLevel.platforms.forEach((p) => {
      const rx = p[0] - cameraX;
      if (rx + p[2] < 0 || rx > GAME_WIDTH) return;
      
      const isRoof = p[1] < 10 && p[3] > 10;
      const isWall = p[0] < 0;

      if (isRoof) {
        ctx.fillStyle = currentLevel.id <= 5 ? '#2d1b0e' : '#0f172a';
        ctx.fillRect(rx, p[1], p[2], p[3]);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(rx, p[1] + p[3] - 8, p[2], 8);
      } else if (isWall) {
        ctx.fillStyle = '#000';
        ctx.fillRect(rx, p[1], p[2], p[3]);
      } else {
        // 3D-esque Ground Rendering with Extruded Sides and Smoothed Edges
        const isOutdoor = currentLevel.id <= 2;
        const isBarn = currentLevel.id > 2 && currentLevel.id <= 5;
        const cornerRadius = 12;
        const extrusionDepth = 12;
        
        // Platform Shadow (Drop Shadow on the world)
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 15;
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.roundRect(rx + 5, p[1] + 5, p[2], p[3], cornerRadius);
        ctx.fill();
        ctx.restore();

        // 3D Extrusion (Bottom/Side face)
        ctx.fillStyle = isOutdoor ? '#3d2b1f' : (isBarn ? '#2d1b0e' : '#0a0e14');
        ctx.beginPath();
        ctx.roundRect(rx, p[1] + extrusionDepth, p[2], p[3], cornerRadius);
        ctx.fill();

        // Main Top Face
        const bodyGrad = ctx.createLinearGradient(rx, p[1], rx, p[1] + p[3]);
        if (isOutdoor) {
          bodyGrad.addColorStop(0, '#8b4513');
          bodyGrad.addColorStop(1, '#5d2e0a');
        } else if (isBarn) {
          bodyGrad.addColorStop(0, '#5d4037');
          bodyGrad.addColorStop(1, '#3e2723');
        } else {
          bodyGrad.addColorStop(0, '#2d3748');
          bodyGrad.addColorStop(1, '#1a202c');
        }
        
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(rx, p[1], p[2], p[3], cornerRadius);
        ctx.fill();

        // Top Surface (Grass/Cap)
        if (isOutdoor) {
          // 3D Grass Cap
          ctx.fillStyle = '#2f855a'; // Darker grass side
          ctx.beginPath();
          ctx.roundRect(rx, p[1] + 5, p[2], 15, { topLeft: cornerRadius, topRight: cornerRadius, bottomLeft: 0, bottomRight: 0 });
          ctx.fill();

          ctx.fillStyle = '#48bb78'; // Bright grass top
          ctx.beginPath();
          ctx.roundRect(rx, p[1], p[2], 10, { topLeft: cornerRadius, topRight: cornerRadius, bottomLeft: 0, bottomRight: 0 });
          ctx.fill();
          
          // Grass texture/blades
          ctx.fillStyle = '#38a169';
          for (let gx = 15; gx < p[2] - 15; gx += 25) {
            ctx.beginPath();
            ctx.moveTo(rx + gx, p[1] + 10);
            ctx.lineTo(rx + gx + 12, p[1] + 20);
            ctx.lineTo(rx + gx + 24, p[1] + 10);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = isBarn ? '#6d4c41' : '#4a5568';
          ctx.beginPath();
          ctx.roundRect(rx, p[1], p[2], 10, { topLeft: cornerRadius, topRight: cornerRadius, bottomLeft: 0, bottomRight: 0 });
          ctx.fill();
        }

        // Highlights for 3D edges
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rx + cornerRadius, p[1] + 1);
        ctx.lineTo(rx + p[2] - cornerRadius, p[1] + 1);
        ctx.stroke();

        // Dirt/Rock details
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        const seed = Math.floor(p[0] / 100);
        for (let i = 0; i < 3; i++) {
          const spotX = rx + ((seed * 137 + i * 53) % (p[2] - 40)) + 20;
          const spotY = p[1] + 30 + ((seed * 97 + i * 41) % (p[3] - 60));
          ctx.beginPath();
          ctx.arc(spotX, spotY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // 6. New movement objects rendering on top of platforms
    if (currentLevel.trampolines) {
        currentLevel.trampolines.forEach(t => {
            const tx = t[0] - cameraX;
            // 3D Trampoline
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(tx + 4, t[1] + 4, t[2], t[3]);
            
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.roundRect(tx, t[1], t[2], t[3], 4);
            ctx.fill();
            
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    if (currentLevel.speedRamps) {
        currentLevel.speedRamps.forEach(s => {
            const sx = s[0] - cameraX;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.beginPath();
            ctx.roundRect(sx, s[1], s[2], s[3], 4);
            ctx.fill();
            
            // Draw chevrons with glow
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#0ea5e9';
            ctx.fillStyle = '#0ea5e9';
            ctx.font = 'bold 14px sans-serif';
            for(let i=0; i<5; i++) {
                const chevronX = sx + i * (s[2]/5) + 10;
                ctx.fillText('>>', chevronX, s[1] + s[3] - 2);
            }
            ctx.shadowBlur = 0;
        });
    }

    // 7. THEMED HAZARDS (Animated Enemies)
    currentLevel.hazards.forEach((h) => {
      const rx = h[0] - cameraX;
      if (rx + h[2] < 0 || rx > GAME_WIDTH) return;

      let emoji = '🔺';
      let sizeMultiplier = 1.6;
      if (currentLevel.id <= 2) { emoji = '🐎'; }
      else if (currentLevel.id === 3) { emoji = '🕷️'; }
      else if (currentLevel.id === 4) { emoji = '🐀'; }
      else if (currentLevel.id === 5) { emoji = '💎'; }
      else if (currentLevel.id <= 7) { emoji = '🔪'; }
      else if (currentLevel.id === 8) { emoji = '🌀'; }
      else if (currentLevel.id <= 10) { emoji = '🔥'; }
      else { emoji = '👨‍🍳'; }

      const baseSize = 30;
      const fontSize = baseSize * sizeMultiplier;
      ctx.font = `${fontSize}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      const iconWidth = Math.max(40, fontSize);
      const count = Math.max(1, Math.floor(h[2] / iconWidth));
      
      for (let i = 0; i < count; i++) {
        const xPos = rx + (i * iconWidth) + iconWidth / 2;
        const yBase = h[1] + h[3] - 5; 

        ctx.save();
        // Hazard Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(xPos, yBase, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ensure emoji is solid
        ctx.fillStyle = '#000';

        if (emoji === '🌀') { 
            ctx.translate(xPos, yBase - fontSize/2);
            ctx.rotate(Date.now() / 80);
            ctx.fillText(emoji, 0, fontSize/2);
        } else if (emoji === '🔥') { 
            const yOff = Math.sin(Date.now() / 150 + i) * 6;
            ctx.fillText(emoji, xPos, yBase + yOff);
        } else if (emoji === '🐎') { 
            const xOff = Math.sin(Date.now() / 100 + i) * 12;
            const yOff = Math.abs(Math.cos(Date.now() / 100 + i)) * 8;
            ctx.fillText(emoji, xPos + xOff, yBase - yOff);
        } else if (emoji === '🐀') {
            const xOff = Math.sin(Date.now() / 250 + i) * 20;
            ctx.fillText(emoji, xPos + xOff, yBase);
        } else if (emoji === '🔪') {
            const yOff = Math.sin(Date.now() / 120 + i) * 15;
            ctx.fillText(emoji, xPos, yBase + yOff);
        } else if (emoji === '👨‍🍳') {
            const jumpOff = Math.abs(Math.sin(Date.now() / 300 + i)) * 10;
            ctx.fillText(emoji, xPos, yBase - jumpOff);
        } else {
            ctx.fillText(emoji, xPos, yBase);
        }
        ctx.restore();
      }
    });

    // 8. Goal Zone
    const gx = currentLevel.endZone[0] - cameraX;
    if (currentLevel.id === 11) {
      ctx.fillStyle = '#000'; // Ensure solid emoji
      ctx.font = '64px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦆', gx + 50, currentLevel.endZone[1] + 85);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('MOTHER!', gx + 50, currentLevel.endZone[1] + 15);
    } else {
      // 3D Door
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(gx + 25, currentLevel.endZone[1] + 15, 60, 90);
      
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(gx + 20, currentLevel.endZone[1] + 10, 60, 90, 4);
      ctx.fill();
      
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(gx + 70, currentLevel.endZone[1] + 55, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. Player Rendering
    ctx.save();
    const px = player.x - cameraX;
    const py = player.y;

    // Find nearest solid surface below player for shadow
    let shadowY: number | null = null;
    let minDistance = Infinity;
    
    currentLevel.platforms.forEach(p => {
      // Check if player is horizontally within platform bounds
      if (player.x + PLAYER_WIDTH > p[0] && player.x < p[0] + p[2]) {
        // Check if platform is below player
        if (p[1] >= py + PLAYER_HEIGHT) {
          const distance = p[1] - (py + PLAYER_HEIGHT);
          if (distance < minDistance) {
            minDistance = distance;
            shadowY = p[1];
          }
        }
      }
    });

    // Player Drop Shadow (3D Depth)
    if (!player.isSwimming && shadowY !== null) {
      const shadowScale = Math.max(0.2, 1 - minDistance / 300);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      // Align shadow with the middle of the top surface (approx +5px from platform top)
      ctx.ellipse(px + PLAYER_WIDTH/2, shadowY + 5, 20 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (player.isDashing || player.isHighJumpActive || player.isSpeedOrbActive) {
      const color = player.isSpeedOrbActive ? 'rgba(0, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.4)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const offset = (i * 12) - 12;
        ctx.beginPath();
        ctx.moveTo(px - 10, py + 20 + offset);
        ctx.lineTo(px - 50, py + 20 + offset);
        ctx.stroke();
      }

      if (player.isSpeedOrbActive) {
          // Additional speed orb glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'cyan';
      }
    }

    // Determine transformation based on direction
    const centerX = px + PLAYER_WIDTH / 2;
    const centerY = py + PLAYER_HEIGHT / 2;
    ctx.translate(centerX, centerY);

    // Emojis usually face LEFT. If moving right, flip.
    if (player.facingRight) {
      ctx.scale(-1, 1);
    }

    // Ensure player emoji is solid (not semi-transparent from previous shadow calls)
    ctx.fillStyle = '#000';

    if (eggStage === EggEvolutionStage.DUCK) {
      // Waddle animation when moving on ground
      if (player.isOnGround && Math.abs(player.velocityX) > 0.5) {
        ctx.rotate(Math.sin(Date.now() / 80) * 0.15);
      }
      ctx.font = `${PLAYER_HEIGHT}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦆', 0, 0);
    } else {
      // Egg Stage
      if ((player.isRolling || player.isDashing) && eggStage === EggEvolutionStage.EGG) {
        // Roll rotation inverted: Now rotates clockwise when moving right and counter-clockwise when moving left
        // (Note: Scale -1 flips the coordinate system inside this block, so we adjust accordingly)
        const rollDir = player.facingRight ? -1 : 1;
        ctx.rotate(rollDir * player.x / 14);
      }

      ctx.font = `${PLAYER_HEIGHT}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🥚', 0, 0);

      // Features (Eyes, Legs, Wings)
      if (eggStage !== EggEvolutionStage.EGG) {
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-6, -4, 4, 0, Math.PI * 2);
        ctx.arc(6, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-6, -4, 2, 0, Math.PI * 2);
        ctx.arc(6, -4, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (eggStage === EggEvolutionStage.LEGS || eggStage === EggEvolutionStage.WINGS) {
        // Walk animation for legs - remains the same
        let legOffset = 0;
        if (player.isOnGround && Math.abs(player.velocityX) > 0.5) {
          legOffset = Math.sin(Date.now() / 100) * 5;
        }
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-6, 14);
        ctx.lineTo(-6, 26 + (legOffset > 0 ? legOffset : 0));
        ctx.lineTo(-11, 26 + (legOffset > 0 ? legOffset : 0));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(6, 14);
        ctx.lineTo(6, 26 + (legOffset < 0 ? -legOffset : 0));
        ctx.lineTo(1, 26 + (legOffset < 0 ? -legOffset : 0));
        ctx.stroke();
      }

      if (eggStage === EggEvolutionStage.WINGS) {
        const wingFlap = player.isGliding ? Math.sin(Date.now() / 50) * 5 : 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-20, 2 + wingFlap, 9, 14, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(20, 2 + wingFlap, 9, 14, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (damage > 0 && eggStage !== EggEvolutionStage.DUCK) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, -10); ctx.lineTo(0, 0);
      if (damage >= (MAX_HEALTH / 3)) {
          ctx.moveTo(10, -4); ctx.lineTo(0, 10);
      }
      if (damage >= (MAX_HEALTH * 2 / 3)) {
          ctx.moveTo(-8, 16); ctx.lineTo(10, 20);
      }
      ctx.stroke();
    }

    ctx.restore();

    if (player.isDevFlyMode || player.isGottaGoFastActive) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      if (player.isDevFlyMode) ctx.fillText('DEV FLY ACTIVE', GAME_WIDTH - 10, 25);
      if (player.isGottaGoFastActive) ctx.fillText('CHEAT: SPEED GLITCH', GAME_WIDTH - 10, 45);
    }

  }, [currentLevel, player, eggStage, damage, cameraX]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full shadow-2xl bg-black"
    />
  );
};

export default GameCanvas;

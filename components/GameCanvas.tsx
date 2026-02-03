import React, { useRef, useEffect } from 'react';
import {
  EggEvolutionStage,
  Level,
  Player,
} from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, MAX_HEALTH } from '../constants';

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
      // Rolling Hills
      ctx.fillStyle = '#68d391';
      for (let i = 0; i < 5; i++) {
        const hillX = (i * 600 - (cameraX * 0.2)) % 3000;
        ctx.beginPath();
        ctx.arc(hillX, GAME_HEIGHT + 100, 400, 0, Math.PI * 2);
        ctx.fill();
      }
      // Distant Trees
      ctx.fillStyle = '#276749';
      for (let i = 0; i < 8; i++) {
        const tx = (i * 450 - (cameraX * 0.15)) % 3600;
        ctx.beginPath();
        ctx.moveTo(tx, GAME_HEIGHT - 40);
        ctx.lineTo(tx + 20, GAME_HEIGHT - 100);
        ctx.lineTo(tx + 40, GAME_HEIGHT - 40);
        ctx.fill();
      }
    } else if (currentLevel.id <= 5) {
      // Barn Structure
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 20;
      for (let i = 0; i < 15; i++) {
        const bx = (i * 300 - (cameraX * 0.3)) % 4500;
        ctx.beginPath();
        ctx.moveTo(bx, 0); ctx.lineTo(bx, GAME_HEIGHT); ctx.stroke();
        if (i % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(bx - 150, 150); ctx.lineTo(bx + 150, 250); ctx.stroke();
        }
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
      // Kitchen Appliances silhouettes
      ctx.fillStyle = '#2d3748';
      for (let i = 0; i < 4; i++) {
        const kx = (i * 800 - (cameraX * 0.4)) % 3200;
        ctx.fillRect(kx, 200, 150, 200);
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(kx + 20, 220, 110, 80); // Window
      }
    } else if (currentLevel.id <= 10) {
      // Industrial Vents & Pipes
      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < 8; i++) {
        const px = (i * 400 - (cameraX * 0.25)) % 3200;
        ctx.fillRect(px, 0, 60, GAME_HEIGHT);
        ctx.fillRect(0, px % GAME_HEIGHT, GAME_WIDTH, 30);
      }
    }

    // 3. Wind Zones (before platforms for background effect)
    if (currentLevel.windZones) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.font = '24px serif';
        currentLevel.windZones.forEach(w => {
            const wx = w[0] - cameraX;
            if (wx + w[2] < 0 || wx > GAME_WIDTH) return;
            
            ctx.fillRect(wx, w[1], w[2], w[3]);
            // Draw wind particles
            for(let i=0; i<15; i++) {
                const particleX = (Date.now() * w[4] * 50 + i * 150) % w[2];
                const particleY = (i * 57) % w[3];
                ctx.fillText('🍃', wx + particleX, w[1] + particleY);
            }
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
        ctx.fillStyle = currentLevel.id <= 2 ? '#22543d' : (currentLevel.id <= 5 ? '#3e2723' : '#1a100a');
        ctx.fillRect(rx, p[1], p[2], 8);
        const bodyGrad = ctx.createLinearGradient(rx, p[1] + 8, rx, p[1] + p[3]);
        if (currentLevel.id <= 2) { bodyGrad.addColorStop(0, '#276749'); bodyGrad.addColorStop(1, '#1c4532'); }
        else { bodyGrad.addColorStop(0, '#2d1b0e'); bodyGrad.addColorStop(1, '#1a100a'); }
        ctx.fillStyle = bodyGrad;
        ctx.fillRect(rx, p[1] + 8, p[2], p[3] - 8);
      }
    });

    // 6. New movement objects rendering on top of platforms
    if (currentLevel.trampolines) {
        currentLevel.trampolines.forEach(t => {
            const tx = t[0] - cameraX;
            ctx.fillStyle = '#fef08a'; // Yellow-200
            ctx.fillRect(tx, t[1], t[2], t[3]);
            ctx.strokeStyle = '#facc15'; // Yellow-400
            ctx.lineWidth = 2;
            ctx.strokeRect(tx, t[1], t[2], t[3]);
        });
    }

    if (currentLevel.speedRamps) {
        currentLevel.speedRamps.forEach(s => {
            const sx = s[0] - cameraX;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; // Sky-400 with opacity
            ctx.fillRect(sx, s[1], s[2], s[3]);
            // Draw chevrons
            ctx.fillStyle = '#0ea5e9'; // Sky-500
            for(let i=0; i<5; i++) {
                const chevronX = sx + i * (s[2]/5) + 10;
                ctx.fillText('>>', chevronX, s[1] + s[3]);
            }
        });
    }

    // 7. THEMED HAZARDS (Animated Enemies)
    currentLevel.hazards.forEach((h) => {
      const rx = h[0] - cameraX;
      if (rx + h[2] < 0 || rx > GAME_WIDTH) return;

      let emoji = '🔺';
      let sizeMultiplier = 1;
      if (currentLevel.id <= 2) { emoji = '🐎'; sizeMultiplier = 1.6; } // Horse
      else if (currentLevel.id === 3) { emoji = '🕷️'; sizeMultiplier = 1.2; } // Spiders
      else if (currentLevel.id === 4) { emoji = '🐀'; sizeMultiplier = 1.1; } // Rats
      else if (currentLevel.id === 5) { emoji = '💎'; sizeMultiplier = 1; } // Shards
      else if (currentLevel.id <= 7) { emoji = '🔪'; sizeMultiplier = 1.3; } // Knives
      else if (currentLevel.id === 8) { emoji = '🌀'; sizeMultiplier = 1.5; } // Fans
      else if (currentLevel.id <= 10) { emoji = '🔥'; sizeMultiplier = 1.4; } // Fire
      else { emoji = '👨‍🍳'; sizeMultiplier = 1.8; } // Boss

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
      ctx.font = '64px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦆', gx + 50, currentLevel.endZone[1] + 85);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('MOTHER!', gx + 50, currentLevel.endZone[1] + 15);
    } else {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.beginPath();
      ctx.ellipse(gx + 50, currentLevel.endZone[1] + 55, 50, 70, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(gx + 20, currentLevel.endZone[1] + 10, 60, 90);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 4;
      ctx.strokeRect(gx + 20, currentLevel.endZone[1] + 10, 60, 90);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(gx + 70, currentLevel.endZone[1] + 55, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. Player Rendering
    ctx.save();
    const px = player.x - cameraX;
    const py = player.y;

    if (player.isDashing || player.isHighJumpActive) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const offset = (i * 12) - 12;
        ctx.beginPath();
        ctx.moveTo(px - 10, py + 20 + offset);
        ctx.lineTo(px - 50, py + 20 + offset);
        ctx.stroke();
      }
    }

    if ((player.isRolling || player.isDashing) && eggStage === EggEvolutionStage.EGG) {
      ctx.translate(px + PLAYER_WIDTH / 2, py + PLAYER_HEIGHT / 2);
      ctx.rotate(player.x / 14);
      ctx.translate(-(px + PLAYER_WIDTH / 2), -(py + PLAYER_HEIGHT / 2));
    }

    if (eggStage === EggEvolutionStage.DUCK) {
      ctx.font = `${PLAYER_HEIGHT}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦆', px + PLAYER_WIDTH / 2, py + PLAYER_HEIGHT / 2);
    } else {
      ctx.font = `${PLAYER_HEIGHT}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🥚', px + PLAYER_WIDTH / 2, py + PLAYER_HEIGHT / 2);

      if (eggStage !== EggEvolutionStage.EGG) {
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(px + 11, py + 16, 4, 0, Math.PI * 2);
        ctx.arc(px + 23, py + 16, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(px + 11, py + 16, 2, 0, Math.PI * 2);
        ctx.arc(px + 23, py + 16, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (eggStage === EggEvolutionStage.LEGS || eggStage === EggEvolutionStage.WINGS) {
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(px + 10, py + 34);
        ctx.lineTo(px + 10, py + 46);
        ctx.lineTo(px + 5, py + 46);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px + 22, py + 34);
        ctx.lineTo(px + 22, py + 46);
        ctx.lineTo(px + 27, py + 46);
        ctx.stroke();
      }

      if (eggStage === EggEvolutionStage.WINGS) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.ellipse(px - 4, py + 22, 9, 14, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px + 36, py + 22, 9, 14, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (damage > 0 && eggStage !== EggEvolutionStage.DUCK) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + 6, py + 6); ctx.lineTo(px + 16, py + 16);
      if (damage >= (MAX_HEALTH / 3)) {
          ctx.moveTo(px + 26, py + 12); ctx.lineTo(px + 16, py + 26);
      }
      if (damage >= (MAX_HEALTH * 2 / 3)) {
          ctx.moveTo(px + 8, py + 32); ctx.lineTo(px + 26, py + 36);
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
      className="w-full h-[400px] rounded-t-lg shadow-2xl bg-black border-b-4 border-slate-700"
    />
  );
};

export default GameCanvas;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import GameCanvas from './components/GameCanvas';
import PlayerHUD from './components/PlayerHUD';
import GameOverScreen from './components/GameOverScreen';
import {
  EggEvolutionStage,
  GameStatus,
  Level,
  EggState,
  Player,
  GameObject,
  WindZoneObject,
  SpeedOrbObject,
} from './types';
import {
  LEVELS,
  MAX_HEALTH,
  HAZARD_DAMAGE,
  ABILITY_MESSAGES,
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  GRAVITY,
  JUMP_STRENGTH,
  BASE_JUMP_STRENGTH,
  DASH_BOOST,
  JUMP_BOOST_MULTIPLIER,
  DASH_BUFF_DURATION,
  MAX_JUMP_TIME,
  MOVE_SPEED,
  FRICTION_FACTOR,
  AIR_FRICTION_FACTOR,
  GAME_WIDTH,
  GAME_HEIGHT,
  CAMERA_FOLLOW_THRESHOLD,
  DAMAGE_COOLDOWN,
  GLIDE_GRAVITY_FACTOR,
  WATER_BUOYANCY,
  WATER_MOVE_SPEED,
  WATER_FRICTION_FACTOR,
  TRAMPOLINE_BOUNCE_STRENGTH,
  SPEED_RAMP_BOOST_FACTOR,
  SPEED_ORB_BOOST_FACTOR,
  WIND_STRENGTH_FACTOR,
  DUCK_FLY_STRENGTH,
} from './constants';

const checkCollision = (obj1: GameObject | Player, obj2: GameObject | WindZoneObject | SpeedOrbObject): boolean => {
  const [x1, y1, w1, h1] = Array.isArray(obj1) ? obj1 : [obj1.x, obj1.y, obj1.width, obj1.height];
  const [x2, y2, w2, h2] = obj2;
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
};

const evolutionOrder = [
  EggEvolutionStage.EGG,
  EggEvolutionStage.EYES,
  EggEvolutionStage.LEGS,
  EggEvolutionStage.WINGS,
  EggEvolutionStage.DUCK,
];

const getNaturalStageForLevel = (levelIndex: number): EggEvolutionStage => {
  let stage = EggEvolutionStage.EGG;
  for (let i = 0; i < levelIndex; i++) {
    const transformation = LEVELS[i].eggTransformation;
    if (transformation) {
      const currentStageIndex = evolutionOrder.indexOf(stage);
      const newStageIndex = evolutionOrder.indexOf(transformation);
      if (newStageIndex > currentStageIndex) {
        stage = transformation;
      }
    }
  }
  return stage;
};

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.START_SCREEN);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [eggState, setEggState] = useState<EggState>({ stage: EggEvolutionStage.EGG, damage: 0 });
  const [unlockedAbilityMessage, setUnlockedAbilityMessage] = useState<string | null>(null);
  const [showDevSelector, setShowDevSelector] = useState(false);

  const [player, setPlayer] = useState<Player>({
    x: PLAYER_START_X, y: PLAYER_START_Y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT,
    velocityX: 0, velocityY: 0, isOnGround: false, isSwimming: false,
    isRolling: false, isJumping: false, isGliding: false, isDashing: false, isHighJumpActive: false,
    isDevFlyMode: false, isGottaGoFastActive: false, facingRight: true,
    isSpeedOrbActive: false, speedOrbTargetX: 0,
  });
  const [cameraX, setCameraX] = useState(0);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const typedSequence = useRef<string>('');
  const sequenceTimer = useRef<number | null>(null);
  const highJumpTimerRef = useRef(0);
  const damageCooldownRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const jumpTimer = useRef(0);
  const flapCooldownRef = useRef(0);

  const currentLevel: Level = LEVELS[currentLevelIndex] || LEVELS[0];

  const resetToMainMenu = useCallback(() => {
    setCurrentLevelIndex(0);
    setEggState({ stage: EggEvolutionStage.EGG, damage: 0 });
    setUnlockedAbilityMessage(null);
    highJumpTimerRef.current = 0;
    setPlayer({
      x: PLAYER_START_X, y: PLAYER_START_Y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT,
      velocityX: 0, velocityY: 0, isOnGround: false, isSwimming: false,
      isRolling: false, isJumping: false, isGliding: false, isDashing: false, isHighJumpActive: false,
      isDevFlyMode: false, isGottaGoFastActive: false, facingRight: true,
      isSpeedOrbActive: false, speedOrbTargetX: 0,
    });
    setCameraX(0);
    setGameStatus(GameStatus.START_SCREEN);
  }, []);

  const restartLevel = useCallback(() => {
    setEggState(prev => ({ ...prev, damage: 0 }));
    setPlayer(p => ({
      ...p,
      x: PLAYER_START_X,
      y: PLAYER_START_Y,
      velocityX: 0,
      velocityY: 0,
      isDashing: false,
      isHighJumpActive: false,
      facingRight: true,
      isSpeedOrbActive: false,
      speedOrbTargetX: 0,
    }));
    setCameraX(0);
    setGameStatus(GameStatus.PLAYING);
  }, []);

  const startGame = useCallback(() => setGameStatus(GameStatus.PLAYING), []);

  const jumpToLevel = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, LEVELS.length - 1));
    setCurrentLevelIndex(safeIndex);
    const naturalStage = getNaturalStageForLevel(safeIndex);
    setEggState({ stage: naturalStage, damage: 0 });
    setPlayer(p => ({ 
      ...p, 
      x: PLAYER_START_X, y: PLAYER_START_Y, velocityX: 0, velocityY: 0, 
      isDashing: false, isHighJumpActive: false, facingRight: true, 
      isSpeedOrbActive: false, speedOrbTargetX: 0 
    }));
    setCameraX(0);
    if (gameStatus === GameStatus.START_SCREEN || gameStatus === GameStatus.GAME_OVER) {
      setGameStatus(GameStatus.PLAYING);
    }
  };

  const handleLevelCompletion = useCallback(() => {
    if (gameStatus !== GameStatus.PLAYING) return;
    setGameStatus(GameStatus.LEVEL_COMPLETE);
    
    setTimeout(() => {
      setEggState(prev => {
        const newStage = currentLevel.eggTransformation;
        if (newStage) {
          const currentStageIndex = evolutionOrder.indexOf(prev.stage);
          const newStageIndex = evolutionOrder.indexOf(newStage);
          if (newStageIndex > currentStageIndex) {
            const abilityInfo = ABILITY_MESSAGES.find(msg => msg.stage === newStage);
            if (abilityInfo) {
              setUnlockedAbilityMessage(`Evolution: ${abilityInfo.stage}! ${abilityInfo.message}`);
              setTimeout(() => setUnlockedAbilityMessage(null), 5000);
            }
            return { ...prev, stage: newStage, damage: 0 };
          }
        }
        return prev;
      });

      setCurrentLevelIndex(prevIdx => {
        if (prevIdx < LEVELS.length - 1) {
          setPlayer(p => ({ 
            ...p, x: PLAYER_START_X, y: PLAYER_START_Y, velocityX: 0, velocityY: 0, 
            isDashing: false, isHighJumpActive: false, facingRight: true,
            isSpeedOrbActive: false, speedOrbTargetX: 0
          }));
          setCameraX(0);
          setGameStatus(GameStatus.PLAYING);
          return prevIdx + 1;
        } else {
          setGameStatus(GameStatus.GAME_WIN);
          return prevIdx;
        }
      });
    }, 2000);
  }, [currentLevel, gameStatus]);

  // Centralized Death Check
  useEffect(() => {
    if (eggState.damage >= MAX_HEALTH && gameStatus === GameStatus.PLAYING) {
      setGameStatus(GameStatus.GAME_OVER);
    }
  }, [eggState.damage, gameStatus]);

  const updateGame = useCallback(() => {
    const now = Date.now();
    setPlayer(p => {
      let { x, y, velocityX, velocityY, isOnGround, isSwimming, isJumping, isGliding, isRolling, isDashing, isHighJumpActive, isDevFlyMode, isGottaGoFastActive, facingRight, isSpeedOrbActive, speedOrbTargetX } = p;
      const move = keysPressed.current;

      isHighJumpActive = now < highJumpTimerRef.current;

      if (isDevFlyMode) {
        const devSpeed = 15;
        if (move['ArrowLeft']) { velocityX = -devSpeed; facingRight = false; }
        else if (move['ArrowRight']) { velocityX = devSpeed; facingRight = true; }
        else velocityX = 0;

        if (move['ArrowUp']) velocityY = -devSpeed;
        else if (move['ArrowDown']) velocityY = devSpeed;
        else velocityY = 0;

        x += velocityX; y += velocityY;
        isOnGround = false; isSwimming = false;
      } else {
        const stageIdx = evolutionOrder.indexOf(eggState.stage);
        const hasLegs = stageIdx >= evolutionOrder.indexOf(EggEvolutionStage.LEGS);
        const hasWings = stageIdx >= evolutionOrder.indexOf(EggEvolutionStage.WINGS);
        const isDuck = eggState.stage === EggEvolutionStage.DUCK;

        // Check if Speed Orb boost should end
        if (isSpeedOrbActive && x > speedOrbTargetX) {
          isSpeedOrbActive = false;
        }

        let acc = isOnGround ? 0.8 : 0.4;
        let speedCap = isSwimming ? WATER_MOVE_SPEED : MOVE_SPEED;
        const fric = isSwimming ? WATER_FRICTION_FACTOR : (isOnGround ? FRICTION_FACTOR : AIR_FRICTION_FACTOR);

        // Apply Speed Orb multipliers
        if (isSpeedOrbActive) {
          speedCap *= SPEED_ORB_BOOST_FACTOR;
          acc *= SPEED_ORB_BOOST_FACTOR;
        }

        if (move['ArrowLeft']) {
          velocityX -= acc;
          isRolling = true;
          facingRight = false;
        } else if (move['ArrowRight']) {
          velocityX += acc;
          isRolling = true;
          facingRight = true;
        } else {
          isRolling = Math.abs(velocityX) > 0.5;
        }
        velocityX *= fric;

        if (!isGottaGoFastActive && Math.abs(velocityX) > speedCap * 1.5 && !isDashing) {
           velocityX *= 0.95;
        }

        let currentJumpPower = hasLegs ? JUMP_STRENGTH : BASE_JUMP_STRENGTH;
        if (isHighJumpActive) currentJumpPower *= JUMP_BOOST_MULTIPLIER;

        if (move['ArrowUp']) {
          if (isOnGround || (isSwimming && isDuck)) {
            velocityY = currentJumpPower;
            isOnGround = false;
            isJumping = true;
            jumpTimer.current = 1;

            if (!isSwimming && Math.abs(velocityX) > speedCap * 0.7) {
              const dashTargetSpeed = speedCap * DASH_BOOST;
              velocityX = Math.sign(velocityX) * dashTargetSpeed;
              isDashing = true;
              highJumpTimerRef.current = now + DASH_BUFF_DURATION;
              isHighJumpActive = true;
              velocityY = currentJumpPower * JUMP_BOOST_MULTIPLIER;
            }
          } else if (jumpTimer.current > 0 && jumpTimer.current < MAX_JUMP_TIME && isJumping) {
            velocityY -= (hasLegs ? 0.4 : 0.2);
            jumpTimer.current++;
          }
        } else {
          jumpTimer.current = 0;
        }

        if (hasWings && (move[' '] || move['Space']) && !isSwimming) {
          if (isDuck && !isOnGround && now > flapCooldownRef.current) {
            velocityY = DUCK_FLY_STRENGTH;
            isGliding = false;
            isJumping = true;
            flapCooldownRef.current = now + 150;
          } else if (velocityY > 0) {
            velocityY *= GLIDE_GRAVITY_FACTOR;
            isGliding = true;
          }
        } else {
          isGliding = false;
        }

        if (isSwimming) {
          velocityY += WATER_BUOYANCY;
        } else {
          velocityY += GRAVITY;
        }

        if (isGottaGoFastActive) velocityX *= 1.05;

        currentLevel.windZones?.forEach(w => {
          if (checkCollision({ ...p, x, y }, w)) velocityX += w[4] * WIND_STRENGTH_FACTOR;
        });

        // Speed Orb Collision
        currentLevel.speedOrbs?.forEach(orb => {
          if (checkCollision({ ...p, x, y }, orb)) {
            isSpeedOrbActive = true;
            speedOrbTargetX = orb[4];
          }
        });

        x += velocityX;
        y += velocityY;

        isOnGround = false;
        isSwimming = false;

        currentLevel.waterZones?.forEach(w => {
           if (checkCollision({ ...p, x, y }, w)) isSwimming = true;
        });

        currentLevel.platforms.forEach(platform => {
           if (checkCollision({ ...p, x, y }, platform)) {
              if (p.y + p.height <= platform[1] + 10 && velocityY >= 0) {
                 y = platform[1] - p.height;
                 velocityY = 0;
                 isOnGround = true;
                 isJumping = false;
                 isDashing = false; 
              } else if (p.y >= platform[1] + platform[3] - 10 && velocityY < 0) {
                 y = platform[1] + platform[3];
                 velocityY = 0;
              } else if (p.x + p.width <= platform[0] + 10) {
                 x = platform[0] - p.width;
                 velocityX = 0;
              } else if (p.x >= platform[0] + platform[2] - 10) {
                 x = platform[0] + platform[2];
                 velocityX = 0;
              }
           }
        });

        currentLevel.trampolines?.forEach(t => {
           if (checkCollision({ ...p, x, y }, t)) {
              velocityY = TRAMPOLINE_BOUNCE_STRENGTH;
              isOnGround = false;
              isDashing = false; 
           }
        });

        currentLevel.speedRamps?.forEach(s => {
           if (checkCollision({ ...p, x, y }, s)) {
              velocityX *= SPEED_RAMP_BOOST_FACTOR;
           }
        });

        if (now > damageCooldownRef.current) {
          currentLevel.hazards.forEach(h => {
            if (checkCollision({ ...p, x, y }, h)) {
              setEggState(prev => ({ ...prev, damage: prev.damage + HAZARD_DAMAGE }));
              damageCooldownRef.current = now + DAMAGE_COOLDOWN;
              velocityY = -5;
              velocityX = (x < h[0] + h[2]/2) ? -8 : 8;
              isDashing = false; 
            }
          });
        }

        if (checkCollision({ ...p, x, y }, currentLevel.endZone)) {
           handleLevelCompletion();
        }

        if (y > GAME_HEIGHT + 100) {
           setEggState(prev => ({ ...prev, damage: prev.damage + 25 }));
           x = PLAYER_START_X;
           y = PLAYER_START_Y;
           velocityX = 0;
           velocityY = 0;
           isDashing = false;
           isSpeedOrbActive = false;
        }
      }

      return { ...p, x, y, velocityX, velocityY, isOnGround, isSwimming, isJumping, isGliding, isRolling, isDashing, isHighJumpActive, isDevFlyMode, isGottaGoFastActive, facingRight, isSpeedOrbActive, speedOrbTargetX };
    });

    setCameraX(prev => {
      const target = player.x - CAMERA_FOLLOW_THRESHOLD;
      const nextX = prev + (target - prev) * 0.1;
      return Math.max(0, nextX);
    });

    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [player.x, currentLevel, gameStatus, handleLevelCompletion, eggState.stage]);

  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameStatus, updateGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      typedSequence.current += e.key.toLowerCase();
      if (sequenceTimer.current) clearTimeout(sequenceTimer.current);
      sequenceTimer.current = window.setTimeout(() => {
        typedSequence.current = '';
      }, 1000);

      if (typedSequence.current.endsWith('eggdev')) {
        setShowDevSelector(prev => !prev);
        typedSequence.current = '';
      } else if (typedSequence.current.endsWith('eggfly')) {
        setPlayer(p => ({ ...p, isDevFlyMode: !p.isDevFlyMode }));
        typedSequence.current = '';
      } else if (typedSequence.current.endsWith('eggfast')) {
        setPlayer(p => ({ ...p, isGottaGoFastActive: !p.isGottaGoFastActive }));
        typedSequence.current = '';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const toggleDevFly = () => setPlayer(p => ({ ...p, isDevFlyMode: !p.isDevFlyMode }));
  const toggleSpeedGlitch = () => setPlayer(p => ({ ...p, isGottaGoFastActive: !p.isGottaGoFastActive }));
  const fullHeal = () => setEggState(p => ({ ...p, damage: 0 }));

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {gameStatus === GameStatus.START_SCREEN && <StartScreen onStartGame={startGame} />}
      
      {gameStatus === GameStatus.PLAYING && (
        <>
          <PlayerHUD 
            eggStage={eggState.stage} 
            damage={eggState.damage} 
            unlockedAbilityMessage={unlockedAbilityMessage}
          />
          <GameCanvas 
            currentLevel={currentLevel}
            player={player}
            eggStage={eggState.stage}
            damage={eggState.damage}
            cameraX={cameraX}
          />
        </>
      )}

      {gameStatus === GameStatus.GAME_OVER && (
        <GameOverScreen 
          onRestartLevel={restartLevel} 
          onMainMenu={resetToMainMenu} 
        />
      )}

      {gameStatus === GameStatus.LEVEL_COMPLETE && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
           <h2 className="text-4xl font-bold text-yellow-400 animate-bounce">LEVEL COMPLETE!</h2>
        </div>
      )}

      {gameStatus === GameStatus.GAME_WIN && <EndScreen onRestartGame={resetToMainMenu} />}

      {showDevSelector && (
        <div className="absolute top-20 right-4 bg-gray-900 border-2 border-yellow-500 p-4 rounded-xl z-50 text-white shadow-2xl w-64 max-h-[80vh] overflow-y-auto pointer-events-auto">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <h4 className="text-lg font-bold text-yellow-500">DEV TOOLS</h4>
            <button onClick={() => setShowDevSelector(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          
          <div className="mb-4">
            <p className="text-xs uppercase text-gray-400 mb-2">Toggles</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={toggleDevFly} 
                className={`px-3 py-2 text-sm rounded font-bold transition-colors ${player.isDevFlyMode ? 'bg-yellow-600 text-black' : 'bg-gray-700 text-gray-300'}`}
              >
                Fly Mode: {player.isDevFlyMode ? 'ON' : 'OFF'}
              </button>
              <button 
                onClick={toggleSpeedGlitch} 
                className={`px-3 py-2 text-sm rounded font-bold transition-colors ${player.isGottaGoFastActive ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Speed Glitch: {player.isGottaGoFastActive ? 'ON' : 'OFF'}
              </button>
              <button 
                onClick={fullHeal} 
                className="px-3 py-2 text-sm rounded font-bold bg-green-700 text-white hover:bg-green-600"
              >
                Full Heal Shell
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs uppercase text-gray-400 mb-2">Jump to Level</p>
            <div className="grid grid-cols-4 gap-1">
              {LEVELS.map((lvl, idx) => (
                <button
                  key={lvl.id}
                  onClick={() => jumpToLevel(idx)}
                  className={`p-2 text-xs rounded font-bold transition-colors ${currentLevelIndex === idx ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  {lvl.id}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs uppercase text-gray-400 mb-2">Force Evolution</p>
            <div className="grid grid-cols-1 gap-1">
              {evolutionOrder.map((s) => (
                <button 
                  key={s} 
                  onClick={() => setEggState(p => ({ ...p, stage: s }))} 
                  className={`px-2 py-2 text-xs text-left rounded font-bold transition-colors ${eggState.stage === s ? 'bg-yellow-600 text-black' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

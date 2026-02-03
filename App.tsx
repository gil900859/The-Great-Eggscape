import React, { useState, useEffect, useCallback, useRef } from 'react';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import GameCanvas from './components/GameCanvas';
import PlayerHUD from './components/PlayerHUD';
import {
  EggEvolutionStage,
  GameStatus,
  Level,
  EggState,
  Player,
  GameObject,
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
  CAMERA_FOLLOW_THRESHOLD,
  DAMAGE_COOLDOWN,
  DUCK_FLY_STRENGTH,
  GLIDE_GRAVITY_FACTOR,
  WATER_BUOYANCY,
  WATER_MOVE_SPEED,
  WATER_FRICTION_FACTOR,
  TRAMPOLINE_BOUNCE_STRENGTH,
  SPEED_RAMP_BOOST_FACTOR,
} from './constants';

const checkCollision = (obj1: GameObject | Player, obj2: GameObject): boolean => {
  const [x1, y1, w1, h1] = Array.isArray(obj1) ? obj1 : [obj1.x, obj1.y, obj1.width, obj1.height];
  const [x2, y2, w2, h2] = obj2;
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
};

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.START_SCREEN);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [eggState, setEggState] = useState<EggState>({ stage: EggEvolutionStage.EGG, damage: 0 });
  const [unlockedAbilityMessage, setUnlockedAbilityMessage] = useState<string | null>(null);
  const [showDevSelector, setShowDevSelector] = useState(false);
  const [devSelectedStage, setDevSelectedStage] = useState<EggEvolutionStage>(EggEvolutionStage.EGG);

  const [player, setPlayer] = useState<Player>({
    x: PLAYER_START_X, y: PLAYER_START_Y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT,
    velocityX: 0, velocityY: 0, isOnGround: false, isSwimming: false,
    isRolling: false, isJumping: false, isGliding: false, isDashing: false, isHighJumpActive: false,
    isDevFlyMode: false, isGottaGoFastActive: false,
  });
  const [cameraX, setCameraX] = useState(0);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const typedSequence = useRef<string>('');
  const jumpTimer = useRef(0);
  const highJumpTimerRef = useRef(0);
  const damageCooldownRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);

  const currentLevel: Level = LEVELS[currentLevelIndex] || LEVELS[0];

  const resetGame = useCallback(() => {
    setCurrentLevelIndex(0);
    setEggState({ stage: EggEvolutionStage.EGG, damage: 0 });
    setUnlockedAbilityMessage(null);
    highJumpTimerRef.current = 0;
    setPlayer({
      x: PLAYER_START_X, y: PLAYER_START_Y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT,
      velocityX: 0, velocityY: 0, isOnGround: false, isSwimming: false,
      isRolling: false, isJumping: false, isGliding: false, isDashing: false, isHighJumpActive: false,
      isDevFlyMode: false, isGottaGoFastActive: false,
    });
    setCameraX(0);
    setGameStatus(GameStatus.START_SCREEN);
  }, []);

  const startGame = useCallback(() => setGameStatus(GameStatus.PLAYING), []);

  const jumpToLevel = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, LEVELS.length - 1));
    setCurrentLevelIndex(safeIndex);
    setEggState({ stage: devSelectedStage, damage: 0 });
    setPlayer(p => ({ ...p, x: PLAYER_START_X, y: PLAYER_START_Y, velocityX: 0, velocityY: 0, isDashing: false, isHighJumpActive: false }));
    setCameraX(0);
    setShowDevSelector(false);
    if (gameStatus === GameStatus.START_SCREEN) setGameStatus(GameStatus.PLAYING);
  };

  const handleLevelCompletion = useCallback(() => {
    if (gameStatus !== GameStatus.PLAYING) return;
    setGameStatus(GameStatus.LEVEL_COMPLETE);
    
    setTimeout(() => {
      setEggState(prev => {
        const newStage = currentLevel.eggTransformation;
        if (newStage && newStage !== prev.stage) {
          const abilityInfo = ABILITY_MESSAGES.find(msg => msg.stage === newStage);
          if (abilityInfo) {
            setUnlockedAbilityMessage(`Evolution: ${abilityInfo.stage}! ${abilityInfo.message}`);
            setTimeout(() => setUnlockedAbilityMessage(null), 5000);
          }
          return { ...prev, stage: newStage, damage: 0 };
        }
        return prev;
      });

      setCurrentLevelIndex(prevIdx => {
        if (prevIdx < LEVELS.length - 1) {
          setPlayer(p => ({ ...p, x: PLAYER_START_X, y: PLAYER_START_Y, velocityX: 0, velocityY: 0, isDashing: false, isHighJumpActive: false }));
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

  const updateGame = useCallback(() => {
    const now = Date.now();
    setPlayer(p => {
      let { x, y, velocityX, velocityY, isOnGround, isSwimming, isJumping, isGliding, isRolling, isDashing, isHighJumpActive, isDevFlyMode, isGottaGoFastActive } = p;
      const move = keysPressed.current;

      isHighJumpActive = now < highJumpTimerRef.current;

      if (isDevFlyMode) {
        const devSpeed = 15;
        velocityX = 0; velocityY = 0;
        if (move['ArrowLeft']) velocityX = -devSpeed;
        if (move['ArrowRight']) velocityX = devSpeed;
        if (move['ArrowUp']) velocityY = -devSpeed;
        if (move['ArrowDown']) velocityY = devSpeed;
        x += velocityX; y += velocityY;
        isOnGround = false; isSwimming = false; isDashing = false; isJumping = false;
      } else {
        const acc = isOnGround ? 0.8 : 0.4;
        let speedCap = isSwimming ? WATER_MOVE_SPEED : MOVE_SPEED;
        const fric = isSwimming ? WATER_FRICTION_FACTOR : (isOnGround ? FRICTION_FACTOR : AIR_FRICTION_FACTOR);

        if (move['ArrowLeft']) {
          if (velocityX > -speedCap) velocityX = Math.max(velocityX - acc, -speedCap);
          isRolling = true;
        } else if (move['ArrowRight']) {
          if (velocityX < speedCap) velocityX = Math.min(velocityX + acc, speedCap);
          isRolling = true;
        } else {
          velocityX *= fric;
          isRolling = Math.abs(velocityX) > 0.5;
        }

        if (isDashing && Math.abs(velocityX) < speedCap * 0.8) {
          isDashing = false;
        }

        const hasLegs = eggState.stage >= EggEvolutionStage.LEGS;
        let currentJumpPower = hasLegs ? JUMP_STRENGTH : BASE_JUMP_STRENGTH;
        if (isHighJumpActive) currentJumpPower *= JUMP_BOOST_MULTIPLIER;

        if (move['ArrowUp']) {
          if (isOnGround) {
            velocityY = currentJumpPower;
            isOnGround = false;
            jumpTimer.current = 1;
            isJumping = true;
            
            if (Math.abs(velocityX) > speedCap * 0.8) {
              const dashTargetSpeed = speedCap * DASH_BOOST;
              if (isGottaGoFastActive) {
                 velocityX *= DASH_BOOST;
              } else {
                 if (Math.abs(velocityX) < dashTargetSpeed) {
                    velocityX = Math.sign(velocityX) * dashTargetSpeed;
                 }
              }
              isDashing = true;
              highJumpTimerRef.current = now + DASH_BUFF_DURATION;
              isHighJumpActive = true;
              velocityY = currentJumpPower * JUMP_BOOST_MULTIPLIER;
            }
          } else if (jumpTimer.current > 0 && jumpTimer.current < MAX_JUMP_TIME) {
            const buffMult = isHighJumpActive ? 1.5 : 1.0;
            const variableJumpBonus = (hasLegs ? 0.45 : 0.2) * buffMult;
            velocityY -= variableJumpBonus;
            jumpTimer.current++;
          }
        } else {
          jumpTimer.current = 0;
        }

        if (eggState.stage === EggEvolutionStage.DUCK) {
          if (move['ArrowUp']) velocityY = Math.max(velocityY - 0.5, DUCK_FLY_STRENGTH);
        }

        isGliding = false;
        if (eggState.stage >= EggEvolutionStage.WINGS && move[' '] && velocityY > 0 && !isSwimming) {
          velocityY *= GLIDE_GRAVITY_FACTOR;
          isGliding = true;
        }
        
        if (currentLevel.windZones) {
            for (const wz of currentLevel.windZones) {
                if(checkCollision({ ...p, x, y }, [wz[0], wz[1], wz[2], wz[3]])) {
                    velocityX += wz[4]; // Apply wind strength
                }
            }
        }

        if (isSwimming) {
          velocityY += WATER_BUOYANCY;
          if (move[' ']) velocityY -= 0.6;
        } else if (!isOnGround) {
          velocityY += GRAVITY;
        }

        x += velocityX;
        y += velocityY;

        isOnGround = false;
        isSwimming = false;

        if (currentLevel.waterZones) {
          for (const wz of currentLevel.waterZones) {
            if (checkCollision({ ...p, x, y }, wz)) { isSwimming = true; isDashing = false; break; }
          }
        }

        for (const plat of currentLevel.platforms) {
          if (checkCollision({ ...p, x, y }, plat)) {
            if (velocityY > 0 && p.y + p.height <= plat[1] + 10) {
              y = plat[1] - p.height; velocityY = 0; isOnGround = true; isDashing = false; 
            } else if (velocityY < 0 && p.y >= plat[1] + plat[3] - 10) {
              y = plat[1] + plat[3]; velocityY = 0;
            } else if (x + p.width > plat[0] && x < plat[0] + plat[2]) {
              x -= velocityX; velocityX = 0; isDashing = false;
            }
          }
        }
        
        if (currentLevel.trampolines) {
            for (const t of currentLevel.trampolines) {
                if (checkCollision({ ...p, x, y }, t) && velocityY > 0) {
                    velocityY = TRAMPOLINE_BOUNCE_STRENGTH;
                    isOnGround = false; // Ensure we are airborne after bounce
                }
            }
        }
        
        if (isOnGround && currentLevel.speedRamps) {
            for (const sr of currentLevel.speedRamps) {
                if (checkCollision({ ...p, x, y }, sr)) {
                    if (Math.abs(velocityX) > 0.1) {
                       velocityX *= SPEED_RAMP_BOOST_FACTOR;
                    }
                }
            }
        }
      }

      if (y > 600) { setGameStatus(GameStatus.GAME_OVER); return p; }

      for (const haz of currentLevel.hazards) {
        if (checkCollision({ ...p, x, y }, haz) && now - damageCooldownRef.current > DAMAGE_COOLDOWN) {
          setEggState(es => {
            const nextDamage = es.damage + HAZARD_DAMAGE;
            if (nextDamage >= MAX_HEALTH) {
                setGameStatus(GameStatus.GAME_OVER);
            }
            return { ...es, damage: Math.min(nextDamage, MAX_HEALTH) };
          });
          damageCooldownRef.current = now;
        }
      }

      if (checkCollision({ ...p, x, y }, currentLevel.endZone)) handleLevelCompletion();

      return { ...p, x, y, velocityX, velocityY, isOnGround, isSwimming, isRolling, isJumping, isGliding, isDashing, isHighJumpActive, isDevFlyMode, isGottaGoFastActive };
    });

    setCameraX(prev => {
      const target = player.x - CAMERA_FOLLOW_THRESHOLD;
      return Math.max(0, Math.min(target, currentLevel.levelWidth - GAME_WIDTH));
    });
  }, [player, eggState.stage, currentLevel, handleLevelCompletion]);

  useEffect(() => {
    if (gameStatus !== GameStatus.PLAYING) return;
    const loop = () => {
      updateGame();
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStatus, updateGame]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysPressed.current[e.key] = true;
      
      if (e.key.toLowerCase() === 'g') {
        setPlayer(p => ({ ...p, isDevFlyMode: !p.isDevFlyMode }));
      }

      if (e.key.toLowerCase() === 'z') {
        setShowDevSelector(prev => !prev);
      }

      if (e.key.length === 1) {
        typedSequence.current = (typedSequence.current + e.key.toLowerCase()).slice(-11);
        if (typedSequence.current === 'gottagofast') {
          setPlayer(p => ({ ...p, isGottaGoFastActive: true }));
          setUnlockedAbilityMessage("CHEAT ENABLED: MOMENTUM UNLOCKED!");
          setTimeout(() => setUnlockedAbilityMessage(null), 3000);
        }
      }
    };
    const up = (e: KeyboardEvent) => keysPressed.current[e.key] = false;
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [gameStatus]);

  const evolutionStages = Object.values(EggEvolutionStage);

  const renderContent = () => {
    if (gameStatus === GameStatus.START_SCREEN && !showDevSelector) {
        return <StartScreen onStartGame={startGame} />;
    }
    if (gameStatus === GameStatus.GAME_WIN && !showDevSelector) {
        return <EndScreen onRestartGame={resetGame} />;
    }

    return (
        <div className="w-full h-full relative bg-black flex justify-center items-center">
             {currentLevel && <GameCanvas currentLevel={currentLevel} player={player} eggStage={eggState.stage} damage={eggState.damage} cameraX={cameraX} />}
             {currentLevel && gameStatus === GameStatus.PLAYING && <PlayerHUD eggStage={eggState.stage} damage={eggState.damage} unlockedAbilityMessage={unlockedAbilityMessage} />}
             
             {showDevSelector && (
               <div className="absolute inset-0 bg-black/90 z-[60] p-8 overflow-y-auto rounded-lg flex flex-col items-center animate-fade-in">
                 <h2 className="text-3xl font-bold text-yellow-400 mb-4">DEV SELECTOR</h2>
                 
                 <div className="mb-6 w-full max-w-2xl">
                    <h3 className="text-xl font-semibold text-white mb-2 text-center">Select Evolution Stage</h3>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {evolutionStages.map(stage => (
                            <button
                                key={stage}
                                onClick={() => setDevSelectedStage(stage)}
                                className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${devSelectedStage === stage ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                            >
                                {stage}
                            </button>
                        ))}
                    </div>
                 </div>
    
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
                   {LEVELS.map((lvl, idx) => (
                     <button 
                       key={lvl.id}
                       onClick={() => jumpToLevel(idx)}
                       className="bg-gray-700 hover:bg-yellow-600 p-4 rounded text-left border border-gray-600 transition-colors"
                     >
                       <div className="text-xs text-gray-400">Level {lvl.id}</div>
                       <div className="font-bold text-white">{lvl.name}</div>
                       <div className="text-[10px] text-gray-300 italic">{lvl.description}</div>
                     </button>
                   ))}
                 </div>
                 <button 
                   onClick={() => setShowDevSelector(false)}
                   className="mt-8 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700"
                 >
                   Close Selector (Z)
                 </button>
               </div>
             )}
    
             {gameStatus === GameStatus.LEVEL_COMPLETE && (
               <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
                 <h2 className="text-4xl font-bold text-white animate-bounce">LEVEL COMPLETE!</h2>
               </div>
             )}
    
             {gameStatus === GameStatus.GAME_OVER && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-fade-in">
                    <h2 className="text-5xl font-extrabold text-red-500 mb-8">YOU CRACKED!</h2>
                    <button
                        onClick={resetGame}
                        className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-2xl font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75"
                    >
                        Retry
                    </button>
                </div>
             )}
        </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      {renderContent()}
    </div>
  );
};

export default App;
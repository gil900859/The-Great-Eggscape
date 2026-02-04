import { EggEvolutionStage, Level, GameObject, WindZoneObject } from './types';

// Game Constants
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 400;
export const PLAYER_START_X = 100;
export const PLAYER_START_Y = 200;
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 40;
export const GROUND_Y = GAME_HEIGHT - 40;

export const GRAVITY = 0.45;
export const JUMP_STRENGTH = -8.625; 
export const BASE_JUMP_STRENGTH = -5.625; 
export const DASH_BOOST = 2.2; 
export const JUMP_BOOST_MULTIPLIER = 1.45; 
export const DASH_BUFF_DURATION = 2000; 
export const MAX_JUMP_TIME = 15; 
export const DUCK_FLY_STRENGTH = -10;
export const GLIDE_GRAVITY_FACTOR = 0.15;
export const MOVE_SPEED = 6;
export const FRICTION_FACTOR = 0.85; 
export const AIR_FRICTION_FACTOR = 0.985; 
export const WATER_FRICTION_FACTOR = 0.92;
export const WATER_MOVE_SPEED = 4;
export const WATER_BUOYANCY = -0.4;

// New mechanics constants
export const TRAMPOLINE_BOUNCE_STRENGTH = -15;
export const WIND_STRENGTH_FACTOR = 0.1;
export const SPEED_RAMP_BOOST_FACTOR = 2.5;

export const CAMERA_FOLLOW_THRESHOLD = GAME_WIDTH / 2.5;
export const MAX_HEALTH = 100;
export const HAZARD_DAMAGE = 34; // 3 hits to lose
export const DAMAGE_COOLDOWN = 1200;
export const ABILITY_ACTIVATE_COOLDOWN = 300;

// Level Length - Increased for much longer levels
const TOTAL_LEVEL_WIDTH = 12000;

const generateLevelContent = (levelId: number): Pick<Level, 'platforms' | 'hazards' | 'waterZones' | 'endZone' | 'trampolines' | 'speedRamps' | 'windZones'> => {
  const platforms: GameObject[] = [[-50, -1000, 50, GAME_HEIGHT + 2000]]; 
  platforms.push([0, GROUND_Y, 800, 40]);
  if (levelId >= 3) {
    platforms.push([0, -20, TOTAL_LEVEL_WIDTH, 60]);
  }

  const hazards: GameObject[] = [];
  const waterZones: GameObject[] = [];
  const trampolines: GameObject[] = [];
  const speedRamps: GameObject[] = [];
  const windZones: WindZoneObject[] = [];
  
  let currentX = 800;

  const addGap = (width: number) => { currentX += width; };
  const addPlatform = (w: number, h: number, yOffset: number = 0) => {
    platforms.push([currentX, GROUND_Y - yOffset, w, h]);
    currentX += w;
  };
  const addHazard = (w: number, xOff: number = 0) => {
    hazards.push([currentX + xOff, GROUND_Y - 30, w, 35]);
  };

  while (currentX < TOTAL_LEVEL_WIDTH - 2000) {
    const r = Math.random();
    
    if (r < 0.15 && levelId > 4) {
      // Wind Challenge
      const windWidth = 800 + Math.random() * 500;
      const windStrength = (Math.random() > 0.5 ? 1 : -1) * (WIND_STRENGTH_FACTOR + Math.random() * 0.1);
      windZones.push([currentX, 0, windWidth, GAME_HEIGHT, windStrength]);
      addPlatform(windWidth, 20, 0);
      addGap(150);
    } else if (r < 0.3) {
      // Floating segments with potential trampolines
      const segmentCount = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < segmentCount; i++) {
        const platY = Math.random() * 100 + 30;
        const platW = 120 + Math.random() * 80;
        addPlatform(platW, 20, platY);
        if (Math.random() > 0.7 && levelId > 3) {
          // Add a trampoline to this platform
          trampolines.push([currentX - platW + platW / 4, GROUND_Y - platY - 10, platW / 2, 10]);
        }
        if (Math.random() > 0.8) {
          hazards.push([currentX - 100, GROUND_Y - platY - 30, 40, 35]);
        }
        addGap(130 + Math.random() * 70);
      }
    } else if (r < 0.5) {
      // Hazards on flat ground with potential speed ramps
      const groundWidth = 800 + Math.random() * 800;
      addPlatform(groundWidth, 20, 0);
      if (Math.random() > 0.6 && levelId > 2) {
        speedRamps.push([currentX - groundWidth + 200, GROUND_Y - 10, 150, 10]);
      }
      const hazardCount = Math.floor(groundWidth / 300);
      for (let j = 0; j < hazardCount; j++) {
        addHazard(50 + Math.random() * 30, j * 250 - groundWidth + 150);
      }
    } else if (r < 0.7 && levelId > 3) {
      // Staircases / Verticality with a trampoline at the bottom
      const stepCount = 4 + Math.floor(Math.random() * 3);
      if (Math.random() > 0.5) {
        trampolines.push([currentX - 100, GROUND_Y - 10, 80, 10]);
      }
      for (let i = 0; i < stepCount; i++) {
        addPlatform(200, 20, i * 50);
        addGap(50);
      }
      addGap(200);
    } else if (r < 0.85 && levelId >= 8) {
      // Massive Water Zones
      const waterWidth = 1200 + Math.random() * 1000;
      waterZones.push([currentX, GROUND_Y - 150, waterWidth, 200]);
      platforms.push([currentX, GROUND_Y - 150, waterWidth, 20]); 
      currentX += waterWidth;
    } else {
      // Regular ground with some overhead platforms
      const groundWidth = 1000 + Math.random() * 1000;
      addPlatform(groundWidth, 20, 0);
      if (Math.random() > 0.4) {
          platforms.push([currentX - groundWidth + 300, GROUND_Y - 130, 250, 20]);
          platforms.push([currentX - groundWidth + 650, GROUND_Y - 130, 250, 20]);
      }
    }
    addGap(100 + Math.random() * 150);
  }

  platforms.push([currentX, GROUND_Y, 2000, 40]);
  const endZone: GameObject = [currentX + 1500, GROUND_Y - 100, 100, 100];

  return { platforms, hazards, waterZones, endZone, trampolines, speedRamps, windZones };
};

export const LEVELS: Level[] = [
  { id: 1, name: 'The Great Plains', description: 'Escape the farm. Get rolling!', environmentClass: 'bg-green-400', eggTransformation: null, difficulty: 'easy', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(1) },
  { id: 2, name: 'Haystack Heights', description: 'Watch out for stampeding horses!', environmentClass: 'bg-yellow-500', eggTransformation: null, difficulty: 'easy', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(2) },
  { id: 3, name: 'The Barn Maze', description: 'Wooden skeleton of the old barn. Spiders lurk.', environmentClass: 'bg-amber-800', eggTransformation: EggEvolutionStage.EYES, difficulty: 'medium', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(3) },
  { id: 4, name: 'The High Loft', description: 'Vertical challenges with attic rats.', environmentClass: 'bg-stone-600', eggTransformation: EggEvolutionStage.LEGS, difficulty: 'medium', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(4) },
  { id: 5, name: 'Window Escape', description: 'Leap towards the outer world. Broken glass!', environmentClass: 'bg-blue-400', eggTransformation: null, difficulty: 'medium', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(5) },
  { id: 6, name: 'Kitchen Counter Chaos', description: 'Hot stoves and sharp knives.', environmentClass: 'bg-gray-700', eggTransformation: EggEvolutionStage.WINGS, difficulty: 'hard', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(6) },
  { id: 7, name: 'The Pantry Glide', description: 'Endless shelves and meat cleavers.', environmentClass: 'bg-amber-900', eggTransformation: null, difficulty: 'hard', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(7) },
  { id: 8, name: 'Ventilation Shafts', description: 'Giant fans will blow you away!', environmentClass: 'bg-slate-800', eggTransformation: null, difficulty: 'hard', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(8) },
  { id: 9, name: 'The Overflow Pipes', description: 'Drowning isn\'t the only threat.', environmentClass: 'bg-blue-900', eggTransformation: EggEvolutionStage.DUCK, difficulty: 'hard', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(9) },
  { id: 10, name: 'The Fire Hall', description: 'Flames and gas leaks.', environmentClass: 'bg-orange-700', eggTransformation: null, difficulty: 'hard', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(10) },
  { id: 11, name: 'The Final Confrontation', description: 'THE CHEF IS READY.', environmentClass: 'bg-red-900', eggTransformation: null, difficulty: 'hard', levelWidth: TOTAL_LEVEL_WIDTH, ...generateLevelContent(11) },
];

export const ABILITY_MESSAGES = [
  { stage: EggEvolutionStage.EGG, message: 'Fragile and small. Jump while rolling for a Dash Jump!', keys: 'Arrows, Up (Hop), Roll Fast + Up (Dash)' },
  { stage: EggEvolutionStage.EYES, message: 'You see the path clearer now.', keys: 'Arrows, Up (Hop)' },
  { stage: EggEvolutionStage.LEGS, message: 'Stronger legs! Jump high and hold to reach the loft.', keys: 'Up Arrow (Long Jump)' },
  { stage: EggEvolutionStage.WINGS, message: 'Glide across the abyss.', keys: 'Hold Space in air' },
  { stage: EggEvolutionStage.DUCK, message: 'Swim, fly, and survive!', keys: 'Up / Space' },
];
export enum EggEvolutionStage {
  EGG = 'Egg',
  EYES = 'Eyes',
  LEGS = 'Legs',
  WINGS = 'Wings',
  DUCK = 'Duck',
}

export enum GameStatus {
  START_SCREEN = 'START_SCREEN',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  GAME_WIN = 'GAME_WIN',
}

export interface EggState {
  stage: EggEvolutionStage;
  damage: number;
}

// Define a simple rectangle type for game objects
export type GameObject = [number, number, number, number]; // [x, y, width, height]
export type WindZoneObject = [number, number, number, number, number]; // [x, y, width, height, strength]

export interface Level {
  id: number;
  name: string;
  description: string;
  environmentClass: string; // Tailwind class for background (for HUD/overall vibe)
  eggTransformation: EggEvolutionStage | null; // Stage egg transforms at the *end* of this level
  difficulty: 'easy' | 'medium' | 'hard';

  // Game world properties
  levelWidth: number; // Total horizontal width of the level in pixels
  platforms: GameObject[]; // Solid ground
  hazards: GameObject[]; // Dangerous areas that cause cracks
  waterZones?: GameObject[]; // Areas for swimming (duck stage)
  endZone: GameObject; // Area that triggers level completion
  backgroundElements?: GameObject[]; // Optional: for drawing simple decorative elements on canvas
  backgroundEmoji?: string; // Optional: emoji to draw as background hint
  
  // New movement-affecting objects
  trampolines?: GameObject[];
  speedRamps?: GameObject[];
  windZones?: WindZoneObject[];
}

export interface AbilityMessage {
  stage: EggEvolutionStage;
  message: string;
  keys?: string;
}

// Player state for canvas rendering
export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  isOnGround: boolean;
  isSwimming: boolean; // True if player is currently in water
  isRolling: boolean; // For animation
  isJumping: boolean; // For animation
  isGliding: boolean; // For animation
  isDashing: boolean; // True if performing a long-jump dash
  isHighJumpActive: boolean; // True during the 2-second dash-jump buff
  isDevFlyMode: boolean; // Toggle for developer flight
  isGottaGoFastActive: boolean; // Cheat code state
}
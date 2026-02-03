import React from 'react';
import { EggEvolutionStage, Level } from '../types';
import { ABILITY_MESSAGES, MAX_HEALTH } from '../constants';

interface PlayerHUDProps {
  eggStage: EggEvolutionStage;
  damage: number;
  unlockedAbilityMessage: string | null;
}

const PlayerHUD: React.FC<PlayerHUDProps> = ({
  eggStage,
  damage,
  unlockedAbilityMessage,
}) => {
  const healthPercentage = Math.max(0, ((MAX_HEALTH - damage) / MAX_HEALTH) * 100);
  let healthColor = 'bg-green-500';
  if (healthPercentage < 60) {
    healthColor = 'bg-yellow-500';
  }
  if (healthPercentage < 30) {
    healthColor = 'bg-red-600';
  }

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-auto p-2 z-20">
      <div className="flex flex-col items-center gap-2 bg-gray-800 bg-opacity-80 p-3 rounded-lg shadow-lg">
        {/* Egg State & Health */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl" role="img" aria-label="egg-emoji">
              {eggStage === EggEvolutionStage.EGG && '🥚'}
              {eggStage === EggEvolutionStage.EYES && '👀🥚'}
              {eggStage === EggEvolutionStage.LEGS && '🦵🥚'}
              {eggStage === EggEvolutionStage.WINGS && '🕊️🥚'}
              {eggStage === EggEvolutionStage.DUCK && '🦆'}
            </span>
            <p className="text-xl font-semibold text-white">{eggStage}</p>
          </div>
          <div className="w-48 mt-1">
            <p className="text-xs text-gray-400 uppercase tracking-widest text-center mb-1">
              Shell Integrity
            </p>
            <div className="w-full bg-gray-600 rounded-full h-4 border-2 border-gray-500 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${healthColor}`}
                style={{ width: `${healthPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Unlocked Ability Message */}
      {unlockedAbilityMessage && (
        <div className="absolute left-1/2 -translate-x-1/2 top-24 bg-yellow-600 text-gray-900 px-4 py-2 rounded-full shadow-lg text-lg font-bold animate-pulse-once">
          {unlockedAbilityMessage}
        </div>
      )}
    </div>
  );
};

export default PlayerHUD;
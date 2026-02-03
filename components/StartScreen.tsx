import React from 'react';
import { ABILITY_MESSAGES, LEVELS } from '../constants';
import { EggEvolutionStage } from '../types';

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-lg shadow-xl animate-fade-in">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-yellow-300 drop-shadow-lg">
        THE GREAT EGGSCAPE
      </h1>
      <p className="text-xl md:text-2xl italic text-gray-300 mb-8">
        One egg. One escape. Before the fry.
      </p>

      <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
        {/* Simple Egg Visual */}
        <div className="absolute w-full h-full bg-white rounded-full border-4 border-yellow-400 shadow-lg egg-glow transform -rotate-6"></div>
        <div className="absolute text-7xl z-10 animate-pulse-slow">🥚</div>
      </div>

      <p className="text-md md:text-lg text-gray-200 mb-6 max-w-lg">
        A fragile duck egg escapes a dangerous world to save its mother. Survive by rolling,
        adapting, and enduring. Breaking is not failure—it is growth.
      </p>

      <button
        onClick={onStartGame}
        className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-2xl font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75"
      >
        Start Game
      </button>

      <div className="mt-10 p-6 bg-gray-700 rounded-md max-w-lg text-left">
        <h3 className="text-2xl font-semibold mb-4 text-yellow-300">How to Play</h3>
        <p className="text-gray-200 mb-2">
          Use the <span className="font-bold text-yellow-200">Left/Right Arrow Keys</span> to roll.
        </p>
        <p className="text-gray-200 mb-4">
          As you evolve, new abilities will unlock:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          {ABILITY_MESSAGES.map((ability, index) => (
            <li key={index}>
              <span className="font-semibold text-yellow-200">{ability.stage}:</span>{' '}
              {ability.message} {ability.keys && (
                <span className="text-sm italic text-gray-400">({ability.keys})</span>
              )}
            </li>
          ))}
        </ul>
        <p className="text-gray-200 mt-4">
          Complete <span className="font-bold text-yellow-200">{LEVELS.length} levels</span> to save your mother!
        </p>
      </div>
    </div>
  );
};

export default StartScreen;

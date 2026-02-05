
import React from 'react';
import { ABILITY_MESSAGES, LEVELS } from '../constants';
import { EggEvolutionStage } from '../types';

interface StartScreenProps {
  onStartGame: () => void;
  onToggleMobileControls: () => void;
  mobileControlsEnabled: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ 
  onStartGame, 
  onToggleMobileControls,
  mobileControlsEnabled 
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-lg shadow-xl animate-fade-in max-w-2xl w-full mx-4 max-h-[90vh]">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-yellow-300 drop-shadow-lg uppercase italic tracking-tighter">
        The Great Eggscape
      </h1>
      <p className="text-xl md:text-2xl italic text-gray-300 mb-8">
        One egg. One escape. Before the fry.
      </p>

      <div className="flex items-center gap-4 justify-center">
        <button
          onClick={onStartGame}
          className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-2xl font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75 z-10"
        >
          Start Game
        </button>
        
        <button
          onClick={onToggleMobileControls}
          title={mobileControlsEnabled ? 'Disable Mobile UI' : 'Enable Mobile UI'}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all border-2 shadow-lg transform hover:scale-110 active:scale-95 ${
            mobileControlsEnabled 
            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
            : 'bg-gray-700 border-gray-600 text-gray-400 grayscale hover:grayscale-0 hover:bg-gray-600'
          }`}
        >
          📱
        </button>
      </div>

      <div className="mt-10 p-6 bg-gray-700 rounded-md w-full text-left overflow-y-auto max-h-[40vh] border border-gray-600 shadow-inner">
        <h3 className="text-2xl font-semibold mb-4 text-yellow-300 sticky top-0 bg-gray-700 py-1">How to Play</h3>
        <p className="text-gray-200 mb-2">
          Use the <span className="font-bold text-yellow-200">Left/Right Arrow Keys</span> to roll.
        </p>
        <p className="text-gray-200 mb-4">
          As you evolve, new abilities will unlock:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          {ABILITY_MESSAGES.map((ability, index) => (
            <li key={index} className="border-b border-gray-600 pb-2 last:border-0">
              <span className="font-semibold text-yellow-200">{ability.stage}:</span>{' '}
              {ability.message} {ability.keys && (
                <div className="text-xs italic text-gray-400 ml-6">Controls: {ability.keys}</div>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-4 border-t border-gray-600">
          <p className="text-gray-200">
            Complete <span className="font-bold text-yellow-200">{LEVELS.length} levels</span> to save your mother!
          </p>
          <p className="text-sm text-gray-400 mt-2 italic">
            Tip: Momentum is key. Roll fast before jumping to perform a Dash Jump!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;

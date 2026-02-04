
import React from 'react';

interface GameOverScreenProps {
  onRestartLevel: () => void;
  onMainMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestartLevel, onMainMenu }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-red-950 bg-opacity-95 rounded-2xl shadow-2xl border-4 border-red-600 animate-fade-in z-50 max-w-lg mx-4">
      <h1 className="text-6xl font-black mb-6 text-red-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
        CRACKED!
      </h1>
      <p className="text-2xl italic text-red-200 mb-8">
        The shell has failed. The kitchen is calling...
      </p>

      <div className="text-8xl mb-8 animate-bounce">
        🍳
      </div>

      <div className="flex flex-col gap-4 w-full">
        <button
          onClick={onRestartLevel}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white text-2xl font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-red-400"
        >
          Restart Level
        </button>
        <button
          onClick={onMainMenu}
          className="px-8 py-2 bg-transparent border-2 border-red-400 hover:bg-red-900 text-red-100 text-lg font-bold rounded-full transition-all duration-300"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;

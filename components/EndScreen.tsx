import React from 'react';
import { GameStatus } from '../types';

interface EndScreenProps {
  onRestartGame: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ onRestartGame }) => {
  // This component now only handles the win state.
  const title = 'THE GREAT EGGSCAPE COMPLETE!';
  const message = 'The shell is gone. The duck stands fully formed. The mother is saved!';
  const emoji = '🦆';
  const bgColor = 'bg-green-700';
  const textColor = 'text-green-200';

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-lg shadow-xl ${bgColor} animate-fade-in`}>
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white drop-shadow-lg">
        {title}
      </h1>
      <p className={`text-xl md:text-2xl italic ${textColor} mb-8`}>
        {message}
      </p>

      <div className="relative w-48 h-48 mb-8 flex items-center justify-center text-8xl">
        {emoji}
      </div>

      <p className="text-lg text-gray-100 mb-6 max-w-lg">
        You successfully transformed into a magnificent duck and saved your mother!
      </p>

      <button
        onClick={onRestartGame}
        className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-2xl font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75"
      >
        Play Again
      </button>
    </div>
  );
};

export default EndScreen;
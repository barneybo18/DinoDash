import React from 'react';
import { useGame } from '../context/GameContext';

const Leaderboard = () => {
  const { highScores, setScreen } = useGame();

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 p-8">
      <h1 className="text-5xl font-press-start mb-8 text-yellow-400">Leaderboard</h1>
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-purple-500">
        {highScores.length > 0 ? (
          <ol className="list-decimal list-inside space-y-2 text-xl">
            {highScores.map((entry, index) => (
              <li key={index} className="flex justify-between">
                <span>{index + 1}. {entry.score}</span>
                <span className="text-gray-400">{entry.date}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-center text-xl">No scores yet. Be the first!</p>
        )}
      </div>
      <button onClick={() => setScreen('menu')} className="mt-8 text-xl font-press-start px-6 py-3 border-2 border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-gray-900 transition-colors">Back to Menu</button>
    </div>
  );
};

export default Leaderboard;
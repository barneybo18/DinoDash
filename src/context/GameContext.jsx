import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [screen, setScreen] = useState('menu'); // 'menu', 'game', 'dino', 'scenery', 'leaderboard'
  const [dino, setDino] = useState('Classic'); // 'Classic', 'Beach', 'Space', 'Golden'
  const [scenery, setScenery] =useState('Beach'); // 'Beach', 'Space', 'Desert', 'Cityscape'
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('dinoDashHighScores');
    return saved ? JSON.parse(saved) : [];
  });

  const addHighScore = (score) => {
    const newScores = [...highScores, { score, date: new Date().toLocaleDateString() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setHighScores(newScores);
    localStorage.setItem('dinoDashHighScores', JSON.stringify(newScores));
  };

  const value = { screen, setScreen, dino, setDino, scenery, setScenery, highScores, addHighScore };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
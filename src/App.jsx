// src/App.jsx
import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Menu from './components/Menu';
import GameCanvas from './components/GameCanvas';
import Leaderboard from './components/Leaderboard';
import DinoSelect from './components/DinoSelect';
import ScenerySelect from './components/ScenerySelect';

const ScreenManager = () => {
  const { screen } = useGame();

  switch (screen) {
    case 'game':
      return <GameCanvas />;
    case 'leaderboard':
      return <Leaderboard />;
    case 'menu':
    default:
      return <Menu />;
  }
}

const App = () => (
  <GameProvider>
    <ScreenManager />
  </GameProvider>
);

export default App;

import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import DinoSelect from './DinoSelect';
import ScenerySelect from './ScenerySelect';

const NeonButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="relative text-xl font-press-start px-8 py-4 border-4 border-cyan-400 text-cyan-400 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.7)] hover:bg-cyan-400 hover:text-gray-900 hover:shadow-[0_0_40px_rgba(0,255,255,1)] transition-all duration-300 ease-in-out transform hover:scale-105 hover:rotate-2 focus:outline-none focus:ring-4 focus:ring-cyan-200"
    style={{ background: 'rgba(0, 255, 255, 0.1)', backdropFilter: 'blur(2px)' }}
  >
    {children}
    <span className="absolute inset-0 border-2 border-cyan-300 rounded-xl animate-pulse opacity-50"></span>
  </button>
);

const Menu = () => {
  const { setScreen, dino: dinoSkin } = useGame();
  const [activePopup, setActivePopup] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;

    const drawDino = () => {
      const skinColors = {
        'Classic': '#22C55E',
        'Beach': '#60A5FA',
        'Space': '#9CA3AF',
        'Golden': '#FBBF24',
      };
      const dinoColor = skinColors[dinoSkin] || '#333';
      ctx.fillStyle = dinoColor;
      const isGolden = dinoSkin === 'Golden';

      const frame = Math.floor(frameCount / 10) % 2;
      const x = 60; // Adjusted for new size
      const y = 25; // Positioned relative to canvas

      ctx.save();
      ctx.translate(x, y);

      // Body
      ctx.beginPath();
      ctx.moveTo(40, 15); // top of head
      ctx.lineTo(60, 20); // snout
      ctx.lineTo(60, 40); // jaw
      ctx.lineTo(55, 38);
      ctx.lineTo(40, 45); // neck
      ctx.lineTo(25, 40); // back
      ctx.lineTo(0, 50);  // tail
      ctx.lineTo(15, 55); // under-tail
      ctx.lineTo(35, 55); // belly
      ctx.lineTo(42, 40);
      ctx.closePath();
      ctx.fill();

      // Arms
      ctx.fillRect(43, 46, 8, 4);

      // Legs
      if (frame === 0) {
        ctx.fillRect(25, 55, 10, 15); // Back leg
        ctx.fillRect(15, 55, 10, 10); // Front leg (up)
      } else {
        ctx.fillRect(25, 55, 10, 10); // Back leg (up)
        ctx.fillRect(15, 55, 10, 15); // Front leg
      }

      // Eye
      ctx.fillStyle = 'white';
      ctx.fillRect(52, 22, 5, 5);

      // Skin-specific details
      if (dinoSkin === 'Beach') {
        // Sunglasses
        ctx.fillStyle = '#222';
        ctx.fillRect(50, 20, 10, 4);
      }

      if (dinoSkin === 'Space') {
        drawSpaceHelmet();
      }

      if (isGolden && frame === 0 && frameCount % 20 < 5) {
        // Add a sparkle effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(10, 40);
        ctx.lineTo(13, 43);
        ctx.lineTo(16, 40);
        ctx.lineTo(13, 37);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    const drawSpaceHelmet = () => {
      ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      // Position relative to the dino's translated position
      ctx.arc(50, 30, 20, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.fill();
    };

    const animateDino = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDino();
      frameCount++;
      animationFrameId = requestAnimationFrame(animateDino);
    };

    animateDino();

    return () => cancelAnimationFrame(animationFrameId);
  }, [dinoSkin]);

  return (
    <div className="w-full h-[95vh] flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#1a0933_0%,_#0d051a_70%)] overflow-hidden relative border-2 border-cyan-400 rounded-2xl padding-5">
      {/* Starry background effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.7 + Math.sin(Date.now() * 0.001 + i) * 0.3,
              animation: `twinkle ${2 + Math.random() * 3}s infinite`
            }}
          />
        ))}
      </div>

      <h1
        className="text-6xl md:text-8xl font-press-start mb-2 text-white m-5"
        style={{
          textShadow: '0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6)',
          animation: 'neon-flicker 1.5s infinite alternate'
        }}
      >
        Dino Dash
      </h1>
      <h2
        className="text-3xl md:text-4xl font-press-start mb-10 text-yellow-300"
        style={{ textShadow: '0 0 8px rgba(255, 255, 0, 0.5)' }}
      >
        Multiverse Run
      </h2>
      <div className="space-y-4 flex flex-col items-center z-10">
        <NeonButton onClick={() => setScreen('game')}>Start Game</NeonButton>
        <NeonButton onClick={() => setActivePopup('dino')}>Choose Dino</NeonButton>
        <NeonButton onClick={() => setActivePopup('scenery')}>Choose Scenery</NeonButton>
        <NeonButton onClick={() => setScreen('leaderboard')}>Leaderboard</NeonButton>
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={100}
        className="absolute bottom-4 z-10"
        style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
      />

      {activePopup === 'dino' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-20">
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900 to-gray-900 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.7)]">
            <DinoSelect onClose={() => setActivePopup(null)} />
          </div>
        </div>
      )}
      {activePopup === 'scenery' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-20">
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900 to-gray-900 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.7)]">
            <ScenerySelect onClose={() => setActivePopup(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

// Add CSS animations in a style block (for simplicity in this context)
const styles = `
  @keyframes neon-flicker {
    0%, 100% { opacity: 1; text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6); }
    50% { opacity: 0.95; text-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 15px rgba(0, 255, 255, 0.4); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 0.3; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }
`;

// Inject styles into the document (in a real app, use a CSS file or styled-components)
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Menu;
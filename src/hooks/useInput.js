import { useState, useEffect } from 'react';

export const useInput = () => {
  const [input, setInput] = useState({ jump: false, duck: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') setInput(prev => ({ ...prev, jump: true }));
      if (e.code === 'ArrowDown') setInput(prev => ({ ...prev, duck: true }));
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') setInput(prev => ({ ...prev, jump: false }));
      if (e.code === 'ArrowDown') setInput(prev => ({ ...prev, duck: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return input;
};
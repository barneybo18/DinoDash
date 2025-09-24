import React from 'react';
import { useGame } from '../context/GameContext';

const DINO_SKINS = [
    { name: 'Classic', color: 'bg-green-500', description: 'The original legend.' },
    { name: 'Beach', color: 'bg-blue-400', description: 'Ready to catch some waves.' },
    { name: 'Space', color: 'bg-gray-400', description: 'One small step for a dino...' },
    { name: 'Golden', color: 'bg-yellow-400', description: 'A sparkling, mythic runner.' },
];

const DinoCard = ({ name, color, description, isSelected, onSelect }) => (
    <div
        onClick={() => {
            onSelect(name);
            // The onClose is now handled by the Done button, but this could be used for instant selection
        }}
        className={`p-4 border-4 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'border-cyan-400 scale-105 shadow-lg' : 'border-gray-700 hover:border-cyan-300'}`}
    >
        <div className={`w-full h-24 rounded ${color} mb-4`}></div>
        <h3 className="text-2xl text-center">{name}</h3>
        <p className="text-sm text-center text-gray-400 mt-2 h-10">{description}</p>
    </div>
);

const DinoSelect = ({ onClose }) => {
    const { dino, setDino } = useGame();

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border-2 border-purple-500 w-full max-w-4xl">
            <h1 className="text-4xl font-press-start mb-8 text-yellow-400 text-center">Choose Your Dino</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {DINO_SKINS.map(skin => (
                    <DinoCard
                        key={skin.name}
                        name={skin.name}
                        color={skin.color}
                        description={skin.description}
                        isSelected={dino === skin.name}
                        onSelect={setDino}
                    />
                ))}
            </div>
            <div className="text-center">
                <button
                    onClick={onClose}
                    className="mt-8 text-xl font-press-start px-8 py-3 border-2 border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-gray-900 transition-colors"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default DinoSelect;
import React from 'react';
import { useGame } from '../context/GameContext';

const SCENERIES = [
    { name: 'Beach', preview: 'bg-gradient-to-b from-sky-400 to-yellow-200', description: 'Sun, sand, and surf.' },
    { name: 'Space', preview: 'bg-gradient-to-b from-indigo-900 to-black', description: 'The final frontier.' },
    { name: 'Desert', preview: 'bg-gradient-to-b from-orange-300 to-yellow-500', description: 'A vast, arid landscape.' },
    { name: 'Cityscape', preview: 'bg-gradient-to-b from-slate-800 to-purple-900', description: 'Neon-drenched rooftops.' },
];

const SceneryCard = ({ name, preview, description, isSelected, onSelect }) => (
    <div
        onClick={() => onSelect(name)}
        className={`p-4 border-4 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'border-cyan-400 scale-105 shadow-lg' : 'border-gray-700 hover:border-cyan-300'}`}
    >
        <div className={`w-full h-32 rounded ${preview} mb-4`}></div>
        <h3 className="text-2xl text-center">{name}</h3>
        <p className="text-sm text-center text-gray-400 mt-2">{description}</p>
    </div>
);

const ScenerySelect = ({ onClose }) => {
    const { scenery, setScenery, setScreen } = useGame();

    return (
        // Modal container with backdrop
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            {/* Modal content */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border-2 border-purple-500 w-full max-w-4xl">
                <h1 className="text-4xl font-press-start mb-8 text-yellow-400 text-center">Choose Scenery</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {SCENERIES.map(scene => (
                        <SceneryCard
                            key={scene.name}
                            name={scene.name}
                            preview={scene.preview}
                            description={scene.description}
                            isSelected={scenery === scene.name}
                            onSelect={setScenery}
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
        </div>
    );
};

export default ScenerySelect;
import React, { useRef, useEffect, useState } from 'react';
import { useInput } from '../hooks/useInput';
import { useGame } from '../context/GameContext';

const SCENERY_CONFIG_BASE = {
    Beach: {
        groundColor: '#FFD700',
        skyColor: 'linear-gradient(to bottom, #87CEEB, #FFDAB9)',
        gravity: 0.6,
        jumpHeight: -18,
        obstacles: [
            { type: 'ground', emoji: '🌴', width: 50, height: 50 },
            { type: 'air', emoji: '🏐', width: 40, height: 40, rotate: true },
        ]
    },
    Space: {
        groundColor: '#6A0DAD',
        skyColor: '#000020',
        gravity: 0.3,
        jumpHeight: -15,
        obstacles: [
            { type: 'ground', emoji: '👾', width: 40, height: 40 },
            { type: 'air', emoji: '☄️', width: 50, height: 50, yVariation: true },
        ]
    },
    Desert: {
        groundColor: '#EDC9AF',
        skyColor: 'linear-gradient(to bottom, #F0E68C, #FFD700)',
        gravity: 0.6,
        jumpHeight: -18,
        obstacles: [
            { type: 'ground', emoji: '🌵', width: 40, height: 60 },
            { type: 'air', emoji: '🌪️', width: 50, height: 50 },
        ]
    },
    Cityscape: {
        groundColor: '#606060',
        skyColor: 'linear-gradient(to bottom, #2C3E50, #4682B4)',
        gravity: 0.6,
        jumpHeight: -18,
        obstacles: [
            { type: 'ground', emoji: '🚧', width: 50, height: 50 },
            { type: 'air', emoji: '🚁', width: 40, height: 40 },
        ]
    },
};

const GameCanvas = () => {
    const canvasRef = useRef(null);
    const { scenery, dino: dinoSkin, addHighScore, setScreen } = useGame();
    const input = useInput();
    const inputRef = useRef(input);

    const [gameState, setGameState] = useState({
        finalScore: 0,
        isGameOver: false,
        showInstructions: false,
    });
    const [isMuted, setIsMuted] = useState(false);
    const jumpSoundRef = useRef(null);
    const duckSoundRef = useRef(null);
    const gameOverSoundRef = useRef(null);
    const startSoundRef = useRef(null);
    const backgroundMusicRef = useRef(null);

    const config = SCENERY_CONFIG_BASE[scenery];
    const backgroundItemsRef = useRef([]);

    // Initialize audio files
    useEffect(() => {
        jumpSoundRef.current = new Audio('/sounds/jump.mp3'); // Placeholder path
        duckSoundRef.current = new Audio('/sounds/duck.mp3');
        gameOverSoundRef.current = new Audio('/sounds/game-over.mp3');
        startSoundRef.current = new Audio('/sounds/start.mp3');
        backgroundMusicRef.current = new Audio(`/sounds/${scenery.toLowerCase()}-bg.mp3`);
        backgroundMusicRef.current.loop = true;
        backgroundMusicRef.current.volume = 0.3;

        return () => {
            [jumpSoundRef, duckSoundRef, gameOverSoundRef, startSoundRef, backgroundMusicRef].forEach(ref => {
                if (ref.current) {
                    ref.current.pause();
                    ref.current = null;
                }
            });
        };
    }, [scenery]);

    useEffect(() => {
        inputRef.current = input;
    }, [input]);

    useEffect(() => {
        const hasPlayedBefore = localStorage.getItem('dinoDashPlayedBefore');
        if (!hasPlayedBefore) {
            setGameState(prev => ({ ...prev, showInstructions: true }));
            localStorage.setItem('dinoDashPlayedBefore', 'true');
        }
    }, []);

    const playAudio = (audioRef, options = {}) => {
        if (audioRef.current && !isMuted) {
            audioRef.current.currentTime = 0;
            audioRef.current.volume = options.volume || 1.0;
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
    };

    const handleStartGame = () => {
        setGameState(prev => ({ ...prev, showInstructions: false }));
        // This first user interaction unlocks audio playback in the browser
        const allAudio = [jumpSoundRef, duckSoundRef, gameOverSoundRef, startSoundRef, backgroundMusicRef];
        allAudio.forEach(ref => { if (ref.current) ref.current.muted = false; });

        playAudio(startSoundRef);
        playAudio(backgroundMusicRef, { volume: 0.3 });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let items = [];

        const groundY = canvas.height - 50;

        if (scenery === 'Space') {
            const numStars = 200;
            for (let i = 0; i < numStars; i++) {
                items.push({
                    type: 'star',
                    x: Math.random() * canvas.width,
                    y: Math.random() * (canvas.height - 100),
                    radius: Math.random() * 1.5 + 0.5,
                    twinklePhase: Math.random() * Math.PI * 2,
                    twinkleSpeed: Math.random() * 0.05 + 0.01,
                    speed: Math.random() * 0.5 + 0.1
                });
            }
            items.push({
                type: 'nebula',
                x: canvas.width * 0.5,
                y: canvas.height * 0.3,
                radius: 120,
                color: 'rgba(138, 43, 226, 0.2)'
            });
            items.push({
                type: 'planet',
                x: canvas.width * 0.3,
                y: 100,
                radius: 30,
                color: '#FF4500'
            });
            items.push({
                type: 'planet',
                x: canvas.width * 0.7,
                y: 150,
                radius: 20,
                color: '#1E90FF'
            });
            for (let i = 0; i < 7; i++) {
                items.push({
                    type: 'bridgeLine',
                    x: i * (canvas.width / 7),
                    y: groundY,
                    width: canvas.width / 7,
                    height: 5
                });
            }
        } else if (scenery === 'Beach') {
            let currentX = 0;
            while (currentX < canvas.width * 1.5) {
                items.push({
                    type: 'wave',
                    x: currentX,
                    height: 10 + Math.random() * 8,
                    width: 150 + Math.random() * 50,
                    layer: 'foreground'
                });
                currentX += 180 + Math.random() * 80;
            }
            currentX = 0;
            while (currentX < canvas.width * 1.5) {
                items.push({
                    type: 'wave',
                    x: currentX,
                    height: 8 + Math.random() * 6,
                    width: 200 + Math.random() * 60,
                    layer: 'background'
                });
                currentX += 200 + Math.random() * 100;
            }
            items.push({
                type: 'sun',
                x: canvas.width * 0.7,
                y: 100,
                radius: 40
            });
            for (let i = 0; i < 10; i++) {
                items.push({
                    type: 'seashell',
                    x: Math.random() * canvas.width,
                    y: groundY - 10,
                    size: 4 + Math.random() * 6,
                    rotation: Math.random() * Math.PI / 4 - Math.PI / 8
                });
            }
            for (let i = 0; i < 3; i++) {
                items.push({
                    type: 'cloud',
                    x: Math.random() * canvas.width,
                    y: 50 + Math.random() * 50,
                    width: 80 + Math.random() * 40,
                    height: 20 + Math.random() * 10
                });
            }
        } else if (scenery === 'Desert') {
            let currentX = 0;
            while (currentX < canvas.width * 1.5) {
                const size = 80 + Math.random() * 100;
                items.push({
                    type: 'pyramid',
                    x: currentX,
                    y: groundY,
                    base: size,
                    height: size * 0.8
                });
                currentX += size + 50 + Math.random() * 150;
            }
            items.push({
                type: 'mirage',
                x: 0,
                y: groundY - 10,
                width: canvas.width,
                height: 10
            });
        } else if (scenery === 'Cityscape') {
            let currentX = 0;
            while (currentX < canvas.width * 2) {
                const width = 60 + Math.random() * 80;
                const height = 200 + Math.random() * 300;
                items.push({
                    type: 'skyscraper',
                    x: currentX,
                    width: width,
                    height: height,
                    windows: Array(Math.floor(height / 20)).fill().map(() => ({
                        lit: Math.random() < 0.25,
                        size: 6 + Math.random() * 4
                    }))
                });
                currentX += width + 10 + Math.random() * 20;
            }
            items.push({
                type: 'distantCity',
                x: 0,
                width: canvas.width,
                height: 80,
            });
        }
        backgroundItemsRef.current = items;
    }, [scenery]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let wasJumping = false;
        let wasDucking = false;

        const dino = {
            x: 50,
            y: canvas.height - 50,
            width: 60,
            height: 60,
            dy: 0,
            isJumping: false,
            isDucking: false,
            draw(frameCount) {
                const skinColors = {
                    'Classic': '#22C55E',
                    'Beach': '#60A5FA',
                    'Space': '#9CA3AF',
                    'Golden': '#FBBF24',
                };
                const dinoColor = skinColors[dinoSkin] || '#333';
                ctx.fillStyle = dinoColor;

                const isGolden = dinoSkin === 'Golden';
                const frame = Math.floor(frameCount / 6) % 2;

                ctx.save();
                ctx.translate(this.x, this.y);

                if (this.isDucking) {
                    ctx.beginPath();
                    ctx.moveTo(5, 50);
                    ctx.lineTo(25, 50);
                    ctx.lineTo(40, 35);
                    ctx.lineTo(60, 35);
                    ctx.lineTo(60, 55);
                    ctx.lineTo(55, 60);
                    ctx.lineTo(0, 60);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = 'white';
                    ctx.fillRect(52, 40, 5, 5);

                    if (dinoSkin === 'Beach') {
                        ctx.fillStyle = '#222';
                        ctx.fillRect(50, 38, 10, 4);
                    }
                    if (dinoSkin === 'Space') {
                        ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
                        ctx.lineWidth = 3;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                        ctx.beginPath();
                        ctx.arc(50, 45, 18, Math.PI, Math.PI * 2);
                        ctx.stroke();
                        ctx.fill();
                    }
                } else {
                    ctx.beginPath();
                    ctx.moveTo(40, 15);
                    ctx.lineTo(60, 20);
                    ctx.lineTo(60, 40);
                    ctx.lineTo(55, 38);
                    ctx.lineTo(40, 45);
                    ctx.lineTo(25, 40);
                    ctx.lineTo(0, 50);
                    ctx.lineTo(15, 55);
                    ctx.lineTo(35, 55);
                    ctx.lineTo(42, 40);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillRect(43, 46, 8, 4);

                    if (frame === 0) {
                        ctx.fillRect(25, 55, 10, 15);
                        ctx.fillRect(15, 55, 10, 10);
                    } else {
                        ctx.fillRect(25, 55, 10, 10);
                        ctx.fillRect(15, 55, 10, 15);
                    }

                    ctx.fillStyle = 'white';
                    ctx.fillRect(52, 22, 5, 5);

                    if (dinoSkin === 'Beach') {
                        ctx.fillStyle = '#222';
                        ctx.fillRect(50, 20, 10, 4);
                    }

                    if (dinoSkin === 'Space') {
                        ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
                        ctx.lineWidth = 3;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                        ctx.beginPath();
                        ctx.arc(50, 30, 20, Math.PI * 1.1, Math.PI * 1.9);
                        ctx.stroke();
                        ctx.fill();
                    }

                    if (isGolden && frame === 1 && frameCount % 20 < 5) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.beginPath();
                        ctx.moveTo(10, 40);
                        ctx.lineTo(13, 43);
                        ctx.lineTo(16, 40);
                        ctx.lineTo(13, 37);
                        ctx.closePath();
                        ctx.fill();
                    }

                    const drawPixelSword = () => {
                        ctx.save();
                        // Position near the hand and rotate to point forward
                        ctx.translate(50, 50);
                        ctx.rotate(Math.PI / 6);
                        const s = 2.5; // Increased pixel scale for a bigger sword

                        // Hilt
                        ctx.fillStyle = '#6F482A'; // Light Brown (Pommel)
                        ctx.fillRect(-s, s * 3, s * 2, s);
                        ctx.fillStyle = '#3B2717'; // Dark Brown (Grip)
                        ctx.fillRect(-s, s, s * 2, s * 2);

                        // Cross-guard
                        ctx.fillStyle = '#3B2717'; // Dark Brown
                        ctx.fillRect(-s * 3, 0, s * 6, s);
                        ctx.fillRect(-s * 2, -s, s * 4, s);

                        // Blade
                        // Darkest outline
                        ctx.fillStyle = '#285E5E';
                        ctx.fillRect(-s, -s * 9, s * 2, s * 8);
                        // Medium outline
                        ctx.fillStyle = '#3A8585';
                        ctx.fillRect(-s * 2, -s * 8, s, s * 6); // Left edge
                        ctx.fillRect(s, -s * 8, s, s * 6);     // Right edge
                        ctx.fillRect(-s, -s * 10, s * 2, s);   // Tip
                        // Lightest part
                        ctx.fillStyle = '#61E1E1';
                        ctx.fillRect(-s, -s * 8, s * 2, s * 6); // Blade inner
                        ctx.fillRect(-s, -s, s, -s);           // Shine spot

                        ctx.restore();
                    };
                    drawPixelSword();
                }
                ctx.restore();
            },
            update() {
                if (inputRef.current.jump && !this.isJumping && !wasJumping) {
                    this.dy = config.jumpHeight;
                    this.isJumping = true;
                    playAudio(jumpSoundRef);
                }
                if (inputRef.current.duck && !wasDucking && !this.isJumping) {
                    if (!isMuted && duckSoundRef.current) {
                        duckSoundRef.current.currentTime = 0;
                        duckSoundRef.current.play();
                    }
                }
                this.dy += config.gravity;
                this.y += this.dy;
                if (this.y + this.height > canvas.height - 50) {
                    this.y = canvas.height - 50 - this.height;
                    this.dy = 0;
                    this.isJumping = false;
                }
                this.isDucking = inputRef.current.duck;
                wasJumping = inputRef.current.jump;
                wasDucking = inputRef.current.duck;
            }
        };

        const drawSceneryBackground = (frameCount) => {
            const bgItems = backgroundItemsRef.current;
            const groundY = canvas.height - 50;

            let skyGradient;
            if (typeof config.skyColor === 'string' && config.skyColor.startsWith('linear-gradient')) {
                skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                if (scenery === 'Beach') {
                    skyGradient.addColorStop(0, '#87CEEB');
                    skyGradient.addColorStop(1, '#FFDAB9');
                } else if (scenery === 'Desert') {
                    skyGradient.addColorStop(0, '#F0E68C');
                    skyGradient.addColorStop(1, '#FFD700');
                } else if (scenery === 'Cityscape') {
                    skyGradient.addColorStop(0, '#2C3E50');
                    skyGradient.addColorStop(1, '#4682B4');
                }
                ctx.fillStyle = skyGradient;
            } else {
                ctx.fillStyle = config.skyColor;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            bgItems.forEach(item => {
                if (item.type === 'star') {
                    const opacity = 0.7 + Math.sin(frameCount * item.twinkleSpeed + item.twinklePhase) * 0.3;
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.beginPath();
                    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                    ctx.fill();
                } else if (item.type === 'nebula') {
                    ctx.fillStyle = item.color;
                    ctx.beginPath();
                    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = `rgba(138, 43, 226, ${0.1 + Math.sin(frameCount * 0.01) * 0.05})`;
                    ctx.beginPath();
                    ctx.arc(item.x, item.y, item.radius + 20, 0, Math.PI * 2);
                    ctx.fill();
                } else if (item.type === 'planet') {
                    ctx.fillStyle = item.color;
                    ctx.beginPath();
                    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = `rgba(${parseInt(item.color.slice(1, 3), 16)}, ${parseInt(item.color.slice(3, 5), 16)}, ${parseInt(item.color.slice(5, 7), 16)}, 0.2)`;
                    ctx.beginPath();
                    ctx.arc(item.x, item.y, item.radius + 5, 0, Math.PI * 2);
                    ctx.fill();
                } else if (item.type === 'bridgeLine') {
                    ctx.fillStyle = 'rgba(106, 13, 173, 0.8)';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    ctx.fillStyle = 'rgba(186, 85, 211, 0.3)';
                    ctx.fillRect(item.x, item.y - 2, item.width, item.height + 4);
                } else if (item.type === 'wave') {
                    ctx.fillStyle = item.layer === 'foreground'
                        ? `rgba(0, 105, 148, ${0.5 + Math.sin(frameCount * 0.01) * 0.05})`
                        : `rgba(0, 80, 120, ${0.3 + Math.sin(frameCount * 0.008) * 0.03})`;
                    ctx.beginPath();
                    ctx.moveTo(item.x, groundY);
                    ctx.bezierCurveTo(
                        item.x + item.width / 3, groundY - item.height * 0.8,
                        item.x + item.width * 2 / 3, groundY - item.height * 0.8,
                        item.x + item.width, groundY
                    );
                    ctx.lineTo(item.x, groundY);
                    ctx.fill();
                    if (item.layer === 'foreground') {
                        const foamGradient = ctx.createLinearGradient(item.x, groundY - 3, item.x, groundY);
                        foamGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
                        foamGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                        ctx.fillStyle = foamGradient;
                        ctx.beginPath();
                        ctx.moveTo(item.x, groundY - 3);
                        ctx.bezierCurveTo(
                            item.x + item.width / 3, groundY - item.height * 0.6 - 3,
                            item.x + item.width * 2 / 3, groundY - item.height * 0.6 - 3,
                            item.x + item.width, groundY - 3
                        );
                        ctx.lineTo(item.x, groundY - 3);
                        ctx.fill();
                    }
                } else if (item.type === 'sun') {
                    ctx.fillStyle = `rgba(255, 165, 0, ${0.8 + Math.sin(frameCount * 0.02) * 0.1})`;
                    ctx.beginPath();
                    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
                    ctx.beginPath();
                    ctx.arc(item.x, item.y, item.radius + 15, 0, Math.PI * 2);
                    ctx.fill();
                } else if (item.type === 'seashell') {
                    ctx.save();
                    ctx.translate(item.x, item.y);
                    ctx.rotate(item.rotation);
                    ctx.fillStyle = '#FFFACD';
                    ctx.beginPath();
                    ctx.arc(0, 0, item.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else if (item.type === 'cloud') {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.beginPath();
                    ctx.ellipse(item.x, item.y, item.width / 2, item.height / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else if (item.type === 'pyramid') {
                    ctx.fillStyle = 'rgba(210, 180, 140, 0.3)';
                    ctx.beginPath();
                    ctx.moveTo(item.x, groundY);
                    ctx.lineTo(item.x + item.base, groundY);
                    ctx.lineTo(item.x + item.base / 2, groundY - item.height);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.beginPath();
                    ctx.moveTo(item.x + item.base, groundY);
                    ctx.lineTo(item.x + item.base + 20, groundY);
                    ctx.lineTo(item.x + item.base / 2, groundY - item.height);
                    ctx.closePath();
                    ctx.fill();
                } else if (item.type === 'mirage') {
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(frameCount * 0.02) * 0.05})`;
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                } else if (item.type === 'skyscraper') {
                    ctx.fillStyle = 'rgba(44, 62, 80, 0.8)';
                    ctx.fillRect(item.x, groundY - item.height, item.width, item.height);
                    item.windows.forEach((window, index) => {
                        ctx.fillStyle = window.lit ? 'rgba(255, 245, 157, 0.4)' : 'rgba(30, 40, 50, 0.6)';
                        ctx.fillRect(item.x + 10, groundY - item.height + 10 + index * 20, window.size || 8, window.size || 8);
                        ctx.fillRect(item.x + item.width / 2 - 4, groundY - item.height + 10 + index * 20, window.size || 8, window.size || 8);
                        ctx.fillRect(item.x + item.width - 18, groundY - item.height + 10 + index * 20, window.size || 8, window.size || 8);
                        if (window.lit) {
                            ctx.fillStyle = 'rgba(255, 245, 157, 0.2)';
                            ctx.fillRect(item.x + 9, groundY - item.height + 9 + index * 20, (window.size || 8) + 2, (window.size || 8) + 2);
                            ctx.fillRect(item.x + item.width / 2 - 5, groundY - item.height + 9 + index * 20, (window.size || 8) + 2, (window.size || 8) + 2);
                            ctx.fillRect(item.x + item.width - 19, groundY - item.height + 9 + index * 20, (window.size || 8) + 2, (window.size || 8) + 2);
                        }
                    });
                } else if (item.type === 'distantCity') {
                    ctx.fillStyle = 'rgba(23, 33, 43, 0.5)';
                    ctx.fillRect(item.x, groundY - item.height, item.width, item.height);
                }
            });

            if (scenery === 'Beach') {
                ctx.fillStyle = 'rgba(210, 180, 140, 0.3)';
                for (let i = 0; i < 50; i++) {
                    ctx.beginPath();
                    ctx.arc(
                        Math.random() * canvas.width,
                        groundY - 5 + Math.random() * 5,
                        1 + Math.random() * 2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        };

        const updateBackground = (speed) => {
            const bgItems = backgroundItemsRef.current;
            const parallaxFactor = scenery === 'Beach' ? 0.2 : 0.3;

            if (scenery === 'Space') {
                for (let i = bgItems.length - 1; i >= 0; i--) {
                    const item = bgItems[i];
                    if (item.type === 'star') {
                        item.x -= item.speed;
                        if (item.x < 0) {
                            item.x += canvas.width;
                            item.y = Math.random() * (canvas.height - 100);
                        }
                    } else if (item.type === 'bridgeLine') {
                        item.x -= speed;
                        if (item.x + item.width < 0) {
                            bgItems.splice(i, 1);
                        }
                    }
                }
                let maxXBridge = 0;
                bgItems.filter(item => item.type === 'bridgeLine').forEach(item => {
                    maxXBridge = Math.max(maxXBridge, item.x + item.width);
                });
                if (maxXBridge < canvas.width) {
                    const groundY = canvas.height - 50;
                    bgItems.push({ type: 'bridgeLine', x: maxXBridge, y: groundY, width: canvas.width / 7, height: 5 });
                }
            } else {
                for (let i = bgItems.length - 1; i >= 0; i--) {
                    if (bgItems[i].type !== 'sun' && bgItems[i].type !== 'planet' && bgItems[i].type !== 'nebula' && bgItems[i].type !== 'distantCity' && bgItems[i].type !== 'seashell' && bgItems[i].type !== 'cloud') {
                        bgItems[i].x -= speed * (bgItems[i].layer === 'background' ? parallaxFactor * 0.5 : parallaxFactor);
                        let itemWidth = bgItems[i].type === 'wave' ? bgItems[i].width : bgItems[i].type === 'pyramid' ? bgItems[i].base : bgItems[i].width;
                        if (bgItems[i].x + itemWidth < 0) {
                            bgItems.splice(i, 1);
                        }
                    } else if (bgItems[i].type === 'cloud') {
                        bgItems[i].x -= speed * 0.1;
                        if (bgItems[i].x + bgItems[i].width < 0) {
                            bgItems[i].x = canvas.width + bgItems[i].width;
                            bgItems[i].y = 50 + Math.random() * 50;
                        }
                    }
                }

                let maxXForeground = 0;
                let maxXBackground = 0;
                bgItems.forEach(item => {
                    if (item.type === 'wave') {
                        const itemWidth = item.width;
                        if (item.layer === 'foreground' && item.x + itemWidth > maxXForeground) {
                            maxXForeground = item.x + itemWidth;
                        } else if (item.layer === 'background' && item.x + itemWidth > maxXBackground) {
                            maxXBackground = item.x + itemWidth;
                        }
                    } else if (item.type === 'pyramid' || item.type === 'skyscraper') {
                        const itemWidth = item.type === 'pyramid' ? item.base : item.width;
                        if (item.x + itemWidth > maxXForeground) {
                            maxXForeground = item.x + itemWidth;
                        }
                    }
                });

                if (maxXForeground < canvas.width * 1.5 && scenery !== 'Space') {
                    let newItem;
                    const groundY = canvas.height - 50;
                    if (scenery === 'Beach') {
                        newItem = {
                            type: 'wave',
                            x: maxXForeground + 180 + Math.random() * 80,
                            height: 10 + Math.random() * 8,
                            width: 150 + Math.random() * 50,
                            layer: 'foreground'
                        };
                    } else if (scenery === 'Desert') {
                        const size = 80 + Math.random() * 100;
                        newItem = {
                            type: 'pyramid',
                            x: maxXForeground + 50 + Math.random() * 150,
                            y: groundY,
                            base: size,
                            height: size * 0.8
                        };
                    } else if (scenery === 'Cityscape') {
                        const width = 60 + Math.random() * 80;
                        const height = 200 + Math.random() * 300;
                        newItem = {
                            type: 'skyscraper',
                            x: maxXForeground + 10 + Math.random() * 20,
                            width: width,
                            height: height,
                            windows: Array(Math.floor(height / 20)).fill().map(() => ({
                                lit: Math.random() < 0.25,
                                size: 6 + Math.random() * 4
                            }))
                        };
                    }
                    if (newItem) bgItems.push(newItem);
                }
                if (scenery === 'Beach' && maxXBackground < canvas.width * 1.5) {
                    const newItem = {
                        type: 'wave',
                        x: maxXBackground + 200 + Math.random() * 100,
                        height: 8 + Math.random() * 6,
                        width: 200 + Math.random() * 60,
                        layer: 'background'
                    };
                    bgItems.push(newItem);
                }
            }
        };

        let obstacles = [];
        let frameCount = 0;
        let score = 0;
        let speed = 8;
        let scoreMilestone = 100;

        if (gameState.showInstructions) {
            return;
        }

        // Play start sound and background music when game starts
        if (!gameState.isGameOver) {
            playAudio(startSoundRef);
            playAudio(backgroundMusicRef, { volume: 0.3 });
        }

        const gameLoop = () => {
            if (!gameState.isGameOver) {
                frameCount++;
                score += 0.1;
                if (Math.floor(score) > scoreMilestone) {
                    speed += 0.5;
                    scoreMilestone += 100;
                }
                updateBackground(speed);
                dino.update();
                if (frameCount % Math.max(30, (150 - Math.floor(speed * 5))) === 0) {
                    const obstacleTemplates = config.obstacles;
                    const template = obstacleTemplates[Math.floor(Math.random() * obstacleTemplates.length)];
                    let y;
                    if (template.type === 'ground') {
                        y = canvas.height - 50 - template.height;
                    } else if (template.yVariation && scenery === 'Space') {
                        const isHigh = Math.random() > 0.5;
                        y = isHigh ? canvas.height - 50 - template.height - 80 : canvas.height - 50 - template.height - 35;
                    } else {
                        y = canvas.height - 50 - template.height - 35;
                    }
                    obstacles.push({
                        x: canvas.width,
                        y: y,
                        ...template
                    });
                }
                obstacles.forEach((obs, index) => {
                    obs.x -= speed;
                    const dinoRect = { x: dino.x, y: dino.y, width: dino.width, height: dino.isDucking ? dino.height / 2 : dino.height };
                    if (dino.isDucking) dinoRect.y += dino.height / 2;
                    if (
                        dinoRect.x < obs.x + obs.width &&
                        dinoRect.x + dinoRect.width > obs.x &&
                        dinoRect.y < obs.y + obs.height &&
                        dinoRect.y + dinoRect.height > obs.y
                    ) {
                        setGameState({ finalScore: score, isGameOver: true });
                        addHighScore(Math.floor(score));
                        playAudio(gameOverSoundRef);
                        if (backgroundMusicRef.current) {
                            backgroundMusicRef.current.pause();
                        }
                    }
                    if (obs.x + obs.width < 0) {
                        obstacles.splice(index, 1);
                    }
                });
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawSceneryBackground(frameCount);
            ctx.fillStyle = config.groundColor;
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            dino.draw(frameCount);
            obstacles.forEach((obs) => {
                ctx.save();
                ctx.font = `${obs.height}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (obs.rotate) {
                    ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                    ctx.rotate((frameCount * speed * 0.02) % (2 * Math.PI));
                    ctx.fillText(obs.emoji, 0, 0);
                } else {
                    ctx.fillText(obs.emoji, obs.x + obs.width / 2, obs.y + obs.height / 2);
                }
                ctx.restore();
            });
            ctx.fillStyle = 'white';
            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText(`Score: ${Math.floor(score)}`, 20, 40);
            if (gameState.isGameOver) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.font = '40px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
                ctx.font = '20px "Press Start 2P"';
                ctx.fillText(`Score: ${Math.floor(gameState.finalScore)}`, canvas.width / 2, canvas.height / 2 + 5);
                ctx.fillText('Space to Restart | Enter for Menu', canvas.width / 2, canvas.height / 2 + 50);
            }

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        const handleKey = (e) => {
            if (gameState.isGameOver) {
                if (e.code === 'Space') {
                    setGameState({ finalScore: 0, isGameOver: false });
                    // The main useEffect will now handle restarting the music
                } else if (e.code === 'Enter') {
                    setScreen('menu');
                    if (backgroundMusicRef.current) {
                        backgroundMusicRef.current.pause();
                    }
                }
            }
        };
        document.addEventListener('keydown', handleKey);

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('keydown', handleKey);
        };
    }, [gameState, scenery, dinoSkin, isMuted]);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-black p-4">
            <canvas
                ref={canvasRef}
                width={1000}
                height={600}
                className="bg-gray-800 w-full h-auto max-w-5xl rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.5)]"
            />
            {gameState.showInstructions && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border-2 border-purple-500 w-full max-w-2xl text-white text-center">
                        <h1 className="text-4xl font-press-start mb-6 text-yellow-400">How to Play</h1>
                        <p className="text-lg mb-6">Welcome to Dino Dash: Multiverse Run!</p>
                        <div className="text-left space-y-4 mb-8">
                            <p><strong>Jump:</strong> Press <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Space</kbd> or <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">ArrowUp</kbd></p>
                            <p><strong>Crouch:</strong> Press <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">ArrowDown</kbd></p>
                        </div>
                        <div className="flex justify-around items-center mb-8">
                            <div className="flex flex-col items-center">
                                <p className="mb-2">Jump over these:</p>
                                <span className="text-5xl">{config.obstacles.find(o => o.type === 'ground')?.emoji || '🌵'}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="mb-2">Crouch under these:</p>
                                <span className="text-5xl">{config.obstacles.find(o => o.type === 'air')?.emoji || '🚁'}</span>
                            </div>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleStartGame}
                                className="text-xl font-press-start px-8 py-3 border-2 border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-gray-900 transition-colors"
                            >Got It!</button>
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="text-xl font-press-start px-8 py-3 border-2 border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-gray-900 transition-colors"
                            >{isMuted ? 'Unmute' : 'Mute'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameCanvas;
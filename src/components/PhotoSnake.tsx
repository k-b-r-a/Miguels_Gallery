import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';

const GRID_SIZE = 15;
const INITIAL_SNAKE = [{ x: 7, y: 7 }, { x: 7, y: 8 }, { x: 7, y: 9 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function PhotoSnake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateFood = useCallback(() => {
    let newFood = { x: 0, y: 0 };
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
       
      if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) break;
    }
    return newFood;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (isGameOver || !isPlaying) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check collision with food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPlaying, generateFood]);

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, 150);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, isGameOver, moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      // Prevent scrolling with arrow keys while playing
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp': if (direction.y !== 1) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y !== -1) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x !== 1) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x !== -1) setDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPlaying]);

  // Touch Controls
  const touchStart = useRef<{ x: number, y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || !isPlaying) return;
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > 30) {
        if (deltaX > 0 && direction.x !== -1) setDirection({ x: 1, y: 0 });
        else if (deltaX < 0 && direction.x !== 1) setDirection({ x: -1, y: 0 });
      }
    } else {
      if (Math.abs(deltaY) > 30) {
        if (deltaY > 0 && direction.y !== -1) setDirection({ x: 0, y: 1 });
        else if (deltaY < 0 && direction.y !== 1) setDirection({ x: 0, y: -1 });
      }
    }
  };

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <div 
      className="relative w-full aspect-square max-w-[400px] bg-zinc-950 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col p-4 touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: isPlaying ? 'none' : 'auto' }}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
           <CameraIcon className="w-5 h-5 text-purple-500" />
           <span className="text-xs font-black uppercase tracking-widest text-white/60">Photo Snake</span>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-bold text-white/40 uppercase">Score: <span className="text-white">{score}</span></p>
           <p className="text-[10px] font-bold text-white/20 uppercase">Best: {highScore}</p>
        </div>
      </div>

      <div className="relative grow bg-black/40 rounded-3xl border border-white/5 grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}>
        {!isPlaying && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl p-6 text-center">
             <h3 className="text-2xl font-Cinzel font-bold text-white mb-2">{isGameOver ? '¡Game Over!' : '¿Un descanso?'}</h3>
             <p className="text-xs text-white/40 mb-6 uppercase tracking-widest leading-relaxed">
                {isGameOver ? `Puntaje final: ${score}` : 'Usa las flechas o desliza en el cuadro para jugar'}
             </p>
             <button 
                onClick={startGame}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-purple-500 transition-all active:scale-95 shadow-lg"
             >
                {isGameOver ? 'Reintentar' : 'Jugar Snake'}
             </button>
          </div>
        )}

        {/* Food */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center p-0.5"
          style={{ gridColumnStart: food.x + 1, gridRowStart: food.y + 1 }}
        >
          <div className="w-full h-full bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)] flex items-center justify-center">
             <PhotoIcon className="w-3 h-3 text-white" />
          </div>
        </motion.div>

        {/* Snake */}
        {snake.map((segment, i) => (
          <div 
            key={i}
            className={`p-0.5 transition-all duration-150 ${i === 0 ? 'z-10' : 'z-0'}`}
            style={{ gridColumnStart: segment.x + 1, gridRowStart: segment.y + 1 }}
          >
            <div className={`w-full h-full rounded-sm ${i === 0 ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] flex items-center justify-center' : 'bg-purple-500/60'}`}>
               {i === 0 && <div className="w-1 h-1 bg-black rounded-full" />}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center md:hidden">
         <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">Desliza para mover la cámara</p>
      </div>
    </div>
  );
}

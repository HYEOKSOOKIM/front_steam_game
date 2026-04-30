import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const GameList = ({ title, games }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= games.length) {
      setIndex(0);
    }
  }, [games, index]);

  const next = () => setIndex((prev) => (prev + 1) % games.length);
  const prev = () => setIndex((prev) => (prev - 1 + games.length) % games.length);

  return (
    <section className="mb-20 overflow-hidden">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
        <a
          href="https://store.steampowered.com/charts/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-highlight hover:underline font-medium"
        >
          전체보기 <ExternalLink size={14} />
        </a>
      </div>

      <div className="relative h-[500px] flex items-center justify-center">
        <button
          onClick={prev}
          className="absolute left-0 z-50 p-3 bg-white/5 hover:bg-highlight/20 border border-white/10 rounded-full text-white transition-all backdrop-blur-sm shadow-xl"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={next}
          className="absolute right-0 z-50 p-3 bg-white/5 hover:bg-highlight/20 border border-white/10 rounded-full text-white transition-all backdrop-blur-sm shadow-xl"
        >
          <ChevronRight size={24} />
        </button>

        <div className="relative w-full max-w-[1000px] h-full flex items-center justify-center">
          <AnimatePresence initial={false}>
            {games.map((game, i) => {
              const offset = i - index;

              let displayOffset = offset;
              if (offset > games.length / 2) displayOffset = offset - games.length;
              if (offset < -games.length / 2) displayOffset = offset + games.length;

              if (Math.abs(displayOffset) > 2) return null;

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: displayOffset * 180, scale: 0.8 }}
                  animate={{
                    opacity: 1 - Math.abs(displayOffset) * 0.4,
                    x: displayOffset * 260,
                    scale: 1 - Math.abs(displayOffset) * 0.2,
                    zIndex: 10 - Math.abs(displayOffset),
                    filter: `blur(${Math.abs(displayOffset) * 4}px)`,
                  }}
                  exit={{ opacity: 0, scale: 0.5, x: displayOffset * 300 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -100) next();
                    if (info.offset.x > 100) prev();
                  }}
                  className="absolute w-[300px] h-[400px] cursor-grab active:cursor-grabbing"
                >
                  <div className="steam-card group relative h-full w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#171a21]">
                    <div className="relative w-full aspect-video overflow-hidden bg-black/50">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#171a21] via-transparent to-transparent opacity-40"></div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#1b2838] to-[#171a21]">
                      <div className="space-y-3">
                        <h4 className="text-2xl font-bold text-white leading-tight line-clamp-2 group-hover:text-highlight transition-colors">
                          {game.title}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {game.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] bg-highlight/10 text-highlight/80 border border-highlight/20 px-2 py-0.5 rounded-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {displayOffset === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4"
                        >
                          <button
                            onClick={() => navigate('/report')}
                            className="w-full py-3 bg-highlight text-steam-dark font-bold rounded-lg shadow-[0_0_20px_rgba(102,192,244,0.3)] transition-all hover:brightness-110 active:scale-95"
                          >
                            정밀 분석 데이터 보기
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default GameList;

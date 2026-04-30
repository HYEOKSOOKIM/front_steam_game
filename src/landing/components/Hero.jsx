import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="mb-16 py-12 relative overflow-hidden">
      <div className="absolute top-0 -right-20 w-96 h-96 bg-highlight/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 -left-20 w-72 h-72 bg-highlight/5 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66C0F4] to-white">
            사용자의 의도를 읽고,
          </span>
          <br />
          실제 리뷰로 증명합니다.
        </h2>
        <p className="text-xl text-secondary leading-relaxed mb-8 max-w-2xl">
          단순한 리스트 나열은 그만.<br />
          10만 개의 스팀 게임 중,<br />
          당신이 납득할 수 있는 구매 판단 기준을 제시합니다.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/recommend')}
            className="px-8 py-3 bg-highlight text-steam-dark font-bold rounded-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(102,192,244,0.3)]"
          >
            추천 시작하기
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-sm hover:bg-white/10 transition-all"
          >
            서비스 소개
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;

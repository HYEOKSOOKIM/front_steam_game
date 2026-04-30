import React from 'react';
import { Cpu, Database, Network, Zap } from 'lucide-react';

const stacks = [
  { name: 'LangChain', icon: <Network size={16} /> },
  { name: 'MiniLM', icon: <Zap size={16} /> },
  { name: 'OpenAI', icon: <Cpu size={16} /> },
  { name: 'Vector DB', icon: <Database size={16} /> }
];

const TechStack = () => {
  return (
    <section className="mb-20 p-10 rounded-3xl bg-gradient-to-br from-highlight/5 to-transparent border border-white/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-highlight/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-6">Tech Stack & Architecture</h3>
        <p className="text-lg text-secondary mb-10 max-w-2xl leading-relaxed">
          RAG 기술과 하이브리드 추천 엔진(유사도+장르 적합도)을 통해 
          <span className="text-white font-semibold"> 할루시네이션(환각) 없는 </span> 
          정확하고 신뢰할 수 있는 정보를 제공합니다.
        </p>

        <div className="flex flex-wrap gap-4">
          {stacks.map((stack) => (
            <div 
              key={stack.name}
              className="flex items-center gap-3 px-5 py-3 bg-steam-dark/50 border border-white/10 rounded-xl hover:border-highlight/50 transition-colors"
            >
              <span className="text-highlight">{stack.icon}</span>
              <span className="font-bold text-primary">{stack.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;

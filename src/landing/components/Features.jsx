import React from 'react';
import { Search, MessageSquare, BarChart3 } from 'lucide-react';

const featureData = [
  {
    title: "탐색 비용 감소",
    description: "수만 개의 텍스트 리뷰를 직접 읽는 리뷰 피로도를 줄여드립니다.",
    icon: <Search className="text-highlight" size={32} />,
    type: "Pain Point"
  },
  {
    title: "정교한 자연어 검색",
    description: "태그 검색의 한계 극복. '힐링되는데 공포는 빼줘'와 같은 복잡한 한국어 의도도 완벽히 이해합니다.",
    icon: <MessageSquare className="text-highlight" size={32} />,
    type: "Solution"
  },
  {
    title: "구매 근거 제시",
    description: "LLM이 실제 유저 리뷰를 기반으로 장단점을 요약하여 빠른 구매 판단 점수를 제공합니다.",
    icon: <BarChart3 className="text-highlight" size={32} />,
    type: "Value"
  }
];

const Features = () => {
  return (
    <section id="features" className="mb-20">
      <h3 className="text-3xl font-bold mb-10 text-center">왜 STEAMPACK 인가요?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featureData.map((feature, index) => (
          <div 
            key={index}
            className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-highlight/30 transition-all duration-300 group hover:-translate-y-2"
          >
            <div className="mb-6 p-4 w-16 h-16 bg-highlight/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <div className="inline-block px-2 py-1 bg-white/5 rounded text-[10px] text-secondary font-bold mb-4 tracking-wider uppercase">
              {feature.type}
            </div>
            <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
            <p className="text-secondary leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;

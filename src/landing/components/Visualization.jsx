import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle } from 'lucide-react';

const intentData = [
  { name: 'RPG', value: 40 },
  { name: '힐링', value: 35 },
  { name: '오픈월드', value: 25 },
];

const radarData = [
  { subject: '스토리', A: 120, fullMark: 150 },
  { subject: '그래픽', A: 98, fullMark: 150 },
  { subject: '조작감', A: 86, fullMark: 150 },
  { subject: '최적화', A: 99, fullMark: 150 },
  { subject: '가성비', A: 85, fullMark: 150 },
];

const COLORS = ['#66C0F4', '#4B79BB', '#1b2838'];

const Visualization = () => {
  return (
    <section className="mb-20 space-y-12">
      <h3 className="text-3xl font-bold mb-8 text-center">데이터 시각화 분석</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel 1: Review Evidence */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="text-xl font-bold mb-2">빠른 판단 점수 (Quick Decision Score)</h4>
              <p className="text-sm text-secondary">리뷰 1.2만 개의 정밀 분석 결과</p>
            </div>
            <div className="text-4xl font-black text-highlight">89<span className="text-xl text-secondary">/100</span></div>
          </div>

          <div className="w-full bg-white/5 h-4 rounded-full mb-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-highlight/50 to-highlight w-[89%] rounded-full shadow-[0_0_15px_rgba(102,192,244,0.5)]"></div>
          </div>

          <div className="space-y-6">
            <div className="relative pl-6 border-l-2 border-green-500/30">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-sm font-bold text-green-500">강점 (Strengths)</span>
              </div>
              <p className="text-sm text-primary">"아트 스타일이 독보적이며, 스토리텔링의 깊이가 상당함"</p>
              <p className="text-[11px] text-secondary mt-1">#독창적 #스토리맛집</p>
            </div>

            <div className="relative pl-6 border-l-2 border-red-500/30">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-sm font-bold text-red-500">주의점 (Risks)</span>
              </div>
              <p className="text-sm text-primary">"초반 진입장벽이 다소 높고, 튜토리얼이 불친절함"</p>
              <p className="text-[11px] text-secondary mt-1">#어려움 #초반불친절</p>
            </div>
          </div>
        </div>

        {/* Panel 2: Intent Visualization */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h4 className="text-xl font-bold mb-6">의도 추출 시각화 차트</h4>
          <div className="grid grid-cols-2 h-[300px]">
            <div className="flex flex-col justify-center">
              <p className="text-sm text-secondary mb-4 italic">"힐링되는 RPG를 원하지만 오픈월드 요소도 있었으면 좋겠어"</p>
              <div className="space-y-4">
                {intentData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-sm text-primary">{item.name}</span>
                    <span className="text-xs text-secondary font-bold ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={intentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {intentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold">Intent</div>
                  <div className="text-[10px] text-secondary uppercase tracking-widest">Analysis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Visualization;

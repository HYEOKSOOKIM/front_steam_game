import React from 'react';
import { Home, Sparkles, Compass, Gamepad2 } from 'lucide-react';

const Sidebar = ({ navigate, activePath = '/' }) => {
  const menuItems = [
    { icon: <Home size={20} />, label: '홈', path: '/' },
    { icon: <Sparkles size={20} />, label: '맞춤 게임 추천', path: '/recommend' },
    { icon: <Compass size={20} />, label: '게임 알아보기', path: '/report' },
  ];

  return (
    <aside className="col-span-1 border-r border-white/10 bg-[#171A21] flex flex-col p-6 h-screen sticky top-0">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-highlight rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(102,192,244,0.4)]">
          <Gamepad2 className="text-steam-dark" />
        </div>
        <h1 className="text-xl font-bold tracking-tighter text-white">STEAMPACK</h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-4">
          {menuItems.map((item, index) => {
            const isActive = activePath === item.path;
            return (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 py-2 px-3 rounded-md transition-all duration-200 group ${
                    isActive
                      ? 'bg-white/5 text-highlight'
                      : 'text-secondary hover:text-highlight hover:bg-white/5'
                  }`}
                >
                  <span className={`${isActive ? 'text-highlight' : 'text-secondary group-hover:text-highlight'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="p-4 rounded-xl bg-gradient-to-br from-highlight/10 to-transparent border border-highlight/20">
          <p className="text-xs text-secondary mb-2">AI Powered by</p>
          <p className="text-sm font-bold text-highlight">SteamPack LLM v2.4</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

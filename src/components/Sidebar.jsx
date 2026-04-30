import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Gamepad2, Home, Sparkles } from 'lucide-react';

const MENU_ITEMS = [
  { icon: <Home size={20} />, label: '홈', path: '/' },
  { icon: <Sparkles size={20} />, label: '맞춤 게임 추천', path: '/recommend' },
  { icon: <Compass size={20} />, label: '게임 알아보기', path: '/report' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__logo">
        <div className="app-sidebar__logo-icon">
          <Gamepad2 size={20} />
        </div>
        <h1 className="app-sidebar__title">STEAMPACK</h1>
      </div>

      <nav className="app-sidebar__nav">
        <ul>
          {MENU_ITEMS.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`app-sidebar__nav-btn${location.pathname === item.path ? ' active' : ''}`}
              >
                <span className="app-sidebar__nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="app-sidebar__footer">
        <div className="app-sidebar__badge">
          <p className="app-sidebar__badge-label">AI Powered by</p>
          <p className="app-sidebar__badge-value">SteamPack LLM v2.4</p>
        </div>
      </div>
    </aside>
  );
}

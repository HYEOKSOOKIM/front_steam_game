import { useState } from "react";
import Hero from "../landing/components/Hero";
import CategoryFilter from "../landing/components/CategoryFilter";
import GameList from "../landing/components/GameList";
import Features from "../landing/components/Features";
import TechStack from "../landing/components/TechStack";
import Visualization from "../landing/components/Visualization";
import { gamesData } from "../landing/data";
import "../landing/tailwind.css";

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState("전체");

  const filteredGames =
    activeCategory === "전체"
      ? gamesData
      : gamesData.filter((game) => game.tags.includes(activeCategory));

  const videoId = "ltMKzJ-L158";

  return (
      <main className="h-screen overflow-y-auto hide-scrollbar text-[#C7D5E0] bg-steam-dark font-outfit">
        {/* 상단 Hero 영역 (배경 영상 적용) */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <iframe
              className="absolute top-1/2 left-1/2 w-[150%] h-[150%] aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
              allow="autoplay; encrypted-media; picture-in-picture"
              frameBorder="0"
              title="SteamPack Background Video"
            />
          </div>
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#171A21]/30 via-[#171A21]/50 to-steam-dark backdrop-blur-sm pointer-events-none" />
          <div className="max-w-[1400px] mx-auto px-12 pt-16 pb-8 relative z-10">
            <Hero />
          </div>
        </div>

        {/* 하단 리스트 영역 */}
        <div className="max-w-[1400px] mx-auto px-12 py-10 relative z-10">
          <CategoryFilter
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          <GameList
            title={activeCategory === "전체" ? "지금 뜨는 인기 게임" : `${activeCategory} 게임 추천`}
            games={filteredGames.slice(0, 10)}
          />

          <Features />
          <TechStack />
          <Visualization />

          <footer className="mt-20 py-12 border-t border-white/5 flex justify-between items-center text-secondary text-sm">
            <p>© 2026 STEAMPACK Team. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-highlight transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-highlight transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-highlight transition-colors">GitHub</a>
            </div>
          </footer>
        </div>
      </main>
  );
}

import { useState } from "react";
import HomeSection from "./components/HomeSection";
import QuestSection from "./components/QuestSection";
import AllianceSection from "./components/AllianceSection";
import PortfolioSection from "./components/PortfolioSection";

const tabs = [
  { id: "home", label: "Home" },
  { id: "quest", label: "Quest" },
  { id: "alliance", label: "Alliance" },
  { id: "portfolio", label: "My Portfolio" },
];

function App() {
  const [activeTab, setActiveTab] = useState("home");

  const renderSection = () => {
    switch (activeTab) {
      case "home":
        return <HomeSection onMoveToQuest={() => setActiveTab("quest")} />;
      case "quest":
        return <QuestSection />;
      case "alliance":
        return <AllianceSection />;
      case "portfolio":
        return <PortfolioSection />;
      default:
        return <HomeSection onMoveToQuest={() => setActiveTab("quest")} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-3"
            aria-label="gotchi home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-sm">
              g
            </div>
            <div className="text-left">
              <p className="text-base font-black tracking-tight text-slate-950">
                gotchi
              </p>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">
                먼저 일해보고, 팀이 되는 곳
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative rounded-full px-3 py-2 text-xs font-bold transition-colors duration-200 sm:px-4 sm:text-sm ${
                    isActive
                      ? "text-slate-950"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-white shadow-sm" />
                  )}
                  <span
                    className={`absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-blue-600 transition-all duration-300 ${
                      isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main>{renderSection()}</main>
    </div>
  );
}

export default App;

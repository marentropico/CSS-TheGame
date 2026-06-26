import { useState } from "react";
import { BookOpen, Trophy, CheckCircle2, ChevronRight, Award, Flame, Heart, ShieldAlert, Zap, Cpu } from "lucide-react";
import { Level, Achievement, AppTheme } from "../types";

interface SidebarProps {
  levels: Level[];
  currentLevelId: number;
  completedLevels: number[];
  achievements: Achievement[];
  onSelectLevel: (levelId: number) => void;
  theme: AppTheme;
  xp: number;
  hearts: number;
  streak: number;
  onTriggerStressTest: () => void;
  onOpenPractice: () => void;
}

export default function Sidebar({
  levels,
  currentLevelId,
  completedLevels,
  achievements,
  onSelectLevel,
  theme,
  xp,
  hearts,
  streak,
  onTriggerStressTest,
  onOpenPractice
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"lessons" | "trophies">("lessons");

  const totalLevels = levels.length;
  const completedCount = completedLevels.length;
  const progressPercent = Math.round((completedCount / totalLevels) * 100);

  const categories = ["Básico", "Intermediário", "Avançado"] as const;

  const getDifficultyStyles = (diff: Level["difficulty"]) => {
    if (theme === "retro") {
      switch (diff) {
        case "Fácil":
          return "bg-white text-emerald-800 border-2 border-emerald-800 font-bold text-[9px]";
        case "Médio":
          return "bg-white text-amber-800 border-2 border-amber-800 font-bold text-[9px]";
        case "Difícil":
          return "bg-white text-rose-800 border-2 border-rose-800 font-bold text-[9px]";
      }
    } else if (theme === "dracula") {
      switch (diff) {
        case "Fácil":
          return "bg-[#50fa7b]/10 text-[#50fa7b] border border-[#50fa7b]/20 text-[9px]";
        case "Médio":
          return "bg-[#f1fa8c]/10 text-[#f1fa8c] border border-[#f1fa8c]/20 text-[9px]";
        case "Difícil":
          return "bg-[#ff5555]/10 text-[#ff5555] border border-[#ff5555]/20 text-[9px]";
      }
    } else {
      switch (diff) {
        case "Fácil":
          return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]";
        case "Médio":
          return "bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px]";
        case "Difícil":
          return "bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px]";
      }
    }
  };

  const getContainerClass = () => {
    switch (theme) {
      case "retro":
        return "w-full lg:w-80 flex flex-col h-full bg-[#c0c0c0] border-r-4 border-r-[#808080] text-black font-mono flex-shrink-0 select-none";
      case "dracula":
        return "w-full lg:w-80 flex flex-col h-full bg-[#1e1f29] border-r border-[#44475a] text-[#f8f8f2] font-sans flex-shrink-0";
      case "modern":
      default:
        return "w-full lg:w-80 flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 flex-shrink-0 font-sans";
    }
  };

  const getHeaderClass = () => {
    switch (theme) {
      case "retro":
        return "p-3 bg-[#000080] text-white flex items-center justify-between border-b-2 border-b-[#c0c0c0]";
      case "dracula":
        return "p-5 border-b border-[#44475a] flex items-center space-x-3 bg-[#282a36]";
      case "modern":
      default:
        return "p-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950";
    }
  };

  const getProgressBarStyles = () => {
    switch (theme) {
      case "retro":
        return {
          container: "p-4 bg-[#c0c0c0] border-b-4 border-b-[#808080]",
          barTrack: "w-full h-5 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white overflow-hidden p-0.5",
          barFill: "h-full bg-[#000080]",
          text: "text-xs font-bold text-black"
        };
      case "dracula":
        return {
          container: "p-5 bg-[#282a36]/50 border-b border-[#44475a]",
          barTrack: "w-full h-2.5 bg-[#282a36] rounded-full overflow-hidden border border-[#44475a]",
          barFill: "h-full bg-gradient-to-r from-[#bd93f9] to-[#8be9fd]",
          text: "text-xs font-semibold text-[#f8f8f2]"
        };
      case "modern":
      default:
        return {
          container: "p-5 bg-slate-950/50 border-b border-slate-800",
          barTrack: "w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-800",
          barFill: "h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full",
          text: "text-xs font-semibold text-slate-400"
        };
    }
  };

  const barStyles = getProgressBarStyles();

  return (
    <div className={getContainerClass()}>
      {/* Brand Header */}
      {theme === "retro" ? (
        <div className={getHeaderClass()}>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">💾 CSS_THE_GAME.EXE</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080] border text-[9px] text-black font-extrabold flex items-center justify-center">_</div>
            <div className="w-4 h-4 bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080] border text-[9px] text-black font-extrabold flex items-center justify-center">X</div>
          </div>
        </div>
      ) : (
        <div className={getHeaderClass()}>
          <div className={`p-2.5 rounded-xl border flex-shrink-0 shadow-lg ${
            theme === "dracula"
              ? "bg-[#6272a4]/20 text-[#ff79c6] border-[#ff79c6]/30 shadow-[#1e1f29]/40"
              : "bg-indigo-600/20 text-indigo-400 border-indigo-500/30 shadow-indigo-950/40"
          }`}>
            <Award size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-none">
              {theme === "dracula" ? "CSS The Game 🎮" : "CSS The Game"}
            </h1>
            <p className={`text-[10px] font-semibold tracking-widest uppercase mt-1 ${
              theme === "dracula" ? "text-[#6272a4]" : "text-slate-500"
            }`}>
              Aprenda Brincando
            </p>
          </div>
        </div>
      )}

      {/* GAME STATS BAR (XP, Streak, Hearts) */}
      <div className={`px-4 py-3 flex items-center justify-between border-b-2 gap-2 ${
        theme === "retro"
          ? "bg-[#dfdfdf] border-b-[#808080]"
          : theme === "dracula"
            ? "bg-[#1e1f29] border-b-[#44475a] text-[#f8f8f2]"
            : "bg-slate-950 border-b border-slate-800 text-slate-200"
      }`}>
        {/* XP */}
        <div className="flex items-center space-x-1" title="Seus pontos de experiência (XP)">
          <Zap size={14} className={theme === "dracula" ? "text-[#ffb86c]" : "text-yellow-400"} fill="currentColor" />
          <span className="text-xs font-bold">{xp} XP</span>
        </div>

        {/* Streak */}
        <div className="flex items-center space-x-1" title="Dias seguidos praticando">
          <Flame size={14} className={theme === "dracula" ? "text-[#ffb86c]" : "text-orange-500"} fill="currentColor" />
          <span className="text-xs font-bold">{streak} Dias</span>
        </div>

        {/* Hearts */}
        <div className="flex items-center space-x-1" title="Suas vidas / tentativas">
          <Heart size={14} className="text-rose-500" fill={hearts > 0 ? "currentColor" : "none"} />
          <span className="text-xs font-bold">{hearts}/5 Vidas</span>
        </div>

        {/* Restore Hearts / Practice trigger */}
        {hearts < 5 && (
          <button
            onClick={onOpenPractice}
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse transition ${
              theme === "retro"
                ? "bg-[#000080] text-white border border-black"
                : theme === "dracula"
                  ? "bg-[#ff79c6] text-[#282a36]"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white"
            }`}
          >
            Treinar
          </button>
        )}
      </div>

      {/* Gamified Progress Status Bar */}
      <div className={barStyles.container}>
        <div className="flex items-center justify-between mb-2">
          <span className={barStyles.text}>
            {theme === "retro" ? "PROG_STATUS" : "Progresso total"}
          </span>
          <span className={`text-xs font-bold ${
            theme === "retro" ? "text-black" : theme === "dracula" ? "text-[#bd93f9]" : "text-indigo-400"
          }`}>
            {progressPercent}%
          </span>
        </div>
        <div className={barStyles.barTrack}>
          <div
            className={`${barStyles.barFill} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={`flex justify-between items-center mt-3 text-[10px] font-semibold ${
          theme === "retro" ? "text-[#303030]" : theme === "dracula" ? "text-[#6272a4]" : "text-slate-500"
        }`}>
          <span>{completedCount} de {totalLevels} Desafios</span>
          <span className="flex items-center gap-1">
            <Flame size={12} className={theme === "dracula" ? "text-[#ffb86c] animate-bounce" : "text-orange-500 animate-bounce"} />
            {completedCount > 0 ? `${completedCount}🔥 Concluídos` : "0🔥 Começando"}
          </span>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className={`flex ${
        theme === "retro" ? "bg-[#c0c0c0] p-1 gap-1 border-b-2 border-b-[#808080]" : "bg-slate-950/30 border-b border-slate-800"
      }`}>
        <button
          id="tab-sidebar-lessons"
          onClick={() => setActiveTab("lessons")}
          className={
            theme === "retro"
              ? `flex-1 py-1.5 px-3 text-xs font-bold flex items-center justify-center space-x-2 border-2 ${
                  activeTab === "lessons"
                    ? "bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
                    : "bg-[#dfdfdf] border-transparent text-[#505050] hover:text-black"
                }`
              : `flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition ${
                  activeTab === "lessons"
                    ? theme === "dracula"
                      ? "border-[#bd93f9] text-[#bd93f9] bg-[#282a36]/40"
                      : "border-indigo-500 text-indigo-400 bg-slate-900/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`
          }
        >
          <BookOpen size={14} />
          <span>{theme === "retro" ? "DESAFIOS.INI" : "Módulos"}</span>
        </button>
        <button
          id="tab-sidebar-trophies"
          onClick={() => setActiveTab("trophies")}
          className={
            theme === "retro"
              ? `flex-1 py-1.5 px-3 text-xs font-bold flex items-center justify-center space-x-2 border-2 ${
                  activeTab === "trophies"
                    ? "bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
                    : "bg-[#dfdfdf] border-transparent text-[#505050] hover:text-black"
                }`
              : `flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition ${
                  activeTab === "trophies"
                    ? theme === "dracula"
                      ? "border-[#bd93f9] text-[#bd93f9] bg-[#282a36]/40"
                      : "border-indigo-500 text-indigo-400 bg-slate-900/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`
          }
        >
          <Trophy size={14} />
          <span>
            {theme === "retro"
              ? `CONQUIST.REG`
              : `Conquistas (${achievements.filter((a) => a.unlocked).length})`}
          </span>
        </button>
      </div>

      {/* Dynamic Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === "lessons" ? (
          <div className="space-y-4">
            {categories.map((category) => {
              const categoryLevels = levels.filter((l) => l.category === category);
              if (categoryLevels.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h3 className={`text-[11px] font-bold uppercase tracking-wider px-1 ${
                    theme === "retro" ? "text-black border-b border-black pb-1 mb-2" : theme === "dracula" ? "text-[#ff79c6]" : "text-slate-500"
                  }`}>
                    {category}
                  </h3>
                  <div className="space-y-1.5">
                    {categoryLevels.map((lvl) => {
                      const isSelected = lvl.id === currentLevelId;
                      const isCompleted = completedLevels.includes(lvl.id);

                      let btnClass = "";
                      if (theme === "retro") {
                        btnClass = `w-full text-left p-2.5 transition-all flex items-center justify-between border-2 ${
                          isSelected
                            ? "bg-[#dfdfdf] border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-black font-bold"
                            : "bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black hover:bg-[#dfdfdf]"
                        }`;
                      } else if (theme === "dracula") {
                        btnClass = `w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#bd93f9]/10 border-[#bd93f9]/40 text-[#bd93f9] shadow-inner"
                            : "bg-[#282a36]/30 hover:bg-[#282a36]/60 border-[#44475a]/50 hover:border-[#6272a4]/50 text-slate-400"
                        }`;
                      } else {
                        btnClass = `w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-indigo-600/10 border-indigo-500/40 text-slate-100 shadow-inner"
                            : "bg-slate-900/35 hover:bg-slate-800/55 border-slate-800/80 hover:border-slate-700/80 text-slate-400"
                        }`;
                      }

                      // Find the first incomplete level to mark as "next recommended"
                      const nextRecommendedId = (() => {
                        const incomplete = levels.filter(l => !completedLevels.includes(l.id));
                        return incomplete.length > 0 ? incomplete[0].id : null;
                      })();
                      const isNextRecommended = !isCompleted && !isSelected && lvl.id === nextRecommendedId;

                      return (
                        <button
                          key={lvl.id}
                          id={`btn-select-level-${lvl.id}`}
                          onClick={() => onSelectLevel(lvl.id)}
                          className={`${btnClass} ${isNextRecommended ? (theme === "dracula" ? "ring-1 ring-[#50fa7b]/40" : theme === "retro" ? "" : "ring-1 ring-emerald-500/30") : ""}`}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden mr-2">
                            {isCompleted ? (
                              <div className={theme === "dracula" ? "text-[#50fa7b]" : theme === "retro" ? "text-emerald-800 font-bold" : "text-emerald-400"}>
                                {theme === "retro" ? (
                                  <span className="text-xs">[OK]</span>
                                ) : (
                                  <CheckCircle2 size={16} fill={theme === "dracula" ? "rgba(80, 250, 123, 0.1)" : "rgba(16, 185, 129, 0.1)"} />
                                )}
                              </div>
                            ) : isNextRecommended ? (
                              <div className={`w-4 h-4 rounded-full border text-[9px] font-mono flex items-center justify-center flex-shrink-0 animate-pulse ${
                                theme === "dracula" ? "border-[#50fa7b] text-[#50fa7b]" : "border-emerald-500 text-emerald-400"
                              }`}>
                                {lvl.id}
                              </div>
                            ) : (
                              <div className={`w-4 h-4 rounded-full border text-[9px] font-mono flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? theme === "dracula" ? "border-[#bd93f9] text-[#bd93f9]" : theme === "retro" ? "border-black text-black font-bold" : "border-indigo-400 text-indigo-400"
                                  : theme === "dracula" ? "border-[#44475a] text-[#6272a4]" : "border-slate-700 text-slate-500"
                              }`}>
                                {lvl.id}
                              </div>
                            )}
                            <div className="truncate">
                              <p className={`text-xs font-semibold truncate ${
                                isSelected
                                  ? theme === "dracula" ? "text-[#f8f8f2]" : theme === "retro" ? "text-black" : "text-indigo-200"
                                  : isCompleted
                                    ? theme === "dracula" ? "text-slate-300" : "text-slate-400"
                                    : "text-slate-400"
                              }`}>
                                {lvl.id}. {lvl.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`inline-block font-bold px-1 py-0.2 rounded ${getDifficultyStyles(lvl.difficulty)}`}>
                                  {lvl.difficulty}
                                </span>
                                {isNextRecommended && theme !== "retro" && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    theme === "dracula" ? "bg-[#50fa7b]/15 text-[#50fa7b]" : "bg-emerald-500/10 text-emerald-400"
                                  }`}>
                                    ▶ Próximo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {theme !== "retro" && <ChevronRight size={14} className="opacity-40 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.map((ach) => {
              let cardClass = "";
              let iconClass = "";
              let titleClass = "";

              if (theme === "retro") {
                cardClass = `p-3 border-2 flex items-start space-x-3 ${
                  ach.unlocked
                    ? "bg-[#dfdfdf] border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black"
                    : "bg-[#b0b0b0] border-t-[#808080] border-l-[#808080] border-r-white border-b-white opacity-60 text-[#404040]"
                }`;
                iconClass = `text-2xl p-1 bg-white border border-[#808080] flex-shrink-0`;
                titleClass = `text-xs font-bold ${ach.unlocked ? "text-blue-900" : "text-[#505050]"}`;
              } else if (theme === "dracula") {
                cardClass = `p-3.5 rounded-xl border transition-all flex items-start space-x-3.5 ${
                  ach.unlocked
                    ? "bg-[#282a36] border-[#bd93f9]/40 shadow-lg shadow-[#1e1f29]"
                    : "bg-[#1e1f29]/20 border-[#44475a]/50 opacity-60"
                }`;
                iconClass = `text-2xl p-2 rounded-xl flex-shrink-0 ${
                  ach.unlocked ? "bg-[#bd93f9]/15" : "bg-[#282a36]"
                }`;
                titleClass = `text-xs font-bold leading-tight ${ach.unlocked ? "text-[#ff79c6]" : "text-[#6272a4]"}`;
              } else {
                cardClass = `p-3.5 rounded-xl border transition-all flex items-start space-x-3.5 ${
                  ach.unlocked
                    ? "bg-indigo-950/30 border-indigo-500/35 shadow-lg shadow-indigo-950/20"
                    : "bg-slate-900/20 border-slate-800/50 opacity-60"
                }`;
                iconClass = `text-2xl p-2 rounded-xl flex-shrink-0 ${
                  ach.unlocked ? "bg-indigo-500/15" : "bg-slate-850"
                }`;
                titleClass = `text-xs font-bold leading-tight ${ach.unlocked ? "text-amber-400" : "text-slate-400"}`;
              }

              return (
                <div key={ach.id} className={cardClass}>
                  <div className={iconClass}>
                    {ach.icon}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className={titleClass}>
                       {ach.title}
                    </h4>
                    <p className={`text-[10px] mt-1 leading-relaxed ${
                      theme === "retro" ? "text-black" : theme === "dracula" ? "text-[#f8f8f2]/75" : "text-slate-400"
                    }`}>
                      {ach.description}
                    </p>
                    {ach.unlocked && ach.unlockedAt && (
                      <span className={`inline-block text-[8px] font-mono border px-1 py-0.2 rounded mt-2 ${
                        theme === "retro"
                          ? "bg-white text-emerald-800 border-emerald-800"
                          : theme === "dracula"
                            ? "text-[#50fa7b]/80 bg-[#50fa7b]/5 border border-[#50fa7b]/20"
                            : "text-emerald-400/80 bg-emerald-950/30 border border-emerald-900/30"
                      }`}>
                        Conquistado em {new Date(ach.unlockedAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AUTOMATED STRESS TEST TRIGGER BUTTON (At footer of sidebar) */}
      <div className={`p-3 border-t border-b ${
        theme === "retro"
          ? "bg-[#c0c0c0] border-t-[#808080] border-b-[#808080] flex flex-col gap-1.5"
          : theme === "dracula"
            ? "bg-[#1e1f29] border-t-[#44475a] border-b-0 flex flex-col gap-2"
            : "bg-slate-950 border-t border-slate-800 flex flex-col gap-2"
      }`}>
        <button
          onClick={onTriggerStressTest}
          className={`w-full flex items-center justify-center space-x-1 px-3 py-2 text-xs font-bold transition rounded shadow-md ${
            theme === "retro"
              ? "bg-[#dfdfdf] border-2 border-t-white border-l-white border-r-black border-b-black text-black active:border-t-black active:border-l-black hover:bg-[#c0c0c0]"
              : theme === "dracula"
                ? "bg-[#bd93f9]/10 border border-[#bd93f9]/30 text-[#bd93f9] hover:bg-[#bd93f9]/20"
                : "bg-slate-900 hover:bg-slate-850 border border-slate-700 text-indigo-400"
          }`}
        >
          <Cpu size={14} className="animate-pulse" />
          <span>{theme === "retro" ? "TESTADOR.EXE" : "Estressador de CSS"}</span>
        </button>
      </div>
    </div>
  );
}

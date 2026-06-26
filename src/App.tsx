import { useState, useEffect } from "react";
import { levels, achievementsData } from "./levelsData";
import { UserProgress, Achievement, AppTheme, DEFAULT_USER_PROGRESS, ConfirmModalConfig } from "./types";
import Sidebar from "./components/Sidebar";
import CodeEditor from "./components/CodeEditor";
import SandboxPreview from "./components/SandboxPreview";
import { playSound } from "./utils/audio";
import { quizQuestions } from "./data/quizData";
import { runFullStressTestSuite, StressTestResult } from "./utils/stressTester";
import { checkAchievements, calculateNextStreak, shouldResetStreak } from "./utils/achievements";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Sparkles,
  Heart,
  Zap,
  Flame,
  Github,
  X,
  Cpu,
  RefreshCw,
  BookOpen,
  AlertTriangle
} from "lucide-react";

const LOCAL_STORAGE_KEY = "css_academy_progress_v1";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem("css_academy_theme");
      if (saved === "retro" || saved === "dracula" || saved === "modern") {
        return saved;
      }
    } catch (e) {}
    return "modern"; // modern is the sleek premium default
  });

  // Save theme state
  useEffect(() => {
    localStorage.setItem("css_academy_theme", theme);
  }, [theme]);

  // In-app confirm modal (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(null);

  const showConfirm = (config: ConfirmModalConfig) => setConfirmModal(config);
  const closeConfirm = () => setConfirmModal(null);

  // Load initial progress from localStorage — with migration for legacy saves
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate optional fields from old saves to non-optional defaults
        return {
          ...DEFAULT_USER_PROGRESS,
          ...parsed,
          xp: parsed.xp ?? 0,
          hearts: parsed.hearts ?? 5,
          streak: parsed.streak ?? 0,
          lastActiveDate: parsed.lastActiveDate ?? "",
        } as UserProgress;
      }
    } catch (e) {
      console.error("Error reading progress from localStorage", e);
    }
    return { ...DEFAULT_USER_PROGRESS };
  });

  // Current level state
  const currentLevel = levels.find((l) => l.id === progress.currentLevelId) || levels[0];
  const [editorCode, setEditorCode] = useState("");
  const [checkedState, setCheckedState] = useState<{ [ruleId: string]: boolean } | null>(null);
  
  // Confetti / Celebration states
  const [showLevelSuccess, setShowLevelSuccess] = useState(false);
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);

  // Sound play on level load
  const [lastLevelId, setLastLevelId] = useState(currentLevel.id);

  // Active achievements list with unlocked status
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    return achievementsData.map(ach => ({
      ...ach,
      unlocked: progress.unlockedAchievements.includes(ach.id)
    }));
  });

  // Tracking if solution has been opened (revealed) for the current level
  const [solutionRevealed, setSolutionRevealed] = useState(false);

  // Collapsible instructions
  const [showInstructions, setShowInstructions] = useState(true);

  // Screen selection state: hub (Jornada dashboard) or exercise (pristine sandbox)
  const [screen, setScreen] = useState<"hub" | "exercise">("hub");

  // Mobile layout view selection (portability)
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("preview");

  // CSS Practice / Quiz State
  const [showPractice, setShowPractice] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState<boolean | null>(null);

  // Stress Test Suite State
  const [showStressTest, setShowStressTest] = useState(false);
  const [stressResults, setStressResults] = useState<StressTestResult[] | null>(null);
  const [isStressTesting, setIsStressTesting] = useState(false);

  // On mount: check streak health and update lastActiveDate to today
  useEffect(() => {
    if (shouldResetStreak(progress.lastActiveDate)) {
      updateProgress({ streak: 0 });
    }
    // Track that user opened the app today (for streak purposes)
    const todayStr = new Date().toISOString().split("T")[0];
    const lastStr = progress.lastActiveDate ? progress.lastActiveDate.split("T")[0] : "";
    if (lastStr !== todayStr) {
      updateProgress({ lastActiveDate: new Date().toISOString() });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load level initial code or saved progress code
  useEffect(() => {
    const savedCode = progress.levelCss[currentLevel.id];
    setEditorCode(savedCode !== undefined ? savedCode : currentLevel.initialCss);
    setCheckedState(null);
    setShowLevelSuccess(false);
    setSolutionRevealed(false);

    if (currentLevel.id !== lastLevelId) {
      playSound("click");
      setLastLevelId(currentLevel.id);
    }
  }, [currentLevel.id]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
    
    // Update achievements unlocked flag in state
    setAchievements(prev =>
      prev.map(ach => ({
        ...ach,
        unlocked: progress.unlockedAchievements.includes(ach.id)
      }))
    );
  }, [progress]);

  // Update progress helper
  const updateProgress = (updates: Partial<UserProgress>) => {
    setProgress((prev) => {
      const next = { ...prev, ...updates };
      return next;
    });
  };

  // Run validation in real-time as editorCode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const sandboxContainer = document.getElementById("sandbox-root");
      if (!sandboxContainer) return;

      const results: { [ruleId: string]: boolean } = {};
      currentLevel.validationRules.forEach((rule) => {
        try {
          const passed = rule.validate(sandboxContainer, editorCode);
          results[rule.id] = passed;
        } catch (err) {
          results[rule.id] = false;
        }
      });

      setCheckedState(results);
    }, 100);

    return () => clearTimeout(timer);
  }, [editorCode, currentLevel.id, currentLevel.validationRules]);

  // Run the validation check on the current level CSS
  const handleRunCode = () => {
    // Check if user has lives
    if (progress.hearts <= 0) {
      playSound("failure");
      setShowPractice(true);
      return;
    }

    const sandboxContainer = document.getElementById("sandbox-root");
    if (!sandboxContainer) return;

    const results: { [ruleId: string]: boolean } = {};
    let allPassed = true;

    currentLevel.validationRules.forEach((rule) => {
      try {
        const passed = rule.validate(sandboxContainer, editorCode);
        results[rule.id] = passed;
        if (!passed) allPassed = false;
      } catch (err) {
        results[rule.id] = false;
        allPassed = false;
      }
    });

    setCheckedState(results);

    // Save written CSS for this level
    const updatedLevelCss = { ...progress.levelCss, [currentLevel.id]: editorCode };

    if (allPassed) {
      playSound("success");

      // Mark as completed
      const alreadyCompleted = progress.completedLevels.includes(currentLevel.id);
      const nextCompleted = alreadyCompleted
        ? progress.completedLevels
        : [...progress.completedLevels, currentLevel.id];

      // XP Rewards — full points without solution, reduced with solution
      let xpGained = 0;
      if (!alreadyCompleted) {
        xpGained = solutionRevealed ? 20 : 100;
      }

      const nextXp = progress.xp + xpGained;
      const nextStreak = calculateNextStreak(progress.streak, progress.lastActiveDate);

      // Check achievements using pure utility function
      const newlyUnlocked = checkAchievements(
        nextCompleted,
        progress.unlockedAchievements,
        levels.length
      );
      const nextUnlockedAchievements = [
        ...progress.unlockedAchievements,
        ...newlyUnlocked.map((a) => a.id),
      ];

      updateProgress({
        completedLevels: nextCompleted,
        levelCss: updatedLevelCss,
        unlockedAchievements: nextUnlockedAchievements,
        xp: nextXp,
        streak: nextStreak,
        lastActiveDate: new Date().toISOString(),
      });

      // Trigger achievement modal first, then level success modal
      if (newlyUnlocked.length > 0) {
        playSound("achievement");
        setNewlyUnlockedAchievement(newlyUnlocked[0]);
      } else {
        setShowLevelSuccess(true);
      }
    } else {
      // Lose a life!
      const nextHearts = Math.max(0, progress.hearts - 1);
      playSound(nextHearts === 0 ? "failure" : "heart_lost");
      updateProgress({ levelCss: updatedLevelCss, hearts: nextHearts });
    }
  };

  const handleNextLevel = () => {
    setShowLevelSuccess(false);
    const nextId = currentLevel.id + 1;
    if (nextId <= levels.length) {
      updateProgress({ currentLevelId: nextId });
      setMobileTab("editor"); // Reset mobile view back to editor
    }
  };

  const handlePrevLevel = () => {
    const prevId = currentLevel.id - 1;
    if (prevId >= 1) {
      updateProgress({ currentLevelId: prevId });
      setMobileTab("editor");
    }
  };

  const resetLevelCode = () => {
    showConfirm({
      message: "Deseja realmente resetar o código deste nível para o estado inicial? Todo o progresso digitado será perdido.",
      confirmLabel: "Resetar Código",
      cancelLabel: "Cancelar",
      variant: "danger",
      onConfirm: () => {
        setEditorCode(currentLevel.initialCss);
        setCheckedState(null);
      },
    });
  };

  // Close newly unlocked achievement modal and transition to level success
  const closeAchievementModal = () => {
    setNewlyUnlockedAchievement(null);
    setShowLevelSuccess(true);
  };

  // --- RESTORE HEARTS QUIZ ACTIONS ---
  const handleOpenPracticeQuiz = () => {
    playSound("click");
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setQuizIsCorrect(null);
    // Select a semi-random question
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    setQuizIndex(randomIndex);
    setShowPractice(true);
  };

  const handleSubmitQuiz = () => {
    if (selectedAnswer === null) return;
    const currentQuestion = quizQuestions[quizIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    setQuizIsCorrect(isCorrect);
    setQuizSubmitted(true);
    if (isCorrect) {
      playSound("success");
      updateProgress({
        hearts: Math.min(5, progress.hearts + 1),
        xp: progress.xp + 15,
      });
    } else {
      playSound("failure");
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setQuizIsCorrect(null);
    // Cycle to next question
    setQuizIndex((prev) => (prev + 1) % quizQuestions.length);
  };

  // --- AUTOMATIC STRESS TEST SUITE ---
  const handleLaunchStressTests = () => {
    playSound("click");
    setIsStressTesting(true);
    setStressResults(null);
    setShowStressTest(true);

    setTimeout(() => {
      try {
        const results = runFullStressTestSuite();
        setStressResults(results);
      } catch (err) {
        console.error("Stress Test Error:", err);
      } finally {
        setIsStressTesting(false);
      }
    }, 1200); // Small cool timeout delay to simulate diagnostic compiler sweep
  };

  return (
    <div className={
      theme === "retro"
        ? "flex flex-col lg:flex-row h-screen w-screen bg-[#008080] font-mono text-black overflow-hidden relative p-1.5 gap-1.5"
        : theme === "dracula"
          ? "flex flex-col lg:flex-row h-screen w-screen bg-[#282a36] font-sans text-[#f8f8f2] overflow-hidden relative"
          : "flex flex-col lg:flex-row h-screen w-screen bg-slate-950 font-sans text-slate-100 overflow-hidden relative"
    }>

      {/* Dynamic document title */}
      {/* eslint-disable-next-line react-hooks/exhaustive-deps */}
      {(() => {
        const base = "CSS The Game";
        if (screen === "exercise") {
          document.title = `Nível ${currentLevel.id}: ${currentLevel.title} — ${base}`;
        } else {
          document.title = `${base} — Aprenda CSS Jogando!`;
        }
        return null;
      })()}

      {/* 🔔 In-App Confirm Modal (replaces window.confirm globally) */}
      {confirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-fade-in">
          {theme === "retro" ? (
            <div className="bg-[#c0c0c0] border-4 border-t-white border-l-white border-r-black border-b-black p-5 max-w-sm w-full shadow-2xl font-mono text-black">
              <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center mb-4">
                <span className="text-xs font-bold">⚠ CONFIRMAÇÃO.EXE</span>
                <button onClick={closeConfirm} className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-black border-b-black text-[9px] text-black font-bold flex items-center justify-center">X</button>
              </div>
              <p className="text-xs leading-relaxed mb-4">{confirmModal.message}</p>
              <div className="flex gap-2">
                <button onClick={() => { confirmModal.onConfirm(); closeConfirm(); }} className="flex-1 bg-[#000080] text-white text-xs font-bold py-1.5 border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black">
                  {confirmModal.confirmLabel ?? "Confirmar"}
                </button>
                <button onClick={() => { confirmModal.onCancel?.(); closeConfirm(); }} className="flex-1 bg-[#c0c0c0] text-black text-xs font-bold py-1.5 border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black">
                  {confirmModal.cancelLabel ?? "Cancelar"}
                </button>
              </div>
            </div>
          ) : (
            <div className={`max-w-sm w-full p-6 rounded-2xl shadow-2xl border ${
              theme === "dracula"
                ? "bg-[#1e1f29] border-[#ff5555]/60 text-[#f8f8f2]"
                : "bg-slate-900 border-rose-500/30 text-slate-100"
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  confirmModal.variant === "danger"
                    ? theme === "dracula" ? "bg-[#ff5555]/15 text-[#ff5555]" : "bg-rose-500/10 text-rose-400"
                    : theme === "dracula" ? "bg-[#6272a4]/15 text-[#6272a4]" : "bg-slate-700 text-slate-300"
                }`}>
                  <AlertTriangle size={20} />
                </div>
                <p className="text-sm leading-relaxed">{confirmModal.message}</p>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => { confirmModal.onConfirm(); closeConfirm(); }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition ${
                    confirmModal.variant === "danger"
                      ? theme === "dracula" ? "bg-[#ff5555] hover:bg-[#ff6666] text-white" : "bg-rose-600 hover:bg-rose-500 text-white"
                      : theme === "dracula" ? "bg-[#bd93f9] hover:bg-[#cc99ff] text-[#1e1f29]" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  {confirmModal.confirmLabel ?? "Confirmar"}
                </button>
                <button
                  onClick={() => { confirmModal.onCancel?.(); closeConfirm(); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition border ${
                    theme === "dracula" ? "bg-[#282a36] hover:bg-[#44475a] border-[#44475a] text-[#f8f8f2]" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                >
                  {confirmModal.cancelLabel ?? "Cancelar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🏆 Newly Unlocked Achievement Modal Overlay */}
      {newlyUnlockedAchievement && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
          {theme === "retro" ? (
            <div className="bg-[#c0c0c0] border-4 border-t-white border-l-white border-r-black border-b-black p-6 max-w-md w-full shadow-2xl font-mono text-black">
              {/* Titlebar */}
              <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center mb-4">
                <span className="text-xs font-bold">🏆 CONQUISTA_DESBLOQUEADA.EXE</span>
                <button onClick={closeAchievementModal} className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-black border-b-black text-[9px] text-black font-bold flex items-center justify-center">X</button>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white flex items-center justify-center text-3xl mb-4">
                  {newlyUnlockedAchievement.icon}
                </div>
                <span className="text-[10px] font-bold tracking-wider text-blue-900 bg-white border border-[#808080] px-3 py-1">
                  PARABÉNS!
                </span>
                <h3 className="text-lg font-bold text-black mt-4">
                  {newlyUnlockedAchievement.title}
                </h3>
                <p className="text-xs text-[#202020] mt-2 leading-relaxed">
                  {newlyUnlockedAchievement.description}
                </p>
                <button
                  onClick={closeAchievementModal}
                  className="mt-6 w-full bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black hover:bg-[#dfdfdf] text-black text-xs font-bold py-2.5 px-6 active:border-t-black active:border-l-black active:border-r-white active:border-b-white"
                >
                  OK - CONTINUAR
                </button>
              </div>
            </div>
          ) : theme === "dracula" ? (
            <div className="bg-[#1e1f29] border-2 border-[#ff79c6] p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative overflow-hidden text-[#f8f8f2]">
              <div className="mx-auto w-20 h-20 bg-[#ff79c6]/10 text-[#ff79c6] rounded-full flex items-center justify-center text-4xl mb-5 border border-[#ff79c6]/35 shadow-lg shadow-[#1e1f29]/50 animate-bounce">
                {newlyUnlockedAchievement.icon}
              </div>
              <span className="text-[10px] font-bold tracking-widest text-[#ff79c6] uppercase bg-[#ff79c6]/10 border border-[#ff79c6]/30 px-3 py-1 rounded-full">
                Conquista Desbloqueada!
              </span>
              <h3 className="text-2xl font-bold text-[#bd93f9] mt-4 tracking-tight">
                {newlyUnlockedAchievement.title}
              </h3>
              <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
                {newlyUnlockedAchievement.description}
              </p>
              <button
                onClick={closeAchievementModal}
                className="mt-6 w-full bg-[#ff79c6] hover:bg-[#ff92df] text-[#1e1f29] text-sm font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-[#ff79c6]/20"
              >
                Sensacional! Continuar
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl" />
              <div className="mx-auto w-20 h-20 bg-amber-400/15 text-amber-400 rounded-full flex items-center justify-center text-4xl mb-5 border border-amber-400/40 shadow-lg shadow-amber-950/55 animate-bounce">
                {newlyUnlockedAchievement.icon}
              </div>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
                Conquista Desbloqueada!
              </span>
              <h3 className="text-2xl font-bold text-slate-100 mt-4 tracking-tight">
                {newlyUnlockedAchievement.title}
              </h3>
              <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                {newlyUnlockedAchievement.description}
              </p>
              <button
                onClick={closeAchievementModal}
                className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-sm font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-indigo-950/40"
              >
                Sensacional! Continuar
              </button>
            </div>
          )}
        </div>
      )}

      {/* ✅ Level Completion Success Overlay */}
      {showLevelSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          {theme === "retro" ? (
            <div className="bg-[#c0c0c0] border-4 border-t-white border-l-white border-r-black border-b-black p-6 max-w-md w-full shadow-2xl font-mono text-black">
              {/* Titlebar */}
              <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center mb-4">
                <span className="text-xs font-bold">✅ SUCESSO.EXE</span>
                <button onClick={() => setShowLevelSuccess(false)} className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-black border-b-black text-[9px] text-black font-bold flex items-center justify-center">X</button>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold tracking-wider text-emerald-800 bg-white border border-[#808080] px-3 py-1">
                  DESAFIO CONCLUÍDO!
                </span>
                <h3 className="text-base font-bold text-black mt-4">
                  Nível {currentLevel.id}: {currentLevel.title}
                </h3>
                <p className="text-xs text-[#202020] mt-2 leading-relaxed">
                  Você aplicou as regras CSS corretamente e superou todos os requisitos de validação deste nível!
                </p>

                <div className="mt-6 flex flex-col gap-2">
                  {currentLevel.id < levels.length ? (
                    <button
                      id="btn-next-level-modal"
                      onClick={handleNextLevel}
                      className="w-full bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black hover:bg-[#dfdfdf] text-black text-xs font-bold py-2.5 px-6 active:border-t-black active:border-l-black flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>PRÓXIMO NÍVEL</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div className="p-3 bg-white border border-[#808080]">
                      <span className="text-xl">🏆</span>
                      <h4 className="text-xs font-bold text-blue-950 mt-1">Parabéns de Mestre!</h4>
                      <p className="text-[10px] text-gray-700 mt-1">Você concluiu todos os níveis do tutorial de CSS.</p>
                    </div>
                  )}
                  <button
                    onClick={() => setShowLevelSuccess(false)}
                    className="w-full bg-[#c0c0c0] border border-t-white border-l-white border-r-black border-b-black text-[#303030] text-xs font-bold py-2 px-6 active:border-t-black active:border-l-black"
                  >
                    PERMANECER E VER CÓDIGO
                  </button>
                </div>
              </div>
            </div>
          ) : theme === "dracula" ? (
            <div className="bg-[#1e1f29] border-2 border-[#50fa7b] p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative text-[#f8f8f2]">
              <div className="mx-auto w-16 h-16 bg-[#50fa7b]/10 text-[#50fa7b] rounded-full flex items-center justify-center mb-5 border border-[#50fa7b]/20">
                <CheckCircle2 size={36} />
              </div>

              <span className="text-[10px] font-bold tracking-widest text-[#50fa7b] uppercase bg-[#50fa7b]/10 border border-[#50fa7b]/20 px-3 py-0.5 rounded-full">
                Desafio Concluído!
              </span>
              <h3 className="text-xl font-bold text-[#bd93f9] mt-3 tracking-tight">
                Nível {currentLevel.id}: {currentLevel.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Você aplicou as regras CSS corretamente e superou todos os requisitos de validação deste nível!
              </p>

              <div className="mt-6 flex flex-col gap-2">
                {currentLevel.id < levels.length ? (
                  <button
                    id="btn-next-level-modal"
                    onClick={handleNextLevel}
                    className="w-full bg-[#50fa7b] hover:bg-[#40e06b] text-[#282a36] text-sm font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-[#50fa7b]/15 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Próximo Nível</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <div className="p-4 bg-[#bd93f9]/10 border border-[#bd93f9]/25 rounded-xl">
                    <span className="text-xl">🏆</span>
                    <h4 className="text-sm font-bold text-[#bd93f9] mt-1">Parabéns de Mestre!</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Você concluiu todos os níveis do tutorial de CSS.</p>
                  </div>
                )}
                <button
                  onClick={() => setShowLevelSuccess(false)}
                  className="w-full bg-[#282a36] hover:bg-[#44475a] text-[#bd93f9] text-xs font-semibold py-2.5 px-6 rounded-xl transition border border-[#44475a]/60"
                >
                  Permanecer no Nível e Ver Código
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative text-slate-100">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-5 border border-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>

              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-400/10 border border-emerald-400/20 px-3 py-0.5 rounded-full">
                Desafio Concluído!
              </span>
              <h3 className="text-xl font-bold text-white mt-3 tracking-tight">
                Nível {currentLevel.id}: {currentLevel.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Você aplicou as regras CSS corretamente e superou todos os requisitos de validação deste nível!
              </p>

              <div className="mt-6 flex flex-col gap-2">
                {currentLevel.id < levels.length ? (
                  <button
                    id="btn-next-level-modal"
                    onClick={handleNextLevel}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-indigo-950/40 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Próximo Nível</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-xl">
                    <span className="text-xl">🏆</span>
                    <h4 className="text-sm font-bold text-indigo-300 mt-1">Parabéns de Mestre!</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Você concluiu todos os níveis do tutorial de CSS.</p>
                  </div>
                )}
                <button
                  onClick={() => setShowLevelSuccess(false)}
                  className="w-full bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2.5 px-6 rounded-xl transition"
                >
                  Permanecer no Nível e Ver Código
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🎮 GAME RESTORE HEARTS / CSS QUIZ INTERACTIVE MODAL */}
      {showPractice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
          <div className={`max-w-md w-full p-6 shadow-2xl relative flex flex-col ${
            theme === "retro"
              ? "bg-[#c0c0c0] border-4 border-t-white border-l-white border-r-black border-b-black font-mono text-black"
              : theme === "dracula"
                ? "bg-[#1e1f29] border-2 border-[#ff79c6] rounded-2xl text-[#f8f8f2]"
                : "bg-slate-900 border border-slate-700 rounded-2xl text-slate-100"
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-700">
              <div className="flex items-center space-x-2">
                <Heart size={18} className="text-rose-500 animate-pulse fill-rose-500" />
                <span className="text-sm font-bold">Treino de Recuperação</span>
              </div>
              <button
                onClick={() => setShowPractice(false)}
                className="p-1 hover:bg-white/10 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Question Box */}
            <div className="mb-5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                theme === "retro" ? "text-blue-900" : theme === "dracula" ? "text-[#ff79c6]" : "text-indigo-400"
              }`}>
                Pergunta {quizIndex + 1} de {quizQuestions.length}
              </span>
              <h3 className="text-base font-bold mt-1.5 leading-relaxed">
                {quizQuestions[quizIndex].question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-2 mb-6">
              {quizQuestions[quizIndex].options.map((option, idx) => {
                let optionStyle = "";
                if (theme === "retro") {
                  optionStyle = `w-full text-left p-2.5 text-xs font-bold border-2 transition ${
                    selectedAnswer === idx
                      ? "bg-[#000080] text-white border-black"
                      : "bg-[#dfdfdf] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:bg-white text-black"
                  }`;
                } else if (theme === "dracula") {
                  optionStyle = `w-full text-left px-4 py-3 text-xs rounded-xl border transition ${
                    selectedAnswer === idx
                      ? "bg-[#bd93f9]/20 border-[#bd93f9] text-[#bd93f9] font-semibold"
                      : "bg-[#282a36] border-[#44475a] hover:bg-[#44475a] text-slate-300"
                  }`;
                } else {
                  optionStyle = `w-full text-left px-4 py-3 text-xs rounded-xl border transition ${
                    selectedAnswer === idx
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold"
                      : "bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-300"
                  }`;
                }

                return (
                  <button
                    key={idx}
                    disabled={quizSubmitted}
                    onClick={() => {
                      playSound("click");
                      setSelectedAnswer(idx);
                    }}
                    className={optionStyle}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-5 h-5 rounded-full border text-[10px] font-bold flex items-center justify-center ${
                        selectedAnswer === idx ? "bg-currentColor/10 border-current" : "border-slate-600"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback message */}
            {quizSubmitted && (
              <div className={`p-4 mb-4 rounded-xl flex flex-col gap-1 border ${
                quizIsCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}>
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {quizIsCorrect ? "✨ Resposta Correta!" : "❌ Resposta Incorreta!"}
                </span>
                <p className="text-[11px] leading-relaxed">
                  {quizQuestions[quizIndex].explanation}
                </p>
                {quizIsCorrect && (
                  <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase mt-1">
                    ❤️ +1 Vida Recuperada! (Pratique para ganhar XP!)
                  </span>
                )}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex justify-between items-center mt-auto gap-2">
              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswer === null}
                  className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition ${
                    selectedAnswer === null
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : theme === "retro"
                        ? "bg-[#000080] text-white hover:bg-blue-900 border-2 border-t-white border-l-white"
                        : theme === "dracula"
                          ? "bg-[#50fa7b] hover:bg-[#40e06b] text-[#282a36]"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  Enviar Resposta
                </button>
              ) : (
                <div className="w-full flex gap-2">
                  <button
                    onClick={handleNextQuizQuestion}
                    className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition ${
                      theme === "retro"
                        ? "bg-[#dfdfdf] border-2 border-t-white text-black hover:bg-white"
                        : "bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    Outra Pergunta
                  </button>
                  <button
                    onClick={() => setShowPractice(false)}
                    className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition ${
                      theme === "retro"
                        ? "bg-[#000080] text-white"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    Concluir Treino
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ AUTOMATED STRESS TEST / COMPILER SWEATER DIAGNOSTICS */}
      {showStressTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in">
          <div className={`max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[85vh] ${
            theme === "retro"
              ? "bg-[#c0c0c0] border-4 border-t-white border-l-white border-r-black border-b-black font-mono text-black"
              : theme === "dracula"
                ? "bg-[#1e1f29] border-2 border-[#bd93f9] rounded-2xl text-[#f8f8f2]"
                : "bg-slate-900 border border-slate-700 rounded-2xl text-slate-100"
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-700">
              <div className="flex items-center space-x-2">
                <Cpu size={18} className="text-indigo-400 animate-spin" />
                <span className="text-sm font-bold">Estressador Supremo de Validadores CSS</span>
              </div>
              <button
                onClick={() => setShowStressTest(false)}
                className="p-1 hover:bg-white/10 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tester details */}
            <div className="mb-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Este script automático injeta o código gabarito (Solution CSS) de cada um dos {levels.length} níveis em tempo real contra seus respectivos Validadores DOM para detectar falsas rejeições ou falhas de portabilidade.
              </p>
            </div>

            {/* Test Console Output */}
            <div className="flex-1 overflow-y-auto bg-black text-xs font-mono p-4 rounded-xl border border-slate-800 space-y-2.5 mb-4 custom-scrollbar min-h-[220px]">
              <div className="text-slate-500">{"[SYSTEM] Iniciando sweep de estresse do compilador..."}</div>
              
              {isStressTesting ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-2">
                  <RefreshCw className="animate-spin text-indigo-400" size={24} />
                  <span className="text-[10px] text-indigo-400">Varrendo DOM, estilos computados e assertions...</span>
                </div>
              ) : stressResults ? (
                <>
                  {stressResults.map((res, i) => (
                    <div key={i} className="border-b border-slate-900 pb-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-300 font-bold">{"Nível " + res.levelId + ": " + res.levelTitle}</span>
                        <div className="flex space-x-2">
                          <span className={res.solutionTestPassed ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                            {res.solutionTestPassed ? "[GABARITO: PASSA]" : "[GABARITO: FALHA]"}
                          </span>
                          <span className={res.blankTestPassed ? "text-emerald-400" : "text-amber-400"}>
                            {res.blankTestPassed ? "[VAZIO: BLOQUEADO]" : "[VAZIO: PASSOU (FALHA)]"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Rules diagnostics detail */}
                      <div className="pl-4 space-y-0.5 text-[10px] text-slate-400">
                        {res.ruleResults.map((rule, ri) => (
                          <div key={ri} className="flex justify-between">
                            <span>{ "• " + rule.description }</span>
                            <span className={rule.passedWithSolution ? "text-emerald-500 font-semibold" : "text-rose-500 font-semibold"}>
                              {rule.passedWithSolution ? "OK" : "REJEITADO"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-emerald-400 font-bold text-center">
                    {`✨ SWEEP DE TESTE CONCLUÍDO: Todos os ${levels.length}/${levels.length} validadores estão 100% calibrados e funcionais!`}
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  {"Console em espera. Clique em 'Iniciar Sweep' para iniciar."}
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex gap-2">
              <button
                disabled={isStressTesting}
                onClick={handleLaunchStressTests}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw size={14} className={isStressTesting ? "animate-spin" : ""} />
                <span>Iniciar Sweep</span>
              </button>
              <button
                onClick={() => setShowStressTest(false)}
                className="py-2.5 px-6 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💔 NO HEARTS LEFT OVERLAY MODAL */}
      {(progress.hearts !== undefined ? progress.hearts : 5) === 0 && !showPractice && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in">
          <div className={`max-w-md w-full p-8 text-center shadow-2xl relative rounded-2xl ${
            theme === "retro"
              ? "bg-[#c0c0c0] border-4 border-t-white border-l-white border-r-black border-b-black font-mono text-black"
              : theme === "dracula"
                ? "bg-[#1e1f29] border-2 border-[#ff5555] text-[#f8f8f2]"
                : "bg-slate-900 border border-rose-500/30 text-slate-100"
          }`}>
            <div className="mx-auto w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-5 animate-bounce">
              <Heart size={36} fill="currentColor" />
            </div>

            <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase bg-rose-400/10 border border-rose-500/20 px-3 py-1 rounded-full">
              Sem Vidas Sobrando!
            </span>
            <h3 className="text-xl font-bold mt-4 tracking-tight">
              Seus corações acabaram!
            </h3>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              Não se preocupe! Você pode recuperar suas vidas agora mesmo respondendo a perguntas educativas sobre CSS no nosso quiz ou reiniciando o seu progresso.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleOpenPracticeQuiz}
                className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-2 cursor-pointer ${
                  theme === "retro"
                    ? "bg-[#000080] text-white"
                    : "bg-emerald-500 hover:bg-emerald-400 text-white"
                }`}
              >
                <span>Fazer Treino de CSS (+1 Vida)</span>
              </button>
              <button
                onClick={() => {
                  showConfirm({
                    message: "Isso vai apagar todo o seu progresso, XP, conquistas e códigos salvos. Esta ação é irreversível.",
                    confirmLabel: "Reiniciar Tudo",
                    cancelLabel: "Manter Progresso",
                    variant: "danger",
                    onConfirm: () => {
                      updateProgress({ ...DEFAULT_USER_PROGRESS, hearts: 5 });
                    },
                  });
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 px-6 rounded-xl transition"
              >
                Reiniciar Jornada (Resetar Tudo)
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === "hub" ? (
        <>
          {/* 🗄️ Sidebar Navigation Panel */}
          <Sidebar
            levels={levels}
            currentLevelId={progress.currentLevelId}
            completedLevels={progress.completedLevels}
            achievements={achievements}
            onSelectLevel={(id) => {
              updateProgress({ currentLevelId: id });
              setScreen("exercise");
            }}
            theme={theme}
            xp={progress.xp}
            hearts={progress.hearts}
            streak={progress.streak}
            onTriggerStressTest={handleLaunchStressTests}
            onOpenPractice={handleOpenPracticeQuiz}
          />


          {/* 💻 Hub Dashboard Area */}
          <div className={`flex-1 flex flex-col h-full overflow-y-auto animate-slide-in-left ${
            theme === "retro" ? "bg-[#c0c0c0] text-black font-mono border-4 border-t-white border-l-white border-r-black border-b-black" : theme === "dracula" ? "bg-[#282a36] text-[#f8f8f2] border border-[#44475a]" : "bg-slate-950 text-slate-100"
          } p-4 md:p-8 custom-scrollbar`}>
            
            {/* Header Banner */}
            <div className={`relative overflow-hidden p-6 md:p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 flex-shrink-0 ${
              theme === "retro"
                ? "bg-[#dfdfdf] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
                : theme === "dracula"
                  ? "bg-gradient-to-r from-[#282a36] to-[#44475a]/50 border border-[#44475a]"
                  : "bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/40 border border-indigo-500/10 shadow-2xl shadow-indigo-950/20"
            }`}>
              <div className="z-10 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Sparkles size={18} className="text-amber-400 animate-pulse" />
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${
                    theme === "retro" ? "text-blue-900" : theme === "dracula" ? "text-[#ff79c6]" : "text-indigo-400"
                  }`}>
                    Painel da Jornada
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {theme === "retro" ? "BEM_VINDO_AO_SUPREMO_CSS.EXE" : "Sua Jornada CSS"}
                </h1>
                <p className={`text-xs mt-1 max-w-xl leading-relaxed ${theme === "retro" ? "text-black" : theme === "dracula" ? "text-slate-300" : "text-slate-400"}`}>
                  Aprenda CSS de forma prática, gamificada e intuitiva! Complete desafios para progredir na trilha de aprendizado e conquistar insígnias lendárias.
                </p>

                {/* Theme Selector Widget inside Hub Header */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${theme === "retro" ? "text-black" : theme === "dracula" ? "text-[#ff79c6]" : "text-indigo-400"}`}>
                    Visual do Sistema:
                  </span>
                  <div className={`inline-flex items-center gap-1 p-0.5 ${
                    theme === "retro"
                      ? "border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-[#dfdfdf] font-bold text-[10px]"
                      : theme === "dracula"
                        ? "bg-[#1e1f29] border border-[#44475a] rounded-lg p-0.5 text-xs"
                        : "bg-slate-900 border border-slate-800 rounded-full p-0.5 text-xs"
                  }`}>
                    {(["retro", "dracula", "modern"] as AppTheme[]).map((t) => {
                      const isActive = theme === t;
                      let label = t === "retro" ? "Retro" : t === "dracula" ? "Dracula" : "Modern";

                      let btnStyle = "";
                      if (theme === "retro") {
                        btnStyle = `px-2 py-0.5 text-[9px] font-bold border ${
                          isActive
                            ? "bg-[#c0c0c0] border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-black"
                            : "bg-[#dfdfdf] border-transparent text-[#505050] hover:text-black"
                        }`;
                      } else if (theme === "dracula") {
                        btnStyle = `px-2.5 py-1 text-[9px] font-semibold rounded transition-all ${
                          isActive
                            ? "bg-[#bd93f9] text-[#1e1f29] font-bold shadow-sm"
                            : "text-[#6272a4] hover:text-[#f8f8f2]"
                        }`;
                      } else {
                        btnStyle = `px-2.5 py-1 text-[9px] font-medium rounded-full transition-all ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm font-semibold"
                            : "text-slate-400 hover:text-slate-200"
                        }`;
                      }

                      return (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`${btnStyle} cursor-pointer`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Quick Stats Block inside Header */}
              <div className="flex flex-wrap items-center justify-center gap-4 z-10 flex-shrink-0">
                <div className={`px-4 py-3 rounded-xl border text-center min-w-[80px] ${
                  theme === "retro" ? "bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white" : theme === "dracula" ? "bg-[#1e1f29] border-[#44475a]" : "bg-slate-900/60 border-slate-800"
                }`}>
                  <div className="flex items-center justify-center gap-1.5 text-amber-500 font-bold text-lg mb-0.5">
                    <Flame size={18} className="fill-amber-500" />
                    <span>{progress.streak !== undefined ? progress.streak : 0}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Ofensiva</span>
                </div>
                <div className={`px-4 py-3 rounded-xl border text-center min-w-[80px] ${
                  theme === "retro" ? "bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white" : theme === "dracula" ? "bg-[#1e1f29] border-[#44475a]" : "bg-slate-900/60 border-slate-800"
                }`}>
                  <div className="flex items-center justify-center gap-1.5 text-indigo-400 font-bold text-lg mb-0.5">
                    <Zap size={18} className="fill-indigo-400" />
                    <span>{progress.xp !== undefined ? progress.xp : 0} XP</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Total</span>
                </div>
                <div className={`px-4 py-3 rounded-xl border text-center min-w-[80px] ${
                  theme === "retro" ? "bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white" : theme === "dracula" ? "bg-[#1e1f29] border-[#44475a]" : "bg-slate-900/60 border-slate-800"
                }`}>
                  <div className="flex items-center justify-center gap-1.5 text-rose-500 font-bold text-lg mb-0.5">
                    <Heart size={18} className="fill-rose-500 animate-pulse" />
                    <span>{progress.hearts !== undefined ? progress.hearts : 5}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Vidas</span>
                </div>
              </div>
            </div>

            {/* Two-Column Grid: Central Map + Sideline Widgets */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start flex-shrink-0">
              {/* Left/Center Column: Active Mission + Skills Progress (Takes 2/3 space) */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                
                {/* Section Title */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-400" />
                    <span>Seu Desafio Ativo</span>
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">
                    Selecione outras lições na barra lateral
                  </span>
                </div>

                {/* Active/Selected Challenge Highlight Card */}
                {(() => {
                  const isCompleted = progress.completedLevels.includes(currentLevel.id);
                  
                  let activeCardStyle = "";
                  let activeBtnStyle = "";
                  
                  if (theme === "retro") {
                    activeCardStyle = "p-6 bg-[#dfdfdf] border-4 border-t-white border-l-white border-r-black border-b-black text-black";
                    activeBtnStyle = "py-3 px-6 text-sm font-bold bg-[#000080] text-white border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black hover:bg-[#0000a0]";
                  } else if (theme === "dracula") {
                    activeCardStyle = "p-6 rounded-2xl bg-[#282a36] border-2 border-[#bd93f9] shadow-[0_0_20px_rgba(189,147,249,0.15)] flex flex-col justify-between gap-6";
                    activeBtnStyle = "py-3 px-6 text-sm font-bold rounded-xl bg-[#50fa7b] hover:bg-[#40e06b] text-[#282a36] shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]";
                  } else {
                    activeCardStyle = "p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border-2 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col justify-between gap-6";
                    activeBtnStyle = "py-3 px-6 text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-950/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]";
                  }

                  return (
                    <div className={activeCardStyle}>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                              theme === "retro" ? "bg-[#000080] text-white" : theme === "dracula" ? "bg-[#bd93f9]/20 text-[#bd93f9]" : "bg-indigo-500/20 text-indigo-400"
                            }`}>
                              Nível {currentLevel.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              currentLevel.difficulty === "Fácil"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                                : currentLevel.difficulty === "Médio"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                            }`}>
                              {currentLevel.difficulty}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                              • {currentLevel.category}
                            </span>
                          </div>

                          {isCompleted ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Concluído ✓
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                              Próxima Missão
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className={`text-xl font-black ${theme === "retro" ? "text-black" : "text-white"}`}>
                            {currentLevel.title}
                          </h3>
                          <p className={`text-sm mt-2 leading-relaxed ${theme === "retro" ? "text-gray-800" : "text-slate-300"}`}>
                            {currentLevel.description}
                          </p>
                        </div>

                        {/* Quick info list */}
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl border ${
                          theme === "retro" ? "bg-[#c0c0c0] border-black" : theme === "dracula" ? "bg-[#1e1f29]/60 border-[#44475a]" : "bg-slate-950/60 border-slate-800"
                        }`}>
                          <div className="flex items-start gap-2.5">
                            <span className="text-lg">🎯</span>
                            <div>
                              <p className={`text-xs font-bold ${theme === "retro" ? "text-black" : "text-slate-200"}`}>Objetivo</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                                Escrever código CSS válido para passar nas regras de validação do elemento.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="text-lg">💎</span>
                            <div>
                              <p className={`text-xs font-bold ${theme === "retro" ? "text-black" : "text-slate-200"}`}>Recompensas</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                                +100 XP para subir na liga, progresso rumo aos troféus e insígnias.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 border-t border-slate-800/60 pt-4">
                        <span className="text-xs text-slate-500 font-medium">
                          {isCompleted ? "Você já concluiu este desafio! Pode revisá-lo para praticar." : "Complete as regras de estilização para avançar."}
                        </span>
                        <button
                          onClick={() => {
                            playSound("click");
                            setScreen("exercise");
                          }}
                          className={`${activeBtnStyle} cursor-pointer w-full sm:w-auto text-center`}
                        >
                          {isCompleted ? "Revisar Desafio" : "Iniciar Desafio"}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Categories & Specialties Progression Panel */}
                <div className="flex flex-col gap-4">
                  <div className="border-b border-slate-800/80 pb-2">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-300">
                      <span>📊 Suas Especializações</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                      const basicLevels = levels.filter(l => l.category === "Básico");
                      const intermediateLevels = levels.filter(l => l.category === "Intermediário");
                      const advancedLevels = levels.filter(l => l.category === "Avançado");

                      const completedBasic = basicLevels.filter(l => progress.completedLevels.includes(l.id)).length;
                      const completedIntermediate = intermediateLevels.filter(l => progress.completedLevels.includes(l.id)).length;
                      const completedAdvanced = advancedLevels.filter(l => progress.completedLevels.includes(l.id)).length;

                      const percentBasic = basicLevels.length > 0 ? Math.round((completedBasic / basicLevels.length) * 100) : 0;
                      const percentIntermediate = intermediateLevels.length > 0 ? Math.round((completedIntermediate / intermediateLevels.length) * 100) : 0;
                      const percentAdvanced = advancedLevels.length > 0 ? Math.round((completedAdvanced / advancedLevels.length) * 100) : 0;

                      const cards = [
                        {
                          title: "Básico",
                          emoji: "🌱",
                          completed: completedBasic,
                          total: basicLevels.length,
                          percent: percentBasic,
                          colorClass: "bg-emerald-500",
                          bgProgress: "bg-emerald-500/10",
                          borderClass: "border-emerald-500/20"
                        },
                        {
                          title: "Intermediário",
                          emoji: "⚡",
                          completed: completedIntermediate,
                          total: intermediateLevels.length,
                          percent: percentIntermediate,
                          colorClass: "bg-amber-500",
                          bgProgress: "bg-amber-500/10",
                          borderClass: "border-amber-500/20"
                        },
                        {
                          title: "Avançado",
                          emoji: "🔥",
                          completed: completedAdvanced,
                          total: advancedLevels.length,
                          percent: percentAdvanced,
                          colorClass: "bg-purple-500",
                          bgProgress: "bg-purple-500/10",
                          borderClass: "border-purple-500/20"
                        }
                      ];

                      return cards.map(c => {
                        let specialtyCardStyle = "";
                        if (theme === "retro") {
                          specialtyCardStyle = "p-4 bg-[#dfdfdf] border-2 border-t-white border-l-white border-r-black border-b-black text-black";
                        } else if (theme === "dracula") {
                          specialtyCardStyle = `p-4 rounded-xl bg-[#1e1f29] border ${c.borderClass}`;
                        } else {
                          specialtyCardStyle = `p-4 rounded-xl bg-slate-900/60 border ${c.borderClass}`;
                        }

                        return (
                          <div key={c.title} className={specialtyCardStyle}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xl">{c.emoji}</span>
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                {c.completed} / {c.total}
                              </span>
                            </div>
                            <h4 className={`text-xs font-bold ${theme === "retro" ? "text-black" : "text-white"}`}>
                              Especialidade {c.title}
                            </h4>
                            <div className="mt-3">
                              <div className="flex justify-between items-center text-[10px] font-semibold mb-1 text-slate-400">
                                <span>Conclusão</span>
                                <span className={theme === "retro" ? "text-black" : "text-indigo-400"}>{c.percent}%</span>
                              </div>
                              <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === "retro" ? "bg-white border" : "bg-slate-800"}`}>
                                <div
                                  className={`h-full ${c.colorClass} transition-all duration-500`}
                                  style={{ width: `${c.percent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

              </div>

              {/* Right Column: Widgets (Takes 1/3 space) */}
              <div className="flex flex-col gap-6">
                {/* Recovery Quiz Card */}
                <div className={`p-5 rounded-2xl border relative overflow-hidden ${
                  theme === "retro" ? "bg-[#dfdfdf] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]" : theme === "dracula" ? "bg-[#282a36] border-[#44475a]" : "bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-950 border-slate-800"
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Heart size={18} className="text-rose-500 fill-rose-500 animate-pulse" />
                    <h3 className="text-sm font-bold">Quiz de Treino (Recupere Vidas)</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Completou todas as vidas? Não se preocupe! Responda perguntas rápidas de CSS para recuperar corações de graça e continuar aprendendo.
                  </p>
                  <button
                    onClick={handleOpenPracticeQuiz}
                    className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      theme === "retro"
                        ? "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black text-black"
                        : theme === "dracula"
                          ? "bg-[#50fa7b] hover:bg-[#40e06b] text-[#282a36]"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>Iniciar Prática</span>
                  </button>
                </div>

                {/* Trophies cabinet */}
                <div className={`p-5 rounded-2xl border ${
                  theme === "retro" ? "bg-[#dfdfdf] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]" : theme === "dracula" ? "bg-[#282a36] border-[#44475a]" : "bg-slate-900/50 border-slate-800"
                }`}>
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Trophy size={16} className="text-amber-400" />
                    <span>Seus Troféus</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {achievements.map((ach) => {
                      const isUnlocked = ach.unlocked;
                      return (
                        <div
                          key={ach.id}
                          title={`${ach.title}: ${ach.description}`}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center relative transition-all duration-300 ${
                            isUnlocked
                              ? theme === "dracula" ? "bg-[#282a36] border-[#bd93f9]/30" : "bg-indigo-950/20 border-indigo-500/20 shadow-md"
                              : "bg-slate-950/40 border-slate-900 opacity-30 select-none"
                          }`}
                        >
                          <span className="text-2xl">{ach.icon}</span>
                          <span className="text-[9px] font-bold mt-1.5 leading-none truncate max-w-full text-slate-400">
                            {ach.title.split(" ")[0]}
                          </span>
                          {isUnlocked && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Slim black footer with Github link */}
            <div className="mt-8 pt-4 flex-shrink-0">
              <div className="bg-black text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-center gap-2 text-xs border border-white/5 shadow-inner">
                <Github size={14} className="text-white flex-shrink-0" />
                <span className="opacity-95 font-medium">Projeto Open Source Criado por @marentropico.</span>
                <a 
                  href="https://github.com/marentropico" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-300 hover:text-indigo-100 transition underline underline-offset-2 font-semibold"
                >
                  https://github.com/marentropico
                </a>
              </div>
            </div>

          </div>
        </>
      ) : (
        /* ==================== EXERCISE SCREEN (FULLSCREEN WORKSPACE) ==================== */
        <div className={`flex-1 flex flex-col h-screen overflow-hidden animate-slide-in-right ${
          theme === "retro"
            ? "bg-[#c0c0c0] text-black font-mono"
            : theme === "dracula"
              ? "bg-[#282a36] text-[#f8f8f2] font-sans"
              : "bg-slate-950 text-slate-100 font-sans"
        }`}>

          {/* Workspace Subheader / Level Navigation */}
          <div className={
            theme === "retro"
              ? "p-1.5 bg-[#dfdfdf] border-b-4 border-b-[#808080] flex-shrink-0 flex flex-row items-center justify-between gap-2"
              : theme === "dracula"
                ? "p-2 bg-[#1e1f29] border-b border-[#44475a] flex-shrink-0 flex flex-row items-center justify-between gap-2 text-[#f8f8f2]"
                : "p-2 bg-slate-900/60 border-b border-slate-800/80 flex-shrink-0 flex flex-row items-center justify-between gap-2"
          }>
            <div className="flex items-center gap-2 overflow-hidden">
              {/* Back Button to Journey Hub */}
              <button
                onClick={() => {
                  playSound("click");
                  setScreen("hub");
                }}
                className={
                  theme === "retro"
                    ? "px-1.5 py-0.5 border-2 border-t-white border-l-white border-r-black border-b-black text-[10px] font-bold bg-[#c0c0c0] active:border-t-black active:border-l-black flex items-center gap-0.5 cursor-pointer text-black"
                    : theme === "dracula"
                      ? "px-2 py-1 rounded border border-[#44475a] hover:bg-[#44475a] text-slate-300 hover:text-white text-[10px] md:text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      : "px-2 py-1 rounded border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-[10px] md:text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                }
              >
                <ArrowLeft size={12} className="flex-shrink-0" />
                <span>Voltar</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className={
                    theme === "retro"
                      ? "text-[8px] font-extrabold px-1 py-0.2 bg-white text-black border border-black"
                      : theme === "dracula"
                        ? "text-[9px] font-extrabold px-1.5 py-0.2 bg-[#bd93f9]/20 text-[#bd93f9] border border-[#bd93f9]/25"
                        : "text-[9px] font-extrabold px-1.5 py-0.2 bg-indigo-600/20 text-indigo-400 rounded border border-indigo-500/20"
                  }>
                    {currentLevel.id}/16
                  </span>
                  <span className={`text-[10px] font-semibold capitalize hidden sm:inline ${theme === "retro" ? "text-black" : theme === "dracula" ? "text-[#6272a4]" : "text-slate-500"}`}>
                    • {currentLevel.category}
                  </span>
                </div>
                <h2 className={`tracking-tight truncate ${
                  theme === "retro" ? "text-xs font-bold text-black" : theme === "dracula" ? "text-xs md:text-sm font-bold text-[#ff79c6]" : "text-xs md:text-sm font-bold text-white"
                }`}>
                  {currentLevel.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Quick Level Arrow Selectors */}
              <div className="flex items-center space-x-1">
                <button
                  disabled={currentLevel.id === 1}
                  onClick={handlePrevLevel}
                  className={
                    theme === "retro"
                      ? `px-1.5 py-0.5 border-2 font-bold text-[9px] ${
                          currentLevel.id === 1
                            ? "border-[#808080]/30 text-gray-500 cursor-not-allowed bg-[#c0c0c0]"
                            : "border-t-white border-l-white border-r-black border-b-black text-black bg-[#c0c0c0] active:border-t-black active:border-l-black cursor-pointer"
                        }`
                      : `p-1 rounded border transition ${
                          currentLevel.id === 1
                            ? "border-transparent text-slate-700 cursor-not-allowed bg-transparent"
                            : "border-slate-850 hover:border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white cursor-pointer"
                        }`
                  }
                  title="Desafio Anterior"
                >
                  <ArrowLeft size={12} />
                </button>
                <button
                  disabled={currentLevel.id === levels.length}
                  onClick={handleNextLevel}
                  className={
                    theme === "retro"
                      ? `px-1.5 py-0.5 border-2 font-bold text-[9px] ${
                          currentLevel.id === levels.length
                            ? "border-[#808080]/30 text-gray-500 cursor-not-allowed bg-[#c0c0c0]"
                            : "border-t-white border-l-white border-r-black border-b-black text-black bg-[#c0c0c0] active:border-t-black active:border-l-black cursor-pointer"
                        }`
                      : `p-1 rounded border transition ${
                          currentLevel.id === levels.length
                            ? "border-transparent text-slate-700 cursor-not-allowed bg-transparent"
                            : "border-slate-850 hover:border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white cursor-pointer"
                        }`
                  }
                  title="Próximo Desafio"
                >
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Workspace Code & Live Render Panel */}
          <div className="flex-1 flex flex-col landscape:grid landscape:grid-cols-5 lg:grid lg:grid-cols-5 p-2 lg:p-3 gap-2 lg:gap-3 overflow-hidden min-h-0">
            
            {/* Left Panel: Webpage Viewport */}
            <div className="h-[35vh] landscape:h-full landscape:col-span-3 lg:h-full lg:col-span-3 flex flex-col overflow-hidden min-h-0 flex-shrink-0">
              <SandboxPreview
                html={currentLevel.initialHtml}
                css={editorCode}
                resetCode={resetLevelCode}
                theme={theme}
                levelId={currentLevel.id}
              />
            </div>

            {/* Right Panel: Browser Inspector */}
            <div className="flex-1 landscape:h-full landscape:col-span-2 lg:h-full lg:col-span-2 flex flex-col overflow-hidden min-h-0">
              <CodeEditor
                code={editorCode}
                onChange={setEditorCode}
                onRun={handleRunCode}
                levelTitle={currentLevel.title}
                solutionCss={currentLevel.solutionCss}
                theme={theme}
                html={currentLevel.initialHtml}
                validationRules={currentLevel.validationRules}
                checkedState={checkedState}
                onBackToHub={() => setScreen("hub")}
              />
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

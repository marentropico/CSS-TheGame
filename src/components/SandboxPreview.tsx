import { useState, useEffect, useRef } from "react";
import { RefreshCw, Lock, ArrowLeft, ArrowRight, ShieldCheck, Terminal } from "lucide-react";
import { AppTheme } from "../types";

interface SandboxPreviewProps {
  html: string;
  css: string;
  resetCode: () => void;
  theme: AppTheme;
  levelId?: number; // Optional level ID to display in mock browser URL bar
}

export default function SandboxPreview({
  html,
  css,
  resetCode,
  theme,
  levelId = 1
}: SandboxPreviewProps) {
  const sandboxRef = useRef<HTMLDivElement>(null);
  const [scopedCss, setScopedCss] = useState("");

  // Scope CSS to only affect the sandbox container
  useEffect(() => {
    const scopeCSS = (rawCss: string, rootId: string): string => {
      let cleaned = rawCss.replace(/\/\*[\s\S]*?\*\//g, ""); // Strip comments
      let result = "";
      let i = 0;
      
      while (i < cleaned.length) {
        const nextBrace = cleaned.indexOf("{", i);
        if (nextBrace === -1) {
          result += cleaned.substring(i);
          break;
        }
        
        const selectorSection = cleaned.substring(i, nextBrace).trim();
        
        // Find the matching '}' for this block, tracking nested braces
        let depth = 1;
        let j = nextBrace + 1;
        while (j < cleaned.length && depth > 0) {
          if (cleaned[j] === "{") {
            depth++;
          } else if (cleaned[j] === "}") {
            depth--;
          }
          j++;
        }
        
        const blockContent = cleaned.substring(nextBrace, j);
        
        if (selectorSection.startsWith("@keyframes") || selectorSection.startsWith("@-webkit-keyframes")) {
          // Do not scope selectors inside @keyframes
          result += selectorSection + " " + blockContent + "\n";
        } else if (selectorSection.startsWith("@media") || selectorSection.startsWith("@supports")) {
          // Recursively scope the rules inside media or supports query
          const innerContent = blockContent.substring(1, blockContent.length - 1);
          const scopedInner = scopeCSS(innerContent, rootId);
          result += selectorSection + " {\n" + scopedInner + "\n}\n";
        } else if (selectorSection.startsWith("@")) {
          // Other at-rules
          result += selectorSection + " " + blockContent + "\n";
        } else if (selectorSection) {
          // Standard selectors - scope them to the sandbox container
          const scopedSelectors = selectorSection
            .split(",")
            .map(sel => {
              const trimmed = sel.trim();
              if (!trimmed) return "";
              return `#${rootId} ${trimmed}`;
            })
            .filter(Boolean)
            .join(", ");
          result += scopedSelectors + " " + blockContent + "\n";
        } else {
          result += blockContent + "\n";
        }
        
        i = j;
      }
      return result;
    };

    setScopedCss(scopeCSS(css, "sandbox-root"));
  }, [css]);

  // Theme-specific UI styles
  const getContainerClass = () => {
    switch (theme) {
      case "retro":
        return "flex flex-col h-full bg-[#dfdfdf] border-4 border-t-white border-l-white border-r-black border-b-black text-black font-mono shadow-md overflow-hidden";
      case "dracula":
        return "flex flex-col h-full bg-[#282a36] border border-[#44475a] rounded-xl overflow-hidden shadow-2xl text-[#f8f8f2] font-mono";
      case "modern":
      default:
        return "flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl";
    }
  };

  const getBrowserBarClass = () => {
    switch (theme) {
      case "retro":
        return "flex flex-col gap-1 px-2 py-1.5 bg-[#dfdfdf] border-b-2 border-b-[#808080] text-black text-xs";
      case "dracula":
        return "flex flex-col gap-2 px-4 py-3 bg-[#1e1f29] border-b border-[#44475a] text-slate-300";
      case "modern":
      default:
        return "flex flex-col gap-2 px-4 py-3 bg-slate-950 border-b border-slate-800 text-slate-300";
    }
  };

  const getUrlBarClass = () => {
    switch (theme) {
      case "retro":
        return "flex-1 flex items-center px-2 py-0.5 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-xs text-black";
      case "dracula":
        return "flex-1 flex items-center px-3 py-1.5 bg-[#282a36] border border-[#44475a] rounded-lg text-xs font-mono text-slate-300 gap-1.5";
      case "modern":
      default:
        return "flex-1 flex items-center px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 gap-1.5";
    }
  };

  const getSandboxWindowBg = () => {
    return "flex-1 bg-white relative overflow-auto min-h-[140px] lg:min-h-[250px] w-full";
  };

  const getSandboxContainerStyles = () => {
    return "w-full h-full text-black font-serif text-base text-left p-6";
  };

  const handleResetClick = () => {
    if (window.confirm("Deseja realmente reiniciar o código deste nível para os estilos padrão?")) {
      resetCode();
    }
  };

  return (
    <div className={getContainerClass()}>
      {/* Scoped Dynamic Stylesheet */}
      <style>{scopedCss}</style>

      {/* Mock Browser Header (The Chrome Viewport Frame) */}
      <div className={getBrowserBarClass()}>
        {/* Top Control Bar: Window controls + Title */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {theme === "retro" ? (
              <span className="text-xs font-bold text-black select-none">🌐 RETRO_NAVIGATOR.EXE</span>
            ) : (
              <div className="flex space-x-1.5 select-none">
                <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
              </div>
            )}
            
            {theme !== "retro" && (
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 ml-2 select-none">
                Navegador de Desafio
              </span>
            )}
          </div>
          
          {/* Label indicating this is the webpage under test */}
          <div className="flex items-center gap-1.5 opacity-70">
            {theme === "retro" ? (
              <span className="text-[10px] font-bold bg-black text-white px-1 py-0.2">PAGINA_WEB</span>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[10px] font-semibold">
                <ShieldCheck size={11} />
                <span>Webpage Canvas</span>
              </div>
            )}
          </div>
        </div>

        {/* Browser Navigation bar: Arrows + Address + Reload */}
        <div className="flex items-center gap-2 mt-1.5 w-full">
          {/* Back & Forward Arrow buttons (mocked for aesthetics) */}
          <div className="flex items-center gap-1 flex-shrink-0 opacity-60">
            <button className={`p-1 rounded hover:bg-white/10 ${theme === "retro" ? "border bg-[#c0c0c0]" : ""}`} disabled>
              <ArrowLeft size={14} />
            </button>
            <button className={`p-1 rounded hover:bg-white/10 ${theme === "retro" ? "border bg-[#c0c0c0]" : ""}`} disabled>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Immersive URL Address bar */}
          <div className={getUrlBarClass()}>
            <Lock size={12} className="text-emerald-500 flex-shrink-0" />
            <span className="opacity-40 select-none">https://</span>
            <span className="font-semibold select-all truncate">
              {theme === "retro" ? "CSS_THE_GAME.ORG" : "css-the-game.edu"}/desafio/{levelId}
            </span>
          </div>

          {/* Restore / Restart code button styled as browser Reload / Refresh! */}
          <button
            id="btn-browser-reload"
            onClick={handleResetClick}
            title="Reiniciar código (Reload styles)"
            className={
              theme === "retro"
                ? "p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black text-black active:border-t-black active:border-l-black flex items-center justify-center cursor-pointer"
                : "p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer"
            }
          >
            <RefreshCw size={14} className="hover:rotate-180 transition duration-300" />
          </button>
        </div>
      </div>

      {/* Main Page Viewport Container */}
      <div className={getSandboxWindowBg()}>
        {/* The visual page layout containing the target box */}
        <div className={getSandboxContainerStyles()}>
          
          {/* Live Render DOM root container */}
          <div
            id="sandbox-root"
            ref={sandboxRef}
            className="w-full relative"
            dangerouslySetInnerHTML={{ __html: html }}
          />

        </div>

        {/* Floating inspect coordinates badge mimicking standard browser Inspect Element hover! */}
        <div className={`absolute bottom-3 left-3 px-2 py-1 rounded font-mono text-[9px] select-none flex items-center gap-1 ${
          theme === "retro"
            ? "bg-black text-white border"
            : theme === "dracula"
              ? "bg-[#1e1f29] text-[#8be9fd] border border-[#44475a]/80"
              : "bg-slate-950 text-sky-400 border border-slate-800"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            theme === "dracula" ? "bg-[#8be9fd]" : "bg-sky-400"
          }`} />
          <span>Inspect: #sandbox-root</span>
        </div>
      </div>
    </div>
  );
}

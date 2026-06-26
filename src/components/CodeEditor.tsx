import { useState, useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle, Info, Sparkles, Code, FileText, Check, X, Terminal, Palette, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { AppTheme, ValidationRule } from "../types";
import { cssDictionary } from "../utils/cssDictionary";

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onRun: () => void;
  levelTitle: string;
  solutionCss: string;
  theme: AppTheme;
  html: string;
  validationRules: ValidationRule[];
  checkedState: { [ruleId: string]: boolean } | null;
  onBackToHub?: () => void;
}

export default function CodeEditor({
  code,
  onChange,
  onRun,
  levelTitle,
  solutionCss,
  theme,
  html,
  validationRules,
  checkedState,
  onBackToHub
}: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState<"styles" | "elements">("styles");
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);

  useEffect(() => {
    // Collapse by default on mobile screens
    if (window.innerWidth < 768) {
      setIsConsoleExpanded(false);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const allAuditsPassed = checkedState !== null && validationRules.every((rule) => checkedState[rule.id] === true);

  // Assisted code writing states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionCoords, setSuggestionCoords] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTrigger, setActiveTrigger] = useState<"property" | "value">("property");
  const [activePropertyOnLine, setActivePropertyOnLine] = useState<string>("");
  const [activeLineNumber, setActiveLineNumber] = useState<number>(1);
  const [showDocAssistant, setShowDocAssistant] = useState(true);
  const [hoveredProperty, setHoveredProperty] = useState<string>("");
  const hoverTimeoutRef = useRef<any>(null);

  const handleMouseEnterProperty = (prop: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredProperty(prop);
      setShowDocAssistant(true);
    }, 1000);
  };

  const handleMouseLeaveProperty = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const getDetectedProperties = () => {
    const detected = new Set<string>();
    
    if (solutionCss) {
      Object.keys(cssDictionary).forEach((prop) => {
        const regex = new RegExp(`\\b${prop}\\b`);
        if (regex.test(solutionCss)) {
          detected.add(prop);
        }
      });
    }

    if (code) {
      Object.keys(cssDictionary).forEach((prop) => {
        const regex = new RegExp(`\\b${prop}\\b`);
        if (regex.test(code)) {
          detected.add(prop);
        }
      });
    }

    return Array.from(detected);
  };

  const isColorProperty = (prop: string) => {
    if (!prop) return false;
    const l = prop.toLowerCase();
    return l.includes("color") || l === "background" || l === "border" || l === "shadow" || l === "outline";
  };

  const handleColorPick = (colorHex: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const value = code;
    
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    const linesList = beforeCursor.split("\n");
    const currentLineIndex = linesList.length - 1;
    const currentLine = linesList[currentLineIndex];
    
    // Detect if there is a colon on this line
    const colonIdx = currentLine.indexOf(":");
    if (colonIdx !== -1) {
      const beforeColon = currentLine.substring(0, colonIdx + 1);
      const afterColon = currentLine.substring(colonIdx + 1);
      
      const hasSemicolon = afterColon.includes(";");
      const suffix = hasSemicolon ? ";" : "";
      const spacePrefix = afterColon.startsWith(" ") ? " " : "";
      
      const newLineText = beforeColon + spacePrefix + colorHex + suffix;
      
      const allLines = value.split("\n");
      allLines[currentLineIndex] = newLineText;
      const newCode = allLines.join("\n");
      
      onChange(newCode);
      
      const linesBeforeLength = allLines.slice(0, currentLineIndex).join("\n").length + (currentLineIndex > 0 ? 1 : 0);
      const newCursorPos = linesBeforeLength + beforeColon.length + spacePrefix.length + colorHex.length;
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursorPos;
          updateCursorContext(newCode, newCursorPos);
        }
      }, 0);
    } else {
      const newText = beforeCursor + colorHex + afterCursor;
      onChange(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + colorHex.length;
          updateCursorContext(newText, start + colorHex.length);
        }
      }, 0);
    }
  };

  const handleInsertExample = (exampleText: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const value = code;
    
    const beforeCursor = value.substring(0, start);
    const linesList = beforeCursor.split("\n");
    const currentLineIndex = linesList.length - 1;
    
    // Replace the current line with indented example
    const newLineText = "  " + exampleText;
    
    const allLines = value.split("\n");
    allLines[currentLineIndex] = newLineText;
    const newCode = allLines.join("\n");
    
    onChange(newCode);
    
    const linesBeforeLength = allLines.slice(0, currentLineIndex).join("\n").length + (currentLineIndex > 0 ? 1 : 0);
    const newCursorPos = linesBeforeLength + newLineText.length;
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursorPos;
        updateCursorContext(newCode, newCursorPos);
      }
    }, 0);
  };

  const updateCursorContext = (text: string, selectionStart: number) => {
    if (!textareaRef.current) return;
    
    const beforeCursor = text.substring(0, selectionStart);
    const linesList = beforeCursor.split("\n");
    const currentLineIndex = linesList.length - 1;
    setActiveLineNumber(currentLineIndex + 1);

    const currentLine = linesList[currentLineIndex] || "";
    
    const colonIdx = currentLine.indexOf(":");
    let activeProp = "";
    if (colonIdx !== -1) {
      const match = currentLine.substring(0, colonIdx).trim().match(/[a-zA-Z-]+$/);
      if (match) {
        activeProp = match[0];
      }
    } else {
      const match = currentLine.trim().match(/[a-zA-Z-]+$/);
      if (match) {
        activeProp = match[0];
      }
    }
    setActivePropertyOnLine(activeProp);

    handleTextareaInputOrSelect(text, selectionStart);
  };

  const handleTextareaInputOrSelect = (text: string, selectionStart: number) => {
    if (!textareaRef.current) return;
    
    const beforeCursor = text.substring(0, selectionStart);
    const currentLine = beforeCursor.split("\n").pop() || "";
    
    const openBracesBefore = (beforeCursor.match(/{/g) || []).length;
    const closeBracesBefore = (beforeCursor.match(/}/g) || []).length;
    const isInsideRules = openBracesBefore > closeBracesBefore;
    
    if (!isInsideRules) {
      setShowSuggestions(false);
      return;
    }

    // Never show suggestions if there's a semicolon on the current line before the cursor
    if (currentLine.includes(";")) {
      setShowSuggestions(false);
      return;
    }

    const colonIndex = currentLine.indexOf(":");
    const isTypingValue = colonIndex !== -1 && selectionStart > (beforeCursor.length - currentLine.length + colonIndex);
    
    let query = "";
    let triggerType: "property" | "value" = "property";
    let filtered: string[] = [];

    if (isTypingValue) {
      triggerType = "value";
      const valueMatch = beforeCursor.match(/[a-zA-Z0-9-()#]*$/);
      query = valueMatch ? valueMatch[0] : "";

      const beforeColon = currentLine.substring(0, colonIndex).trim();
      const propertyNameMatch = beforeColon.match(/[a-zA-Z-]+$/);
      const propertyName = propertyNameMatch ? propertyNameMatch[0] : "";

      let valuePool = [
        "center", "flex-start", "flex-end", "space-between", "space-around", "space-evenly", "stretch", "baseline",
        "row", "column", "row-reverse", "column-reverse", "flex", "grid", "block", "inline-block", "none",
        "absolute", "relative", "fixed", "sticky", "bold", "normal", "transparent", "solid", "dashed", "dotted"
      ];

      if (propertyName === "display") {
        valuePool = ["flex", "grid", "block", "inline-block", "inline", "none"];
      } else if (propertyName === "flex-direction") {
        valuePool = ["row", "column", "row-reverse", "column-reverse"];
      } else if (propertyName === "justify-content") {
        valuePool = ["center", "flex-start", "flex-end", "space-between", "space-around", "space-evenly"];
      } else if (propertyName === "align-items" || propertyName === "align-self") {
        valuePool = ["center", "flex-start", "flex-end", "stretch", "baseline"];
      } else if (propertyName === "position") {
        valuePool = ["absolute", "relative", "fixed", "sticky", "static"];
      } else if (propertyName === "flex-wrap") {
        valuePool = ["wrap", "nowrap", "wrap-reverse"];
      } else if (propertyName === "font-weight") {
        valuePool = ["normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
      } else if (propertyName === "text-align") {
        valuePool = ["left", "right", "center", "justify"];
      } else if (propertyName === "overflow") {
        valuePool = ["visible", "hidden", "scroll", "auto"];
      } else if (propertyName === "cursor") {
        valuePool = ["pointer", "default", "move", "not-allowed", "help", "wait", "text"];
      } else if (propertyName.includes("color") || propertyName === "border" || propertyName === "background") {
        valuePool = ["transparent", "white", "black", "red", "blue", "green", "yellow", "purple", "orange", "pink", "gray", "indigo", "rose", "emerald", "amber"];
      }

      if (query) {
        filtered = valuePool.filter(v => v.toLowerCase().startsWith(query.toLowerCase()) && v.toLowerCase() !== query.toLowerCase());
      } else {
        filtered = valuePool;
      }
    } else {
      triggerType = "property";
      const wordMatch = beforeCursor.match(/[a-zA-Z-]*$/);
      query = wordMatch ? wordMatch[0] : "";
      
      const propertyPool = [
        "display", "flex-direction", "justify-content", "align-items", "gap",
        "row-gap", "column-gap", "flex-wrap", "flex-grow", "flex-shrink", "flex-basis", "flex",
        "align-self", "align-content", "order", "grid-template-columns", "grid-template-rows",
        "grid-column", "grid-row", "grid-area", "margin", "margin-top", "margin-bottom",
        "margin-left", "margin-right", "padding", "padding-top", "padding-bottom",
        "padding-left", "padding-right", "background-color", "color", "border",
        "border-radius", "border-width", "border-style", "border-color", "font-size",
        "font-family", "font-weight", "text-align", "width", "height", "min-width",
        "min-height", "max-width", "max-height", "position", "top", "right", "bottom",
        "left", "z-index", "overflow", "opacity", "transition", "transform", "box-shadow",
        "cursor"
      ];

      if (query) {
        filtered = propertyPool.filter(p => p.toLowerCase().startsWith(query.toLowerCase()) && p.toLowerCase() !== query.toLowerCase());
      } else {
        filtered = [];
      }
    }

    // Never show suggestions if typed query has less than 3 characters
    if (query.length < 3) {
      setShowSuggestions(false);
      return;
    }

    if (filtered.length > 0) {
      setSuggestions(filtered.slice(0, 8));
      setActiveTrigger(triggerType);
      setSearchQuery(query);
      
      const linesList = beforeCursor.split("\n");
      const currentLineIndex = linesList.length - 1;
      const currentCharIndex = linesList[linesList.length - 1].length;
      
      const lineH = 24; 
      const charW = 8.4; 
      const scrollTop = textareaRef.current.scrollTop;
      
      const leftOffset = Math.min(
        textareaRef.current.clientWidth - 160,
        Math.max(16, currentCharIndex * charW)
      );
      const topOffset = Math.min(
        textareaRef.current.clientHeight - 100,
        Math.max(16, (currentLineIndex * lineH) - scrollTop + 24)
      );
      
      setSuggestionCoords({ top: topOffset, left: leftOffset });
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const value = code;
    
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    
    let newText = "";
    let newCursorPos = 0;
    
    if (activeTrigger === "property") {
      const queryLen = searchQuery.length;
      newText = beforeCursor.substring(0, beforeCursor.length - queryLen) + suggestion + ": ";
      newCursorPos = newText.length;
      newText += afterCursor;
    } else {
      const queryLen = searchQuery.length;
      const hasSemicolon = afterCursor.trim().startsWith(";");
      const suffix = hasSemicolon ? "" : ";";
      
      newText = beforeCursor.substring(0, beforeCursor.length - queryLen) + suggestion + suffix;
      newCursorPos = newText.length;
      newText += afterCursor;
    }
    
    onChange(newText);
    setShowSuggestions(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursorPos;
        updateCursorContext(newText, newCursorPos);
      }
    }, 0);
  };

  const handleTextareaChange = (val: string) => {
    onChange(val);
    setTimeout(() => {
      if (textareaRef.current) {
        updateCursorContext(val, textareaRef.current.selectionStart);
      }
    }, 0);
  };

  const handleTextareaCursorMove = () => {
    if (textareaRef.current) {
      updateCursorContext(code, textareaRef.current.selectionStart);
    }
  };

  // Simple syntax validator
  useEffect(() => {
    const errors: string[] = [];
    
    // Check balanced braces
    let openBraces = 0;
    for (let i = 0; i < code.length; i++) {
      if (code[i] === "{") openBraces++;
      if (code[i] === "}") {
        openBraces--;
        if (openBraces < 0) {
          errors.push("Chave fechada '}' sem correspondente aberta '{'.");
        }
      }
    }
    if (openBraces > 0) {
      errors.push(`Falta fechar ${openBraces} chave(s) '}'.`);
    }

    // Check semi-colon warnings (simple check: if a property is written, check if it ends with ;)
    const lines = code.split("\n");
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (
        trimmed.includes(":") &&
        !trimmed.startsWith("@") &&
        !trimmed.startsWith("/*") &&
        !trimmed.endsWith("{") &&
        !trimmed.endsWith("}") &&
        !trimmed.endsWith(";") &&
        !trimmed.includes("/*")
      ) {
        errors.push(`Linha ${index + 1}: Possível falta de ponto e vírgula ';' no final da propriedade.`);
      }
    });

    setSyntaxErrors(errors);
  }, [code]);

  // Generate line numbers side strip
  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i + 1);

  // HTML syntax highlighter for Elements Tab
  const highlightHtmlLine = (line: string) => {
    if (!line.trim()) {
      return <span className="block h-4">&nbsp;</span>;
    }

    // Split token to find tags, attributes, strings
    const tokenRegex = /(<\/?[a-zA-Z0-9-]+>|(?:\s[a-zA-Z0-9-]+=(?:"[^"]*"|'[^']*'))|[^<>\s]+|\s+|<|>)/g;
    const tokens = line.split(tokenRegex).filter(Boolean);

    const getColors = () => {
      switch (theme) {
        case "retro":
          return {
            tag: "text-blue-800 font-bold",
            attr: "text-red-700 font-medium",
            val: "text-green-800 font-semibold",
            text: "text-black",
            symbol: "text-gray-600"
          };
        case "dracula":
          return {
            tag: "text-[#ff79c6] font-bold",
            attr: "text-[#50fa7b]",
            val: "text-[#f1fa8c]",
            text: "text-[#f8f8f2]",
            symbol: "text-[#6272a4]"
          };
        case "modern":
default:
          return {
            tag: "text-indigo-400 font-bold",
            attr: "text-sky-400",
            val: "text-emerald-400",
            text: "text-slate-300",
            symbol: "text-slate-500"
          };
      }
    };

    const colors = getColors();

    return (
      <span className="font-mono text-xs block min-h-[16px] leading-relaxed select-text">
        {tokens.map((token, idx) => {
          if (token.startsWith("<") && token.endsWith(">")) {
            const isClose = token.startsWith("</");
            const tagName = token.replace(/[<>/]/g, "").split(" ")[0];
            return (
              <span key={idx}>
                <span className={colors.symbol}>&lt;</span>
                {isClose && <span className={colors.symbol}>/</span>}
                <span className={colors.tag}>{tagName}</span>
                <span className={colors.symbol}>&gt;</span>
              </span>
            );
          } else if (token.startsWith("<")) {
            const tagName = token.substring(1);
            return (
              <span key={idx}>
                <span className={colors.symbol}>&lt;</span>
                <span className={colors.tag}>{tagName}</span>
              </span>
            );
          } else if (token === ">") {
            return <span key={idx} className={colors.symbol}>&gt;</span>;
          } else if (token.startsWith(" ") && token.includes("=")) {
            const parts = token.split("=");
            const attrName = parts[0];
            const attrVal = parts.slice(1).join("=");
            return (
              <span key={idx}>
                <span className={colors.attr}>{attrName}</span>
                <span className={colors.symbol}>=</span>
                <span className={colors.val}>{attrVal}</span>
              </span>
            );
          } else {
            return <span key={idx} className={colors.text}>{token}</span>;
          }
        })}
      </span>
    );
  };

  // Theme-specific CSS classes
  const getContainerClass = () => {
    switch (theme) {
      case "retro":
        return "flex flex-col h-full bg-[#dfdfdf] border-4 border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-black font-mono shadow-md";
      case "dracula":
        return "flex flex-col h-full bg-[#1e1f29] border border-[#44475a] rounded-xl overflow-hidden shadow-2xl text-[#f8f8f2] font-mono";
      case "modern":
      default:
        return "flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-sans";
    }
  };

  const getHeaderClass = () => {
    switch (theme) {
      case "retro":
        return "flex items-center justify-between px-1 md:px-2 py-0.5 md:py-1 bg-[#808080] text-white border-b-2 border-b-[#dfdfdf]";
      case "dracula":
        return "flex items-center justify-between px-2 md:px-4 py-1 md:py-2.5 bg-[#282a36] border-b border-[#44475a]";
      case "modern":
      default:
        return "flex items-center justify-between px-2 md:px-4 py-1 md:py-2.5 bg-slate-950 border-b border-slate-800";
    }
  };

  const getTabButtonClass = (tab: "styles" | "elements") => {
    const active = activeTab === tab;
    if (theme === "retro") {
      return `px-2 md:px-3 py-0.5 md:py-1 font-bold text-[10px] md:text-xs border-r border-[#808080] flex items-center gap-1 md:gap-1.5 ${
        active
          ? "bg-[#c0c0c0] text-black border-t-2 border-t-black"
          : "bg-[#dfdfdf] text-[#606060] hover:text-black"
      }`;
    } else if (theme === "dracula") {
      return `px-2 md:px-4 py-1 md:py-2 text-[10px] md:text-xs font-semibold flex items-center gap-1 md:gap-1.5 transition-all relative ${
        active
          ? "text-[#bd93f9] bg-[#1e1f29] border-t-2 border-t-[#bd93f9]"
          : "text-slate-400 hover:text-slate-200 hover:bg-[#282a36]"
      }`;
    } else {
      return `px-2 md:px-4 py-1 md:py-2 text-[10px] md:text-xs font-semibold flex items-center gap-1 md:gap-1.5 transition-all relative ${
        active
          ? "text-indigo-400 bg-slate-900 border-t-2 border-t-indigo-500"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
      }`;
    }
  };

  const getLineNumbersClass = () => {
    switch (theme) {
      case "retro":
        return "w-12 py-4 select-none bg-[#dfdfdf] text-right pr-3 font-mono text-xs text-slate-700 border-r-2 border-r-[#808080] flex flex-col";
      case "dracula":
        return "w-12 py-4 select-none bg-[#282a36] text-right pr-3 font-mono text-xs text-[#6272a4] border-r border-[#44475a] flex flex-col";
      case "modern":
      default:
        return "w-12 py-4 select-none bg-slate-950/70 text-right pr-3 font-mono text-xs text-slate-600 border-r border-slate-800 flex flex-col";
    }
  };

  const getSolutionButtonClass = () => {
    if (theme === "retro") {
      return "flex items-center space-x-1 px-1.5 md:px-2.5 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black text-[9px] md:text-[10px] font-bold active:border-t-black active:border-l-black active:border-r-white active:border-b-white";
    } else if (theme === "dracula") {
      return "flex items-center space-x-1 px-2 md:px-3 py-1 md:py-1.5 bg-[#44475a] hover:bg-[#6272a4] text-[#f8f8f2] text-[10px] md:text-xs rounded transition font-medium border border-transparent";
    } else {
      return "flex items-center space-x-1 px-2 md:px-3 py-1 md:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] md:text-xs rounded transition font-medium border border-transparent hover:border-slate-700";
    }
  };

  const getConsolePanelClass = () => {
    const padding = isConsoleExpanded ? "p-3 md:p-4 gap-3" : "p-2.5 pb-2 gap-0";
    switch (theme) {
      case "retro":
        return `bg-[#c0c0c0] border-t-4 border-t-[#808080] flex flex-col ${padding}`;
      case "dracula":
        return `bg-[#282a36] border-t border-[#44475a] flex flex-col ${padding}`;
      case "modern":
      default:
        return `bg-slate-950 border-t border-slate-850 flex flex-col ${padding}`;
    }
  };

  const getRunButtonClass = () => {
    const disabled = syntaxErrors.length > 0 || !allAuditsPassed;
    if (theme === "retro") {
      return `px-5 py-1.5 border-2 font-bold text-xs ${
        disabled
          ? "bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-gray-500 cursor-not-allowed opacity-60"
          : "bg-[#c0c0c0] border-t-white border-l-white border-r-black border-b-black text-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white active:pt-2 active:pb-1 cursor-pointer"
      }`;
    } else if (theme === "dracula") {
      return `px-6 py-2.5 rounded-lg text-xs font-semibold transition flex items-center space-x-2 shadow-md ${
        disabled
          ? "bg-[#44475a] text-[#6272a4] cursor-not-allowed opacity-60"
          : "bg-[#50fa7b] hover:bg-[#40e06b] text-[#282a36] hover:shadow-[#50fa7b]/20 cursor-pointer"
      }`;
    } else {
      return `px-6 py-2.5 rounded-lg text-xs font-semibold transition flex items-center space-x-2 shadow-md ${
        disabled
          ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
          : "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-950/40 cursor-pointer"
      }`;
    }
  };

  return (
    <div className={getContainerClass()}>
      {/* DevTools Header Tabs */}
      <div className={getHeaderClass()}>
        <div className="flex items-center space-x-1">
          {theme !== "retro" && (
            <div className="flex items-center space-x-1.5 mr-4 pl-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
          )}
          
          {/* Tabs */}
          <div className="flex">
            <button
              id="tab-devtools-styles"
              onClick={() => setActiveTab("styles")}
              className={getTabButtonClass("styles")}
            >
              <FileText size={13} />
              <span>{theme === "retro" ? "STYLES.CSS" : "styles.css"}</span>
            </button>
            <button
              id="tab-devtools-elements"
              onClick={() => setActiveTab("elements")}
              className={getTabButtonClass("elements")}
            >
              <Code size={13} />
              <span>{theme === "retro" ? "ELEMENTS.HTML" : "Elements (HTML)"}</span>
            </button>
          </div>
        </div>

        {isMobile && isFocused ? (
          <button
            onClick={() => {
              textareaRef.current?.blur();
            }}
            className={
              theme === "retro"
                ? "flex items-center space-x-1 px-3 py-0.5 bg-[#000080] text-white text-[10px] font-bold border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black cursor-pointer"
                : theme === "dracula"
                  ? "flex items-center space-x-1 px-3 py-1 bg-[#50fa7b] hover:bg-[#40e06b] text-[#282a36] text-xs font-bold rounded shadow transition cursor-pointer"
                  : "flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow transition cursor-pointer"
            }
          >
            <Check size={13} strokeWidth={2.5} />
            <span>{theme === "retro" ? "CONCLUIR.EXE" : "Concluir"}</span>
          </button>
        ) : (
          <button
            id="btn-reveal-solution"
            onClick={() => setShowSolution(!showSolution)}
            className={getSolutionButtonClass()}
          >
            {theme !== "retro" && <Sparkles size={12} className={theme === "dracula" ? "text-[#f1fa8c]" : "text-amber-400"} />}
            <span>{showSolution ? (theme === "retro" ? "OCULTAR" : "Ocultar Dica") : (theme === "retro" ? "SOLUCAO" : "Ver Solução")}</span>
          </button>
        )}
      </div>

      {/* Suggested Solution Dropdown */}
      {showSolution && (
        <div className={`${
          theme === "retro" ? "bg-[#dfdfdf] border-b-2 border-b-[#808080] p-3 text-black" : theme === "dracula" ? "bg-[#282a36] border-b border-[#44475a] p-4 text-[#f8f8f2]" : "bg-slate-950 border-b border-slate-800 p-4 text-slate-300"
        } font-mono text-xs transition-all duration-300 z-10`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`${theme === "retro" ? "text-blue-900 font-bold" : theme === "dracula" ? "text-[#ff79c6] font-semibold" : "text-amber-400 font-semibold"} flex items-center gap-1`}>
              <Info size={14} /> Solução Sugerida:
            </span>
            <button
              onClick={() => {
                onChange(solutionCss);
                setShowSolution(false);
              }}
              className={
                theme === "retro"
                  ? "text-xs bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black text-black px-2 py-0.5 font-bold active:border-t-black active:border-l-black"
                  : theme === "dracula"
                    ? "text-xs bg-[#282a36] hover:bg-[#44475a] border border-[#bd93f9] text-[#bd93f9] px-2.5 py-1 rounded transition"
                    : "text-xs bg-slate-850 hover:bg-slate-800 border border-slate-700 text-amber-300 px-2.5 py-1 rounded transition"
              }
            >
              Copiar para Styles
            </button>
          </div>
          <pre className={`p-3 rounded border overflow-x-auto ${
            theme === "retro" ? "bg-white border-[#808080] text-black" : theme === "dracula" ? "bg-[#1e1f29] border-[#44475a] text-[#f1fa8c]" : "bg-slate-900 border-slate-850 text-amber-200"
          }`}>
            {solutionCss}
          </pre>
        </div>
      )}

      {/* Tab Area Content */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative flex-col">
        {activeTab === "styles" ? (
          /* STYLES TAB: Standard Text Editor */
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* VSCode Assistant Properties Row */}
            {(!isMobile || !isFocused) && (
              <div className={`px-4 py-1.5 flex flex-wrap items-center justify-between border-b gap-2 z-10 ${
                theme === "retro" ? "bg-[#c0c0c0] border-b-2 border-b-[#808080] text-black font-mono" : theme === "dracula" ? "bg-[#282a36] border-b border-[#44475a] text-[#f8f8f2]" : "bg-slate-900 border-b border-slate-800/80 text-slate-400"
              } font-sans text-xs`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <Sparkles size={12} className="text-amber-400 animate-pulse flex-shrink-0" />
                  <span className="font-semibold text-[10px] sm:text-[11px] text-slate-300">Hover Doc (VSCode):</span>
                  <div className="flex flex-wrap gap-1">
                    {getDetectedProperties().map((prop) => (
                      <button
                        key={prop}
                        onMouseEnter={() => handleMouseEnterProperty(prop)}
                        onMouseLeave={handleMouseLeaveProperty}
                        className={`px-2 py-0.5 rounded font-mono text-[10px] border transition cursor-help ${
                          hoveredProperty === prop
                            ? theme === "retro"
                              ? "bg-[#000080] text-white border-[#000080]"
                              : theme === "dracula"
                                ? "bg-[#bd93f9] text-[#1e1f29] border-[#bd93f9] font-bold"
                                : "bg-indigo-600 text-white border-indigo-500 font-medium"
                            : theme === "retro"
                              ? "bg-white text-black border-slate-400 hover:bg-slate-100"
                              : theme === "dracula"
                                ? "bg-[#1e1f29] text-[#f8f8f2] border-[#44475a] hover:bg-[#282a36]"
                                : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-slate-100"
                        }`}
                      >
                        {prop}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] opacity-60 italic hidden sm:inline">Repouse o cursor por 1s para ver as instruções</span>
              </div>
            )}
            
            {/* Color Palette Assistant Row (Displays only when on a color property line) */}
            {isColorProperty(activePropertyOnLine) && (!isMobile || !isFocused) && (
              <div className={`px-4 py-1.5 flex flex-wrap items-center justify-between border-b gap-2 z-10 ${
                theme === "retro" ? "bg-[#c0c0c0] border-b-2 border-b-[#808080] text-black font-mono" : theme === "dracula" ? "bg-[#282a36] border-b border-[#44475a] text-[#f8f8f2]" : "bg-slate-950/90 border-b border-slate-800/85 text-slate-300"
              } font-sans text-xs`}>
                <div className="flex items-center gap-2">
                  <Palette size={13} className="text-pink-500" />
                  <span className="font-semibold text-[10px] sm:text-[11px]">
                    Paleta para <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1 py-0.5 rounded">{activePropertyOnLine}</span>:
                  </span>
                  
                  {/* Preset Colors */}
                  <div className="flex items-center gap-1.5 ml-1">
                    {[
                      "#3b82f6", // Blue
                      "#10b981", // Emerald
                      "#ef4444", // Red
                      "#f59e0b", // Amber
                      "#8b5cf6", // Purple
                      "#ec4899", // Pink
                      "#ffffff", // White
                      "#000000", // Black
                    ].map((col) => (
                      <button
                        key={col}
                        onClick={() => handleColorPick(col)}
                        title={col}
                        className="w-4 h-4 rounded-full border border-slate-700/60 transition hover:scale-110 active:scale-95 cursor-pointer shadow-sm flex-shrink-0"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom input type color picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Seletor de Cor:</span>
                  <input
                    type="color"
                    onChange={(e) => handleColorPick(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border border-slate-600/50 p-0 overflow-hidden bg-transparent"
                  />
                </div>
              </div>
            )}

            <div className="flex-1 flex overflow-hidden relative">
              <div className={getLineNumbersClass()}>
                {lineNumbers.map((num) => (
                  <div key={num} className="h-6">
                    {num}
                  </div>
                ))}
              </div>

              <textarea
                id="css-editor-input"
                ref={textareaRef}
                value={code}
                onChange={(e) => handleTextareaChange(e.target.value)}
                onKeyUp={handleTextareaCursorMove}
                onSelect={handleTextareaCursorMove}
                onScroll={handleTextareaCursorMove}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsFocused(false), 150);
                }}
                placeholder="/* Digite suas regras CSS aqui */"
                className={`flex-1 p-4 bg-transparent font-mono text-sm resize-none outline-none focus:ring-0 leading-6 overflow-y-auto whitespace-pre h-full ${
                  theme === "retro" ? "text-black caret-black" : theme === "dracula" ? "text-[#f8f8f2] caret-[#ff79c6]" : "text-slate-200 caret-indigo-500"
                }`}
                style={{ tabSize: 2 }}
                onKeyDown={(e) => {
                  if (showSuggestions && suggestions.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
                      return;
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                      return;
                    }
                    if (e.key === "Enter" || e.key === "Tab") {
                      e.preventDefault();
                      applySuggestion(suggestions[activeSuggestionIndex]);
                      return;
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setShowSuggestions(false);
                      return;
                    }
                  }

                  if (e.key === "Tab") {
                    e.preventDefault();
                    const start = e.currentTarget.selectionStart;
                    const end = e.currentTarget.selectionEnd;
                    const value = e.currentTarget.value;
                    onChange(value.substring(0, start) + "  " + value.substring(end));
                    setTimeout(() => {
                      if (textareaRef.current) {
                        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
                        updateCursorContext(textareaRef.current.value, start + 2);
                      }
                    }, 0);
                  }
                }}
              />

              {/* 💡 Floating IntelliSense Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className={`absolute z-50 max-h-48 overflow-y-auto w-56 shadow-2xl border ${
                    theme === "retro"
                      ? "bg-[#dfdfdf] border-2 border-t-white border-l-white border-r-black border-b-black font-mono text-black text-[11px]"
                      : theme === "dracula"
                        ? "bg-[#282a36] border border-[#44475a] font-mono text-[#f8f8f2] rounded-lg text-xs"
                        : "bg-slate-900 border border-slate-800 font-sans text-slate-200 rounded-xl text-xs"
                  }`}
                  style={{
                    top: `${suggestionCoords.top}px`,
                    left: `${suggestionCoords.left}px`,
                  }}
                >
                  {suggestions.map((suggestion, idx) => {
                    const isActive = idx === activeSuggestionIndex;
                    return (
                      <button
                        key={suggestion}
                        onClick={() => applySuggestion(suggestion)}
                        className={`w-full text-left px-3 py-1.5 transition ${
                          isActive
                            ? theme === "retro"
                              ? "bg-[#000080] text-white font-bold"
                              : theme === "dracula"
                                ? "bg-[#bd93f9] text-[#1e1f29] font-bold"
                                : "bg-indigo-600 text-white font-semibold"
                            : theme === "retro"
                              ? "hover:bg-[#c0c0c0]"
                              : theme === "dracula"
                                ? "hover:bg-[#44475a] text-[#f8f8f2]"
                                : "hover:bg-slate-800/80 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono">{suggestion}</span>
                          <span className="text-[9px] opacity-40 uppercase tracking-widest font-mono">
                            {activeTrigger === "property" ? "prop" : "val"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ELEMENTS TAB: Highlighted DOM Tree Code */
          <div className={`flex-1 p-4 overflow-y-auto ${
            theme === "retro" ? "bg-white" : theme === "dracula" ? "bg-[#282a36]" : "bg-slate-950"
          }`}>
            <div className="mb-4 select-none flex items-center gap-1.5 opacity-60">
              <Terminal size={12} />
              <span className="text-[10px] uppercase font-mono tracking-widest">
                {theme === "retro" ? ";; ARVORE_HTML_DOM" : "Estrutura do Elemento (DOM)"}
              </span>
            </div>
            
            <div className="pl-2 border-l border-dashed border-slate-700/40">
              {/* Outer container tag representation */}
              <div className="opacity-50">
                {highlightHtmlLine('<div id="sandbox-root">')}
              </div>
              
              {/* actual inner level HTML */}
              <div className="pl-4">
                {html.split("\n").map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 inline-block text-slate-600 font-mono text-[10px] select-none text-right pr-2">
                      {i + 1}
                    </span>
                    {highlightHtmlLine(line)}
                  </div>
                ))}
              </div>

              <div className="opacity-50">
                {highlightHtmlLine("</div>")}
              </div>
            </div>
          </div>
        )}
      </div>
         {/* Syntax error / Validation checklist drawer (DevTools Console Style) */}
      {(!isMobile || !isFocused) && (
        <div className={getConsolePanelClass()}>
          {/* Panel Header */}
          <div 
            onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
            className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-dashed border-slate-700/40"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <Terminal size={14} className={theme === "dracula" ? "text-[#bd93f9]" : "text-indigo-400"} />
              <span>{theme === "retro" ? "VALIDADOR_DIAGNOSTICO" : "Audits de Validação (Console)"}</span>
              {isConsoleExpanded ? <ChevronDown size={14} className="opacity-70 ml-1" /> : <ChevronUp size={14} className="opacity-70 ml-1" />}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono opacity-50">
                {checkedState === null ? (theme === "retro" ? "AGUARDANDO" : "Pendente") : (theme === "retro" ? "COMPILADO" : "Avaliado")}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-slate-800/40 border border-slate-700/30 rounded text-slate-400">
                {isConsoleExpanded ? "Recolher" : "Expandir"}
              </span>
            </div>
          </div>

          {isConsoleExpanded && (
            <>
              {/* Syntax Errors View if any */}
              {syntaxErrors.length > 0 && (
                <div className={`p-2.5 rounded border flex flex-col gap-1.5 ${
                  theme === "retro" ? "bg-red-100 border-red-700 text-red-950" : theme === "dracula" ? "bg-rose-950/30 border-rose-900 text-rose-400" : "bg-rose-950/20 border-rose-900/60 text-rose-300"
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle size={14} className="flex-shrink-0 animate-pulse text-red-500" />
                    <span>Erro de Sintaxe Detectado</span>
                  </div>
                  {syntaxErrors.map((err, idx) => (
                    <div key={idx} className="text-[11px] pl-5 font-mono leading-tight">
                      {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Level Validation Checklist Rules */}
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-48 custom-scrollbar">
                {validationRules.map((rule) => {
                  const hasChecked = checkedState !== null;
                  const isPassed = checkedState?.[rule.id] ?? false;

                  const getRuleStyle = () => {
                    if (theme === "retro") {
                      return `flex items-start gap-2 p-1.5 border border-dashed font-mono text-[11px] ${
                        hasChecked
                          ? isPassed
                            ? "bg-white border-emerald-800 text-emerald-900"
                            : "bg-white border-red-800 text-red-900"
                          : "bg-[#dfdfdf] border-gray-600 text-black"
                      }`;
                    } else if (theme === "dracula") {
                      return `flex items-start gap-2.5 p-2 rounded-lg border transition ${
                        hasChecked
                          ? isPassed
                            ? "bg-[#50fa7b]/10 border-[#50fa7b]/20 text-[#50fa7b]"
                            : "bg-[#ff5555]/10 border-[#ff5555]/20 text-[#ff5555]"
                        : "bg-[#282a36]/40 border-[#44475a]/50 text-slate-400"
                      }`;
                    } else {
                      return `flex items-start gap-2.5 p-2 rounded-lg border transition ${
                        hasChecked
                          ? isPassed
                            ? "bg-emerald-950/20 border-emerald-800/30 text-emerald-300"
                            : "bg-rose-950/20 border-rose-950/30 text-rose-300"
                        : "bg-slate-900/40 border-slate-850 text-slate-400"
                      }`;
                    }
                  };

                  return (
                    <div key={rule.id} className={getRuleStyle()}>
                      <div className="flex-shrink-0 mt-0.5">
                        {hasChecked ? (
                          isPassed ? (
                            theme === "retro" ? (
                              <span className="font-bold text-emerald-800">[OK]</span>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                                <Check size={11} strokeWidth={3} />
                              </div>
                            )
                          ) : (
                            theme === "retro" ? (
                              <span className="font-bold text-red-800">[!]</span>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center animate-pulse">
                                <X size={11} strokeWidth={3} />
                              </div>
                            )
                          )
                        ) : (
                          theme === "retro" ? (
                            <span>[ ]</span>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-700 bg-slate-950 flex-shrink-0" />
                          )
                        )}
                      </div>

                      <div className="flex-1 leading-tight text-xs">
                        <span className="font-medium">{rule.description}</span>
                        {hasChecked && !isPassed && (
                          <span className="block text-[10px] opacity-75 mt-0.5 font-mono">
                            {theme === "retro" ? ">> REQUISITO REJEITADO" : "» Assertion failed - verifique seus estilos"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inspect/Verify Active CTA Button */}
              <div className="pt-2 border-t border-dashed border-slate-800/60 flex justify-end">
                <button
                  id="btn-run-code"
                  onClick={onRun}
                  disabled={syntaxErrors.length > 0 || !allAuditsPassed}
                  className={getRunButtonClass()}
                >
                  <CheckCircle size={14} className="flex-shrink-0" />
                  <span>{theme === "retro" ? "VERIFICAR_CODIGO" : "Verificar Desafio"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 💡 VSCode Intellisense Hover Assistant Card (Fixed Overlay) */}
      {hoveredProperty && cssDictionary[hoveredProperty] && (
        <div className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-[280px] sm:w-[340px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-md transition-all duration-300 ${
          theme === "retro"
            ? "bg-[#dfdfdf] border-2 border-t-white border-l-white border-r-black border-b-black text-black font-mono text-[11px]"
            : theme === "dracula"
              ? "bg-[#282a36]/95 border border-[#44475a] text-[#f8f8f2]"
              : "bg-slate-900/95 border border-slate-800/90 text-slate-200"
        }`}>
          {showDocAssistant ? (
            <div className={`flex flex-col gap-3 select-none ${
              theme === "retro"
                ? "text-black font-mono text-[11px]"
                : theme === "dracula"
                  ? "text-[#f8f8f2]"
                  : "text-slate-200"
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b pb-2 border-slate-750">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400 animate-pulse flex-shrink-0" />
                  <div>
                    <h4 className="font-mono font-bold text-xs sm:text-sm text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded break-all">
                      {hoveredProperty}
                    </h4>
                    <span className="text-[9px] opacity-50 uppercase tracking-wider font-mono block mt-0.5">Dica do Editor (VSCode)</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDocAssistant(false);
                    setHoveredProperty("");
                  }}
                  className="p-1 hover:bg-slate-800/85 rounded-lg transition flex-shrink-0 cursor-pointer"
                  title="Fechar dica"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed opacity-90 font-sans">
                {cssDictionary[hoveredProperty].description}
              </p>

              {/* Syntax */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono opacity-50 font-bold">SINTAXE:</span>
                <pre className="font-mono text-[10.5px] p-2 bg-slate-950/70 border border-slate-800/40 rounded-lg overflow-x-auto text-pink-450">
                  {cssDictionary[hoveredProperty].syntax}
                </pre>
              </div>

              {/* Expected Values */}
              {cssDictionary[hoveredProperty].expectedValues.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono opacity-50 font-bold">VALORES COMUNS:</span>
                  <ul className="list-disc pl-4 text-[10.5px] space-y-1 font-sans opacity-85">
                    {cssDictionary[hoveredProperty].expectedValues.map((val, i) => (
                      <li key={i}>{val}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples */}
              {cssDictionary[hoveredProperty].examples.length > 0 && (
                <div className="flex flex-col gap-1.5 border-t border-slate-750 pt-2.5">
                  <span className="text-[10px] font-mono opacity-50 font-bold">EXEMPLOS (CLIQUE PARA INSERIR):</span>
                  <div className="flex flex-col gap-1.5">
                    {cssDictionary[hoveredProperty].examples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => handleInsertExample(ex)}
                        className={`text-left font-mono text-[10px] p-1.5 rounded-lg border flex items-center justify-between group transition cursor-pointer ${
                          theme === "retro"
                            ? "bg-white text-black border-slate-400 hover:bg-slate-100"
                            : theme === "dracula"
                              ? "bg-[#1e1f29] text-[#f1fa8c] border-[#44475a] hover:bg-[#282a36]"
                              : "bg-slate-950 text-indigo-300 border-slate-850 hover:border-indigo-500/40 hover:bg-slate-900"
                        }`}
                        title="Clique para inserir no editor"
                      >
                        <span className="break-all">{ex}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 opacity-60 group-hover:opacity-100 group-hover:bg-indigo-500/20 transition font-sans flex-shrink-0 ml-1.5">
                          Inserir
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Minimized state */
            <button
              onClick={() => setShowDocAssistant(true)}
              className={`p-2 px-3 shadow-xl border flex items-center gap-1.5 rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                theme === "retro"
                  ? "bg-[#dfdfdf] border-2 border-t-white border-l-white border-r-black border-b-black text-black font-mono text-[10px]"
                  : theme === "dracula"
                    ? "bg-[#282a36] border border-[#bd93f9] text-[#bd93f9]"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850"
              }`}
            >
              <Sparkles size={12} className="text-amber-400 animate-pulse flex-shrink-0" />
              <span className="text-[10px] font-semibold font-sans">
                Ver Dica de <span className="font-mono text-indigo-400 font-bold">{hoveredProperty}</span>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

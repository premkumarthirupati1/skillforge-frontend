import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
    Copy, 
    Check, 
    RotateCcw, 
    Sparkles, 
    FileCode, 
    Terminal, 
    Folder, 
    ChevronRight, 
    Split, 
    Settings, 
    Maximize2, 
    CheckCheck,
    Code2,
    Eye,
    EyeOff
} from "lucide-react";
import { highlightLine } from "./syntaxHighlighter";
import toast from "react-hot-toast";

export default function CodeStudioEditor({
    files,
    activeFileName,
    onSelectFile,
    onChangeCode,
    onResetFile
}) {
    const activeFile = files.find(f => f.name === activeFileName) || files[0];

    const textareaRef = useRef(null);
    const preRef = useRef(null);
    const minimapRef = useRef(null);

    const [copied, setCopied] = useState(false);
    const [showMinimap, setShowMinimap] = useState(true);
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

    // Split content into lines for line numbers and syntax highlighting
    const lines = useMemo(() => {
        return (activeFile?.content || "").split("\n");
    }, [activeFile?.content]);

    // Synchronize scrolling between textarea, pre highlight layer, and minimap
    const handleScroll = (e) => {
        const { scrollTop, scrollLeft } = e.target;
        if (preRef.current) {
            preRef.current.scrollTop = scrollTop;
            preRef.current.scrollLeft = scrollLeft;
        }
        if (minimapRef.current) {
            const scrollRatio = scrollTop / (e.target.scrollHeight - e.target.clientHeight || 1);
            minimapRef.current.scrollTop = scrollRatio * (minimapRef.current.scrollHeight - minimapRef.current.clientHeight);
        }
    };

    // Update cursor position on click or keyup
    const updateCursorPosition = () => {
        if (!textareaRef.current) return;
        const selStart = textareaRef.current.selectionStart;
        const textBefore = activeFile.content.substring(0, selStart);
        const linesBefore = textBefore.split("\n");
        const line = linesBefore.length;
        const col = linesBefore[linesBefore.length - 1].length + 1;
        setCursorPos({ line, col });
    };

    // Support Tab key indentation (inserts 4 spaces instead of losing focus)
    const handleKeyDown = (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;

            // Insert 4 spaces
            const updated = value.substring(0, start) + "    " + value.substring(end);
            onChangeCode(updated);

            // Restore caret position after React rerenders
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 4;
                updateCursorPosition();
            }, 0);
        }
    };

    // Copy file content
    const handleCopy = () => {
        navigator.clipboard.writeText(activeFile.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(`Copied ${activeFile.name} to clipboard`);
    };

    // Format Code (prettify indentation)
    const handleFormat = () => {
        // Normalize trailing whitespaces and tabs
        const formatted = lines
            .map(l => l.replace(/\t/g, "    ").trimEnd())
            .join("\n");
        onChangeCode(formatted);
        toast.success(`Formatted ${activeFile.name}`);
    };

    // Icon & badge selector by file extension
    const getFileBadge = (filename) => {
        if (filename.endsWith(".rs")) return { label: "Rust", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
        if (filename.endsWith(".ts") || filename.endsWith(".tsx")) return { label: "TS", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
        if (filename.endsWith(".js") || filename.endsWith(".jsx")) return { label: "JS", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
        if (filename.endsWith(".toml")) return { label: "TOML", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
        if (filename.endsWith(".md")) return { label: "MD", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
        return { label: "Code", color: "text-slate-400 bg-white/5 border-white/10" };
    };

    return (
        <div className="flex-grow flex flex-col h-full bg-[#070A11] border-l border-white/10 overflow-hidden font-mono text-xs select-none">
            
            {/* ======================================================== */}
            {/* 1. VS CODE STYLE TABS BAR                                */}
            {/* ======================================================== */}
            <div className="h-10 bg-[#0A0E17] border-b border-white/10 flex items-center justify-between px-2 overflow-x-auto shrink-0 select-none">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {files.map(file => {
                        const active = file.name === activeFileName;
                        const badge = getFileBadge(file.name);
                        return (
                            <button
                                key={file.name}
                                onClick={() => onSelectFile(file.name)}
                                className={`group px-3 py-1.5 rounded-t-lg text-xs font-mono flex items-center gap-2 border-t-2 transition-all shrink-0 ${
                                    active
                                        ? "bg-[#070A11] text-white border-blue-500 shadow-sm font-semibold"
                                        : "bg-white/[0.02] text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
                                }`}
                            >
                                <span className={`text-[9px] font-bold px-1 py-0.2 rounded border uppercase ${badge.color}`}>
                                    {badge.label}
                                </span>
                                <span>{file.name}</span>
                                {active && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Right toolbar controls */}
                <div className="flex items-center gap-1.5 pr-2">
                    <button
                        onClick={() => setShowMinimap(!showMinimap)}
                        className={`p-1.5 rounded-lg border transition-colors ${showMinimap ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-white/5 border-white/5 text-slate-400 hover:text-white"}`}
                        title={showMinimap ? "Hide Minimap" : "Show Minimap"}
                    >
                        {showMinimap ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    <button
                        onClick={handleFormat}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-amber-300 transition-colors"
                        title="Format Code (Prettier / Rustfmt)"
                    >
                        <Sparkles size={13} />
                    </button>

                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Copy File Content"
                    >
                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>

                    <button
                        onClick={onResetFile}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Reset file to starter skeleton"
                    >
                        <RotateCcw size={13} />
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 2. BREADCRUMBS BAR                                       */}
            {/* ======================================================== */}
            <div className="h-7 bg-[#070A11] border-b border-white/5 px-4 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
                <div className="flex items-center gap-1.5">
                    <Folder size={12} className="text-blue-400" />
                    <span>project</span>
                    <ChevronRight size={10} />
                    <span>src</span>
                    <ChevronRight size={10} />
                    <span className="text-slate-300 font-bold">{activeFile.name}</span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Ready</span>
                    </span>
                    <span>UTF-8</span>
                    <span>Spaces: 4</span>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 3. DUAL-LAYER CODE EDITOR CANVAS                         */}
            {/* ======================================================== */}
            <div className="flex-grow flex relative overflow-hidden bg-[#070A11]">
                
                {/* Line Numbers Gutter */}
                <div className="w-12 bg-[#090D16] border-r border-white/5 py-4 select-none text-right pr-3 text-slate-600 font-mono text-xs leading-6 shrink-0">
                    {lines.map((_, i) => {
                        const lineNum = i + 1;
                        const isCurrentLine = cursorPos.line === lineNum;
                        return (
                            <div 
                                key={lineNum} 
                                className={`transition-colors ${isCurrentLine ? "text-cyan-400 font-bold" : ""}`}
                            >
                                {lineNum}
                            </div>
                        );
                    })}
                </div>

                {/* Editor Content Area (Pre layer + Textarea layer) */}
                <div className="relative flex-grow h-full overflow-hidden">
                    
                    {/* Active Line Highlight Background */}
                    <div 
                        className="absolute left-0 right-0 pointer-events-none bg-blue-500/[0.04] border-y border-blue-500/10 z-0 transition-all duration-75"
                        style={{
                            top: `${(cursorPos.line - 1) * 24 + 16}px`,
                            height: "24px"
                        }}
                    />

                    {/* Layer 1: Syntax Highlighted HTML (Underneath) */}
                    <pre
                        ref={preRef}
                        aria-hidden="true"
                        className="absolute inset-0 p-4 font-mono text-xs sm:text-sm leading-6 overflow-hidden pointer-events-none select-none z-10 m-0 whitespace-pre"
                    >
                        {lines.map((line, idx) => (
                            <div 
                                key={idx}
                                dangerouslySetInnerHTML={{ __html: highlightLine(line) }}
                                className="leading-6"
                            />
                        ))}
                    </pre>

                    {/* Layer 2: Transparent Interactive Textarea (Foreground) */}
                    <textarea
                        ref={textareaRef}
                        value={activeFile.content}
                        onChange={(e) => onChangeCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onKeyUp={updateCursorPosition}
                        onClick={updateCursorPosition}
                        onScroll={handleScroll}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        className="absolute inset-0 p-4 font-mono text-xs sm:text-sm leading-6 resize-none bg-transparent text-transparent caret-cyan-400 focus:outline-none focus:ring-0 selection:bg-blue-600/30 selection:text-transparent border-none z-20 m-0 overflow-auto whitespace-pre"
                        style={{
                            tabSize: 4,
                            WebkitTextFillColor: "transparent"
                        }}
                    />
                </div>

                {/* ======================================================== */}
                {/* 4. VS CODE MINIMAP (RIGHT SIDEBAR)                       */}
                {/* ======================================================== */}
                {showMinimap && (
                    <div 
                        ref={minimapRef}
                        className="w-20 lg:w-28 bg-[#05070B] border-l border-white/5 py-4 px-1 select-none overflow-hidden hidden sm:block shrink-0 pointer-events-none opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <div className="font-mono text-[4px] leading-[6px] tracking-tighter text-slate-500 space-y-0.5 truncate">
                            {lines.slice(0, 100).map((line, idx) => (
                                <div key={idx} className="truncate whitespace-nowrap">
                                    {line ? (
                                        <span className={line.trim().startsWith("//") ? "text-slate-600" : line.includes("fn") || line.includes("function") ? "text-blue-400" : "text-slate-400"}>
                                            {line.replace(/\s/g, "·")}
                                        </span>
                                    ) : (
                                        <span>&nbsp;</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* ======================================================== */}
            {/* 5. VS CODE STATUS BAR FOOTER                             */}
            {/* ======================================================== */}
            <div className="h-6 bg-[#090D16] border-t border-white/10 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0 font-mono">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                        <Terminal size={12} />
                        <span>SkillForge Language Engine</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">
                        Ln {cursorPos.line}, Col {cursorPos.col}
                    </span>
                    <span>•</span>
                    <span>{lines.length} lines</span>
                </div>

                <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCheck size={12} />
                        <span>Prettier / rustfmt active</span>
                    </span>
                    <span>UTF-8</span>
                    <span className="text-cyan-400 font-bold">{getFileBadge(activeFile.name).label}</span>
                </div>
            </div>

        </div>
    );
}

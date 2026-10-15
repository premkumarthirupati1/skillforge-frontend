import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
    Copy, 
    Check, 
    RotateCcw, 
    Sparkles, 
    Folder, 
    ChevronRight, 
    Eye,
    EyeOff,
    CheckCheck,
    Terminal,
    Code2,
    FileText
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
    const gutterRef = useRef(null);

    const [copied, setCopied] = useState(false);
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
    const [viewMode, setViewMode] = useState("editor"); // 'editor' | 'preview'

    // Split content into lines for line numbers and syntax highlighting
    const lines = useMemo(() => {
        return (activeFile?.content || "").split("\n");
    }, [activeFile?.content]);

    // Synchronize scrolling between textarea and gutter
    const handleScroll = (e) => {
        if (gutterRef.current) {
            gutterRef.current.scrollTop = e.target.scrollTop;
        }
    };

    // Update cursor line and column coordinates
    const updateCursorPosition = () => {
        if (!textareaRef.current) return;
        const selStart = textareaRef.current.selectionStart;
        const textBefore = activeFile.content.substring(0, selStart);
        const linesBefore = textBefore.split("\n");
        const line = linesBefore.length;
        const col = linesBefore[linesBefore.length - 1].length + 1;
        setCursorPos({ line, col });
    };

    // Smart Keyboard Handling: Tab indentation & auto-indent on Enter
    const handleKeyDown = (e) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // 1. Tab key -> Insert 4 spaces
        if (e.key === "Tab") {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;

            const updated = value.substring(0, start) + "    " + value.substring(end);
            onChangeCode(updated);

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 4;
                updateCursorPosition();
            }, 0);
            return;
        }

        // 2. Enter key -> Smart Auto-Indent matching previous line
        if (e.key === "Enter") {
            const start = textarea.selectionStart;
            const value = textarea.value;
            const lineBeforeCursor = value.substring(0, start).split("\n").pop() || "";
            const indentMatch = lineBeforeCursor.match(/^\s*/);
            let indent = indentMatch ? indentMatch[0] : "";

            // If line ended with opening brace '{' or '(', add 4 extra spaces
            if (lineBeforeCursor.trimEnd().endsWith("{") || lineBeforeCursor.trimEnd().endsWith("(")) {
                indent += "    ";
            }

            if (indent.length > 0) {
                e.preventDefault();
                const updated = value.substring(0, start) + "\n" + indent + value.substring(textarea.selectionEnd);
                onChangeCode(updated);

                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
                    updateCursorPosition();
                }, 0);
            }
        }
    };

    // Copy file content
    const handleCopy = () => {
        navigator.clipboard.writeText(activeFile.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(`Copied ${activeFile.name} to clipboard`);
    };

    // Format Code (clean trailing whitespaces and normalize indentation)
    const handleFormat = () => {
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
        <div className="flex-grow flex flex-col h-full bg-[#070A11] overflow-hidden font-mono text-xs select-none">
            
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
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/5">
                        <button
                            onClick={() => setViewMode("editor")}
                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${viewMode === "editor" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                            title="Interactive Code Editor"
                        >
                            <Code2 size={11} />
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={() => setViewMode("preview")}
                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${viewMode === "preview" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                            title="Highlighted Syntax Preview"
                        >
                            <FileText size={11} />
                            <span>Syntax View</span>
                        </button>
                    </div>

                    <button
                        onClick={handleFormat}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-amber-300 transition-colors"
                        title="Format Code (Auto Indent)"
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
            {/* 3. CODE EDITOR CANVAS (EDIT MODE VS PREVIEW MODE)        */}
            {/* ======================================================== */}
            <div className="flex-grow flex relative overflow-hidden bg-[#070A11]">
                
                {/* Line Numbers Gutter */}
                <div 
                    ref={gutterRef}
                    className="w-12 bg-[#090D16] border-r border-white/5 py-4 select-none text-right pr-3 text-slate-600 font-mono text-xs leading-6 overflow-hidden shrink-0"
                >
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

                {/* Main Interactive Editor View */}
                {viewMode === "editor" ? (
                    <div className="relative flex-grow h-full overflow-hidden">
                        
                        {/* Active Line Glow */}
                        <div 
                            className="absolute left-0 right-0 pointer-events-none bg-blue-500/[0.04] border-y border-blue-500/10 z-0 transition-all duration-75"
                            style={{
                                top: `${(cursorPos.line - 1) * 24 + 16}px`,
                                height: "24px"
                            }}
                        />

                        {/* Solid, Visible, High-Performance Textarea */}
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
                            className="absolute inset-0 p-4 font-mono text-xs sm:text-sm leading-6 resize-none bg-transparent text-slate-100 caret-cyan-400 focus:outline-none focus:ring-0 selection:bg-blue-600 selection:text-white border-none z-10 m-0 overflow-auto whitespace-pre font-medium"
                            style={{
                                tabSize: 4
                            }}
                        />
                    </div>
                ) : (
                    /* Syntax Highlighted Preview View */
                    <div className="flex-grow h-full overflow-auto p-4 font-mono text-xs sm:text-sm leading-6 select-text whitespace-pre">
                        {lines.map((line, idx) => (
                            <div 
                                key={idx}
                                dangerouslySetInnerHTML={{ __html: highlightLine(line) }}
                                className="leading-6"
                            />
                        ))}
                    </div>
                )}

            </div>

            {/* ======================================================== */}
            {/* 4. VS CODE STATUS BAR FOOTER                             */}
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
                        <span>Smart Indentation</span>
                    </span>
                    <span>UTF-8</span>
                    <span className="text-cyan-400 font-bold">{getFileBadge(activeFile.name).label}</span>
                </div>
            </div>

        </div>
    );
}

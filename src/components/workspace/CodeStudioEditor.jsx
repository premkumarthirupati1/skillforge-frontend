import React, { useState, useRef, useMemo } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";

// Import Prism core syntax languages
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-toml";
import "prismjs/components/prism-markdown";
import "prismjs/themes/prism-tomorrow.css";

import { 
    Copy, 
    Check, 
    RotateCcw, 
    Sparkles, 
    Folder, 
    ChevronRight, 
    CheckCheck,
    Terminal,
    Code2
} from "lucide-react";
import toast from "react-hot-toast";

export default function CodeStudioEditor({
    files,
    activeFileName,
    onSelectFile,
    onChangeCode,
    onResetFile
}) {
    const activeFile = files.find(f => f.name === activeFileName) || files[0];
    const [copied, setCopied] = useState(false);
    const editorScrollRef = useRef(null);
    const gutterRef = useRef(null);

    // Split content into lines for line numbers
    const lines = useMemo(() => {
        return (activeFile?.content || "").split("\n");
    }, [activeFile?.content]);

    // Syntax Highlight function using Prism.js
    const highlightCode = (code) => {
        const ext = activeFile.name.split('.').pop().toLowerCase();
        let grammar = Prism.languages.rust;

        if (ext === "rs") {
            grammar = Prism.languages.rust || Prism.languages.clike;
        } else if (ext === "ts" || ext === "tsx") {
            grammar = Prism.languages.typescript || Prism.languages.javascript;
        } else if (ext === "js" || ext === "jsx") {
            grammar = Prism.languages.javascript || Prism.languages.clike;
        } else if (ext === "py") {
            grammar = Prism.languages.python;
        } else if (ext === "go") {
            grammar = Prism.languages.go || Prism.languages.clike;
        } else if (ext === "toml") {
            grammar = Prism.languages.toml;
        } else if (ext === "md") {
            grammar = Prism.languages.markdown;
        }

        try {
            return Prism.highlight(code || "", grammar || Prism.languages.clike, ext);
        } catch (e) {
            return code;
        }
    };

    // Synchronize gutter scroll with code editor scroll
    const handleScroll = (e) => {
        if (gutterRef.current) {
            gutterRef.current.scrollTop = e.target.scrollTop;
        }
    };

    // Copy file content
    const handleCopy = () => {
        navigator.clipboard.writeText(activeFile.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(`Copied ${activeFile.name} to clipboard`);
    };

    // Format Code
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
            {/* 1. VS CODE TABS BAR                                      */}
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
                        <span>Live Syntax Active</span>
                    </span>
                    <span>UTF-8</span>
                    <span>Spaces: 4</span>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 3. CODE EDITOR CANVAS WITH REAL-TIME PRISM SYNTAX HIGHLIGHT*/}
            {/* ======================================================== */}
            <div className="flex-grow flex relative overflow-hidden bg-[#070A11]">
                
                {/* Line Numbers Gutter */}
                <div 
                    ref={gutterRef}
                    className="w-12 bg-[#090D16] border-r border-white/5 py-4 select-none text-right pr-3 text-slate-600 font-mono text-xs leading-[24px] overflow-hidden shrink-0"
                >
                    {lines.map((_, i) => (
                        <div key={i + 1}>
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Editor Container with Prism Theme */}
                <div 
                    ref={editorScrollRef}
                    onScroll={handleScroll}
                    className="flex-grow h-full overflow-auto relative custom-prism-editor font-mono text-xs sm:text-sm selection:bg-blue-600/40 selection:text-white"
                >
                    <Editor
                        value={activeFile.content}
                        onValueChange={onChangeCode}
                        highlight={highlightCode}
                        padding={16}
                        tabSize={4}
                        insertSpaces={true}
                        style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            fontSize: 13,
                            lineHeight: "24px",
                            minHeight: "100%",
                            backgroundColor: "transparent",
                            outline: "none"
                        }}
                    />
                </div>

            </div>

            {/* ======================================================== */}
            {/* 4. VS CODE STATUS BAR FOOTER                             */}
            {/* ======================================================== */}
            <div className="h-6 bg-[#090D16] border-t border-white/10 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0 font-mono">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                        <Terminal size={12} />
                        <span>SkillForge Prism Engine</span>
                    </span>
                    <span>•</span>
                    <span>{lines.length} lines</span>
                </div>

                <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCheck size={12} />
                        <span>Syntax Highlighted</span>
                    </span>
                    <span>UTF-8</span>
                    <span className="text-cyan-400 font-bold">{getFileBadge(activeFile.name).label}</span>
                </div>
            </div>

        </div>
    );
}

import React, { useState, useRef, useMemo, useEffect } from "react";
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
    Code2,
    Zap,
    Box,
    FileCode,
    Cpu
} from "lucide-react";
import { getSuggestions } from "./autocompleteEngine";
import toast from "react-hot-toast";

const PAIRS = {
    "(": ")",
    "{": "}",
    "[": "]",
    '"': '"',
    "'": "'"
};
const CLOSING_CHARS = new Set([")", "}", "]", '"', "'"]);

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
    const textareaRef = useRef(null);

    // Autocomplete IntelliSense State
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const [wordPrefix, setWordPrefix] = useState("");
    const [popoverPos, setPopoverPos] = useState({ top: 40, left: 80 });

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
        // Dismiss autocomplete on scroll
        if (suggestions.length > 0) setSuggestions([]);
    };

    // Grab underlying textarea reference from Editor component
    useEffect(() => {
        if (editorScrollRef.current) {
            const ta = editorScrollRef.current.querySelector("textarea");
            if (ta) textareaRef.current = ta;
        }
    });

    // Apply selected autocomplete suggestion
    const applySuggestion = (suggestion) => {
        if (!suggestion) return;
        const textarea = textareaRef.current || document.querySelector(".custom-prism-editor textarea");
        if (!textarea) return;

        const pos = textarea.selectionStart;
        const value = activeFile.content;
        const start = Math.max(0, pos - wordPrefix.length);
        const insert = suggestion.insertText;

        const updated = value.substring(0, start) + insert + value.substring(pos);
        onChangeCode(updated);
        setSuggestions([]);

        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + insert.length;
        }, 0);
    };

    // Keyboard Handler: Auto-Closing Brackets, Pairs & IntelliSense Navigation
    const handleKeyDown = (e) => {
        const textarea = e.target;
        if (!textarea) return;
        const { selectionStart: start, selectionEnd: end, value } = textarea;

        // 1. If suggestions menu is visible, intercept navigation keys
        if (suggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                return;
            }
            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                applySuggestion(suggestions[selectedSuggestionIndex]);
                return;
            }
            if (e.key === "Escape") {
                e.preventDefault();
                setSuggestions([]);
                return;
            }
        }

        // 2. Auto-Closing Brackets & Quotes: (, {, [, ", '
        if (PAIRS[e.key]) {
            const open = e.key;
            const close = PAIRS[e.key];

            // If user selected text, wrap it! E.g. select 'my_var', type '(' -> '(my_var)'
            if (start !== end) {
                e.preventDefault();
                const selected = value.substring(start, end);
                const updated = value.substring(0, start) + open + selected + close + value.substring(end);
                onChangeCode(updated);
                setTimeout(() => {
                    textarea.selectionStart = start + 1;
                    textarea.selectionEnd = end + 1;
                }, 0);
                return;
            }

            // For quotes: if next character is already the identical quote, simply step over it (overtype)
            if ((open === '"' || open === "'") && value[start] === open) {
                e.preventDefault();
                textarea.selectionStart = textarea.selectionEnd = start + 1;
                return;
            }

            e.preventDefault();
            const updated = value.substring(0, start) + open + close + value.substring(end);
            onChangeCode(updated);
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 1;
            }, 0);
            return;
        }

        // 3. Overtyping Closing Brackets: ), }, ]
        if (CLOSING_CHARS.has(e.key)) {
            if (start === end && value[start] === e.key) {
                e.preventDefault();
                textarea.selectionStart = textarea.selectionEnd = start + 1;
                return;
            }
        }

        // 4. Backspace between matching empty pairs: (|), {|}, [|], "|", '|'
        if (e.key === "Backspace" && start === end && start > 0) {
            const prevChar = value[start - 1];
            const nextChar = value[start];
            if (PAIRS[prevChar] === nextChar) {
                e.preventDefault();
                const updated = value.substring(0, start - 1) + value.substring(start + 1);
                onChangeCode(updated);
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start - 1;
                }, 0);
                return;
            }
        }

        // 5. Smart Enter between Braces: {|} -> creates indented multiline block
        if (e.key === "Enter" && start === end && start > 0) {
            const prevChar = value[start - 1];
            const nextChar = value[start];
            if (prevChar === "{" && nextChar === "}") {
                e.preventDefault();
                const lineBefore = value.substring(0, start).split("\n").pop() || "";
                const indentMatch = lineBefore.match(/^\s*/);
                const baseIndent = indentMatch ? indentMatch[0] : "";
                const innerIndent = baseIndent + "    ";

                const insert = `\n${innerIndent}\n${baseIndent}`;
                const updated = value.substring(0, start) + insert + value.substring(start);
                onChangeCode(updated);
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 1 + innerIndent.length;
                }, 0);
                return;
            }
        }
    };

    // KeyUp Handler: Compute Autocomplete Suggestions in real time
    const handleKeyUp = (e) => {
        if (["ArrowUp", "ArrowDown", "Enter", "Tab", "Escape"].includes(e.key)) return;

        const textarea = e.target;
        if (!textarea) return;
        const { selectionStart: pos, value } = textarea;

        // Check word right behind the cursor
        const textBefore = value.substring(0, pos);
        const match = textBefore.match(/([a-zA-Z_][a-zA-Z0-9_!]*)$/);
        const word = match ? match[1] : "";

        if (word.length >= 1) {
            const ext = activeFile.name.split('.').pop().toLowerCase();
            const lang = ext === "rs" ? "rust" : (ext === "ts" || ext === "tsx") ? "typescript" : "javascript";
            const found = getSuggestions(word, lang, value);

            if (found.length > 0) {
                setSuggestions(found);
                setSelectedSuggestionIndex(0);
                setWordPrefix(word);

                // Approximate caret position for floating popover
                const linesBefore = textBefore.split("\n");
                const lineIndex = linesBefore.length;
                const colIndex = linesBefore[linesBefore.length - 1].length;

                const top = Math.min(lineIndex * 24 + 18, (editorScrollRef.current?.clientHeight || 400) - 200);
                const left = Math.min(colIndex * 8 + 48, (editorScrollRef.current?.clientWidth || 600) - 280);
                setPopoverPos({ top, left });
                return;
            }
        }

        setSuggestions([]);
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

    const getSuggestionIcon = (type) => {
        switch (type) {
            case "snippet": return <Sparkles size={12} className="text-amber-400" />;
            case "macro": return <Zap size={12} className="text-cyan-400" />;
            case "type": return <Box size={12} className="text-sky-400" />;
            case "keyword": return <Code2 size={12} className="text-purple-400" />;
            case "method": return <Cpu size={12} className="text-blue-400" />;
            default: return <FileCode size={12} className="text-slate-400" />;
        }
    };

    return (
        <div className="flex-grow flex flex-col h-full bg-[#070A11] overflow-hidden font-mono text-xs select-none relative">
            
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
                    <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>IntelliSense & Auto-Close Active</span>
                    </span>
                    <span>UTF-8</span>
                    <span>Spaces: 4</span>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 3. CODE EDITOR CANVAS WITH PRISM SYNTAX HIGHLIGHTING     */}
            {/* ======================================================== */}
            <div className="flex-grow flex relative overflow-hidden bg-[#070A11]">
                
                {/* Line Numbers Gutter */}
                <div 
                    ref={gutterRef}
                    className="w-12 bg-[#090D16] border-r border-white/10 py-4 select-none text-right pr-3 text-slate-600 font-mono text-xs leading-[24px] overflow-hidden shrink-0"
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
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                        onClick={() => { if (suggestions.length > 0) setSuggestions([]); }}
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

                    {/* ======================================================== */}
                    {/* INTELLISENSE AUTOCOMPLETE POPOVER WIDGET                 */}
                    {/* ======================================================== */}
                    {suggestions.length > 0 && (
                        <div 
                            className="absolute z-50 w-72 max-w-sm rounded-xl bg-[#0D121F] border border-blue-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-slate-200 overflow-hidden font-mono text-xs backdrop-blur-md animate-in fade-in duration-150"
                            style={{
                                top: `${popoverPos.top}px`,
                                left: `${popoverPos.left}px`
                            }}
                        >
                            <div className="p-1.5 bg-[#090E17] border-b border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                                <span className="font-bold text-blue-400">Suggestions</span>
                                <span className="text-slate-500">↵ to insert</span>
                            </div>

                            <div className="p-1 space-y-0.5 max-h-52 overflow-y-auto">
                                {suggestions.map((item, idx) => {
                                    const active = idx === selectedSuggestionIndex;
                                    return (
                                        <div
                                            key={item.label}
                                            onClick={() => applySuggestion(item)}
                                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                                                active 
                                                    ? "bg-blue-600 text-white font-bold" 
                                                    : "hover:bg-white/5 text-slate-300"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                {getSuggestionIcon(item.type)}
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                            <span className={`text-[10px] font-mono capitalize shrink-0 ml-2 ${active ? "text-blue-200" : "text-slate-500"}`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-1.5 bg-[#070A11] border-t border-white/5 text-[10px] text-slate-500 truncate">
                                {suggestions[selectedSuggestionIndex]?.detail || "IntelliSense symbol"}
                            </div>
                        </div>
                    )}

                </div>

            </div>

            {/* ======================================================== */}
            {/* 4. VS CODE STATUS BAR FOOTER                             */}
            {/* ======================================================== */}
            <div className="h-6 bg-[#090D16] border-t border-white/10 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0 font-mono">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                        <Terminal size={12} />
                        <span>SkillForge IntelliSense</span>
                    </span>
                    <span>•</span>
                    <span>{lines.length} lines</span>
                </div>

                <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCheck size={12} />
                        <span>Auto-Closing Pairs Active</span>
                    </span>
                    <span>UTF-8</span>
                    <span className="text-cyan-400 font-bold">{getFileBadge(activeFile.name).label}</span>
                </div>
            </div>

        </div>
    );
}

import React, { useState, useRef, useEffect, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { 
    Copy, 
    Check, 
    RotateCcw, 
    Sparkles, 
    ChevronRight, 
    Code2, 
    FileCode, 
    Maximize2, 
    Eye, 
    EyeOff,
    WrapText,
    ZoomIn,
    ZoomOut,
    GitBranch,
    CheckCircle2,
    Sliders,
    Play,
    Terminal,
    FileText,
    X
} from "lucide-react";
import { getFileIcon } from "./FileExplorerTree";
import toast from "react-hot-toast";

function getMonacoLanguage(fileName = "") {
    const ext = fileName.split('.').pop()?.toLowerCase() || "";
    switch (ext) {
        case "rs": return "rust";
        case "py": return "python";
        case "go": return "go";
        case "js":
        case "jsx": return "javascript";
        case "ts":
        case "tsx": return "typescript";
        case "json": return "json";
        case "html": return "html";
        case "css": return "css";
        case "md": return "markdown";
        case "toml": return "ini";
        default: return "plaintext";
    }
}

function getLanguageLabel(fileName = "") {
    const ext = fileName.split('.').pop()?.toLowerCase() || "";
    switch (ext) {
        case "rs": return "Rust 2021";
        case "py": return "Python 3.12";
        case "go": return "Go 1.22";
        case "js":
        case "jsx": return "JavaScript";
        case "ts":
        case "tsx": return "TypeScript 5.4";
        case "json": return "JSON";
        case "toml": return "TOML";
        case "md": return "Markdown";
        default: return "Plain Text";
    }
}

function CodeStudioEditor({
    files = [],
    activeFileName,
    onSelectFile,
    onChangeCode,
    onResetFile,
    onCursorChange,
    onRunTests,
    onOpenCommandPalette,
    editorInstanceRef
}) {
    const activeFile = files.find(f => f.name === activeFileName) || files[0] || { name: "main.rs", content: "" };
    const [copied, setCopied] = useState(false);
    
    // Cursor position for the IDE status bar
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

    // Load user preferences from settings / localStorage
    const [editorPref, setEditorPref] = useState(() => {
        try {
            const raw = localStorage.getItem("skillforge_editor_settings");
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return {
            theme: "skillforge-dark",
            fontSize: 13.5,
            fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontLigatures: true,
            tabSize: 4,
            wordWrap: "on",
            minimap: true,
            lineNumbers: "on"
        };
    });

    const [showMinimap, setShowMinimap] = useState(() => editorPref.minimap !== false);
    const [isWordWrapOn, setIsWordWrapOn] = useState(() => editorPref.wordWrap !== "off");
    const [currentFontSize, setCurrentFontSize] = useState(() => editorPref.fontSize || 13.5);
    const internalEditorRef = useRef(null);

    // Listen for settings changes dispatched from Settings modal or other components
    useEffect(() => {
        const handler = (e) => {
            if (e.detail) {
                setEditorPref(e.detail);
                if (typeof e.detail.minimap === 'boolean') {
                    setShowMinimap(e.detail.minimap);
                }
                if (e.detail.wordWrap) {
                    setIsWordWrapOn(e.detail.wordWrap === "on");
                }
                if (e.detail.fontSize) {
                    setCurrentFontSize(e.detail.fontSize);
                }
            }
        };
        window.addEventListener("skillforge_editor_settings_changed", handler);
        return () => window.removeEventListener("skillforge_editor_settings_changed", handler);
    }, []);

    // Monaco Theme definition: SkillForge Obsidian Matte Theme
    const handleBeforeMount = (monaco) => {
        monaco.editor.defineTheme("skillforge-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "comment", foreground: "64748B", fontStyle: "italic" },
                { token: "keyword", foreground: "38BDF8", fontStyle: "bold" },
                { token: "keyword.control", foreground: "38BDF8", fontStyle: "bold" },
                { token: "type", foreground: "FCD34D", fontStyle: "bold" },
                { token: "type.identifier", foreground: "FCD34D" },
                { token: "function", foreground: "C084FC" },
                { token: "method", foreground: "C084FC" },
                { token: "string", foreground: "4ADE80" },
                { token: "string.escape", foreground: "6EE7B7" },
                { token: "number", foreground: "FB923C" },
                { token: "constant", foreground: "FB7185" },
                { token: "variable", foreground: "F1F5F9" },
                { token: "variable.parameter", foreground: "E2E8F0" },
                { token: "delimiter", foreground: "94A3B8" },
                { token: "delimiter.bracket", foreground: "CBD5E1" },
                { token: "operator", foreground: "38BDF8" },
                { token: "tag", foreground: "F472B6" },
                { token: "attribute.name", foreground: "A78BFA" }
            ],
            colors: {
                "editor.background": "#0B0F19",
                "editor.foreground": "#E6EDF3",
                "editor.lineHighlightBackground": "#16203255",
                "editor.lineHighlightBorder": "#1E293B33",
                "editor.selectionBackground": "#2563EB38",
                "editor.inactiveSelectionBackground": "#2563EB1A",
                "editorCursor.foreground": "#38BDF8",
                "editorWhitespace.foreground": "#1E293B",
                "editorLineNumber.foreground": "#475569",
                "editorLineNumber.activeForeground": "#38BDF8",
                "editorIndentGuide.background": "#161F30",
                "editorIndentGuide.activeBackground": "#38BDF844",
                "minimap.background": "#080B12",
                "minimap.selectionHighlight": "#38BDF840",
                "minimapSlider.background": "#38BDF815",
                "minimapSlider.hoverBackground": "#38BDF825",
                "minimapSlider.activeBackground": "#38BDF835",
                "scrollbarSlider.background": "#33415525",
                "scrollbarSlider.hoverBackground": "#47556950",
                "scrollbarSlider.activeBackground": "#38BDF840",
                "editorBracketMatch.background": "#38BDF822",
                "editorBracketMatch.border": "#38BDF866"
            }
        });
    };

    const handleEditorDidMount = (editor, monaco) => {
        internalEditorRef.current = editor;
        if (editorInstanceRef) {
            editorInstanceRef.current = editor;
        }

        // Track cursor position changes
        editor.onDidChangeCursorPosition((e) => {
            const pos = {
                line: e.position.lineNumber,
                col: e.position.column
            };
            setCursorPos(pos);
            onCursorChange?.(pos);
        });

        // Keyboard Shortcut: Ctrl+Enter / Cmd+Enter to Run Tests
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            onRunTests?.();
        });

        // Keyboard Shortcut: Ctrl+P / Cmd+P to Open Command Palette
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
            onOpenCommandPalette?.();
        });
    };

    const handleCopy = () => {
        if (!activeFile?.content) return;
        navigator.clipboard.writeText(activeFile.content);
        setCopied(true);
        toast.success(`Copied ${activeFile.name} to clipboard`);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleZoomIn = () => {
        if (currentFontSize < 24) {
            setCurrentFontSize(prev => prev + 1);
        }
    };

    const handleZoomOut = () => {
        if (currentFontSize > 11) {
            setCurrentFontSize(prev => prev - 1);
        }
    };

    const handleToggleWordWrap = () => {
        setIsWordWrapOn(prev => !prev);
    };

    const editorOptions = useMemo(() => ({
        fontSize: currentFontSize,
        fontFamily: editorPref.fontFamily || "'Geist Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontLigatures: editorPref.fontLigatures !== undefined ? editorPref.fontLigatures : true,
        minimap: { enabled: showMinimap, maxColumn: 80, scale: 1 },
        lineNumbers: editorPref.lineNumbers || "on",
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        automaticLayout: true,
        tabSize: editorPref.tabSize || 4,
        insertSpaces: true,
        wordWrap: isWordWrapOn ? "on" : "off",
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        formatOnPaste: true,
        formatOnType: true,
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        padding: { top: 14, bottom: 14 }
    }), [showMinimap, isWordWrapOn, currentFontSize, editorPref]);

    const activeIconMeta = getFileIcon(activeFile.name);

    return (
        <div className="flex flex-col h-full bg-[#0B0F19] select-none overflow-hidden border-r border-[#1B2232]">
            
            {/* 1. TOP TAB BAR */}
            <div className="flex items-center justify-between border-b border-[#1B2232] bg-[#080B12] px-2 h-10 shrink-0 select-none">
                
                {/* Scrollable Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none h-full pt-1.5">
                    {files.map(file => {
                        const isActive = file.name === activeFileName;
                        const iconMeta = getFileIcon(file.name);
                        return (
                            <button
                                key={file.name}
                                type="button"
                                onClick={() => onSelectFile(file.name)}
                                className={`px-3 py-1.5 text-xs font-mono font-medium flex items-center gap-2 rounded-t-lg transition-all shrink-0 border-t-2 relative ${
                                    isActive
                                        ? "bg-[#0B0F19] text-white border-sky-400 border-x border-[#1B2232] shadow-sm -mb-[1px] z-10"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border-transparent border-x border-transparent"
                                }`}
                                title={file.path || file.name}
                            >
                                <span className={`text-[10px] font-bold px-1 py-0.2 rounded ${iconMeta.bg || "bg-white/5"} ${iconMeta.color} border ${iconMeta.border || "border-white/10"}`}>
                                    {iconMeta.label}
                                </span>
                                <span className="truncate max-w-[140px]">{file.name}</span>
                                {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Right Tab Toolbar Actions */}
                <div className="flex items-center gap-1 shrink-0 pl-2">
                    {/* Zoom In/Out */}
                    <div className="hidden sm:flex items-center gap-0.5 bg-[#0D121F] border border-[#1B2232] rounded-md p-0.5">
                        <button
                            type="button"
                            onClick={handleZoomOut}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title={`Zoom Out (${currentFontSize}px)`}
                        >
                            <ZoomOut size={12} />
                        </button>
                        <span className="text-[10px] font-mono text-slate-400 px-1">{currentFontSize}</span>
                        <button
                            type="button"
                            onClick={handleZoomIn}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title={`Zoom In (${currentFontSize}px)`}
                        >
                            <ZoomIn size={12} />
                        </button>
                    </div>

                    {/* Word Wrap Toggle */}
                    <button
                        type="button"
                        onClick={handleToggleWordWrap}
                        className={`p-1.5 rounded-md border transition-all text-xs flex items-center ${
                            isWordWrapOn
                                ? "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-sm"
                                : "text-slate-400 hover:text-white bg-[#0D121F] border-[#1B2232]"
                        }`}
                        title={isWordWrapOn ? "Word Wrap: ON" : "Word Wrap: OFF"}
                    >
                        <WrapText size={13} />
                    </button>

                    {/* Minimap Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowMinimap(prev => !prev)}
                        className={`p-1.5 rounded-md border transition-all text-xs flex items-center ${
                            showMinimap
                                ? "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-sm"
                                : "text-slate-400 hover:text-white bg-[#0D121F] border-[#1B2232]"
                        }`}
                        title={showMinimap ? "Minimap: ON" : "Minimap: OFF"}
                    >
                        {showMinimap ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    {/* Copy Code */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="p-1.5 rounded-md text-slate-400 hover:text-white bg-[#0D121F] hover:bg-white/10 border border-[#1B2232] transition-colors"
                        title="Copy Code"
                    >
                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>

                    {/* Reset File */}
                    <button
                        type="button"
                        onClick={onResetFile}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 bg-[#0D121F] hover:bg-rose-500/10 border border-[#1B2232] transition-colors"
                        title="Reset File to Starter Code"
                    >
                        <RotateCcw size={13} />
                    </button>
                </div>
            </div>

            {/* 2. MODERN BREADCRUMB & CONTEXT BAR */}
            <div className="flex items-center justify-between px-3 py-1 border-b border-[#161D2B] bg-[#090C14] text-[11px] font-mono text-slate-400 shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                    <Code2 size={13} className="text-sky-400 shrink-0" />
                    <span className="text-slate-500">workspace</span>
                    <ChevronRight size={10} className="text-slate-600" />
                    <span className="text-slate-500">src</span>
                    <ChevronRight size={10} className="text-slate-600" />
                    <span className="text-slate-200 font-semibold truncate flex items-center gap-1">
                        {activeFile.name}
                    </span>
                </div>

                <div className="flex items-center gap-2.5 text-[10px] text-slate-400 shrink-0">
                    <span className="hidden md:inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                        <CheckCircle2 size={10} />
                        Auto-saved
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="font-semibold text-slate-300">
                        {getLanguageLabel(activeFile.name)}
                    </span>
                </div>
            </div>

            {/* 3. MONACO CANVAS CONTAINER */}
            <div className="flex-grow w-full h-full relative overflow-hidden bg-[#0B0F19]">
                <Editor
                    height="100%"
                    width="100%"
                    language={getMonacoLanguage(activeFile.name)}
                    value={activeFile.content || ""}
                    theme={editorPref.theme || "skillforge-dark"}
                    beforeMount={handleBeforeMount}
                    onMount={handleEditorDidMount}
                    onChange={(newVal) => onChangeCode(newVal || "")}
                    options={editorOptions}
                />
            </div>
        </div>
    );
}

export default React.memo(CodeStudioEditor);

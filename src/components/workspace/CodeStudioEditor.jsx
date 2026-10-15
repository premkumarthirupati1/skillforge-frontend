import React, { useState, useRef, useEffect } from "react";
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
    EyeOff
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
    const [showMinimap, setShowMinimap] = useState(true);
    const internalEditorRef = useRef(null);

    const handleBeforeMount = (monaco) => {
        // Define SkillForge Obsidian Deep Dark Theme for Monaco
        monaco.editor.defineTheme("skillforge-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "comment", foreground: "64748B", fontStyle: "italic" },
                { token: "keyword", foreground: "38BDF8", fontStyle: "bold" },
                { token: "string", foreground: "34D399" },
                { token: "number", foreground: "FBBF24" },
                { token: "type", foreground: "818CF8" },
                { token: "function", foreground: "60A5FA" },
                { token: "variable", foreground: "E2E8F0" },
                { token: "delimiter", foreground: "94A3B8" }
            ],
            colors: {
                "editor.background": "#070A11",
                "editor.foreground": "#E2E8F0",
                "editor.lineHighlightBackground": "#0F172A44",
                "editor.selectionBackground": "#2563EB44",
                "editor.inactiveSelectionBackground": "#2563EB22",
                "editorCursor.foreground": "#38BDF8",
                "editorWhitespace.foreground": "#1E293B",
                "editorLineNumber.foreground": "#475569",
                "editorLineNumber.activeForeground": "#38BDF8",
                "editorIndentGuide.background": "#1E293B",
                "editorIndentGuide.activeBackground": "#38BDF844",
                "minimap.background": "#070A11",
                "scrollbarSlider.background": "#1E293B44",
                "scrollbarSlider.hoverBackground": "#33415588",
                "scrollbarSlider.activeBackground": "#38BDF855"
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
            onCursorChange?.({
                line: e.position.lineNumber,
                col: e.position.column
            });
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

    const editorOptions = React.useMemo(() => ({
        fontSize: 13.5,
        fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontLigatures: true,
        minimap: { enabled: showMinimap, maxColumn: 80, scale: 1 },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        wordWrap: "on",
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        formatOnPaste: true,
        formatOnType: true,
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        padding: { top: 12, bottom: 12 }
    }), [showMinimap]);

    return (
        <div className="flex flex-col h-full bg-[#070A11] border-r border-white/10 select-none overflow-hidden">
            
            {/* Top Editor Tab Bar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#05070B] px-2 h-10 shrink-0 overflow-x-auto">
                {/* Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto">
                    {files.map(file => {
                        const isActive = file.name === activeFileName;
                        const iconMeta = getFileIcon(file.name);
                        return (
                            <button
                                key={file.name}
                                type="button"
                                onClick={() => onSelectFile(file.name)}
                                className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-bold flex items-center gap-2 border-t-2 transition-all shrink-0 ${
                                    isActive
                                        ? "bg-[#070A11] text-white border-blue-500 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent"
                                }`}
                            >
                                <span className={`text-[10px] ${iconMeta.color}`}>{iconMeta.label}</span>
                                <span>{file.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Editor Right Toolbar Controls */}
                <div className="flex items-center gap-1 shrink-0 pl-2">
                    <button
                        onClick={() => setShowMinimap(prev => !prev)}
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                        title={showMinimap ? "Hide Minimap" : "Show Minimap"}
                    >
                        {showMinimap ? <Eye size={13} className="text-cyan-400" /> : <EyeOff size={13} />}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Copy Code"
                    >
                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                    <button
                        onClick={onResetFile}
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Reset File to Starter Code"
                    >
                        <RotateCcw size={13} />
                    </button>
                </div>
            </div>

            {/* Breadcrumb Path Bar */}
            <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-white/5 bg-[#070A11] text-[11px] font-mono text-slate-400 shrink-0">
                <Code2 size={12} className="text-blue-400" />
                <span className="text-slate-500">workspace</span>
                <ChevronRight size={10} className="text-slate-600" />
                <span className="text-slate-400">{activeFile.path || activeFile.name}</span>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-grow w-full h-full relative overflow-hidden">
                <Editor
                    height="100%"
                    width="100%"
                    language={getMonacoLanguage(activeFile.name)}
                    value={activeFile.content || ""}
                    theme="skillforge-dark"
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

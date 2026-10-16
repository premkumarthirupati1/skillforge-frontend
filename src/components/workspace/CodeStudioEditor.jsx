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
        // Define SkillForge Matte Dark Theme for Monaco
        monaco.editor.defineTheme("skillforge-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "comment", foreground: "6A737D", fontStyle: "italic" },
                { token: "keyword", foreground: "79C0FF", fontStyle: "bold" },
                { token: "string", foreground: "7EE787" },
                { token: "number", foreground: "FFA657" },
                { token: "type", foreground: "D2A8FF" },
                { token: "function", foreground: "A5D6FF" },
                { token: "variable", foreground: "E6EDF3" },
                { token: "delimiter", foreground: "8B949E" }
            ],
            colors: {
                "editor.background": "#1e1e1e",
                "editor.foreground": "#E6EDF3",
                "editor.lineHighlightBackground": "#26262655",
                "editor.selectionBackground": "#388bfd33",
                "editor.inactiveSelectionBackground": "#388bfd1a",
                "editorCursor.foreground": "#388bfd",
                "editorWhitespace.foreground": "#2b2b2b",
                "editorLineNumber.foreground": "#6e7681",
                "editorLineNumber.activeForeground": "#eff1f6",
                "editorIndentGuide.background": "#262626",
                "editorIndentGuide.activeBackground": "#388bfd44",
                "minimap.background": "#1e1e1e",
                "scrollbarSlider.background": "#33333344",
                "scrollbarSlider.hoverBackground": "#44444488",
                "scrollbarSlider.activeBackground": "#388bfd55"
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
        <div className="flex flex-col h-full bg-[#1e1e1e] select-none overflow-hidden">
            
            {/* Top Editor Tab Bar */}
            <div className="flex items-center justify-between border-b border-[#333333] bg-[#262626] px-2 h-9 shrink-0 overflow-x-auto">
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
                                className={`px-3 py-1.5 rounded-t-md text-xs font-mono font-medium flex items-center gap-2 border-t-2 transition-all shrink-0 ${
                                    isActive
                                        ? "bg-[#1e1e1e] text-[#eff1f6] border-[#388bfd] shadow-sm"
                                        : "text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-white/5 border-transparent"
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
                        className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                        title={showMinimap ? "Hide Minimap" : "Show Minimap"}
                    >
                        {showMinimap ? <Eye size={13} className="text-[#388bfd]" /> : <EyeOff size={13} />}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-white/5 transition-colors"
                        title="Copy Code"
                    >
                        {copied ? <Check size={13} className="text-[#2cbb5d]" /> : <Copy size={13} />}
                    </button>
                    <button
                        onClick={onResetFile}
                        className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-white/5 transition-colors"
                        title="Reset File to Starter Code"
                    >
                        <RotateCcw size={13} />
                    </button>
                </div>
            </div>

            {/* Breadcrumb Path Bar */}
            <div className="flex items-center gap-1.5 px-3.5 py-1 border-b border-[#2e2e2e] bg-[#1e1e1e] text-[11px] font-mono text-[#8c8c8c] shrink-0">
                <Code2 size={12} className="text-[#388bfd]" />
                <span className="text-[#595959]">workspace</span>
                <ChevronRight size={10} className="text-[#595959]" />
                <span className="text-[#cfd3dc]">{activeFile.path || activeFile.name}</span>
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

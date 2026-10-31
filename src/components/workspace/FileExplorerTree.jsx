import React, { useState, useMemo } from "react";
import { 
    Folder, 
    FolderOpen, 
    FileCode, 
    Plus, 
    RotateCcw, 
    ChevronRight, 
    ChevronDown, 
    FileText, 
    Settings, 
    Search,
    Check,
    Download,
    X,
    FolderTree
} from "lucide-react";

export function getFileIcon(fileName = "") {
    const ext = fileName.split('.').pop()?.toLowerCase() || "";
    switch (ext) {
        case "rs":
            return { 
                color: "text-orange-400", 
                bg: "bg-orange-500/10", 
                border: "border-orange-500/30", 
                label: "RS" 
            };
        case "py":
            return { 
                color: "text-emerald-400", 
                bg: "bg-emerald-500/10", 
                border: "border-emerald-500/30", 
                label: "PY" 
            };
        case "go":
            return { 
                color: "text-cyan-400", 
                bg: "bg-cyan-500/10", 
                border: "border-cyan-500/30", 
                label: "GO" 
            };
        case "ts":
        case "tsx":
            return { 
                color: "text-sky-400", 
                bg: "bg-sky-500/10", 
                border: "border-sky-500/30", 
                label: "TS" 
            };
        case "js":
        case "jsx":
            return { 
                color: "text-amber-400", 
                bg: "bg-amber-500/10", 
                border: "border-amber-500/30", 
                label: "JS" 
            };
        case "json":
        case "toml":
            return { 
                color: "text-purple-400", 
                bg: "bg-purple-500/10", 
                border: "border-purple-500/30", 
                label: "CFG" 
            };
        case "md":
            return { 
                color: "text-slate-300", 
                bg: "bg-slate-500/10", 
                border: "border-slate-500/30", 
                label: "MD" 
            };
        default:
            return { 
                color: "text-slate-400", 
                bg: "bg-slate-500/10", 
                border: "border-slate-500/20", 
                label: "TXT" 
            };
    }
}

export default function FileExplorerTree({
    files = [],
    activeFileName,
    onSelectFile,
    onResetFile,
    onCreateFile,
    repoName = "skillforge/workspace"
}) {
    const [searchFilter, setSearchFilter] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newFileName, setNewFileName] = useState("");
    const [openFolders, setOpenFolders] = useState({ src: true, tests: true });

    const toggleFolder = (folderName) => {
        setOpenFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        const trimmed = newFileName.trim();
        if (trimmed && onCreateFile) {
            onCreateFile(trimmed);
            setNewFileName("");
            setIsCreating(false);
        }
    };

    // Filter files
    const filteredFiles = files.filter(f => 
        !searchFilter.trim() || f.name.toLowerCase().includes(searchFilter.toLowerCase())
    );

    // Group files by root directory or root
    const grouped = useMemo(() => {
        const folders = {};
        const rootFiles = [];

        filteredFiles.forEach(file => {
            const parts = (file.path || file.name).split("/");
            if (parts.length > 1) {
                const folder = parts[0];
                if (!folders[folder]) folders[folder] = [];
                folders[folder].push(file);
            } else {
                rootFiles.push(file);
            }
        });

        return { folders, rootFiles };
    }, [filteredFiles]);

    return (
        <div className="flex flex-col h-full bg-[#080B12] text-slate-300 text-xs font-mono select-none border-r border-[#1B2232]">
            {/* Header & Quick Action Buttons */}
            <div className="px-3 py-2.5 border-b border-[#1B2232] flex items-center justify-between bg-[#070A10]">
                <div className="flex items-center gap-2 truncate">
                    <FolderTree size={14} className="text-sky-400 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 truncate">
                        {repoName.split("/")[1] || "Project Files"}
                    </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="New File"
                    >
                        <Plus size={14} />
                    </button>
                    <button
                        onClick={onResetFile}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Reset Current File"
                    >
                        <RotateCcw size={12} />
                    </button>
                </div>
            </div>

            {/* Quick Filter Search */}
            <div className="p-2 border-b border-[#161D2B] bg-[#090C14]">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0D121F] border border-[#1B2232] text-[11px]">
                    <Search size={12} className="text-slate-500 shrink-0" />
                    <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Search files (⌘P)..."
                        className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none"
                    />
                    {searchFilter && (
                        <button onClick={() => setSearchFilter("")} className="text-slate-500 hover:text-slate-300">
                            <X size={11} />
                        </button>
                    )}
                </div>
            </div>

            {/* New File Input Modal/Bar */}
            {isCreating && (
                <form onSubmit={handleCreateSubmit} className="p-2 border-b border-sky-500/30 bg-sky-500/10 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5">
                        <FileCode size={13} className="text-sky-400" />
                        <input
                            type="text"
                            autoFocus
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="filename.rs"
                            onBlur={() => { if (!newFileName.trim()) setIsCreating(false); }}
                            className="w-full bg-[#0B0F19] border border-sky-500/50 rounded px-2 py-0.5 text-xs text-white focus:outline-none font-mono"
                        />
                    </div>
                </form>
            )}

            {/* File List Tree */}
            <div className="flex-grow overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {/* Folders */}
                {Object.entries(grouped.folders).map(([folderName, folderFiles]) => {
                    const isOpen = openFolders[folderName] !== false;
                    return (
                        <div key={folderName} className="space-y-0.5">
                            <button
                                type="button"
                                onClick={() => toggleFolder(folderName)}
                                className="w-full flex items-center gap-1.5 py-1 px-1.5 rounded-md hover:bg-white/[0.04] text-slate-400 hover:text-white transition-colors text-left"
                            >
                                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                {isOpen ? <FolderOpen size={13} className="text-sky-400" /> : <Folder size={13} className="text-sky-500/80" />}
                                <span className="font-semibold text-[11px] text-slate-300">{folderName}</span>
                            </button>

                            {isOpen && (
                                <div className="pl-3.5 space-y-0.5 border-l border-white/[0.06] ml-2.5">
                                    {folderFiles.map(file => {
                                        const isActive = file.name === activeFileName;
                                        const iconMeta = getFileIcon(file.name);
                                        return (
                                            <button
                                                key={file.name}
                                                type="button"
                                                onClick={() => onSelectFile(file.name)}
                                                className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md transition-all text-left group ${
                                                    isActive 
                                                        ? "bg-sky-500/10 text-white font-semibold border border-sky-500/30 shadow-sm" 
                                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${iconMeta.bg || "bg-white/5"} ${iconMeta.color} border ${iconMeta.border || "border-white/10"}`}>
                                                        {iconMeta.label}
                                                    </span>
                                                    <span className="truncate text-xs">{file.name}</span>
                                                </div>
                                                {isActive && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Root Files */}
                {grouped.rootFiles.map(file => {
                    const isActive = file.name === activeFileName;
                    const iconMeta = getFileIcon(file.name);
                    return (
                        <button
                            key={file.name}
                            type="button"
                            onClick={() => onSelectFile(file.name)}
                            className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md transition-all text-left ${
                                isActive 
                                    ? "bg-sky-500/10 text-white font-semibold border border-sky-500/30 shadow-sm" 
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                            }`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${iconMeta.bg || "bg-white/5"} ${iconMeta.color} border ${iconMeta.border || "border-white/10"}`}>
                                    {iconMeta.label}
                                </span>
                                <span className="truncate text-xs">{file.name}</span>
                            </div>
                            {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Bottom Status / Summary */}
            <div className="px-3 py-2 border-t border-[#1B2232] bg-[#070A10] text-[10px] text-slate-500 flex items-center justify-between">
                <span>{files.length} Files</span>
                <span className="text-sky-400 font-semibold uppercase">{files.find(f => f.name === activeFileName)?.language || "Rust"}</span>
            </div>
        </div>
    );
}

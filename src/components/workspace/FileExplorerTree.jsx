import React, { useState } from "react";
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
    Download
} from "lucide-react";

export function getFileIcon(fileName = "") {
    const ext = fileName.split('.').pop()?.toLowerCase() || "";
    switch (ext) {
        case "rs":
            return { color: "text-amber-500", label: "RS" };
        case "py":
            return { color: "text-emerald-400", label: "PY" };
        case "go":
            return { color: "text-cyan-400", label: "GO" };
        case "ts":
        case "tsx":
            return { color: "text-blue-400", label: "TS" };
        case "js":
        case "jsx":
            return { color: "text-yellow-400", label: "JS" };
        case "json":
        case "toml":
            return { color: "text-purple-400", label: "CFG" };
        case "md":
            return { color: "text-slate-300", label: "MD" };
        default:
            return { color: "text-slate-400", label: "TXT" };
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
    const grouped = React.useMemo(() => {
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
        <div className="flex flex-col h-full bg-[#090D16] text-slate-300 text-xs font-mono select-none">
            {/* Header & Quick Action Buttons */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#070A11]">
                <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                        {repoName.split("/")[1] || "Project Files"}
                    </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="New File"
                    >
                        <Plus size={14} />
                    </button>
                    <button
                        onClick={onResetFile}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Reset Current File"
                    >
                        <RotateCcw size={12} />
                    </button>
                </div>
            </div>

            {/* Quick Filter */}
            <div className="p-2 border-b border-white/5">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px]">
                    <Search size={12} className="text-slate-500 shrink-0" />
                    <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Filter files..."
                        className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* New File Input */}
            {isCreating && (
                <form onSubmit={handleCreateSubmit} className="p-2 border-b border-blue-500/30 bg-blue-500/10">
                    <div className="flex items-center gap-1.5">
                        <FileCode size={13} className="text-cyan-400" />
                        <input
                            type="text"
                            autoFocus
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="filename.ext"
                            onBlur={() => { if (!newFileName.trim()) setIsCreating(false); }}
                            className="w-full bg-[#05070B] border border-blue-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        />
                    </div>
                </form>
            )}

            {/* File List */}
            <div className="flex-grow overflow-y-auto p-2 space-y-1">
                {/* Folders */}
                {Object.entries(grouped.folders).map(([folderName, folderFiles]) => {
                    const isOpen = openFolders[folderName] !== false;
                    return (
                        <div key={folderName} className="space-y-0.5">
                            <button
                                type="button"
                                onClick={() => toggleFolder(folderName)}
                                className="w-full flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-left"
                            >
                                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                {isOpen ? <FolderOpen size={13} className="text-cyan-400" /> : <Folder size={13} className="text-blue-400" />}
                                <span className="font-bold text-[11px] text-slate-300">{folderName}</span>
                            </button>

                            {isOpen && (
                                <div className="pl-4 space-y-0.5 border-l border-white/5 ml-2.5">
                                    {folderFiles.map(file => {
                                        const isActive = file.name === activeFileName;
                                        const iconMeta = getFileIcon(file.name);
                                        return (
                                            <button
                                                key={file.name}
                                                type="button"
                                                onClick={() => onSelectFile(file.name)}
                                                className={`w-full flex items-center justify-between py-1 px-2 rounded transition-all text-left group ${
                                                    isActive 
                                                        ? "bg-blue-600/20 text-white font-bold border-l-2 border-cyan-400" 
                                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className={`text-[10px] font-bold ${iconMeta.color}`}>
                                                        {iconMeta.label}
                                                    </span>
                                                    <span className="truncate">{file.name}</span>
                                                </div>
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
                            className={`w-full flex items-center justify-between py-1 px-2 rounded transition-all text-left ${
                                isActive 
                                    ? "bg-blue-600/20 text-white font-bold border-l-2 border-cyan-400" 
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                            }`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <span className={`text-[10px] font-bold ${iconMeta.color}`}>
                                    {iconMeta.label}
                                </span>
                                <span className="truncate">{file.name}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Bottom Status / Summary */}
            <div className="p-2.5 border-t border-white/5 bg-[#05070B] text-[10px] text-slate-500 flex items-center justify-between">
                <span>{files.length} Project Files</span>
                <span className="text-cyan-400 font-bold uppercase">{files.find(f => f.name === activeFileName)?.language || "Text"}</span>
            </div>
        </div>
    );
}

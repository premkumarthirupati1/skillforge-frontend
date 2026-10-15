import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    FileCode, 
    Play, 
    RotateCcw, 
    Milestone, 
    Terminal, 
    Layers, 
    CheckCircle2, 
    ChevronRight,
    Sparkles
} from "lucide-react";

export default function CommandPalette({
    isOpen,
    onClose,
    files = [],
    activeFileName,
    onSelectFile,
    onRunTests,
    onResetFile,
    onSelectTab
}) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    // Build searchable items (files + commands)
    const items = React.useMemo(() => {
        const fileItems = files.map(f => ({
            type: "file",
            id: `file_${f.name}`,
            title: f.name,
            subtitle: f.path || f.name,
            icon: FileCode,
            action: () => {
                onSelectFile(f.name);
                onClose();
            }
        }));

        const commandItems = [
            {
                type: "command",
                id: "cmd_run_tests",
                title: "Run Tests & Verify Milestone",
                subtitle: "Execute compiler harness (Ctrl+Enter)",
                icon: Play,
                action: () => {
                    onRunTests();
                    onClose();
                }
            },
            {
                type: "command",
                id: "cmd_open_roadmap",
                title: "Open Milestone Roadmap",
                subtitle: "Inspect 5-stage project pipeline",
                icon: Milestone,
                action: () => {
                    onSelectTab("roadmap");
                    onClose();
                }
            },
            {
                type: "command",
                id: "cmd_open_spec",
                title: "Open Specification Guide",
                subtitle: "View current milestone rules and tests",
                icon: Layers,
                action: () => {
                    onSelectTab("spec");
                    onClose();
                }
            },
            {
                type: "command",
                id: "cmd_open_prereqs",
                title: "Open Prerequisites Checklist",
                subtitle: "Review system dependencies and toolchain",
                icon: CheckCircle2,
                action: () => {
                    onSelectTab("prereq");
                    onClose();
                }
            },
            {
                type: "command",
                id: "cmd_open_hints",
                title: "Open Architectural Hints",
                subtitle: "Unblock milestone challenges",
                icon: Sparkles,
                action: () => {
                    onSelectTab("hints");
                    onClose();
                }
            },
            {
                type: "command",
                id: "cmd_reset_file",
                title: `Reset ${activeFileName} to Starter Skeleton`,
                subtitle: "Revert current file to initial code",
                icon: RotateCcw,
                action: () => {
                    onResetFile();
                    onClose();
                }
            }
        ];

        const all = [...fileItems, ...commandItems];
        if (!query.trim()) return all;

        const q = query.toLowerCase();
        return all.filter(item => 
            item.title.toLowerCase().includes(q) || 
            item.subtitle.toLowerCase().includes(q)
        );
    }, [files, activeFileName, query, onSelectFile, onRunTests, onResetFile, onSelectTab, onClose]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Handle Keyboard Navigation inside Command Palette
    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(1, items.length));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + items.length) % Math.max(1, items.length));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (items[selectedIndex]) {
                items[selectedIndex].action();
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div 
                className="w-full max-w-xl rounded-2xl bg-[#090D16] border border-blue-500/30 text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                onKeyDown={handleKeyDown}
            >
                {/* Search Input Bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#070A11]">
                    <Search size={16} className="text-cyan-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search files or type command (> Run Tests, Roadmap...)"
                        className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                    />
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-slate-400 font-mono">
                        ESC
                    </kbd>
                </div>

                {/* Results List */}
                <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 font-mono">
                            No matching files or commands found.
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const Icon = item.icon;
                            const isSelected = idx === selectedIndex;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={item.action}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all text-xs font-mono ${
                                        isSelected 
                                            ? "bg-blue-600 text-white shadow-md" 
                                            : "text-slate-300 hover:bg-white/5"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        <Icon size={14} className={isSelected ? "text-white" : "text-cyan-400"} />
                                        <div className="truncate">
                                            <div className="font-bold truncate">{item.title}</div>
                                            <div className={`text-[10px] truncate ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                                                {item.subtitle}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={13} className={`shrink-0 ${isSelected ? "text-white" : "text-slate-600"}`} />
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer hints */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#05070B] text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center gap-2">
                        <span>Navigate <kbd className="px-1 rounded bg-white/10">↑</kbd> <kbd className="px-1 rounded bg-white/10">↓</kbd></span>
                        <span>Select <kbd className="px-1 rounded bg-white/10">↵</kbd></span>
                    </div>
                    <div>SkillForge Command Palette</div>
                </div>
            </div>
        </div>
    );
}

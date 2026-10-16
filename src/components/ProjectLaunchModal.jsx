import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Terminal, 
    Cpu, 
    CheckCircle2, 
    Sparkles, 
    ExternalLink, 
    Copy, 
    Check, 
    Layers, 
    Clock, 
    Award,
    Code2,
    Play,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Target,
    Milestone,
    BookOpen,
    RotateCw
} from "lucide-react";
import SkillForgeLogo from "./SkillForgeLogo";
import CodeAnvilLogo from "./CodeAnvilLogo";
import { getProjectWorkspaceData } from "../data/projectWorkspacesData";
import toast from "react-hot-toast";

/**
 * ProjectLaunchModal
 * Fullscreen / centered modal showing the SkillForge Compiler Sandbox
 * startup sequence, live container allocation, and project brief.
 */
export default function ProjectLaunchModal({ project, isOpen, onClose }) {
    const navigate = useNavigate();
    const [activeModalTab, setActiveModalTab] = useState("runtime"); // "runtime" | "roadmap"
    const [bootPhase, setBootPhase] = useState(1); // 1: Connecting, 2: Allocating Container, 3: Compiler Booting, 4: Ready
    const [terminalLines, setTerminalLines] = useState([]);
    const [copied, setCopied] = useState(false);
    const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState(0);

    const workspaceData = useMemo(() => {
        return project ? getProjectWorkspaceData(project.id, project) : null;
    }, [project]);

    const currentGuide = workspaceData?.milestoneGuides?.[selectedRoadmapIdx] || {
        milestone: selectedRoadmapIdx + 1,
        title: project?.milestones?.[selectedRoadmapIdx]?.title || `Milestone ${selectedRoadmapIdx + 1}`,
        objective: "Implement required architecture according to specification.",
        specRules: ["Write clean, test-compliant code."],
        testCases: []
    };

    const startBootSequence = () => {
        setBootPhase(1);
        setTerminalLines(["[1/4] Connecting to SkillForge cloud sandbox network..."]);

        const t1 = setTimeout(() => {
            setBootPhase(2);
            setTerminalLines(prev => [
                ...prev, 
                `[2/4] Initializing isolated SkillForge microVM container for [${project?.title || "Project"}]...`
            ]);
        }, 800);

        const t2 = setTimeout(() => {
            setBootPhase(3);
            setTerminalLines(prev => [
                ...prev, 
                `[3/4] SkillForge compiler kernel active. Mounting AST analyzer, language runtime & milestone assertions...`,
                `> Syncing automated test harnesses and specifications...`
            ]);
        }, 1800);

        const t3 = setTimeout(() => {
            setBootPhase(4);
            setTerminalLines(prev => [
                ...prev,
                `[4/4] SkillForge Compiler Runtime ready! All milestone test harnesses loaded. Happy forging!`
            ]);
        }, 3200);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    };

    useEffect(() => {
        if (!isOpen) {
            setBootPhase(1);
            setTerminalLines([]);
            setActiveModalTab("runtime");
            return;
        }

        setActiveModalTab("runtime");
        const cleanup = startBootSequence();
        return cleanup;
    }, [isOpen, project]);

    if (!isOpen || !project) return null;

    const gitCloneCommand = `git clone https://forge.skillforge.dev/specs/${project.id}.git`;

    const handleCopy = () => {
        navigator.clipboard.writeText(gitCloneCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            
            {/* Modal Card (Scoped to dark compiler terminal theme) */}
            <div className="dark relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#090D16] border border-blue-500/30 text-white shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#090D16]/95 backdrop-blur-md z-20">
                    <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            <span>Compiler Sandbox</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                            {project.title}
                        </h3>
                    </div>

                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Navigation Switcher */}
                <div className="flex items-center justify-between px-6 pt-3 border-b border-white/10 bg-[#070A11]">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveModalTab("roadmap")}
                            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 transition-all ${
                                activeModalTab === "roadmap"
                                    ? "bg-[#090D16] text-white border-t-2 border-blue-500 shadow-sm"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Milestone size={14} className="text-cyan-400" />
                            <span>Milestone Roadmap & Objectives</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                                {project.milestones?.length || 5} Stages
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveModalTab("runtime")}
                            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 transition-all ${
                                activeModalTab === "runtime"
                                    ? "bg-[#090D16] text-white border-t-2 border-blue-500 shadow-sm"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Terminal size={14} className="text-blue-400" />
                            <span>Compiler Runtime & Logs</span>
                            <span className={`w-2 h-2 rounded-full ${bootPhase === 4 ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`} />
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 pb-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            bootPhase === 4 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-blue-500/10 text-cyan-400 border-blue-500/20"
                        }`}>
                            {bootPhase === 4 ? "● Runtime Ready" : "○ Runtime Allocating"}
                        </span>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6 flex-grow">
                    
                    {/* TAB 1: INTERACTIVE MILESTONE ROADMAP & OBJECTIVES */}
                    {activeModalTab === "roadmap" && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            
                            {/* Project Header Overview */}
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 via-indigo-950/20 to-transparent border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                            {project.track}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">
                                            Estimated {project.timeEstimate}
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-white">
                                        Architecture Roadmap: 5 Stages to Production
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-normal max-w-xl">
                                        Select any milestone on the roadmap to inspect its architectural objectives and automated test requirements before starting.
                                    </p>
                                </div>

                                <div className="text-right sm:self-center shrink-0">
                                    <span className="text-xs font-mono text-cyan-400 font-bold px-3 py-1.5 rounded-xl bg-[#05070B] border border-blue-500/30 inline-block">
                                        Stage {selectedRoadmapIdx + 1} of {project.milestones?.length || 5}
                                    </span>
                                </div>
                            </div>

                            {/* Horizontal Connected Roadmap Pipeline */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5 text-blue-400">
                                        <Layers size={13} />
                                        <span>Pipeline Roadmap</span>
                                    </span>
                                    <span className="text-[11px] text-cyan-400 lowercase font-normal">
                                        Click a stage to view objectives
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-[#05070B] border border-white/10 overflow-x-auto">
                                    <div className="flex items-center justify-between min-w-[550px] relative px-4 py-2">
                                        
                                        {/* Background Connection Line */}
                                        <div className="absolute left-10 right-10 top-6 h-0.5 bg-white/10 z-0" />
                                        
                                        {project.milestones?.map((m, idx) => {
                                            const isSelected = idx === selectedRoadmapIdx;
                                            return (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => setSelectedRoadmapIdx(idx)}
                                                    className={`relative z-10 flex flex-col items-center gap-1.5 transition-all ${
                                                        isSelected 
                                                            ? "scale-105" 
                                                            : "opacity-75 hover:opacity-100"
                                                    }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                                                        isSelected 
                                                            ? "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white ring-4 ring-blue-500/30 shadow-[0_0_25px_rgba(37,99,235,0.8)]" 
                                                            : "bg-[#090D16] border border-white/20 text-slate-400 hover:border-blue-400 hover:text-white"
                                                    }`}>
                                                        {idx + 1}
                                                    </div>
                                                    <span className={`text-[11px] font-mono whitespace-nowrap font-bold ${
                                                        isSelected ? "text-cyan-300" : "text-slate-400"
                                                    }`}>
                                                        Stage {idx + 1}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 truncate max-w-[85px] text-center">
                                                        {m.title.split(" ").slice(0, 2).join(" ")}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Selected Milestone Objectives & Description Card */}
                            <motion.div
                                key={selectedRoadmapIdx}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#070A11] border border-blue-500/30 space-y-4 shadow-xl"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold uppercase">
                                                Stage {selectedRoadmapIdx + 1} of {project.milestones?.length || 5}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">
                                                {currentGuide.testCases?.length || project.milestones?.[selectedRoadmapIdx]?.testCount || 4} Automated Tests
                                            </span>
                                        </div>
                                        <h5 className="text-base sm:text-lg font-bold text-white">
                                            {currentGuide.title}
                                        </h5>
                                    </div>

                                    {/* Previous / Next Stage Quick Controls */}
                                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRoadmapIdx(prev => Math.max(0, prev - 1))}
                                            disabled={selectedRoadmapIdx === 0}
                                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1"
                                            title="Previous Stage"
                                        >
                                            <ChevronLeft size={14} />
                                            <span>Prev Stage</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRoadmapIdx(prev => Math.min((project.milestones?.length || 5) - 1, prev + 1))}
                                            disabled={selectedRoadmapIdx === (project.milestones?.length || 5) - 1}
                                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1"
                                            title="Next Stage"
                                        >
                                            <span>Next Stage</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Milestone Detailed Description */}
                                <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-1">
                                    <div className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <BookOpen size={11} />
                                        <span>Milestone Description</span>
                                    </div>
                                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                                        {currentGuide.objective}
                                    </p>
                                </div>

                                {/* Milestone Architectural Objectives Checklist */}
                                <div className="space-y-2 pt-1">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-blue-400">
                                            <ShieldCheck size={13} />
                                            <span>Milestone Objectives & Architecture Checklist</span>
                                        </span>
                                        <span className="text-[10px] font-mono text-cyan-400 font-normal">
                                            {currentGuide.specRules?.length || 0} requirements
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        {currentGuide.specRules?.map((rule, rIdx) => (
                                            <div key={rIdx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                                                <CheckCircle2 size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{rule}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Milestone Technical Prerequisites */}
                                {currentGuide.prerequisites && currentGuide.prerequisites.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                                            <Target size={13} />
                                            <span>Milestone Prerequisites & Core Concepts</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {currentGuide.prerequisites.map((req, qIdx) => (
                                                <div key={qIdx} className="flex items-center gap-2 p-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                                    <span className="truncate">{req}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Target Test Verification Preview */}
                                {currentGuide.testCases && currentGuide.testCases.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <Terminal size={13} className="text-cyan-400" />
                                            <span>Target Automated Test Assertions ({currentGuide.testCases.length})</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                                            {currentGuide.testCases.map((tc, tIdx) => (
                                                <div key={tIdx} className="p-2.5 rounded-xl bg-[#05070B] border border-white/10 text-slate-300 space-y-1">
                                                    <div className="flex items-center justify-between font-bold text-slate-200">
                                                        <span className="truncate pr-1">✓ {tc.name}</span>
                                                        <span className="text-[9px] text-blue-400 uppercase">Harness</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        Expects: <span className="text-emerald-400">{tc.expected}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Project-Wide Toolchain & Setup Prerequisites */}
                            {project.prerequisites && project.prerequisites.length > 0 && (
                                <div className="p-4 rounded-2xl bg-[#05070B] border border-white/10 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                            <ShieldCheck size={14} className="text-blue-400" />
                                            <span>Project Toolchain & Setup Prerequisites</span>
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-400">
                                            {project.techStack?.slice(0, 3).join(" • ")}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {project.prerequisites.map((p, pIdx) => (
                                            <div key={pIdx} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                                                <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{p}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Git Clone Quick Command */}
                            <div className="space-y-2 pt-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                    Clone Locally or Forge Online
                                </label>
                                <div className="flex items-center gap-2 bg-[#05070B] border border-white/10 rounded-xl p-2.5">
                                    <code className="text-xs font-mono text-cyan-300 truncate flex-grow pl-2">
                                        {gitCloneCommand}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 shrink-0"
                                    >
                                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                        <span>{copied ? "Copied" : "Copy"}</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* TAB 2: COMPILER RUNTIME & BOOT LOGS */}
                    {activeModalTab === "runtime" && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            
                            {/* SkillForge Compiler Runtime Boot Stage & Animated Logo Morph */}
                            <div className="relative overflow-hidden rounded-2xl bg-[#0d1017] border border-white/10 p-8 flex flex-col items-center justify-center min-h-[280px] shadow-xl text-center">
                                
                                {/* Subtle Ambient Lighting (Clean & restrained) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-36 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none" />

                                {/* Dual-Logo Transformation Showcase */}
                                <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                                    
                                    {/* Logo Morphing Stage: SkillForge SF -> The Code Anvil */}
                                    <div className="relative h-24 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            {bootPhase === 1 ? (
                                                /* STEP 1: SkillForge SF Brandmark */
                                                <motion.div
                                                    key="sf-logo"
                                                    initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                                    exit={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
                                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                                    className="p-3.5 rounded-2xl bg-[#090b10] border border-white/10 shadow-lg flex items-center justify-center"
                                                >
                                                    <img 
                                                        src="/images/skillforge-logo.png" 
                                                        alt="SkillForge" 
                                                        className="h-12 w-auto object-contain" 
                                                    />
                                                </motion.div>
                                            ) : (
                                                /* STEP 2, 3, 4: Transformed to The Code Anvil */
                                                <motion.div
                                                    key="anvil-logo"
                                                    initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                                    exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
                                                    transition={{ duration: 0.5, type: "spring", stiffness: 140, damping: 18 }}
                                                    className="p-3.5 rounded-2xl bg-[#090b10] border border-blue-500/30 shadow-[0_0_25px_rgba(37,99,235,0.25)] flex items-center justify-center"
                                                >
                                                    <CodeAnvilLogo 
                                                        size="xl" 
                                                        pulsing={bootPhase < 4} 
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Live Compiler Status Badge */}
                                    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium tracking-wide transition-all ${
                                        bootPhase === 4 
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                                            : bootPhase === 1
                                            ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                                            : "bg-blue-500/15 border-blue-500/30 text-blue-300"
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${
                                            bootPhase === 4 
                                                ? "bg-emerald-400" 
                                                : "bg-blue-400 animate-ping"
                                        }`} />
                                        <span>
                                            {bootPhase === 1 && "Connecting to SkillForge Network..."}
                                            {bootPhase === 2 && "Morphing into Sandbox MicroVM..."}
                                            {bootPhase === 3 && "Code Anvil Compiler Booting..."}
                                            {bootPhase === 4 && "Code Anvil Compiler Ready"}
                                        </span>
                                    </div>

                                    {/* Re-run boot sequence trigger */}
                                    {bootPhase === 4 && (
                                        <button
                                            type="button"
                                            onClick={startBootSequence}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-white transition-colors pt-0.5"
                                            title="Re-run compiler bootup sequence"
                                        >
                                            <RotateCw size={11} /> Re-run Boot Check
                                        </button>
                                    )}
                                </div>

                                {/* Status Label Below Logo */}
                                <p className="relative z-10 text-xs text-slate-400 max-w-md mt-3 font-normal leading-relaxed">
                                    {bootPhase === 1 && "Authenticating session and establishing secure websocket to SkillForge cloud network."}
                                    {bootPhase === 2 && "Transforming workspace to isolated Code Anvil sandbox microVM with hot-reload compiler."}
                                    {bootPhase === 3 && "Mounting AST language runtime, milestone harnesses, and assertions."}
                                    {bootPhase === 4 && "Code Anvil compiler runtime initialized. All milestone test harnesses loaded."}
                                </p>
                            </div>

                            {/* Terminal Boot Log */}
                            <div className="bg-[#05070B] border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1 shadow-inner">
                                <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-white/5 mb-2 text-[10px] uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5 text-blue-400">
                                        <Terminal size={12} /> skillforge-sandbox-runtime
                                    </span>
                                    <span>x86_64 Linux</span>
                                </div>
                                {terminalLines.map((line, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <span className="text-blue-500 select-none">&gt;</span>
                                        <span className={idx === terminalLines.length - 1 ? "text-cyan-300 font-bold" : "text-slate-400"}>
                                            {line}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Git Clone Quick Command */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                    Clone Locally or Forge Online
                                </label>
                                <div className="flex items-center gap-2 bg-[#05070B] border border-white/10 rounded-xl p-2.5">
                                    <code className="text-xs font-mono text-cyan-300 truncate flex-grow pl-2">
                                        {gitCloneCommand}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 shrink-0"
                                    >
                                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                        <span>{copied ? "Copied" : "Copy"}</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-white/10 bg-[#090D16] flex flex-col sm:flex-row items-center justify-end gap-3 sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        Back to Catalog
                    </button>

                    <button
                        onClick={() => {
                            const token = localStorage.getItem("token");
                            if (!token) {
                                toast.error("Please sign in to launch the workspace and track your progress", { icon: "🔒" });
                                onClose();
                                navigate("/login", { state: { from: `/projects/${project.id}/workspace` } });
                                return;
                            }
                            onClose();
                            navigate(`/projects/${project.id}/workspace`);
                        }}
                        disabled={bootPhase < 3}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        <Play size={14} fill="currentColor" />
                        <span>Launch In-Browser Workspace</span>
                    </button>
                </div>

            </div>
        </div>
    );
}

import React, { useState, useEffect } from "react";
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
    Play
} from "lucide-react";
import CodeAnvilLogo from "./CodeAnvilLogo";
import SkillForgeLogo from "./SkillForgeLogo";

/**
 * ProjectLaunchModal
 * Fullscreen / centered modal showing the dramatic transition from the Main Logo 
 * into The Code Anvil with compiler startup sequence, blinking anvil, and project brief.
 */
export default function ProjectLaunchModal({ project, isOpen, onClose }) {
    const [bootPhase, setBootPhase] = useState(1); // 1: Main Logo, 2: Morphing to Anvil, 3: Anvil Compiler Blinking / Booting, 4: Ready
    const [terminalLines, setTerminalLines] = useState([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setBootPhase(1);
            setTerminalLines([]);
            return;
        }

        // Sequence timing:
        // Phase 1: 0 - 800ms -> Main Logo
        // Phase 2: 800 - 1800ms -> Morphing Shockwave
        // Phase 3: 1800 - 3200ms -> Anvil Blinking / Compiler Booting
        // Phase 4: 3200ms+ -> Workspace Ready

        setBootPhase(1);
        setTerminalLines(["[1/4] Connecting to SkillForge cloud sandbox..."]);

        const t1 = setTimeout(() => {
            setBootPhase(2);
            setTerminalLines(prev => [...prev, "[2/4] Switching platform mode: Transforming brandmark to The Code Anvil..."]);
        }, 900);

        const t2 = setTimeout(() => {
            setBootPhase(3);
            setTerminalLines(prev => [
                ...prev, 
                `[3/4] Compiler kernel active. Spawning isolated runtime for ${project?.title || "Project"}...`,
                `> Mounting test runner and architectural specifications...`
            ]);
        }, 2000);

        const t3 = setTimeout(() => {
            setBootPhase(4);
            setTerminalLines(prev => [
                ...prev,
                `[4/4] Environment ready! All 5 milestone test harnesses loaded. Happy forging!`
            ]);
        }, 3400);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
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
            
            {/* Modal Card */}
            <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#090D16] border border-blue-500/30 text-white shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col">
                
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

                <div className="p-6 sm:p-8 space-y-8 flex-grow">
                    
                    {/* ======================================================== */}
                    {/* DRAMATIC LOGO TRANSITION & COMPILER BOOTUP STAGE        */}
                    {/* ======================================================== */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#111827] to-[#0A0E17] border border-blue-500/20 p-8 flex flex-col items-center justify-center min-h-[260px] shadow-inner text-center">
                        
                        {/* Ambient Radial Energy Glow */}
                        <div className="absolute inset-0 bg-blue-600/10 blur-[60px] pointer-events-none" />

                        {/* Particle Ring Shockwaves */}
                        {(bootPhase === 2 || bootPhase === 3) && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0.9 }}
                                animate={{ scale: 2.3, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                className="absolute w-40 h-40 rounded-full border-2 border-blue-400/50 pointer-events-none"
                            />
                        )}

                        <div className="relative z-10 min-h-[100px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {bootPhase === 1 ? (
                                    /* Phase 1: Main Platform Logo */
                                    <motion.div
                                        key="step-main"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.3, filter: "blur(8px)" }}
                                        transition={{ duration: 0.5 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <SkillForgeLogo size="lg" />
                                        <span className="text-[11px] font-mono text-slate-400 tracking-wider">
                                            Platform Curriculum Mode
                                        </span>
                                    </motion.div>
                                ) : (
                                    /* Phase 2, 3, 4: The Code Anvil Logo Blinking in Compiler */
                                    <motion.div
                                        key="step-anvil"
                                        initial={{ opacity: 0, scale: 0.7, filter: "blur(12px)" }}
                                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
                                        className="flex flex-col items-center gap-3"
                                    >
                                        <div className="relative">
                                            {/* Compiler Blinking Anvil Effect */}
                                            <CodeAnvilLogo 
                                                size="2xl" 
                                                pulsing={bootPhase === 2 || bootPhase === 3} 
                                            />
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold uppercase tracking-widest">
                                            <span className={`w-2 h-2 rounded-full ${bootPhase === 4 ? "bg-emerald-400" : "bg-cyan-400 animate-ping"}`} />
                                            <span>
                                                {bootPhase === 4 ? "Compiler Ready" : "Compiler Booting..."}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Status Label Below Logo */}
                        <p className="relative z-10 text-xs text-slate-400 max-w-sm mt-4 font-medium">
                            {bootPhase < 4 
                                ? "Switching from study mode to interactive compiler sandbox. Blinking Code Anvil indicates container allocation."
                                : "Runtime container synchronized. All automated test suites and specifications ready."
                            }
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

                    {/* Project Specifications & Milestones Preview */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Layers size={15} className="text-blue-400" />
                                <span>Milestones & Test Verification</span>
                            </h4>
                            <span className="text-xs text-slate-400">
                                {project.milestones?.length || 5} Progressive Stages
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {project.milestones?.map((m, index) => (
                                <div key={m.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2.5 truncate">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                                            {index + 1}
                                        </div>
                                        <span className="text-slate-200 truncate">{m.title}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded shrink-0">
                                        {m.testCount} tests
                                    </span>
                                </div>
                            ))}
                        </div>
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
                                onClick={handleCopy}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 shrink-0"
                            >
                                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                <span>{copied ? "Copied" : "Copy"}</span>
                            </button>
                        </div>
                    </div>

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
                        onClick={() => alert(`Launching compiler workspace for "${project.title}"! Phase 2 will bring the live in-browser Monaco IDE.`)}
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

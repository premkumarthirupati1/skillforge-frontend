import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Zap, ArrowRight, Play, RefreshCw, Cpu, CheckCircle2 } from "lucide-react";
import SkillForgeLogo from "./SkillForgeLogo";
import CodeAnvilLogo from "./CodeAnvilLogo";

/**
 * ForgeModeTransition Component
 * Visualizes the transition from the main SkillForge platform identity (SF Monogram)
 * into the Code Anvil compiler runtime identity when stepping into the Project Forge.
 */
export default function ForgeModeTransition({ onLaunchDemo }) {
    // Current active mode: "courseware" (SF Logo) or "forge" (Code Anvil)
    const [mode, setMode] = useState("forge");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [stepLog, setStepLog] = useState("Runtime online. Ready to build.");

    const triggerTransition = (targetMode) => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        if (targetMode === "forge") {
            setStepLog("Initiating compiler kernel... [0/3]");
            setTimeout(() => setStepLog("Transforming brandmark into The Code Anvil... [1/3]"), 600);
            setTimeout(() => setStepLog("Mounting in-browser container & test harness... [2/3]"), 1200);
            setTimeout(() => {
                setMode("forge");
                setStepLog("Compiler Engine Online. Ready to Forge. [3/3]");
                setIsTransitioning(false);
            }, 1800);
        } else {
            setStepLog("Returning to platform curriculum... [1/2]");
            setTimeout(() => {
                setMode("courseware");
                setStepLog("Platform Navigation Active.");
                setIsTransitioning(false);
            }, 1000);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#111827]/90 to-[#0B0F19]/90 border border-blue-500/25 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/15 blur-[90px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/15 blur-[90px] rounded-full pointer-events-none" />

            {/* Top Bar: Controls & Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Zap size={16} className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-bold block">
                            Brandmark State Engine
                        </span>
                        <h4 className="text-sm font-bold text-white tracking-tight">
                            Platform ➔ Compiler Runtime Transition
                        </h4>
                    </div>
                </div>

                {/* Mode Selector Pill */}
                <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-2xl">
                    <button
                        onClick={() => triggerTransition("courseware")}
                        disabled={isTransitioning}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            mode === "courseware"
                                ? "bg-white text-slate-900 shadow-md"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <span>Main Platform</span>
                    </button>

                    <div className="text-slate-600 px-0.5">
                        <ArrowRight size={12} />
                    </div>

                    <button
                        onClick={() => triggerTransition("forge")}
                        disabled={isTransitioning}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            mode === "forge"
                                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        <span>The Code Anvil</span>
                    </button>
                </div>
            </div>

            {/* Transition Transformation Stage */}
            <div className="relative min-h-[220px] flex flex-col items-center justify-center py-6">
                
                {/* Radial Concentric Shockwave Rings on Transition */}
                <AnimatePresence>
                    {isTransitioning && (
                        <>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0.8 }}
                                animate={{ scale: 2.2, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                                className="absolute w-44 h-44 rounded-full border border-blue-400/40 pointer-events-none"
                            />
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0.6 }}
                                animate={{ scale: 1.6, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2, delay: 0.3, repeat: Infinity, ease: "easeOut" }}
                                className="absolute w-44 h-44 rounded-full border border-cyan-400/40 pointer-events-none"
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* Animated Logo Container */}
                <div className="relative z-10 flex items-center justify-center min-h-[90px]">
                    <AnimatePresence mode="wait">
                        {mode === "courseware" ? (
                            <motion.div
                                key="main-sf"
                                initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="flex flex-col items-center gap-3"
                            >
                                <SkillForgeLogo size="lg" />
                                <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                                    [ State: Course Learning & Curriculum ]
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="code-anvil"
                                initial={{ opacity: 0, scale: 0.85, y: 10, filter: "blur(8px)" }}
                                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="flex flex-col items-center gap-3 text-center"
                            >
                                <div className="relative group p-2">
                                    {/* Glowing Aura behind Anvil */}
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:bg-blue-500/35 transition-all" />
                                    <CodeAnvilLogo size="xl" pulsing={true} />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
                                        Active Badge: The Code Anvil
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Interactive Action Prompt */}
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 z-10">
                    <button
                        onClick={() => triggerTransition(mode === "courseware" ? "forge" : "courseware")}
                        disabled={isTransitioning}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={isTransitioning ? "animate-spin" : ""} />
                        <span>{mode === "courseware" ? "Trigger Forge Transition" : "Replay Morph Transition"}</span>
                    </button>

                    {onLaunchDemo && (
                        <button
                            onClick={onLaunchDemo}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 active:scale-95"
                        >
                            <Play size={13} fill="currentColor" />
                            <span>Preview Compiler Sandbox Bootup</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Live Terminal Status Line */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <div className="flex items-center gap-2 truncate">
                    <Terminal size={13} className="text-blue-400 shrink-0" />
                    <span className="text-slate-400">{stepLog}</span>
                </div>
                <span className="hidden sm:inline text-slate-600">v2.4 Kernel</span>
            </div>

        </div>
    );
}

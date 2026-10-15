import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Volume2, VolumeX } from "lucide-react";

/**
 * ForgeVideoIntro Component
 * Automatically plays the cinematic video transition from SkillForge Logo into the Code Anvil logo
 * upon entering the Projects section. Automatically dissolves to reveal the projects catalog without
 * asking the user to manually click or trigger anything.
 */
export default function ForgeVideoIntro({ isOpen, onClose }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (isOpen && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(err => {
                console.log("Autoplay caught:", err);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.6 } }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16] p-4 sm:p-8"
            >
                {/* Skip / Dismiss Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-30 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 backdrop-blur-md border border-white/10"
                >
                    <span>Skip to Catalog</span>
                    <X size={14} />
                </button>

                {/* Subtle Ambient Radial Lighting */}
                <div className="absolute inset-0 bg-blue-600/10 blur-[120px] pointer-events-none" />

                {/* Cinematic Video Wrapper */}
                <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden border border-blue-500/30 shadow-[0_0_80px_rgba(37,99,235,0.25)] bg-black">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        onEnded={onClose}
                        className="w-full h-full object-cover"
                    >
                        <source src="/videos/skillforge-to-anvil-transition.mp4" type="video/mp4" />
                        <source src="/videos/skillforge-to-anvil-transition.webm" type="video/webm" />
                    </video>

                    {/* Progress Bar at Bottom of Video */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5, ease: "linear" }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        />
                    </div>
                </div>

                {/* Footnote */}
                <div className="absolute bottom-6 text-center text-xs font-mono text-slate-500 tracking-wider">
                    Entering The Project Forge • Transitioning to Code Anvil Runtime
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

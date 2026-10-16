import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RouteTransitionLayout Component
 * Implements the fast, smooth route transition with animated logo layer (400-600ms):
 * 1. Current page slides & fades left slightly (0-200ms)
 * 2. Fullscreen transition layer appears with The Code Anvil logo when entering Projects (or SF logo when leaving) (200-400ms)
 * 3. New page smoothly fades and slides in from the right (400-600ms)
 */
export default function RouteTransitionLayout({ children }) {
    const location = useLocation();
    const prevPathRef = useRef(location.pathname);
    
    // Whether the logo transition layer overlay is visible
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [logoPhase, setLogoPhase] = useState(1); // 1: SkillForge, 2: Code Anvil

    useEffect(() => {
        const currentPath = location.pathname;
        const prevPath = prevPathRef.current;

        const enteringProjects = currentPath.startsWith("/project") && !prevPath.startsWith("/project");
        const enteringWorkspace = currentPath.includes("/workspace") && !prevPath.includes("/workspace");
        const leavingProjects = !currentPath.startsWith("/project") && prevPath.startsWith("/project");

        if (enteringProjects || enteringWorkspace) {
            setLogoPhase(1);
            setIsTransitioning(true);
            const morphTimer = setTimeout(() => {
                setLogoPhase(2);
            }, 280);
            const endTimer = setTimeout(() => {
                setIsTransitioning(false);
                setLogoPhase(1);
            }, 750);
            prevPathRef.current = currentPath;
            return () => {
                clearTimeout(morphTimer);
                clearTimeout(endTimer);
            };
        } else if (leavingProjects) {
            setLogoPhase(2);
            setIsTransitioning(true);
            const morphTimer = setTimeout(() => {
                setLogoPhase(1);
            }, 250);
            const endTimer = setTimeout(() => {
                setIsTransitioning(false);
            }, 650);
            prevPathRef.current = currentPath;
            return () => {
                clearTimeout(morphTimer);
                clearTimeout(endTimer);
            };
        }

        prevPathRef.current = currentPath;
    }, [location.pathname]);

    return (
        <div className="relative min-h-screen bg-brand-bg text-brand-text overflow-x-hidden">
            
            {/* TRANSITION LAYER (Dynamic SF -> Anvil Animated Logo Morph) */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        key="transition-layer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] bg-[#0c0e14] flex items-center justify-center pointer-events-none"
                    >
                        {/* Subtle Ambient Radial Lighting */}
                        <div className="absolute inset-0 bg-blue-600/10 blur-[90px] rounded-full pointer-events-none" />

                        {/* Centered Dynamic Logo Morph */}
                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <AnimatePresence mode="wait">
                                {logoPhase === 1 ? (
                                    /* Phase 1: SkillForge SF Logo */
                                    <motion.div
                                        key="trans-sf"
                                        initial={{ scale: 0.85, opacity: 0, filter: "blur(4px)" }}
                                        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                                        exit={{ scale: 0.85, opacity: 0, filter: "blur(6px)" }}
                                        transition={{ duration: 0.22, ease: "easeInOut" }}
                                        className="relative p-4 rounded-3xl bg-[#141416] border border-neutral-800 shadow-2xl flex items-center justify-center"
                                    >
                                        <img 
                                            src="/images/skillforge-icon.png" 
                                            alt="SkillForge" 
                                            className="h-16 sm:h-20 w-auto object-contain" 
                                        />
                                    </motion.div>
                                ) : (
                                    /* Phase 2: Morphs into The Code Anvil Logo */
                                    <motion.div
                                        key="trans-anvil"
                                        initial={{ scale: 0.85, opacity: 0, filter: "blur(8px)" }}
                                        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                                        exit={{ scale: 1.1, opacity: 0, filter: "blur(4px)" }}
                                        transition={{ duration: 0.28, type: "spring", stiffness: 140, damping: 18 }}
                                        className="relative p-4 rounded-3xl bg-[#141416] border border-blue-500/30 shadow-[0_0_25px_rgba(37,99,235,0.3)] flex items-center justify-center"
                                    >
                                        <img 
                                            src="/images/code-anvil-logo.png" 
                                            alt="The Code Anvil" 
                                            className="h-16 sm:h-20 w-auto object-contain" 
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="text-[11px] font-mono text-neutral-400 transition-all">
                                {logoPhase === 1 ? "SkillForge Cloud" : "Code Anvil Runtime"}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ROUTE PAGE SLIDE / FADE TRANSITION */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="min-h-screen w-full"
                >
                    {React.isValidElement(children)
                        ? React.cloneElement(children, { location })
                        : children}
                </motion.div>
            </AnimatePresence>

        </div>
    );
}

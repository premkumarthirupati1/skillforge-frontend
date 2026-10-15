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
    const [transitionLogoType, setTransitionLogoType] = useState("anvil"); // "anvil" or "sf"

    useEffect(() => {
        const currentPath = location.pathname;
        const prevPath = prevPathRef.current;

        const enteringProjects = currentPath.startsWith("/project") && !prevPath.startsWith("/project");
        const leavingProjects = !currentPath.startsWith("/project") && prevPath.startsWith("/project");

        if (enteringProjects) {
            setTransitionLogoType("anvil");
            setIsTransitioning(true);
            const timer = setTimeout(() => setIsTransitioning(false), 550);
            prevPathRef.current = currentPath;
            return () => clearTimeout(timer);
        } else if (leavingProjects) {
            setTransitionLogoType("sf");
            setIsTransitioning(true);
            const timer = setTimeout(() => setIsTransitioning(false), 450);
            prevPathRef.current = currentPath;
            return () => clearTimeout(timer);
        }

        prevPathRef.current = currentPath;
    }, [location.pathname]);

    return (
        <div className="relative min-h-screen bg-brand-bg text-brand-text overflow-x-hidden">
            
            {/* TRANSITION LAYER (Logo Animation Layer 200-450ms) */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        key="transition-layer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] bg-[#090D16] flex items-center justify-center pointer-events-none"
                    >
                        {/* Ambient Radial Energy Glow */}
                        <div className="absolute inset-0 bg-blue-600/15 blur-[100px] rounded-full pointer-events-none" />

                        {/* Subtle Shockwave Rings */}
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0.8 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute w-36 h-36 rounded-full border border-blue-400/40 pointer-events-none"
                        />
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0.6 }}
                            animate={{ scale: 1.6, opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                            className="absolute w-36 h-36 rounded-full border border-cyan-400/40 pointer-events-none"
                        />

                        {/* Centered Logo Morph */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.15, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="relative z-10 flex flex-col items-center gap-3"
                        >
                            {transitionLogoType === "anvil" ? (
                                /* The Code Anvil Logo */
                                <div className="relative p-4 rounded-3xl bg-[#070A11] border border-blue-500/40 shadow-[0_0_35px_rgba(37,99,235,0.4)] flex items-center justify-center">
                                    <img 
                                        src="/images/code-anvil-logo.png" 
                                        alt="The Code Anvil" 
                                        className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]" 
                                    />
                                </div>
                            ) : (
                                /* Normal SkillForge SF Logo */
                                <div className="relative p-4 rounded-3xl bg-[#070A11] border border-blue-500/40 shadow-[0_0_35px_rgba(37,99,235,0.4)] flex items-center justify-center">
                                    <img 
                                        src="/images/skillforge-icon.png" 
                                        alt="SkillForge" 
                                        className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]" 
                                    />
                                </div>
                            )}
                        </motion.div>
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

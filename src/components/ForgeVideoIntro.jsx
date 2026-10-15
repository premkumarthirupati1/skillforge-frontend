import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ForgeVideoIntro Component
 * Pure fullscreen cinematic video transition.
 * Displays ONLY the video — no text, no headers, no footers, no video details.
 * Seamlessly fades out once the video completes to reveal the page.
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
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                onClick={onClose}
                className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16] cursor-pointer"
            >
                {/* Pure Fullscreen / Centered Video Player with Zero Details */}
                <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        onEnded={onClose}
                        className="w-full h-full object-contain"
                    >
                        <source src="/videos/skillforge-to-anvil-transition.mp4" type="video/mp4" />
                        <source src="/videos/skillforge-to-anvil-transition.webm" type="video/webm" />
                    </video>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

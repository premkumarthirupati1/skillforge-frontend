import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ForgeVideoIntro Component
 * Pure fullscreen cinematic video transition using the user's 1080p video.
 * Displays ONLY the video — no text, no headers, no footers, no video details.
 * Seamlessly fades out once the video completes to reveal the Project Forge.
 * Clicking anywhere dismisses instantly.
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
                onClick={onClose}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black cursor-pointer overflow-hidden select-none"
            >
                {/* Fullscreen 1080p Video Player with Zero Details */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    onEnded={onClose}
                    className="w-full h-full object-contain max-w-full max-h-full"
                >
                    <source src="/videos/skillforge-to-anvil-transition.mp4" type="video/mp4" />
                </video>
            </motion.div>
        </AnimatePresence>
    );
}

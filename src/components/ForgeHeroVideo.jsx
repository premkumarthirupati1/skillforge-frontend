import React, { useRef, useState } from "react";
import { Play, RotateCcw, Sparkles } from "lucide-react";

/**
 * ForgeHeroVideo Component
 * An embedded high-definition video player showing the animated transition
 * from SkillForge into the Code Anvil logo. Plays smoothly on auto-loop with
 * zero manual prompts or awkward button widgets.
 */
export default function ForgeHeroVideo({ className = "" }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);

    const handleReplay = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <div className={`relative max-w-3xl mx-auto rounded-3xl overflow-hidden border border-blue-500/25 bg-[#0A0E17] shadow-[0_20px_60px_rgba(37,99,235,0.2)] ${className}`}>
            
            {/* Ambient Corner Glows */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-cyan-400/20 blur-[60px] rounded-full pointer-events-none" />

            {/* Top Subtitle Bar */}
            <div className="px-5 py-3 border-b border-white/10 bg-[#111827]/80 backdrop-blur-md flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                        Identity Shift: SkillForge ➔ The Code Anvil
                    </span>
                </div>
                
                <button
                    onClick={handleReplay}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-[11px] transition-colors"
                    title="Replay Video Transition"
                >
                    <RotateCcw size={12} />
                    <span>Replay</span>
                </button>
            </div>

            {/* Video Container (16:9 Aspect Ratio) */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/videos/skillforge-to-anvil-transition.mp4" type="video/mp4" />
                    <source src="/videos/skillforge-to-anvil-transition.webm" type="video/webm" />
                </video>
            </div>

            {/* Bottom Status Ribbon */}
            <div className="px-5 py-2.5 bg-[#090D16] border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="truncate">
                    Automatic transition into Project Forge runtime
                </span>
                <span className="text-blue-400 font-bold shrink-0">
                    2.5s 30FPS • HD
                </span>
            </div>

        </div>
    );
}

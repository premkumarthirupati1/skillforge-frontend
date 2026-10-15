import React from "react";

/**
 * Code Anvil Logo Component
 * The official badge for SkillForge's compiler runtime, sandbox IDE, and Project Forge.
 * Minimalist geometric anvil nested between code brackets (< >) in electric cobalt and white.
 * 
 * @param {('sm'|'md'|'lg'|'xl'|'2xl')} size - Scale of the anvil mark
 * @param {boolean} pulsing - If true, pulses with electric blue energy (compiler bootup)
 * @param {string} className - Additional CSS styling
 */
export default function CodeAnvilLogo({ 
    size = "md", 
    pulsing = false, 
    className = "" 
}) {
    const heights = {
        sm: "h-6",
        md: "h-8",
        lg: "h-12",
        xl: "h-16",
        "2xl": "h-24"
    }[size] || "h-8";

    return (
        <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
            {/* Ambient Electric Blue Glow when pulsing */}
            {pulsing && (
                <div className="absolute inset-0 bg-blue-500/25 blur-xl rounded-full animate-pulse pointer-events-none scale-125" />
            )}

            {/* Dark Mode Version (White Anvil + Electric Blue Bracket) */}
            <img 
                src="/images/code-anvil-logo.png" 
                alt="Code Anvil - SkillForge Runtime" 
                className={`${heights} w-auto object-contain hidden dark:block transition-all duration-300 ${
                    pulsing ? "animate-pulse brightness-110 drop-shadow-[0_0_15px_rgba(37,99,235,0.6)]" : ""
                }`}
            />

            {/* Light Mode Version (Slate Anvil + Electric Blue Bracket) */}
            <img 
                src="/images/code-anvil-logo-light.png" 
                alt="Code Anvil - SkillForge Runtime" 
                className={`${heights} w-auto object-contain block dark:hidden transition-all duration-300 ${
                    pulsing ? "animate-pulse brightness-110 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]" : ""
                }`}
            />
        </div>
    );
}

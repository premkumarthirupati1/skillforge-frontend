import React from "react";

/**
 * SkillForge Brandmark Logo Component
 * Uses the exact interlocking 'SF' emblem with transparent background.
 * Automatically adapts between dark mode (white "Skill" + blue "Forge")
 * and light mode (slate "Skill" + blue "Forge").
 * 
 * @param {('sm'|'md'|'lg'|'xl')} size - Logo dimensions scale
 * @param {boolean} iconOnly - If true, displays only the cropped 'SF' monogram icon
 * @param {string} className - Optional container styling classes
 */
export default function SkillForgeLogo({ 
    size = "md", 
    iconOnly = false,
    className = "" 
}) {
    // Height mappings for navbar and headers
    const heights = {
        sm: "h-6",
        md: "h-8",
        lg: "h-11",
        xl: "h-16"
    }[size] || "h-8";

    if (iconOnly) {
        return (
            <img 
                src="/images/skillforge-icon.png" 
                alt="SkillForge" 
                className={`${heights} w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
            />
        );
    }

    return (
        <div className={`inline-flex items-center select-none ${className}`}>
            {/* Dark Mode Version (White "Skill" + Blue "Forge") */}
            <img 
                src="/images/skillforge-logo.png" 
                alt="SkillForge" 
                className={`${heights} w-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-102`}
            />
            {/* Light Mode Version (Dark Slate "Skill" + Blue "Forge") */}
            <img 
                src="/images/skillforge-logo-light.png" 
                alt="SkillForge" 
                className={`${heights} w-auto object-contain block dark:hidden transition-transform duration-200 group-hover:scale-102`}
            />
        </div>
    );
}

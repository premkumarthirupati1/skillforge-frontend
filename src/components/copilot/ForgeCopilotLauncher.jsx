import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, BookOpen, MessageSquare } from "lucide-react";
import { useForgeCopilot } from "../../context/ForgeCopilotContext";

export default function ForgeCopilotLauncher() {
    const { isOpen, toggleCopilot, activeMode, currentPath } = useForgeCopilot();
    const [isHovered, setIsHovered] = useState(false);

    // CRITICAL: Do NOT show duplicate floating launcher inside the code editor workspace
    // Per requirement: "Inside the code editor, use the editor's dedicated assistant panel rather than displaying a duplicate floating chatbot."
    const isEditorWorkspace = currentPath.includes("/workspace") || (currentPath.startsWith("/projects/") && currentPath.split("/").length > 2 && !currentPath.endsWith("/projects"));

    if (isEditorWorkspace) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
            {/* Tooltip Pill on Hover */}
            <AnimatePresence>
                {isHovered && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18181b] border border-neutral-700/80 text-white shadow-xl text-xs font-medium pointer-events-none"
                    >
                        <Sparkles size={13} className="text-blue-400" />
                        <span>Ask Forge Copilot</span>
                        {activeMode === "learning" && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                Lesson Mode
                            </span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            <motion.button
                type="button"
                onClick={toggleCopilot}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative group flex items-center justify-center w-12 h-12 rounded-2xl border transition-all duration-200 ${
                    isOpen
                        ? "bg-[#18181b] border-neutral-700 text-white shadow-lg"
                        : "bg-[#18181b] hover:bg-neutral-800 text-blue-400 hover:text-white border-neutral-700/80 shadow-md"
                }`}
                aria-label="Ask Forge Copilot"
                title="Ask Forge Copilot"
            >

                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close-icon"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X size={22} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="copilot-icon"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="relative"
                        >
                            <Sparkles size={24} className="drop-shadow-sm" />
                            {activeMode === "learning" && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0B0F19]" />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Sparkles, 
    X, 
    RotateCcw, 
    Send, 
    ArrowUp,
    Compass, 
    BookOpen, 
    Code2, 
    Lightbulb, 
    Bug, 
    CheckCircle2, 
    ArrowUpRight,
    ChevronDown,
    Bot
} from "lucide-react";
import { useForgeCopilot } from "../../context/ForgeCopilotContext";
import ForgeCopilotMarkdown from "./ForgeCopilotMarkdown";
import ForgeCopilotCard from "./ForgeCopilotCard";

export default function ForgeCopilotPanel() {
    const { 
        isOpen, 
        setIsOpen, 
        activeMode, 
        messages, 
        isLoading, 
        sendMessage, 
        clearChat,
        lessonContext,
        projectContext
    } = useForgeCopilot();

    const [inputText, setInputText] = useState("");
    const [isAgentMode, setIsAgentMode] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-scroll to bottom of chat when new message arrives
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading, isOpen]);

    // Auto-focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 250);
        }
    }, [isOpen]);

    // Auto-resize textarea as user types
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [inputText]);

    const handleSend = () => {
        if (!inputText.trim() || isLoading) return;
        const text = inputText.trim();
        setInputText("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        sendMessage(text, { isAgent: isAgentMode });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getModeBadge = () => {
        switch (activeMode) {
            case "learning":
                return {
                    label: "Lesson Companion",
                    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                    icon: <BookOpen size={11} />
                };
            case "coding":
                return {
                    label: "Project Assistant",
                    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                    icon: <Code2 size={11} />
                };
            default:
                return {
                    label: "Global Assistant",
                    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                    icon: <Compass size={11} />
                };
        }
    };

    const modeBadge = getModeBadge();

    // 4 Contextual Prompt Cards
    const quickPromptCards = [
        {
            icon: <Bug size={16} className="text-rose-400" />,
            title: "Debug my code",
            desc: "Diagnose an error or unexpected output with guided hints.",
            prompt: activeMode === "coding"
                ? "Can you help me diagnose why my current milestone assertions are failing?"
                : "Can you help me debug a code issue? Here is what I am trying to accomplish:"
        },
        {
            icon: <Lightbulb size={16} className="text-amber-400" />,
            title: "Explain a concept",
            desc: "Break down algorithms, system design, or language features.",
            prompt: activeMode === "learning" && lessonContext?.title
                ? `Can you explain the key concepts of "${lessonContext.title}" using an intuitive mental model?`
                : "Can you explain how distributed consensus protocols like Raft work with an intuitive analogy?"
        },
        {
            icon: <CheckCircle2 size={16} className="text-emerald-400" />,
            title: "Help me practise",
            desc: "Generate a quick quiz or challenge for what I'm learning.",
            prompt: activeMode === "learning" && lessonContext?.title
                ? `Test my understanding of "${lessonContext.title}" with a practical multiple-choice question.`
                : "Can you give me a practical coding challenge to test my fullstack engineering skills?"
        },
        {
            icon: <Code2 size={16} className="text-blue-400" />,
            title: "Plan a project",
            desc: "Design architecture, choose stacks, and plan milestones.",
            prompt: "What is the recommended architectural plan and tech stack to build a high-performance distributed key-value store?"
        }
    ];

    const getPlaceholder = () => {
        if (activeMode === "learning") {
            return "Ask about this lesson, concepts, or request a hint...";
        }
        if (activeMode === "coding") {
            return "Ask about debugging, architecture, or test failures...";
        }
        return "Ask Forge Copilot about courses, concepts, or code...";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop on mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
                    />

                    {/* Copilot Drawer Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 400, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 420, scale: 0.98 }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="fixed top-0 right-0 sm:top-4 sm:right-4 z-50 w-full sm:w-[440px] h-full sm:h-[calc(100vh-32px)] bg-[#18181b] text-neutral-200 border-l sm:border border-neutral-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative px-4 py-3 bg-[#141416] border-b border-neutral-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-blue-400">
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold tracking-tight text-white">
                                            Forge Copilot
                                        </h3>
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${modeBadge.color}`}>
                                            {modeBadge.icon}
                                            {modeBadge.label}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 truncate max-w-[210px] sm:max-w-[260px]">
                                        Your companion for learning, coding, and building.
                                    </p>
                                </div>
                            </div>

                            {/* Actions: New Chat & Close */}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={clearChat}
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                    title="New conversation"
                                >
                                    <RotateCcw size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                    title="Close Forge Copilot"
                                >
                                    <X size={17} />
                                </button>
                            </div>
                        </div>

                        {/* Active Context Banner if in Lesson mode */}
                        {activeMode === "learning" && lessonContext?.title && (
                            <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center gap-2 text-xs text-neutral-300">
                                <BookOpen size={13} className="shrink-0 text-emerald-400" />
                                <span className="truncate">Active Lesson: <strong>{lessonContext.title}</strong></span>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                            {/* If only welcome message exists, show clean LeetCode-inspired empty state */}
                            {messages.length <= 1 && (
                                <div className="my-4 flex flex-col items-center justify-center text-center space-y-3.5 px-2">
                                    <div className="text-3xl select-none">
                                        😎
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold text-neutral-200">
                                            Stuck? Forge Copilot guides you through every line.
                                        </h4>
                                        <p className="text-xs text-neutral-400 max-w-xs">
                                            Ask about lesson concepts, diagnose test failures, or plan your next software project.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-1">
                                        {quickPromptCards.map((card, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => sendMessage(card.prompt, { isAgent: isAgentMode })}
                                                className="text-left p-2.5 rounded-xl bg-[#202024] hover:bg-[#27272b] border border-neutral-800 transition-all group flex flex-col justify-between"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    {card.icon}
                                                    <span className="text-xs font-medium text-neutral-200 group-hover:text-blue-400 transition-colors">
                                                        {card.title}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                                                    {card.desc}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Messages Stream */}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`max-w-[92%] rounded-2xl p-3.5 text-xs sm:text-sm ${
                                            msg.role === "user"
                                                ? "bg-neutral-800 text-neutral-100 border border-neutral-700/60 rounded-tr-sm"
                                                : "bg-[#202024] border border-neutral-800/80 text-neutral-200 rounded-tl-sm shadow-sm"
                                        }`}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-neutral-800 text-[11px] text-neutral-400">
                                                <Sparkles size={12} className="text-blue-400" />
                                                <span className="font-semibold text-neutral-200">Forge Copilot</span>
                                                <span className="text-[10px] text-neutral-500">• {msg.timestamp}</span>
                                            </div>
                                        )}

                                        <ForgeCopilotMarkdown 
                                            content={msg.content} 
                                            onLinkClick={() => setIsOpen(false)}
                                        />

                                        {/* Render Course Cards if present */}
                                        {msg.recommendedCourses && msg.recommendedCourses.length > 0 && (
                                            <div className="mt-3 pt-2 border-t border-neutral-800">
                                                <p className="text-[11px] uppercase font-mono font-semibold text-neutral-400 mb-1.5">
                                                    Recommended Courses
                                                </p>
                                                {msg.recommendedCourses.map((c) => (
                                                    <ForgeCopilotCard 
                                                        key={c._id} 
                                                        course={c} 
                                                        onNavigate={() => setIsOpen(false)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Follow-up Suggestions Chips */}
                                    {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                                            {msg.suggestions.map((sug, sIdx) => (
                                                <button
                                                    key={sIdx}
                                                    type="button"
                                                    onClick={() => sendMessage(sug, { isAgent: isAgentMode })}
                                                    className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 hover:text-white transition-all text-left"
                                                >
                                                    {sug}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Thinking / Loading indicator */}
                            {isLoading && (
                                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#202024] border border-neutral-800 w-fit">
                                    <Sparkles size={14} className="text-blue-400 animate-spin" />
                                    <span className="text-xs text-neutral-400 font-medium">Forge Copilot is thinking</span>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Composer (LeetCode Studio Style) */}
                        <div className="p-3 bg-[#141416] border-t border-neutral-800 shrink-0">
                            <div className="rounded-2xl border border-neutral-700/60 bg-[#1e1e22] focus-within:border-neutral-500 p-3 transition-colors shadow-sm">
                                <textarea
                                    ref={textareaRef}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Shift + Enter to insert a line break."
                                    rows={1}
                                    className="w-full bg-transparent border-0 outline-none resize-none text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 max-h-28 overflow-y-auto leading-relaxed"
                                />

                                {/* Bottom Control Bar inside Composer */}
                                <div className="flex items-center justify-between pt-2 mt-1 border-t border-neutral-800/80">
                                    {/* Left: Model Pill */}
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#161619] border border-neutral-700/50 text-[11px] font-mono text-neutral-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span>Qwen 2.5 Coder</span>
                                        <ChevronDown size={11} className="text-neutral-500" />
                                    </div>

                                    {/* Right: Agent Switch + Circular Send Button */}
                                    <div className="flex items-center gap-3">
                                        <div 
                                            onClick={() => setIsAgentMode(!isAgentMode)}
                                            className="flex items-center gap-1.5 cursor-pointer select-none"
                                            title="Toggle Autonomous Agent Reasoning Mode"
                                        >
                                            <span className="text-[11px] text-neutral-400 font-medium">Agent</span>
                                            <div 
                                                className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                                                    isAgentMode ? "bg-blue-600" : "bg-neutral-700"
                                                }`}
                                            >
                                                <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                                                    isAgentMode ? "translate-x-3.5" : "translate-x-0"
                                                }`} />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSend}
                                            disabled={!inputText.trim() || isLoading}
                                            className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-sm active:scale-95"
                                            title="Send message (Enter)"
                                        >
                                            <ArrowUp size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

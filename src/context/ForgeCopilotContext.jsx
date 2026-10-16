import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";

const ForgeCopilotContext = createContext(null);

export function ForgeCopilotProvider({ children }) {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lessonContext, setLessonContext] = useState(null);
    const [projectContext, setProjectContext] = useState(null);

    // Initial welcome message
    const getInitialMessage = (mode) => ({
        id: "welcome-1",
        role: "assistant",
        content: mode === "learning"
            ? `Hello! I'm **Forge Copilot**, your learning companion. I'm connected to your active lesson and ready to explain concepts, guide you with progressive hints, or test your understanding. What would you like to explore?`
            : mode === "coding"
            ? `Hello! I'm **Forge Copilot**, your engineering assistant. I can diagnose test failures, review implementation patterns, and guide you through your milestones. What are you building right now?`
            : `Hello! I'm **Forge Copilot**, your companion for learning, coding, and building.\n\nWhether you're looking for the right course to master a new skill, debugging a system, or understanding architecture, I'm here to guide you. How can I assist you today?`,
        suggestions: mode === "learning"
            ? [
                "Summarize the main takeaways of this lesson",
                "Explain the core concept with an analogy",
                "Give me a subtle hint on the challenge"
            ]
            : mode === "coding"
            ? [
                "Why is my milestone test failing?",
                "Review my code for edge cases",
                "Explain the expected architectural pattern"
            ]
            : [
                "What course should I start with as a beginner?",
                "How do hands-on project milestones work?",
                "Recommend courses for Fullstack and System Design"
            ],
        recommendedCourses: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Detect operating mode based on current URL and active contexts
    const computeCurrentMode = useCallback(() => {
        const path = location.pathname;
        if (path.includes("/lesson/")) {
            return "learning";
        }
        if (path.includes("/workspace") || path.includes("/projects/")) {
            return "coding";
        }
        return "global";
    }, [location.pathname]);

    const activeMode = computeCurrentMode();

    const [messages, setMessages] = useState([getInitialMessage(activeMode)]);

    // When navigating to a new major section, adapt initial message if chat is pristine
    useEffect(() => {
        setMessages(prev => {
            if (prev.length <= 1) {
                return [getInitialMessage(activeMode)];
            }
            return prev;
        });
    }, [activeMode]);

    const toggleCopilot = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const clearChat = useCallback(() => {
        setMessages([getInitialMessage(activeMode)]);
    }, [activeMode]);

    const sendMessage = useCallback(async (text) => {
        if (!text || !text.trim() || isLoading) return;

        const userMsg = {
            id: `user-${Date.now()}`,
            role: "user",
            content: text.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setIsLoading(true);

        try {
            // Build safe context payload
            const contextPayload = {
                route: location.pathname,
                lesson: lessonContext || null,
                project: projectContext || null
            };

            const payload = {
                mode: activeMode,
                messages: updatedHistory.map(m => ({
                    role: m.role,
                    content: m.content
                })),
                context: contextPayload
            };

            const response = await api.post("/copilot/chat", payload);
            const data = response.data;

            const assistantMsg = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: data.reply || "I've processed your request. Let me know if you need more details!",
                suggestions: data.suggestions || [],
                recommendedCourses: data.recommendedCourses || [],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            console.error("Forge Copilot communication error:", err);
            const errorMsg = {
                id: `assistant-error-${Date.now()}`,
                role: "assistant",
                content: "I ran into a temporary connection issue reaching the AI engine. You can retry your question in a moment or explore our course catalog directly.",
                suggestions: [
                    "What courses are available on SkillForge?",
                    "How do I get started with hands-on projects?"
                ],
                recommendedCourses: [],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, isLoading, activeMode, location.pathname, lessonContext, projectContext]);

    const quickAction = useCallback((prompt) => {
        sendMessage(prompt);
    }, [sendMessage]);

    return (
        <ForgeCopilotContext.Provider
            value={{
                isOpen,
                setIsOpen,
                toggleCopilot,
                activeMode,
                messages,
                isLoading,
                sendMessage,
                clearChat,
                quickAction,
                lessonContext,
                setLessonContext,
                projectContext,
                setProjectContext,
                currentPath: location.pathname
            }}
        >
            {children}
        </ForgeCopilotContext.Provider>
    );
}

export function useForgeCopilot() {
    const context = useContext(ForgeCopilotContext);
    if (!context) {
        throw new Error("useForgeCopilot must be used within a ForgeCopilotProvider");
    }
    return context;
}

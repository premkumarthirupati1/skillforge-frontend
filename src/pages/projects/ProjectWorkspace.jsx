import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Play, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    GitBranch, 
    ChevronRight, 
    ChevronLeft, 
    ArrowLeft, 
    Terminal, 
    BookOpen, 
    Sparkles, 
    Copy, 
    Check, 
    RotateCcw, 
    ShieldCheck, 
    Layers, 
    Award, 
    Lock, 
    Maximize2, 
    Minimize2, 
    Code2, 
    Milestone, 
    Target, 
    FolderTree, 
    Search, 
    Send, 
    ArrowUp, 
    ChevronDown, 
    Lightbulb, 
    Zap, 
    RefreshCw, 
    X, 
    PanelLeftClose, 
    PanelLeftOpen, 
    PanelRightClose,
    PanelRightOpen,
    Plus, 
    Cloud,
    FileText,
    Bot,
    Sun,
    Settings,
    HelpCircle,
    Paperclip,
    AlertCircle,
    CheckCircle,
    Flame,
    FileCode,
    MessageSquare,
    Bookmark,
    Folder,
    FolderOpen,
    UploadCloud,
    Bug
} from "lucide-react";
import { PROJECTS } from "../../data/projectsData";
import { getProjectWorkspaceData } from "../../data/projectWorkspacesData";
import { executeProjectTests, isClientSideLanguage } from "../../services/codeRunnerService";
import { fetchAiMentorAdvice } from "../../services/aiMentorService";
import CodeStudioEditor from "../../components/workspace/CodeStudioEditor";
import CommandPalette from "../../components/workspace/CommandPalette";
import FileExplorerTree, { getFileIcon } from "../../components/workspace/FileExplorerTree";
import CodeReviewPanel from "../../components/workspace/CodeReviewPanel";
import toast from "react-hot-toast";
import api from "../../api";
import ForgeCopilotMarkdown from "../../components/copilot/ForgeCopilotMarkdown";

/**
 * Structured AI / Markdown Content Formatter with Mermaid & Visual Diagram support
 */
function FormattedAiContent({ content, className = "" }) {
    if (!content) return null;
    return (
        <div className={`text-xs leading-relaxed ${className}`}>
            <ForgeCopilotMarkdown content={String(content)} />
        </div>
    );
}

function renderInlineText(text) {
    if (!text) return null;
    const parts = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIdx) {
            parts.push(text.substring(lastIdx, match.index));
        }
        const token = match[0];
        if (token.startsWith('`') && token.endsWith('`')) {
            parts.push(
                <code key={match.index} className="px-1.5 py-0.5 mx-0.5 rounded bg-[#181d29] text-[#7dd3fc] font-mono text-[11px] border border-[#242c3d] font-medium inline-block">
                    {token.slice(1, -1)}
                </code>
            );
        } else if (token.startsWith('**') && token.endsWith('**')) {
            parts.push(
                <strong key={match.index} className="font-semibold text-[#f1f5f9]">
                    {token.slice(2, -2)}
                </strong>
            );
        }
        lastIdx = regex.lastIndex;
    }
    if (lastIdx < text.length) {
        parts.push(text.substring(lastIdx));
    }
    return parts;
}

export default function ProjectWorkspace() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    // Strict Authentication Guard
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please sign in to access the engineering workspace and track your progress", {
                icon: "🔒",
                id: "auth-guard-workspace"
            });
            navigate("/login", {
                replace: true,
                state: { from: `/projects/${projectId}/workspace` }
            });
        }
    }, [projectId, navigate]);

    // Find project metadata
    const project = useMemo(() => {
        return PROJECTS.find(p => p.id === projectId) || PROJECTS[0];
    }, [projectId]);

    // Load workspace starter files and milestone guides
    const workspaceData = useMemo(() => {
        return getProjectWorkspaceData(project.id, project);
    }, [project]);

    // Current active milestone (0-indexed, restored from saved progress)
    const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(() => {
        try {
            const saved = localStorage.getItem(`skillforge_active_milestone_${project.id}`);
            if (saved !== null) {
                const idx = parseInt(saved, 10);
                if (!isNaN(idx) && idx >= 0 && idx < (project.milestones?.length || 5)) {
                    const verified = new Set(JSON.parse(localStorage.getItem(`skillforge_verified_${project.id}`) || "[]"));
                    if (idx === 0 || verified.has(idx - 1)) {
                        return idx;
                    }
                }
            }
        } catch (e) {}
        return 0;
    });
    const currentMilestone = project.milestones?.[currentMilestoneIndex] || project.milestones?.[0];

    // Verified Milestones set
    const [verifiedMilestones, setVerifiedMilestones] = useState(() => {
        try {
            const saved = localStorage.getItem(`skillforge_verified_${project.id}`);
            if (saved) {
                return new Set(JSON.parse(saved));
            }
        } catch (e) {}
        return new Set();
    });

    const isCurrentMilestoneVerified = verifiedMilestones.has(currentMilestoneIndex);

    // Strict Progression Rule
    const isMilestoneUnlocked = (idx) => {
        if (idx === 0) return true;
        return verifiedMilestones.has(idx - 1);
    };

    // Safe milestone switcher
    const handleSelectMilestone = (targetIdx) => {
        if (!isMilestoneUnlocked(targetIdx)) {
            toast.error(`Stage ${targetIdx + 1} is locked! Complete and pass all tests for Stage ${targetIdx} first.`, {
                icon: "🔒",
                id: `locked_stage_${targetIdx}`
            });
            return false;
        }
        setCurrentMilestoneIndex(targetIdx);
        setSelectedRoadmapIdx(targetIdx);
        setSpecTab("description");
        try {
            localStorage.setItem(`skillforge_active_milestone_${project.id}`, targetIdx.toString());
        } catch (e) {}
        return true;
    };

    // File editor contents (persisted per project)
    const [files, setFiles] = useState(() => {
        const saved = localStorage.getItem(`skillforge_files_${project.id}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const isStale = Array.isArray(parsed) && parsed.some(f => 
                    (f.name?.endsWith('.py') && (f.content?.includes('// SkillForge') || f.content?.includes('module.exports'))) ||
                    (f.name?.endsWith('.rs') && f.content?.includes('console.log')) ||
                    (f.name?.endsWith('.go') && f.content?.includes('console.log'))
                );
                if (!isStale && parsed.length > 0) {
                    return parsed;
                }
            } catch (e) { /* fallback */ }
        }
        return workspaceData.files;
    });

    const [activeFileName, setActiveFileName] = useState(workspaceData.files[0]?.name || "main.rs");

    // Activity Rail selection: 'learn' | 'files' | 'tests' | 'discuss' | 'bookmarks'
    const [activityTab, setActivityTab] = useState("learn");

    // Left Drawer Tab: 'description' | 'roadmap' | 'submissions'
    const [specTab, setSpecTab] = useState("description");
    const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState(0);
    const [isSpecsCollapsed, setIsSpecsCollapsed] = useState(false);

    // Sub-tabs in Description: 'task' | 'requirements' | 'examples' | 'hints'
    const [subSpecTab, setSubSpecTab] = useState("task");
    const [isHiddenTestsOpen, setIsHiddenTestsOpen] = useState(false);

    // Resizable Panels
    const [panelWidth, setPanelWidth] = useState(() => {
        try {
            const saved = localStorage.getItem("skillforge_sidepanel_width");
            return saved ? parseInt(saved, 10) || 350 : 350;
        } catch {
            return 350;
        }
    });
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);

    // Right Copilot Panel width & toggle
    const [isCopilotOpen, setIsCopilotOpen] = useState(true);
    const [copilotWidth, setCopilotWidth] = useState(() => {
        try {
            const saved = localStorage.getItem("skillforge_copilot_width");
            return saved ? parseInt(saved, 10) || 380 : 380;
        } catch {
            return 380;
        }
    });
    const [isDraggingCopilot, setIsDraggingCopilot] = useState(false);

    // Bottom execution panel height & toggle
    const [terminalHeight, setTerminalHeight] = useState(240);
    const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);
    const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);

    // Execution Bottom Drawer Tab: 'results' | 'console' | 'terminal' | 'problems' | 'debugger'
    const [terminalTab, setTerminalTab] = useState("results");

    // Execution state
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [selectedFailedTestIdx, setSelectedFailedTestIdx] = useState(0);

    // AI Automated Code Review state
    const [codeReview, setCodeReview] = useState(() => {
        try {
            const saved = localStorage.getItem(`skillforge_review_${project?.id}_${currentMilestoneIndex}`);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });
    const [isLoadingReview, setIsLoadingReview] = useState(false);
    const [reviewHistory, setReviewHistory] = useState([]);

    // Copilot sub-tabs: 'chat' | 'code' | 'explain' | 'debug' | 'architect'
    const [copilotSubTab, setCopilotSubTab] = useState("chat");

    // Monaco Editor Reference & Coordinates
    const editorInstanceRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

    // Command Palette Modal
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    // Console logs
    const [consoleLogs, setConsoleLogs] = useState([
        `⚡ skillforge-engine v2.6 [${project.title}]`,
        `Environment: sandbox container sha256:8b47e2 mounted at /workspace`,
        `Branch: main (tracking origin/main)`,
        `Ready. Edit code in the center editor and press Run (Ctrl+Enter).`
    ]);
    const [terminalInput, setTerminalInput] = useState("");

    // Session timer
    const [secondsElapsed, setSecondsElapsed] = useState(() => {
        try {
            const saved = localStorage.getItem(`skillforge_timer_${project.id}`);
            return saved ? parseInt(saved, 10) || 0 : 0;
        } catch {
            return 0;
        }
    });
    const [showCelebration, setShowCelebration] = useState(false);

    // Forge Copilot state
    const [aiMentorState, setAiMentorState] = useState({
        isLoading: false,
        diagnosis: null,
        hint: null,
        level: 2, // 2. Pinpoint
        targetLine: null,
        codePattern: "",
        quickPrompts: [
            "Why is test failing? Review my code and suggest a fix.",
            "Give me a graduated hint",
            "Explain milestone architecture",
            "Check my code for edge cases"
        ],
        modelUsed: null,
        activeFailingTest: null,
        history: [],
        isAgentMode: false
    });
    const [aiMentorInput, setAiMentorInput] = useState("");

    // Active milestone guide data
    const milestoneGuide = workspaceData.milestoneGuides?.[currentMilestoneIndex] || {
        milestone: currentMilestoneIndex + 1,
        title: currentMilestone?.title || `Milestone ${currentMilestoneIndex + 1}`,
        objective: "Implement required architecture according to specification.",
        specRules: [
            "Listen on TCP address 127.0.0.1 and port 6379.",
            "Handle multiple concurrent client connections without blocking the main event loop.",
            "When client sends PING or *1\\r\\n$4\\r\\nping\\r\\n, respond with +PONG\\r\\n.",
            "With an echo argument (e.g., PING \"hello world\"), return $11\\r\\nhello world\\r\\n."
        ],
        hints: [
            "Use non-blocking asynchronous TCP stream handlers (e.g., tokio::net::TcpListener in Rust).",
            "Parse the RESP format array prefix (*) and bulk string length ($)."
        ],
        examples: [
            "Client sends: PING -> Server responds: +PONG\\r\\n",
            "Client sends: *2\\r\\n$4\\r\\nECHO\\r\\n$5\\r\\nhello\\r\\n -> Server responds: $5\\r\\nhello\\r\\n"
        ],
        testCases: [
            { name: "Test 1 - Basic PING command", expected: "+PONG\\r\\n", duration: "1 ms" },
            { name: "Test 2 - Multiple connections", expected: "Connected", duration: "2 ms" },
            { name: "Test 3 - PING with argument", expected: "$11\\r\\nhello world\\r\\n", actual: "+PONG\\r\\n", duration: "12 ms", failed: true },
            { name: "Test 4 - Concurrent clients", expected: "4 Ok", duration: "-", failed: true }
        ]
    };

    // Session timer ticker
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsElapsed(prev => {
                const next = prev + 1;
                try {
                    localStorage.setItem(`skillforge_timer_${project.id}`, next.toString());
                } catch (e) {}
                return next;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [project.id]);

    // Remote Progress Synchronization
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !project?.id) return;

        let isMounted = true;
        api.get(`/projects/progress/${project.id}`)
            .then((res) => {
                if (!isMounted) return;
                const progress = res.data?.progress;
                if (progress) {
                    if (Array.isArray(progress.verifiedMilestones) && progress.verifiedMilestones.length > 0) {
                        setVerifiedMilestones(new Set(progress.verifiedMilestones));
                        try {
                            localStorage.setItem(`skillforge_verified_${project.id}`, JSON.stringify(progress.verifiedMilestones));
                        } catch (e) {}
                    }
                    if (typeof progress.currentMilestone === "number" && progress.currentMilestone >= 0) {
                        const validIdx = Math.min(progress.currentMilestone, (project.milestones?.length || 5) - 1);
                        setCurrentMilestoneIndex(validIdx);
                        setSelectedRoadmapIdx(validIdx);
                        try {
                            localStorage.setItem(`skillforge_active_milestone_${project.id}`, validIdx.toString());
                        } catch (e) {}
                    }
                    if (typeof progress.secondsElapsed === "number" && progress.secondsElapsed > 0) {
                        setSecondsElapsed(progress.secondsElapsed);
                        try {
                            localStorage.setItem(`skillforge_timer_${project.id}`, progress.secondsElapsed.toString());
                        } catch (e) {}
                    }
                }
            })
            .catch((err) => {
                console.debug("Remote progress fetch:", err.message);
            });

        api.get(`/copilot/reviews/${project.id}`)
            .then((res) => {
                if (!isMounted) return;
                if (Array.isArray(res.data?.reviews)) {
                    setReviewHistory(res.data.reviews);
                    const currentReview = res.data.reviews.find(r => r.milestoneIndex === currentMilestoneIndex);
                    if (currentReview) setCodeReview(currentReview);
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [project?.id]);

    // Format seconds into MM:SS or HH:MM:SS
    const formattedTime = useMemo(() => {
        const hrs = Math.floor(secondsElapsed / 3600);
        const mins = Math.floor((secondsElapsed % 3600) / 60);
        const secs = secondsElapsed % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, [secondsElapsed]);

    // Drag Resizing Listeners
    const panelWidthRef = useRef(panelWidth);
    const terminalHeightRef = useRef(terminalHeight);
    const copilotWidthRef = useRef(copilotWidth);
    const resizeRafIdRef = useRef(null);

    useEffect(() => {
        panelWidthRef.current = panelWidth;
    }, [panelWidth]);

    useEffect(() => {
        terminalHeightRef.current = terminalHeight;
    }, [terminalHeight]);

    useEffect(() => {
        copilotWidthRef.current = copilotWidth;
    }, [copilotWidth]);

    useEffect(() => {
        if (!isDraggingPanel && !isDraggingTerminal && !isDraggingCopilot) return;

        document.body.style.userSelect = "none";
        document.body.style.cursor = (isDraggingPanel || isDraggingCopilot) ? "col-resize" : "row-resize";

        const handleMouseMove = (e) => {
            if (resizeRafIdRef.current) return;
            resizeRafIdRef.current = requestAnimationFrame(() => {
                resizeRafIdRef.current = null;
                if (isDraggingPanel) {
                    const newWidth = Math.max(260, Math.min(e.clientX - 56, window.innerWidth - 450));
                    setPanelWidth(newWidth);
                } else if (isDraggingCopilot) {
                    const newWidth = Math.max(280, Math.min(window.innerWidth - e.clientX, 650));
                    setCopilotWidth(newWidth);
                } else if (isDraggingTerminal) {
                    const newHeight = Math.max(80, Math.min(window.innerHeight - e.clientY - 26, window.innerHeight - 180));
                    setTerminalHeight(newHeight);
                }
            });
        };

        const handleMouseUp = () => {
            if (resizeRafIdRef.current) {
                cancelAnimationFrame(resizeRafIdRef.current);
                resizeRafIdRef.current = null;
            }
            document.body.style.userSelect = "";
            document.body.style.cursor = "";

            if (isDraggingPanel) {
                setIsDraggingPanel(false);
                try {
                    localStorage.setItem("skillforge_sidepanel_width", panelWidthRef.current.toString());
                } catch (e) {}
            }
            if (isDraggingCopilot) {
                setIsDraggingCopilot(false);
                try {
                    localStorage.setItem("skillforge_copilot_width", copilotWidthRef.current.toString());
                } catch (e) {}
            }
            if (isDraggingTerminal) {
                setIsDraggingTerminal(false);
            }

            editorInstanceRef.current?.layout();
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            if (resizeRafIdRef.current) {
                cancelAnimationFrame(resizeRafIdRef.current);
                resizeRafIdRef.current = null;
            }
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDraggingPanel, isDraggingTerminal, isDraggingCopilot]);

    // Handle Code Change
    const handleCodeChange = (newCode) => {
        setFiles(prev => {
            const updated = prev.map(f => f.name === activeFileName ? { ...f, content: newCode } : f);
            try {
                localStorage.setItem(`skillforge_files_${project.id}`, JSON.stringify(updated));
            } catch (e) {
                console.error("Failed to persist code to localStorage", e);
            }
            return updated;
        });
    };

    // Reset current file to initial skeleton
    const handleResetFile = () => {
        const original = workspaceData.files.find(f => f.name === activeFileName);
        if (original) {
            handleCodeChange(original.content);
            toast.success(`Reset ${activeFileName} to starter skeleton`);
        }
    };

    // Create New File
    const handleCreateFile = (newFileName) => {
        if (!newFileName) return;
        if (files.some(f => f.name === newFileName)) {
            toast.error(`File ${newFileName} already exists`);
            setActiveFileName(newFileName);
            return;
        }
        const ext = newFileName.split('.').pop()?.toLowerCase() || "txt";
        const newFile = {
            name: newFileName,
            path: `src/${newFileName}`,
            language: ext,
            content: `// ${newFileName}\n`
        };
        setFiles(prev => {
            const next = [...prev, newFile];
            try {
                localStorage.setItem(`skillforge_files_${project.id}`, JSON.stringify(next));
            } catch (e) {}
            return next;
        });
        setActiveFileName(newFileName);
        toast.success(`Created ${newFileName}`);
    };

    // Jump to Line in Monaco Editor
    const jumpToLine = (lineNumber) => {
        if (editorInstanceRef.current && lineNumber > 0) {
            editorInstanceRef.current.revealLineInCenter(lineNumber);
            editorInstanceRef.current.setPosition({ lineNumber, column: 1 });
            editorInstanceRef.current.focus();
            toast(`Navigated to line ${lineNumber}`, { icon: "📍" });
        }
    };

    const extractLineNumber = (output = "") => {
        const match = output.match(/line (\d+)/i) || output.match(/:(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    };

    // Apply Code Fix directly
    const handleApplyFix = (fixCode) => {
        if (!fixCode) return;
        handleCodeChange(fixCode);
        toast.success(`Applied suggested fix to ${activeFileName}!`);
    };

    // Trigger AI Automated Code Review
    const handleTriggerCodeReview = async () => {
        if (isLoadingReview) return;
        setIsLoadingReview(true);
        setTerminalTab("review");
        setIsTerminalCollapsed(false);

        const activeFileObj = files.find(f => f.name === activeFileName) || files[0];
        const lang = workspaceData.language || project.language || activeFileObj?.language || "javascript";

        try {
            const res = await api.post("/copilot/code-review", {
                projectId: project.id,
                projectTitle: project.title,
                language: lang,
                milestoneIndex: currentMilestoneIndex,
                milestoneTitle: milestoneGuide.title,
                milestoneRules: milestoneGuide.specRules || [],
                files: files.map(f => ({ name: f.name, content: f.content, language: f.language })),
                testResults
            });

            if (res.data?.success && res.data?.review) {
                const newReview = res.data.review;
                setCodeReview(newReview);
                try {
                    localStorage.setItem(`skillforge_review_${project.id}_${currentMilestoneIndex}`, JSON.stringify(newReview));
                } catch (e) {}
                setReviewHistory(prev => [newReview, ...prev.filter(r => r.milestoneIndex !== currentMilestoneIndex)]);
                toast.success(`AI Code Review Ready: Grade ${newReview.grade} (${newReview.score}/100)`, { icon: "🏆" });
            } else {
                toast.error("Failed to generate code review.");
            }
        } catch (err) {
            console.error("AI Code Review error:", err);
            toast.error("AI Code Review unavailable. Please verify API configuration or try again.");
        } finally {
            setIsLoadingReview(false);
        }
    };

    // Apply Review Suggestion directly to active or specified file
    const handleApplyReviewFix = (suggestedCode, currentCode, targetFileName = null) => {
        if (!suggestedCode) return;
        const fileToUpdateName = targetFileName || activeFileName;
        const fileObj = files.find(f => f.name === fileToUpdateName) || files[0];
        if (!fileObj) return;

        let newContent = fileObj.content || "";
        const cleanCurrent = currentCode ? currentCode.trim() : null;

        if (cleanCurrent && newContent.includes(cleanCurrent)) {
            newContent = newContent.replace(cleanCurrent, suggestedCode.trim());
            handleCodeChange(newContent);
            toast.success(`Applied refactor to ${fileObj.name}!`, { icon: "✨" });
        } else {
            newContent = `${newContent}\n\n// AI Suggested Refactor:\n${suggestedCode}`;
            handleCodeChange(newContent);
            toast.success(`Inserted refactor snippet into ${fileObj.name}`, { icon: "✨" });
        }
    };

    // Trigger Forge Copilot
    const handleAskAiMentor = async ({ 
        testCase = null, 
        error = null, 
        line = null, 
        prompt = null, 
        requestedLevel = null 
    } = {}) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please sign in to access Forge Copilot", { icon: "🔒" });
            navigate("/login", { state: { from: `/projects/${projectId}/workspace` } });
            return;
        }

        setIsCopilotOpen(true);

        const isAgent = Boolean(aiMentorState.isAgentMode);
        const targetLevel = requestedLevel !== null ? requestedLevel : (isAgent ? 3 : (prompt ? 2 : (aiMentorState.level || 2)));
        const failingStep = testResults?.status === "failed" ? testResults?.steps?.find(s => !s.passed) : null;
        const failingName = testCase || (testCase === null && prompt ? null : (failingStep?.name || null));
        const failingErr = error || (failingName ? (failingStep?.output || testResults?.error || "") : "");

        setAiMentorState(prev => ({
            ...prev,
            isLoading: true,
            activeFailingTest: failingName,
            level: targetLevel
        }));

        try {
            const activeCode = files.find(f => f.name === activeFileName)?.content || "";
            const advice = await fetchAiMentorAdvice({
                projectId: project.id,
                projectTitle: project.title,
                language: workspaceData.language || project.language || "rust",
                milestoneIndex: currentMilestoneIndex,
                milestoneTitle: milestoneGuide.title,
                milestoneObjective: milestoneGuide.objective,
                specRules: milestoneGuide.specRules || [],
                testCases: milestoneGuide.testCases || [],
                allFiles: files.map(f => ({ 
                    name: f.name, 
                    language: f.language, 
                    content: f.content ? f.content.slice(0, 2000) : "" 
                })),
                activeFileName,
                userCode: activeCode,
                testResults: testResults || (failingErr ? { steps: [{ name: failingName || "Assertion", passed: false, output: failingErr }] } : null),
                userQuery: prompt || (failingName ? `Why is test '${failingName}' failing: ${failingErr}` : `Review code and guide me for ${milestoneGuide.title}`),
                hintLevel: targetLevel,
                isAgent
            });

            let cleanDiagnosis = advice.diagnosis || "";
            let cleanHint = advice.hint || "";
            let cleanPattern = advice.codePattern || "";
            let cleanLine = line || (typeof advice.targetLine === "number" ? advice.targetLine : (parseInt(advice.targetLine, 10) || null));
            let cleanPrompts = advice.quickPrompts || [];

            setAiMentorState(prev => ({
                ...prev,
                isLoading: false,
                diagnosis: prompt ? prev.diagnosis : cleanDiagnosis,
                hint: prompt ? prev.hint : cleanHint,
                level: advice.level || targetLevel,
                targetLine: cleanLine,
                codePattern: prompt ? prev.codePattern : cleanPattern,
                quickPrompts: cleanPrompts.length > 0 ? cleanPrompts : prev.quickPrompts,
                modelUsed: advice.modelUsed,
                history: prompt 
                    ? [...prev.history, { 
                        query: prompt, 
                        reply: cleanHint, 
                        diagnosis: cleanDiagnosis, 
                        codePattern: cleanPattern, 
                        targetLine: cleanLine,
                        isAgent 
                      }] 
                    : prev.history
            }));

            if (cleanLine && cleanLine > 0) {
                jumpToLine(cleanLine);
            }
            toast("Forge Copilot ready", { icon: "⚡" });
        } catch (err) {
            console.error("AI Mentor request error:", err);
            setAiMentorState(prev => ({
                ...prev,
                isLoading: false,
                diagnosis: "Diagnosis could not be loaded.",
                hint: "Inspect your active file structure and verify types match the milestone spec."
            }));
            toast.error("Could not reach Forge AI service.");
        }
    };

    // Run Tests Action
    const handleRunTests = async () => {
        if (isRunningTests) return;

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please sign in to run tests and save project progress", { icon: "🔒" });
            navigate("/login", { state: { from: `/projects/${projectId}/workspace` } });
            return;
        }

        setIsRunningTests(true);

        const language = (workspaceData.language || project.language || "rust").toLowerCase();
        const isClient = isClientSideLanguage(language);

        setConsoleLogs(prev => [
            ...prev,
            `\n[${new Date().toLocaleTimeString()}] ⚡ Invoking ${isClient ? "Client-Side Engine (In-Browser V8 • 0ms)" : "Backend Sandbox Service (/api/runner/execute)"}...`,
            `target: ${project.title} • Milestone ${currentMilestoneIndex + 1}`
        ]);

        try {
            const result = await executeProjectTests({
                language,
                files,
                activeFileName,
                milestoneGuide,
                milestoneIndex: currentMilestoneIndex,
                projectId: project.id
            });

            if (result.stdout) setConsoleLogs(prev => [...prev, result.stdout]);
            if (result.stderr) setConsoleLogs(prev => [...prev, `[stderr] ${result.stderr}`]);

            if (result.success) {
                setTestResults({
                    status: "passed",
                    engineLabel: result.engineLabel,
                    runnerType: result.runnerType,
                    total: result.total,
                    passed: result.passed,
                    duration: result.duration,
                    steps: result.steps
                });

                setAiMentorState(prev => ({
                    ...prev,
                    activeFailingTest: null,
                    diagnosis: null
                }));

                let updatedVerifiedList = [];
                setVerifiedMilestones(prev => {
                    const next = new Set(prev);
                    next.add(currentMilestoneIndex);
                    updatedVerifiedList = [...next];
                    try {
                        localStorage.setItem(`skillforge_verified_${project.id}`, JSON.stringify(updatedVerifiedList));
                    } catch (e) {}
                    return next;
                });

                const totalMilestones = project.milestones?.length || 5;
                const isFinalMilestone = currentMilestoneIndex + 1 === totalMilestones;
                const nextMilestone = Math.min(totalMilestones, currentMilestoneIndex + 2);
                const percent = Math.min(100, Math.round(((currentMilestoneIndex + 1) / totalMilestones) * 100));

                try {
                    const savedBuilds = JSON.parse(localStorage.getItem("skillforge_user_builds") || "[]");
                    const existingIdx = savedBuilds.findIndex(b => b.projectId === project.id);
                    const newEntry = {
                        projectId: project.id,
                        title: project.title,
                        currentMilestone: nextMilestone,
                        lastActive: new Date().toISOString(),
                        status: isFinalMilestone ? "completed" : "in_progress"
                    };
                    if (existingIdx !== -1) savedBuilds[existingIdx] = newEntry;
                    else savedBuilds.push(newEntry);
                    localStorage.setItem("skillforge_user_builds", JSON.stringify(savedBuilds));
                } catch (e) {}

                if (token) {
                    api.post("/projects/progress", {
                        projectId: project.id,
                        projectTitle: project.title,
                        track: project.track,
                        currentMilestone: currentMilestoneIndex,
                        verifiedMilestones: updatedVerifiedList.length > 0 ? updatedVerifiedList : [currentMilestoneIndex],
                        status: isFinalMilestone ? "completed" : "in_progress",
                        percent,
                        secondsElapsed
                    }).catch(err => console.error("Failed to sync progress to database", err));
                }

                toast.success(`Stage ${currentMilestoneIndex + 1} passed! Requirements verified.`);

                // Automatically trigger AI Automated Code Review in background
                handleTriggerCodeReview();

                if (currentMilestoneIndex + 1 === (project.milestones?.length || 5)) {
                    setShowCelebration(true);
                }
            } else {
                setTestResults({
                    status: "failed",
                    engineLabel: result.engineLabel,
                    runnerType: result.runnerType,
                    total: result.total,
                    passed: result.passed,
                    duration: result.duration,
                    steps: result.steps,
                    error: result.error
                });

                const firstFailedIdx = result.steps?.findIndex(s => !s.passed);
                if (firstFailedIdx !== -1 && firstFailedIdx !== undefined) {
                    setSelectedFailedTestIdx(firstFailedIdx);
                }

                const firstFailed = result.steps?.find(s => !s.passed);
                if (firstFailed) {
                    setAiMentorState(prev => ({
                        ...prev,
                        activeFailingTest: firstFailed.name,
                        diagnosis: firstFailed.output || "Test assertion failed",
                        targetLine: extractLineNumber(firstFailed.output),
                        hint: null,
                        codePattern: ""
                    }));
                }

                toast.error("Tests failed. Review output in the test results panel.");
            }

            // Auto-open execution panel if closed
            setIsTerminalCollapsed(false);
            if (terminalHeight < 140) {
                setTerminalHeight(240);
            }
            setTerminalTab("results");

        } catch (err) {
            toast.error(`Execution error: ${err.message}`);
            setConsoleLogs(prev => [...prev, `[fatal] Execution aborted: ${err.message}`]);
        } finally {
            setIsRunningTests(false);
        }
    };

    // Global Keyboard Shortcuts
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "p")) {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === "Enter" || e.key === "'")) {
                e.preventDefault();
                handleRunTests();
            }
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [handleRunTests]);

    // Terminal command runner
    const handleTerminalCommand = (e) => {
        e.preventDefault();
        const cmd = terminalInput.trim();
        if (!cmd) return;

        setConsoleLogs(prev => [...prev, `$ ${cmd}`]);
        setTerminalInput("");

        if (cmd === "clear") {
            setConsoleLogs([]);
            return;
        }
        if (cmd === "test" || cmd === "run") {
            handleRunTests();
            return;
        }
        if (cmd === "ls") {
            setConsoleLogs(prev => [...prev, files.map(f => f.name).join("  ")]);
            return;
        }
        if (cmd === "help") {
            setConsoleLogs(prev => [
                ...prev,
                "Available commands:",
                "  test        - Run automated verification test suite",
                "  ls          - List workspace source files",
                "  clear       - Clear terminal output",
                "  help        - Display this reference manual"
            ]);
            return;
        }
        setConsoleLogs(prev => [...prev, `sh: command not found: ${cmd}. Type 'help' for available commands.`]);
    };

    const totalMilestones = project.milestones?.length || 5;
    const progressPercent = Math.round(((currentMilestoneIndex + (isCurrentMilestoneVerified ? 1 : 0.2)) / totalMilestones) * 100);

    // Active failed step in execution results
    const activeFailingStep = testResults?.steps?.[selectedFailedTestIdx] || testResults?.steps?.find(s => !s.passed) || milestoneGuide.testCases[2];

    return (
        <div className="h-screen w-screen bg-[#080B12] text-[#cbd5e1] flex flex-col overflow-hidden font-sans select-none antialiased">
            
            {/* ======================================================== */}
            {/* TOP BAR: Sleek Obsidian & Cobalt Header Palette           */}
            {/* ======================================================== */}
            <header className="h-12 border-b border-[#1B2232] bg-[#070A10] px-3 flex items-center justify-between shrink-0 z-30 select-none">
                
                {/* 1. Brand & Navigation + 2. Stage Progress */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <button
                        onClick={() => navigate("/projects")}
                        className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Back to Projects"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-1.5 hover:opacity-90 transition-opacity shrink-0"
                        title="SkillForge Dashboard"
                    >
                        <img 
                            src="/images/skillforge-icon.png" 
                            alt="SkillForge" 
                            className="h-5 w-auto object-contain" 
                        />
                        <span className="font-semibold text-sm tracking-tight text-white hidden sm:inline">
                            SkillForge
                        </span>
                    </button>

                    {/* Course Path & Breadcrumb */}
                    <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 ml-1 font-mono">
                        <span className="text-sky-400 font-medium">{project.track || "Systems"}</span>
                        <span>›</span>
                        <span className="truncate max-w-[160px] text-slate-400">{project.title}</span>
                        <span>›</span>
                        <span className="truncate max-w-[200px] text-slate-200 font-medium">
                            Stage {currentMilestoneIndex + 1}: {milestoneGuide.title}
                        </span>
                    </div>

                    {/* 2. Stage Progress Pill + Bar */}
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0D121F] border border-[#1B2232] text-xs shrink-0 ml-1">
                        <span className="font-semibold text-emerald-400 text-[11px] font-mono">
                            Stage {currentMilestoneIndex + 1}/{totalMilestones}
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{progressPercent}%</span>
                    </div>
                </div>

                {/* 3. Language Selector + 4. Actions (Run, Submit, Copilot) */}
                <div className="flex items-center gap-2 shrink-0">
                    
                    {/* 3. Language Dropdown Selector */}
                    <div 
                        onClick={() => navigate("/settings")}
                        className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0D121F] border border-[#1B2232] text-xs font-mono text-slate-300 hover:border-sky-500/40 cursor-pointer transition-colors"
                        title="Configure Editor Settings"
                    >
                        <span className="capitalize">{workspaceData.language || project.language || "Rust"}</span>
                        <ChevronDown size={13} className="text-slate-400" />
                        <Settings size={12} className="text-slate-400 ml-1 hover:text-sky-400 transition-colors" />
                    </div>

                    {/* 4. Action Buttons */}
                    {/* Run Button */}
                    <button
                        onClick={handleRunTests}
                        disabled={isRunningTests}
                        className="px-3.5 py-1.5 rounded-md bg-[#162032] hover:bg-[#1E293B] active:bg-[#0F172A] text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        title="Run Tests (Ctrl+Enter)"
                    >
                        <Play size={12} fill="currentColor" className={isRunningTests ? "animate-spin text-sky-400" : "text-sky-400"} />
                        <span>Run</span>
                    </button>

                    {/* Submit Button */}
                    <button
                        onClick={handleRunTests}
                        disabled={isRunningTests}
                        className="px-3.5 py-1.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        title="Submit Stage Verification (Cloud Sync)"
                    >
                        <Cloud size={13} />
                        <span>Submit</span>
                        <span className="text-[10px] font-mono opacity-70">↵</span>
                    </button>

                    {/* AI Code Review Button */}
                    <button
                        type="button"
                        onClick={handleTriggerCodeReview}
                        disabled={isLoadingReview || isRunningTests}
                        className={`px-3 py-1.5 rounded-md border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                            codeReview
                                ? "bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30"
                                : "bg-[#141B2D] hover:bg-[#1A233A] text-slate-300 border-[#222E46]"
                        }`}
                        title="Request Automated AI Staff Code Review"
                    >
                        {isLoadingReview ? (
                            <RefreshCw size={12} className="animate-spin text-sky-400" />
                        ) : (
                            <Award size={13} className={codeReview ? "text-indigo-400" : "text-slate-400"} />
                        )}
                        <span>{isLoadingReview ? "Reviewing..." : codeReview ? `Review (${codeReview.grade})` : "AI Review"}</span>
                    </button>

                    {/* Forge Copilot Button */}
                    <button
                        onClick={() => setIsCopilotOpen(prev => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all shadow-sm ${
                            isCopilotOpen
                                ? "bg-sky-500/20 text-sky-300 border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.2)] font-semibold"
                                : "bg-[#0D121F] hover:bg-[#162032] text-slate-300 border-[#1B2232]"
                        }`}
                        title="Toggle Forge Copilot Assistant"
                    >
                        <Zap size={13} className="text-sky-400" />
                        <span>Forge Copilot</span>
                    </button>
                </div>

                {/* 5. Utility Icons (Search ⌘K, Settings, Fullscreen, Profile) */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors font-mono"
                        title="Command Palette (Ctrl+K or Ctrl+P)"
                    >
                        <Search size={13} />
                        <kbd className="px-1 py-0.2 bg-[#0D121F] border border-[#1B2232] rounded text-[9px]">⌘K</kbd>
                    </button>

                    <button
                        onClick={() => navigate("/settings")}
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Preferences & Editor Settings"
                    >
                        <Sliders size={14} />
                    </button>

                    <button
                        onClick={() => {
                            if (!document.fullscreenElement) {
                                document.documentElement.requestFullscreen();
                            } else {
                                document.exitFullscreen();
                            }
                        }}
                        className="p-1.5 rounded text-[#717d96] hover:text-white hover:bg-[#1a202c] transition-colors"
                        title="Toggle Fullscreen"
                    >
                        <Maximize2 size={14} />
                    </button>

                    {/* Profile avatar circle (relaxed purple slate) */}
                    <div className="w-7 h-7 rounded-full bg-[#312e81]/60 text-[#c7d2fe] font-medium text-xs flex items-center justify-center border border-[#4338ca]/40 ml-1">
                        P
                    </div>
                </div>
            </header>

            {/* ======================================================== */}
            {/* MAIN WORKSPACE BODY: Sidebar Rail + 3 Primary Columns   */}
            {/* ======================================================== */}
            <div className="flex-grow flex overflow-hidden bg-[#0d1017] relative">

                {/* ---------------------------------------------------- */}
                {/* 6. SIDEBAR NAVIGATION RAIL (Far Left: 56px wide)     */}
                {/* ---------------------------------------------------- */}
                <aside className="w-14 bg-[#070A10] border-r border-[#1B2232] flex flex-col items-center justify-between py-3 shrink-0 z-20 select-none">
                    <div className="flex flex-col items-center gap-3">
                        {[
                            { id: "learn", icon: BookOpen, label: "Learn" },
                            { id: "files", icon: FolderTree, label: "Files" },
                            { id: "tests", icon: CheckCircle2, label: "Tests" },
                            { id: "discuss", icon: MessageSquare, label: "Discuss" },
                            { id: "bookmarks", icon: Bookmark, label: "Bookmarks" }
                        ].map(item => {
                            const Icon = item.icon;
                            const isActive = activityTab === item.id && !isSpecsCollapsed;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        if (activityTab === item.id && !isSpecsCollapsed) {
                                            setIsSpecsCollapsed(true);
                                        } else {
                                            setActivityTab(item.id);
                                            setIsSpecsCollapsed(false);
                                            if (item.id === "learn") setSpecTab("description");
                                            if (item.id === "tests") {
                                                setIsTerminalCollapsed(false);
                                                setTerminalTab("results");
                                            }
                                        }
                                    }}
                                    className={`w-11 py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                                        isActive
                                            ? "bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30 shadow-sm"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span className="text-[9px] tracking-tight">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsSpecsCollapsed(prev => !prev)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                        title={isSpecsCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isSpecsCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                    </button>
                </aside>

                {/* ---------------------------------------------------- */}
                {/* 7. ADAPTIVE LEFT DRAWER (Explorer or Instructions)   */}
                {/* ---------------------------------------------------- */}
                {!isSpecsCollapsed && (() => {
                    const currentSpecTab = ["description", "roadmap", "submissions"].includes(specTab) ? specTab : "description";
                    const currentSubSpecTab = ["task", "requirements", "examples", "hints"].includes(subSpecTab) ? subSpecTab : "task";

                    return (
                    <div 
                        style={{ width: `${panelWidth}px` }}
                        className={`bg-[#080B12] border-r border-[#1B2232] flex flex-col shrink-0 h-full overflow-hidden select-text will-change-[width] ${
                            isDraggingPanel ? "select-none" : ""
                        }`}
                    >
                        {activityTab === "files" ? (
                            <FileExplorerTree
                                files={files}
                                activeFileName={activeFileName}
                                onSelectFile={setActiveFileName}
                                onResetFile={handleResetFile}
                                onCreateFile={handleCreateFile}
                                repoName={project.title || "skillforge/workspace"}
                            />
                        ) : activityTab === "discuss" ? (
                            <div className="flex flex-col h-full bg-[#080B12]">
                                <div className="h-10 bg-[#070A10] border-b border-[#1B2232] px-3 flex items-center justify-between shrink-0 select-none">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={14} className="text-sky-400" />
                                        <span className="text-xs font-semibold text-slate-200">Discussions</span>
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">Stage {currentMilestoneIndex + 1}</span>
                                    </div>
                                    <button
                                        onClick={() => setIsSpecsCollapsed(true)}
                                        className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                                        title="Close Panel"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-3 space-y-3 text-xs scrollbar-thin">
                                    <div className="p-2.5 rounded-lg bg-[#0F1422] border border-[#1E2738] space-y-2">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span className="font-medium text-slate-200 flex items-center gap-1.5">
                                                <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[9px] font-bold">A</span>
                                                alex_dev
                                            </span>
                                            <span className="text-[10px] text-slate-500">2h ago</span>
                                        </div>
                                        <p className="text-slate-300 text-xs leading-relaxed">
                                            How do you handle viewport coordinate scaling when rendering at high DPR (retina displays)?
                                        </p>
                                        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">3 replies</span>
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">Answered</span>
                                        </div>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-[#0F1422] border border-[#1E2738] space-y-2">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span className="font-medium text-slate-200 flex items-center gap-1.5">
                                                <span className="w-4 h-4 rounded-full bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-[9px] font-bold">M</span>
                                                marcus_k
                                            </span>
                                            <span className="text-[10px] text-slate-500">5h ago</span>
                                        </div>
                                        <p className="text-slate-300 text-xs leading-relaxed">
                                            Make sure to clamp the zoom scale between 0.1x and 10x before calculating matrix transforms!
                                        </p>
                                        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">7 upvotes</span>
                                            <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[10px]">Tip</span>
                                        </div>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-[#0F1422] border border-[#1E2738] space-y-2">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span className="font-medium text-slate-200 flex items-center gap-1.5">
                                                <span className="w-4 h-4 rounded-full bg-purple-500/30 text-purple-300 flex items-center justify-center text-[9px] font-bold">S</span>
                                                sarah_t
                                            </span>
                                            <span className="text-[10px] text-slate-500">1d ago</span>
                                        </div>
                                        <p className="text-slate-300 text-xs leading-relaxed">
                                            Remember that clientX/clientY needs to subtract canvas.getBoundingClientRect() before passing to world coords.
                                        </p>
                                        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">12 upvotes</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2.5 border-t border-[#1B2232] bg-[#070A10]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCopilotOpen(true);
                                            setChatInput(`I have a question about Stage ${currentMilestoneIndex + 1}: `);
                                        }}
                                        className="w-full py-2 px-3 rounded-md bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Sparkles size={13} />
                                        <span>Ask Copilot or Community</span>
                                    </button>
                                </div>
                            </div>
                        ) : activityTab === "bookmarks" ? (
                            <div className="flex flex-col h-full bg-[#080B12]">
                                <div className="h-10 bg-[#070A10] border-b border-[#1B2232] px-3 flex items-center justify-between shrink-0 select-none">
                                    <div className="flex items-center gap-2">
                                        <Bookmark size={14} className="text-amber-400" />
                                        <span className="text-xs font-semibold text-slate-200">Resources & Specs</span>
                                    </div>
                                    <button
                                        onClick={() => setIsSpecsCollapsed(true)}
                                        className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                                        title="Close Panel"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-3 space-y-3 text-xs scrollbar-thin">
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Stage References</span>
                                        <div className="p-2.5 rounded-lg bg-[#0F1422] border border-[#1E2738] space-y-1.5">
                                            <div className="font-medium text-slate-200 text-xs flex items-center justify-between">
                                                <span>MDN CanvasRenderingContext2D</span>
                                                <BookOpen size={12} className="text-sky-400" />
                                            </div>
                                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                                Complete reference for transform matrices, scale, translate, and path rendering.
                                            </p>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-[#0F1422] border border-[#1E2738] space-y-1.5">
                                            <div className="font-medium text-slate-200 text-xs flex items-center justify-between">
                                                <span>W3C Pointer Events Level 3</span>
                                                <BookOpen size={12} className="text-sky-400" />
                                            </div>
                                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                                Specs for normalized pointer down, pointer move, and pressure detection.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Milestone Guide Summary</span>
                                        <div className="p-2.5 rounded-lg bg-[#0F1422] border border-[#1E2738] space-y-1">
                                            <span className="text-sky-400 font-mono text-[10px]">Stage {currentMilestoneIndex + 1} Goal</span>
                                            <p className="text-[11px] text-slate-300">
                                                {milestoneGuide.title}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Drawer Header Tabs (Description, Roadmap, Submissions, ✕) */}
                                <div className="h-10 bg-[#070A10] border-b border-[#1B2232] px-3 flex items-center justify-between shrink-0 select-none">
                                    <div className="flex items-center gap-1">
                                        {[
                                            { id: "description", label: "Description", icon: BookOpen },
                                            { id: "roadmap", label: "Roadmap", icon: Milestone },
                                            { id: "submissions", label: "Submissions", icon: UploadCloud }
                                        ].map(tab => {
                                            const Icon = tab.icon;
                                            const isActive = currentSpecTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() => setSpecTab(tab.id)}
                                                    className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                                                        isActive
                                                            ? "bg-[#162032] text-white font-medium border border-sky-500/30 shadow-sm"
                                                            : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                                    }`}
                                                >
                                                    <Icon size={12} className={isActive ? "text-sky-400" : "text-slate-500"} />
                                                    <span>{tab.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setIsSpecsCollapsed(true)}
                                        className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                                        title="Close Panel"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                        {/* Panel Body */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin select-text">
                            
                            {/* TAB: DESCRIPTION */}
                            {currentSpecTab === "description" && (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    {/* Stage Title & In Progress badge */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <h2 className="text-base font-semibold text-[#f1f5f9] tracking-tight">
                                                Stage {currentMilestoneIndex + 1}: {milestoneGuide.title}
                                            </h2>
                                            {isCurrentMilestoneVerified ? (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-medium border border-sky-500/30">
                                                    In Progress
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-[#828ea6] font-mono">
                                            <Layers size={13} className="text-[#38bdf8]" />
                                            <span>Socket &amp; Packen &amp; Ring-Pong</span>
                                        </div>
                                        <p className="text-[#94a3b8] leading-relaxed pt-1">
                                            {milestoneGuide.objective}
                                        </p>
                                    </div>

                                    {/* Inner Sub-Tabs: Task | Requirements | Examples | Hints */}
                                    <div className="flex items-center gap-1 bg-[#0a0d14] p-1 rounded-md border border-[#1c2230]">
                                        {[
                                            { id: "task", label: "Task" },
                                            { id: "requirements", label: "Requirements" },
                                            { id: "examples", label: "Examples" },
                                            { id: "hints", label: "Hints" }
                                        ].map(sub => (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                onClick={() => setSubSpecTab(sub.id)}
                                                className={`flex-1 py-1 text-center rounded text-xs font-medium transition-all ${
                                                    currentSubSpecTab === sub.id
                                                        ? "bg-[#181d2a] text-[#f1f5f9] font-medium border border-[#2b354a] shadow-sm"
                                                        : "text-[#64748b] hover:text-[#cbd5e1]"
                                                }`}
                                            >
                                                {sub.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Sub-tab 1: Task Checklist (Numbered 1, 2, 3, 4) */}
                                    {currentSubSpecTab === "task" && (
                                        <div className="space-y-2.5">
                                            {milestoneGuide.specRules.map((rule, idx) => (
                                                <div 
                                                    key={idx}
                                                    className="p-3 rounded-md bg-[#131722] border border-[#1c2230] flex items-start gap-3 text-[#cbd5e1]"
                                                >
                                                    <span className="w-5 h-5 rounded bg-[#1c2232] text-[#7dd3fc] font-mono text-xs font-medium flex items-center justify-center shrink-0 border border-[#28354c]">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="leading-relaxed text-xs">
                                                        {renderInlineText(rule)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Sub-tab 2: Requirements */}
                                    {currentSubSpecTab === "requirements" && (
                                        <div className="space-y-2 p-3 rounded-md bg-[#131722] border border-[#1c2230] text-[#cbd5e1] leading-relaxed">
                                            <div className="font-medium text-[#f1f5f9] mb-1">Architecture Invariants</div>
                                            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#828ea6]">
                                                <li>Maintain full RFC compliant byte delimiters (<code className="text-[#38bdf8]">\r\n</code>).</li>
                                                <li>Guarantee non-blocking event loops using asynchronous polling.</li>
                                                <li>Handle partial TCP buffers with zero-copy stream decoders.</li>
                                            </ul>
                                        </div>
                                    )}

                                    {/* Sub-tab 3: Examples */}
                                    {currentSubSpecTab === "examples" && (
                                        <div className="space-y-2">
                                            {(milestoneGuide.examples || []).map((ex, i) => (
                                                <div key={i} className="p-3 rounded-md bg-[#131722] border border-[#1c2230] font-mono text-xs text-[#7dd3fc]">
                                                    {ex}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Sub-tab 4: Hints */}
                                    {currentSubSpecTab === "hints" && (
                                        <div className="space-y-2">
                                            {milestoneGuide.hints.map((hint, hIdx) => (
                                                <div key={hIdx} className="p-3 rounded-md bg-[#131722] border border-[#1c2230] space-y-1">
                                                    <div className="flex items-center gap-1.5 text-amber-400/90 font-medium text-xs">
                                                        <Lightbulb size={13} />
                                                        <span>Hint {hIdx + 1}</span>
                                                    </div>
                                                    <p className="text-xs text-[#828ea6] leading-relaxed">
                                                        {renderInlineText(hint)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Test Cases Checklist at Bottom of Learning Panel */}
                                    <div className="pt-2 border-t border-[#1c2230] space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-[#f1f5f9] text-xs">Test Cases</span>
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-medium">
                                                    {testResults ? `${testResults.passed}/${testResults.total}` : "2/4"} Passing
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleRunTests}
                                                disabled={isRunningTests}
                                                className="px-2.5 py-1 rounded bg-[#181d2a] hover:bg-[#202738] text-[#93c5fd] text-xs font-medium flex items-center gap-1 border border-[#2b354a] transition-colors"
                                            >
                                                <RotateCcw size={11} className={isRunningTests ? "animate-spin" : ""} />
                                                <span>Run Tests</span>
                                            </button>
                                        </div>

                                        {/* Test Item List */}
                                        <div className="space-y-1.5">
                                            {(testResults?.steps || milestoneGuide.testCases).map((tc, idx) => {
                                                const isPassed = tc.passed !== undefined ? tc.passed : !tc.failed;
                                                return (
                                                    <div 
                                                        key={idx}
                                                        className="px-3 py-2 rounded-md bg-[#131722] border border-[#1c2230] flex items-center justify-between text-xs"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isPassed ? (
                                                                <CheckCircle2 size={14} className="text-emerald-400" />
                                                            ) : (
                                                                <XCircle size={14} className="text-rose-400" />
                                                            )}
                                                            <span className={isPassed ? "text-[#cbd5e1]" : "text-rose-300 font-medium"}>
                                                                {tc.name}
                                                            </span>
                                                        </div>
                                                        <span className="font-mono text-[11px] text-[#64748b]">
                                                            {tc.duration || "1 ms"}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Hidden Tests Accordion */}
                                        <div className="rounded-md border border-[#1c2230] bg-[#131722] overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setIsHiddenTestsOpen(prev => !prev)}
                                                className="w-full px-3 py-2 flex items-center justify-between text-xs text-[#828ea6] hover:text-white"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Lock size={12} className="text-amber-400/80" />
                                                    <span>Hidden Tests (4)</span>
                                                </div>
                                                <ChevronDown size={14} className={`transition-transform ${isHiddenTestsOpen ? "rotate-180" : ""}`} />
                                            </button>
                                            {isHiddenTestsOpen && (
                                                <div className="p-2.5 border-t border-[#1c2230] text-[11px] text-[#64748b] space-y-1">
                                                    <div>• Hidden verification assertions run during official Submit.</div>
                                                    <div>• Stress tests for concurrent bursts &amp; large payload streaming.</div>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* TAB: ROADMAP */}
                            {currentSpecTab === "roadmap" && (
                                <div className="space-y-3 animate-in fade-in duration-150">
                                    <div className="text-xs uppercase font-medium tracking-wider text-[#64748b] flex items-center justify-between">
                                        <span>Milestone Roadmap</span>
                                        <span className="text-[#38bdf8] font-mono font-medium">
                                            {verifiedMilestones.size}/{totalMilestones} Passed
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {project.milestones?.map((m, idx) => {
                                            const isVerified = verifiedMilestones.has(idx);
                                            const isActive = currentMilestoneIndex === idx;
                                            const isUnlocked = isMilestoneUnlocked(idx);

                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => isUnlocked && handleSelectMilestone(idx)}
                                                    className={`p-3 rounded-md border transition-all text-left flex items-start gap-3 ${
                                                        !isUnlocked
                                                            ? "opacity-40 bg-[#131722] border-[#1c2230] cursor-not-allowed"
                                                            : isActive
                                                            ? "bg-[#181d2a] border-[#38bdf8]/60 shadow-sm cursor-pointer"
                                                            : "bg-[#131722] border-[#1c2230] hover:border-[#2b354a] cursor-pointer"
                                                    }`}
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center font-mono font-medium text-xs shrink-0 ${
                                                        isVerified
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : isActive
                                                            ? "bg-[#38bdf8]/20 text-[#38bdf8]"
                                                            : "bg-[#1e293b] text-[#64748b]"
                                                    }`}>
                                                        {isVerified ? <Check size={12} /> : idx + 1}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                            <span className="font-medium text-[#f1f5f9] truncate text-xs">
                                                                {m.title}
                                                            </span>
                                                            {!isUnlocked && (
                                                                <span className="text-[10px] font-mono text-amber-400/80 flex items-center gap-0.5 shrink-0">
                                                                    <Lock size={10} /> Locked
                                                                </span>
                                                            )}
                                                            {isVerified && (
                                                                <span className="text-[10px] font-mono text-emerald-400 font-medium shrink-0">
                                                                    Passed
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-[#64748b] line-clamp-1">
                                                            {m.description || "Milestone specification objectives"}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* TAB: SUBMISSIONS */}
                            {currentSpecTab === "submissions" && (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    <div className="flex items-center justify-between text-xs uppercase font-medium tracking-wider text-[#64748b]">
                                        <span>Evaluation & Reviews</span>
                                        <span className="text-sky-400 font-mono">Stage {currentMilestoneIndex + 1}</span>
                                    </div>

                                    {/* Latest Status Banner */}
                                    <div className="p-3.5 rounded-xl bg-[#0E1422] border border-[#1C2538] space-y-2.5 text-xs">
                                        <div className="flex items-center justify-between font-mono">
                                            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                                                <CheckCircle2 size={13} className={isCurrentMilestoneVerified ? "text-emerald-400" : "text-amber-400"} />
                                                <span>{isCurrentMilestoneVerified ? "Stage Verified" : "In Progress"}</span>
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-sans">Latest Check</span>
                                        </div>

                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            {isCurrentMilestoneVerified
                                                ? "All verification test assertions passed for this milestone."
                                                : "Run tests or submit milestone code to trigger full verification and AI review."}
                                        </p>
                                    </div>

                                    {/* AI Code Review Summary Card */}
                                    {codeReview ? (
                                        <div className="p-3.5 rounded-xl bg-[#0E1526] border border-indigo-500/30 space-y-3 text-xs shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 font-mono">
                                                    <span className="px-2 py-0.5 rounded font-bold text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                                        Grade {codeReview.grade}
                                                    </span>
                                                    <span className="text-slate-300 font-semibold">{codeReview.score}/100</span>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                    {codeReview.complexity?.time} Time
                                                </span>
                                            </div>

                                            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                                                {codeReview.summary}
                                            </p>

                                            <div className="flex items-center justify-between pt-1 border-t border-[#1D273C]">
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {codeReview.suggestions?.length || 0} Suggestions
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTerminalTab("review");
                                                        setIsTerminalCollapsed(false);
                                                    }}
                                                    className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                                                >
                                                    <span>Open Full Review</span>
                                                    <ChevronRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3.5 rounded-xl bg-[#0E1322] border border-[#1C2538] text-center space-y-2 text-xs">
                                            <Award size={20} className="mx-auto text-slate-500" />
                                            <p className="text-[11px] text-slate-400">
                                                No AI Code Review generated yet for this stage.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={handleTriggerCodeReview}
                                                disabled={isLoadingReview}
                                                className="w-full py-1.5 px-3 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                {isLoadingReview ? (
                                                    <RefreshCw size={12} className="animate-spin" />
                                                ) : (
                                                    <Sparkles size={12} />
                                                )}
                                                <span>{isLoadingReview ? "Analyzing Code..." : "Request Staff Review"}</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Past Review History */}
                                    {reviewHistory.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t border-[#1C2538]">
                                            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                                                Past Submissions ({reviewHistory.length})
                                            </div>
                                            <div className="space-y-1.5">
                                                {reviewHistory.map((rev, rIdx) => (
                                                    <div 
                                                        key={rIdx}
                                                        onClick={() => {
                                                            setCodeReview(rev);
                                                            setTerminalTab("review");
                                                            setIsTerminalCollapsed(false);
                                                        }}
                                                        className="p-2.5 rounded-lg bg-[#0A0E18] hover:bg-[#121828] border border-[#192234] hover:border-sky-500/40 cursor-pointer transition-all flex items-center justify-between text-xs"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold text-[11px] text-indigo-300">
                                                                {rev.grade} ({rev.score})
                                                            </span>
                                                            <span className="text-[11px] text-slate-300 truncate max-w-[150px]">
                                                                Stage {(rev.milestoneIndex ?? 0) + 1}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-slate-500">
                                                            {rev.submittedAt ? new Date(rev.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                            </>
                        )}
                    </div>
                    );
                })()}

                {/* Hairline Divider 1 */}
                {!isSpecsCollapsed && (
                    <div
                        onMouseDown={() => setIsDraggingPanel(true)}
                        onDoubleClick={() => setPanelWidth(350)}
                        className={`w-1 hover:w-1.5 ${
                            isDraggingPanel ? "bg-sky-400" : "bg-[#1B2232] hover:bg-sky-400/60"
                        } transition-colors cursor-col-resize shrink-0 select-none z-20`}
                        title="Drag to resize panel"
                    />
                )}

                {/* ---------------------------------------------------- */}
                {/* 9 & 10. CENTER WORKSPACE: CODE EDITOR & TABS         */}
                {/* ---------------------------------------------------- */}
                <main className="flex-1 min-w-0 flex flex-col overflow-hidden h-full bg-[#0B0F19]">
                    
                    {/* Monaco Editor Container */}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <div className={`flex-grow flex flex-col overflow-hidden min-h-0 ${isDraggingPanel || isDraggingTerminal || isDraggingCopilot ? "pointer-events-none select-none" : ""}`}>
                            <CodeStudioEditor
                                files={files}
                                activeFileName={activeFileName}
                                onSelectFile={setActiveFileName}
                                onChangeCode={handleCodeChange}
                                onResetFile={handleResetFile}
                                onCursorChange={setCursorPosition}
                                onRunTests={handleRunTests}
                                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                                editorInstanceRef={editorInstanceRef}
                            />
                        </div>
                    </div>

                    {/* Resizable Divider between Editor and Execution Panel */}
                    {!isTerminalCollapsed && (
                        <div
                            onMouseDown={() => setIsDraggingTerminal(true)}
                            className={`h-1 hover:h-1.5 ${
                                isDraggingTerminal ? "bg-sky-400" : "bg-[#1B2232] hover:bg-sky-400/60"
                            } transition-colors cursor-row-resize shrink-0 select-none z-20`}
                            title="Drag to resize execution drawer"
                        />
                    )}

                    {/* ---------------------------------------------------- */}
                    {/* 12 & 13. BOTTOM PANEL: TEST RESULTS & TERMINAL TABS  */}
                    {/* ---------------------------------------------------- */}
                    <div 
                        style={{ height: isTerminalCollapsed ? "32px" : `${terminalHeight}px` }}
                        className="bg-[#080B12] border-t border-[#1B2232] flex flex-col overflow-hidden shrink-0 transition-all duration-150"
                    >
                        {/* 12. Bottom Panel Tabs Bar */}
                        <div className="h-8 border-b border-[#1B2232] bg-[#070A10] px-3 flex items-center justify-between shrink-0 select-none">
                            <div className="flex items-center gap-1">
                                {[
                                    { id: "results", label: `Test Results (${testResults ? `${testResults.passed}/${testResults.total}` : "2/4"})`, icon: CheckCircle2 },
                                    { 
                                        id: "review", 
                                        label: codeReview ? `AI Review (${codeReview.grade})` : "AI Review", 
                                        icon: Award, 
                                        badge: isLoadingReview ? "Analyzing" : codeReview ? `${codeReview.score}` : null,
                                        color: codeReview ? "text-indigo-400" : "text-slate-400"
                                    },
                                    { id: "console", label: "Console", icon: Terminal },
                                    { id: "terminal", label: "Terminal", icon: Terminal },
                                    { id: "problems", label: "Problems (1)", icon: AlertCircle, color: "text-rose-400" },
                                    { id: "debugger", label: "Debugger", icon: Bug }
                                ].map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = !isTerminalCollapsed && terminalTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setIsTerminalCollapsed(false);
                                                setTerminalTab(tab.id);
                                            }}
                                            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                                                isActive
                                                    ? "bg-[#162032] text-white font-medium border border-sky-500/30 shadow-sm"
                                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                            }`}
                                        >
                                            <Icon size={12} className={tab.color || (isActive ? "text-sky-400" : "text-slate-500")} />
                                            <span>{tab.label}</span>
                                            {tab.badge && (
                                                <span className={`text-[9px] font-mono px-1 py-0.2 rounded-full font-bold leading-none ${
                                                    isLoadingReview 
                                                        ? "bg-sky-500/20 text-sky-300 animate-pulse" 
                                                        : "bg-indigo-500/25 text-indigo-300 border border-indigo-500/30"
                                                }`}>
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setTerminalHeight(prev => prev > 120 ? 60 : 260)}
                                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                                    title="Toggle Height"
                                >
                                    <Maximize2 size={13} />
                                </button>
                                <button
                                    onClick={() => setIsTerminalCollapsed(true)}
                                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                                    title="Close Bottom Panel"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        </div>

                        {/* 13. Test Results Panel Body */}
                        {!isTerminalCollapsed && (
                            <div className={`flex-grow overflow-y-auto select-text scrollbar-thin ${terminalTab === "review" ? "p-0 flex flex-col" : "p-3.5 font-mono text-xs"}`}>
                                
                                {/* RESULTS TAB: Side-by-Side Diff Expected vs Actual */}
                                {terminalTab === "results" && (
                                    <div className="space-y-3">
                                        {/* Failing Test Header Pill (Relaxed rose tint) */}
                                        <div className="p-2.5 rounded-md bg-[#24151b] border border-[#4c1d24] flex items-center justify-between text-rose-300">
                                            <div className="flex items-center gap-2">
                                                <XCircle size={15} className="text-rose-400" />
                                                <span className="font-semibold text-xs">{activeFailingStep.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-mono text-rose-400/80">12 ms</span>
                                                <button 
                                                    onClick={() => handleAskAiMentor({
                                                        testCase: activeFailingStep.name,
                                                        error: activeFailingStep.output || "Assertion mismatch",
                                                        requestedLevel: 2
                                                    })}
                                                    className="px-2 py-0.5 rounded bg-[#3b1720] hover:bg-[#4a1d28] text-rose-300 text-[10px] font-sans font-medium transition-colors border border-[#5c2432]"
                                                >
                                                    Ask Copilot
                                                </button>
                                            </div>
                                        </div>

                                        {/* Side-by-Side Diff: Expected Output vs Actual Output */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Expected Output */}
                                            <div className="space-y-1">
                                                <div className="text-[11px] font-sans font-medium text-[#828ea6]">
                                                    Expected Output
                                                </div>
                                                <div className="p-3 rounded-md bg-[#0a0d14] border border-[#1c2230] font-mono text-xs text-[#6ee7b7] min-h-[50px] flex items-center">
                                                    <span className="text-[#475569] select-none mr-3">1</span>
                                                    <span>{activeFailingStep.expected || "$11\\r\\nhello world\\r\\n"}</span>
                                                </div>
                                            </div>

                                            {/* Actual Output */}
                                            <div className="space-y-1">
                                                <div className="text-[11px] font-sans font-medium text-[#828ea6]">
                                                    Actual Output
                                                </div>
                                                <div className="p-3 rounded-md bg-[#191016] border border-[#421a24] font-mono text-xs text-rose-300 min-h-[50px] flex items-center">
                                                    <span className="text-[#475569] select-none mr-3">1</span>
                                                    <span>{activeFailingStep.actual || "+PONG\\r\\n"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* AI CODE REVIEW TAB */}
                                {terminalTab === "review" && (
                                    <CodeReviewPanel
                                        review={codeReview}
                                        isLoading={isLoadingReview}
                                        onApplyFix={handleApplyReviewFix}
                                        onJumpToLine={jumpToLine}
                                        onRefreshReview={handleTriggerCodeReview}
                                        activeFileName={activeFileName}
                                    />
                                )}

                                {/* CONSOLE / TERMINAL TAB */}
                                {(terminalTab === "console" || terminalTab === "terminal") && (
                                    <div className="space-y-2 h-full flex flex-col justify-between">
                                        <div className="space-y-1 font-mono text-xs overflow-y-auto">
                                            {consoleLogs.map((log, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`leading-relaxed whitespace-pre-wrap ${
                                                        log.startsWith("$") 
                                                            ? "text-[#38bdf8] font-bold" 
                                                            : log.includes("[stderr]") || log.includes("[fatal]") || log.includes("error") 
                                                            ? "text-rose-300" 
                                                            : log.includes("✓") || log.includes("Passed") 
                                                            ? "text-[#34d399]" 
                                                            : "text-[#828ea6]"
                                                    }`}
                                                >
                                                    {log}
                                                </div>
                                            ))}
                                        </div>

                                        <form onSubmit={handleTerminalCommand} className="flex items-center gap-2 pt-2 border-t border-[#1c2230] shrink-0">
                                            <span className="text-[#38bdf8] font-mono font-bold">$</span>
                                            <input
                                                type="text"
                                                value={terminalInput}
                                                onChange={(e) => setTerminalInput(e.target.value)}
                                                placeholder="Type a command (test, clear, ls, help)..."
                                                className="flex-grow bg-transparent border-0 outline-none text-xs font-mono text-white placeholder-[#475569]"
                                            />
                                        </form>
                                    </div>
                                )}

                                {/* PROBLEMS TAB */}
                                {terminalTab === "problems" && (
                                    <div className="p-2 space-y-1.5 text-xs font-mono">
                                        <div className="flex items-center gap-2 text-rose-300">
                                            <AlertCircle size={14} className="text-rose-400" />
                                            <span>main.rs:17 - Redis protocol bulk string argument handler missing</span>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                </main>

                {/* Hairline Divider 2 (Between Editor and Right Copilot) */}
                {isCopilotOpen && (
                    <div
                        onMouseDown={() => setIsDraggingCopilot(true)}
                        onDoubleClick={() => setCopilotWidth(380)}
                        className={`w-1 hover:w-1.5 ${
                            isDraggingCopilot ? "bg-sky-400" : "bg-[#1B2232] hover:bg-sky-400/60"
                        } transition-colors cursor-col-resize shrink-0 select-none z-20`}
                        title="Drag to resize Copilot"
                    />
                )}

                {/* ---------------------------------------------------- */}
                {/* 11. FORGE COPILOT PANEL (Right Sidecar: 25-27%)       */}
                {/* ---------------------------------------------------- */}
                {isCopilotOpen && (
                    <aside 
                        style={{ width: `${copilotWidth}px` }}
                        className={`bg-[#080B12] border-l border-[#1B2232] flex flex-col shrink-0 h-full overflow-hidden select-text will-change-[width] ${
                            isDraggingCopilot ? "select-none" : ""
                        }`}
                    >
                        {/* Header Bar */}
                        <div className="h-10 bg-[#070A10] border-b border-[#1B2232] px-3 flex items-center justify-between shrink-0 select-none">
                            <div className="flex items-center gap-2">
                                <img 
                                    src="/images/forge-copilot-icon-transparent.png" 
                                    alt="Forge Copilot" 
                                    className="w-4 h-4 rounded object-contain shrink-0" 
                                />
                                <span className="text-xs font-semibold text-white tracking-tight">Forge Copilot</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAiMentorState(prev => ({
                                            ...prev,
                                            diagnosis: null,
                                            hint: null,
                                            codePattern: "",
                                            history: []
                                        }));
                                        toast.success("Started fresh conversation");
                                    }}
                                    className="p-1 rounded text-[#64748b] hover:text-white transition-colors"
                                    title="New Chat"
                                >
                                    <Plus size={13} />
                                </button>
                                <button
                                    onClick={() => setIsCopilotOpen(false)}
                                    className="p-1 rounded text-[#64748b] hover:text-white transition-colors"
                                    title="Close Copilot Panel"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Copilot Sub-Tabs: Chat | Code | Explain | Debug | Architect */}
                        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#1c2230] bg-[#0d1017] text-[11px] select-none">
                            {[
                                { id: "chat", label: "Chat" },
                                { id: "code", label: "Code" },
                                { id: "explain", label: "Explain" },
                                { id: "debug", label: "Debug" },
                                { id: "architect", label: "Architect" }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setCopilotSubTab(tab.id)}
                                    className={`px-2 py-0.5 rounded transition-colors ${
                                        copilotSubTab === tab.id
                                            ? "bg-[#181d2a] text-[#7dd3fc] font-medium"
                                            : "text-[#64748b] hover:text-[#cbd5e1]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Copilot Body Stream */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 select-text scrollbar-thin">
                            
                            {/* Guidance Level Bar: 1. Nudge | 2. Pinpoint | 3. Structure */}
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase font-mono font-medium text-[#64748b]">
                                    Guidance Level
                                </div>
                                <div className="grid grid-cols-3 gap-1 bg-[#0a0d14] p-0.5 rounded-md border border-[#1c2230] font-mono text-[11px]">
                                    {[
                                        { lvl: 1, label: "1. Nudge" },
                                        { lvl: 2, label: "2. Pinpoint" },
                                        { lvl: 3, label: "3. Structure" }
                                    ].map(tab => (
                                        <button
                                            key={tab.lvl}
                                            type="button"
                                            onClick={() => handleAskAiMentor({ requestedLevel: tab.lvl })}
                                            className={`py-1 px-1 rounded text-center transition-colors text-[11px] ${
                                                aiMentorState.level === tab.lvl
                                                    ? "bg-[#1c2436] text-[#7dd3fc] font-medium border border-[#2d3b56]"
                                                    : "text-[#64748b] hover:text-white"
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* User Question Bubble Example (Relaxed dark blue) */}
                            <div className="p-3 rounded-md bg-[#131d2d] border border-[#202f47] text-xs text-[#e2e8f0] font-normal leading-relaxed">
                                Why is test 3 failing? Review my code and suggest a fix.
                            </div>

                            {/* Forge Copilot Answer Card (Relaxed charcoal card) */}
                            <div className="p-3.5 rounded-md bg-[#131722] border border-[#1c2230] space-y-3 text-xs leading-relaxed">
                                <div className="flex items-start gap-2.5">
                                    <img 
                                        src="/images/forge-copilot-icon-transparent.png" 
                                        alt="Copilot" 
                                        className="w-5 h-5 rounded object-contain shrink-0 mt-0.5" 
                                    />
                                    <div className="text-[#cbd5e1] space-y-1.5">
                                        <p>
                                            The test is failing because your server always returns <code className="text-[#38bdf8]">+PONG\r\n</code>, even when the client sends PING with an argument. In Redis protocol, when PING has an argument, you should return it as a bulk string.
                                        </p>
                                    </div>
                                </div>

                                {/* Suggested Fix (main.rs) with Apply button */}
                                <div className="rounded-md border border-[#1c2230] bg-[#0a0d14] overflow-hidden space-y-1">
                                    <div className="h-7 px-3 bg-[#0d1017] border-b border-[#1c2230] flex items-center justify-between text-[11px]">
                                        <span className="font-mono text-[#828ea6] flex items-center gap-1.5">
                                            <Code2 size={12} className="text-[#38bdf8]" />
                                            <span>Suggested fix (main.rs)</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleApplyFix(
                                                `// Redis Server Implementation\nif cmd == "PING" {\n    if args.len() == 0 {\n        return Ok(RespValue::SimpleString("PONG".to_string()));\n    } else {\n        return Ok(RespValue::BulkString(args[0].clone()));\n    }\n}`
                                            )}
                                            className="px-2 py-0.5 rounded bg-[#1c2436] hover:bg-[#25314a] text-[#7dd3fc] font-sans font-medium text-[10px] flex items-center gap-1 transition-colors border border-[#2d3c59]"
                                        >
                                            <Check size={11} />
                                            <span>Apply</span>
                                        </button>
                                    </div>

                                    {/* Diff block lines (Relaxed pastel green) */}
                                    <div className="p-2.5 font-mono text-[11px] space-y-0.5 leading-relaxed overflow-x-auto">
                                        <div className="text-[#525f7a]">13   if cmd == "PING" &#123;</div>
                                        <div className="text-[#6ee7b7] bg-emerald-950/25 px-1 rounded">14 +   if args.len() == 0 &#123;</div>
                                        <div className="text-[#6ee7b7] bg-emerald-950/25 px-1 rounded">15 +     return Ok(RespValue::BulkString(args[0].clone()));</div>
                                        <div className="text-[#6ee7b7] bg-emerald-950/25 px-1 rounded">16 +   &#125; else &#123;</div>
                                        <div className="text-[#6ee7b7] bg-emerald-950/25 px-1 rounded">17 +     return Ok(RespValue::SimpleString("PONG".to_string()));</div>
                                        <div className="text-[#6ee7b7] bg-emerald-950/25 px-1 rounded">18 +   &#125;</div>
                                        <div className="text-[#525f7a]">19   &#125;</div>
                                    </div>
                                </div>

                                {/* Dynamic Advice from Backend */}
                                {aiMentorState.hint && (
                                    <div className="pt-2 border-t border-[#1c2230]">
                                        <FormattedAiContent content={aiMentorState.hint} />
                                    </div>
                                )}
                            </div>

                            {/* Additional Chat History */}
                            {aiMentorState.history.map((h, hIdx) => (
                                <div key={hIdx} className="space-y-2">
                                    <div className="p-2.5 rounded-md bg-[#131d2d] border border-[#202f47] text-xs text-[#e2e8f0]">
                                        {h.query}
                                    </div>
                                    <div className="p-3 rounded-md bg-[#131722] border border-[#1c2230] text-xs text-[#cbd5e1]">
                                        <FormattedAiContent content={h.reply} />
                                    </div>
                                </div>
                            ))}

                            {/* Action Chips: Explain selection, Add test case, Refactor */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                {[
                                    { label: "Explain selection", icon: Search },
                                    { label: "Add test case", icon: Plus },
                                    { label: "Refactor", icon: Zap }
                                ].map((chip, idx) => {
                                    const Icon = chip.icon;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleAskAiMentor({ prompt: `${chip.label} for active code in ${activeFileName}` })}
                                            className="px-2.5 py-1 rounded-md bg-[#131722] hover:bg-[#1a202e] border border-[#1c2230] text-[11px] text-[#828ea6] hover:text-[#f1f5f9] flex items-center gap-1 transition-colors"
                                        >
                                            <Icon size={11} className="text-[#38bdf8]" />
                                            <span>{chip.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                        </div>

                        {/* Anchored Bottom Composer */}
                        <div className="p-3 border-t border-[#1c2230] bg-[#0d1017] select-none">
                            <div className="p-2 rounded-md border border-[#1c2230] bg-[#0a0d14] focus-within:border-[#38bdf8]/60 transition-colors flex items-center gap-2">
                                <textarea
                                    value={aiMentorInput}
                                    onChange={(e) => setAiMentorInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            if (!aiMentorInput.trim() || aiMentorState.isLoading) return;
                                            const query = aiMentorInput.trim();
                                            setAiMentorInput("");
                                            handleAskAiMentor({ prompt: query });
                                        }
                                    }}
                                    placeholder="Ask Forge Copilot anything..."
                                    rows={1}
                                    className="flex-grow bg-transparent border-0 outline-none resize-none text-xs text-[#f1f5f9] placeholder-[#525f7a] leading-relaxed select-text"
                                />

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        className="p-1 text-[#64748b] hover:text-white transition-colors"
                                        title="Attach code snippet"
                                    >
                                        <Paperclip size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!aiMentorInput.trim() || aiMentorState.isLoading) return;
                                            const query = aiMentorInput.trim();
                                            setAiMentorInput("");
                                            handleAskAiMentor({ prompt: query });
                                        }}
                                        disabled={aiMentorState.isLoading || !aiMentorInput.trim()}
                                        className="w-7 h-7 rounded-md bg-[#1c2436] hover:bg-[#25314a] disabled:bg-[#121620] disabled:text-[#475569] text-[#7dd3fc] flex items-center justify-center transition-all shrink-0 border border-[#2d3c59]"
                                        title="Send message"
                                    >
                                        <Send size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </aside>
                )}

            </div>

            {/* ======================================================== */}
            {/* 14, 15, 16. STATUS BAR: Git, Test Status, Editor Info, Env */}
            {/* ======================================================== */}
            <footer className="h-6 border-t border-[#1c2230] bg-[#0a0c12] px-3 flex items-center justify-between text-[11px] font-mono text-[#525f7a] shrink-0 select-none z-30">
                
                {/* 14. Status Bar (Git branch, warnings, test suite) */}
                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        className="flex items-center gap-1 text-[#7dd3fc] hover:underline"
                    >
                        <GitBranch size={12} />
                        <span>main</span>
                        <ChevronDown size={11} />
                    </button>

                    <div className="flex items-center gap-2 text-[#828ea6]">
                        <span className="flex items-center gap-0.5">
                            <RotateCcw size={10} /> 0
                        </span>
                        <span className="flex items-center gap-0.5 text-rose-400">
                            <XCircle size={11} /> 1
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-400">
                            <AlertCircle size={11} /> 0
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setIsTerminalCollapsed(false);
                            setTerminalTab("results");
                        }}
                        className="text-[#34d399] font-medium hover:underline"
                    >
                        Test Suite: {testResults ? `${testResults.passed}/${testResults.total}` : "2/4"} Passing
                    </button>
                </div>

                {/* 15. Editor Info & 16. Environment Status */}
                <div className="flex items-center gap-3">
                    <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
                    <span className="hidden sm:inline">Spaces: 4</span>
                    <span className="hidden sm:inline">UTF-8</span>
                    <span className="capitalize text-[#828ea6]">{workspaceData.language || project.language || "Rust"}</span>
                    <span className="hidden md:inline">Default Environment</span>

                    {/* 16. Environment Status indicator */}
                    <div className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-950/30 border border-emerald-500/20 text-[#6ee7b7] font-sans text-[10px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="hidden sm:inline">Connected</span>
                    </div>
                </div>
            </footer>

            {/* ======================================================== */}
            {/* MODALS: COMMAND PALETTE & CELEBRATION                    */}
            {/* ======================================================== */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                files={files}
                activeFileName={activeFileName}
                onSelectFile={setActiveFileName}
                onRunTests={handleRunTests}
                onResetFile={handleResetFile}
                onSelectTab={(tab) => {
                    setIsSpecsCollapsed(false);
                    if (tab === "files") {
                        setActivityTab("files");
                    } else if (tab === "roadmap") {
                        setActivityTab("learn");
                        setSpecTab("roadmap");
                    } else if (tab === "spec") {
                        setActivityTab("learn");
                        setSpecTab("description");
                        setSubSpecTab("task");
                    } else if (tab === "prereq") {
                        setActivityTab("learn");
                        setSpecTab("description");
                        setSubSpecTab("requirements");
                    } else if (tab === "hints") {
                        setActivityTab("learn");
                        setSpecTab("description");
                        setSubSpecTab("hints");
                    } else if (tab === "submissions") {
                        setActivityTab("learn");
                        setSpecTab("submissions");
                    } else {
                        setActivityTab("learn");
                        setSpecTab("description");
                    }
                }}
            />

            <AnimatePresence>
                {showCelebration && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md p-6 rounded-2xl bg-[#10141d] border border-[#1c2230] text-center space-y-4 shadow-2xl relative overflow-hidden"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
                                <Award size={28} />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-[#f1f5f9]">Project Complete!</h3>
                                <p className="text-xs text-[#828ea6] leading-relaxed">
                                    You have completed all {totalMilestones} architectural milestones for <strong>{project.title}</strong>.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-lg bg-[#0a0d14] border border-[#1c2230] text-xs text-[#cbd5e1] font-mono space-y-1">
                                <div>Total Session Time: <span className="text-[#38bdf8] font-medium">{formattedTime}</span></div>
                                <div>Total Passed Assertions: <span className="text-[#34d399] font-medium">{project.milestones?.reduce((acc, m) => acc + (m.testCount || 4), 0)} Tests</span></div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setShowCelebration(false)}
                                    className="flex-1 py-2 rounded-lg bg-[#181d2a] hover:bg-[#202738] text-xs font-medium text-[#f1f5f9] transition-colors border border-[#2b354a]"
                                >
                                    Stay in Workspace
                                </button>
                                <button
                                    onClick={() => navigate("/projects")}
                                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-black transition-colors"
                                >
                                    Forge Next Project
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

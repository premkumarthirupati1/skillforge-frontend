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
    HelpCircle,
    Award,
    Lock,
    Maximize2,
    Minimize2,
    Code2,
    Milestone,
    Target,
    FolderTree,
    Search,
    Command,
    Bot,
    Send,
    ArrowUp,
    ChevronDown,
    BrainCircuit,
    Lightbulb,
    Zap,
    RefreshCw,
    X,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    FileCode,
    CheckCheck,
    Flame,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Star,
    Cloud
} from "lucide-react";
import { PROJECTS } from "../../data/projectsData";
import { getProjectWorkspaceData } from "../../data/projectWorkspacesData";
import { executeProjectTests, isClientSideLanguage } from "../../services/codeRunnerService";
import { fetchAiMentorAdvice } from "../../services/aiMentorService";
import CodeStudioEditor from "../../components/workspace/CodeStudioEditor";
import CommandPalette from "../../components/workspace/CommandPalette";
import FileExplorerTree from "../../components/workspace/FileExplorerTree";
import toast from "react-hot-toast";
import api from "../../api";

/**
 * Structured AI / Markdown Content Formatter
 */
function FormattedAiContent({ content, className = "" }) {
    if (!content) return null;

    const paragraphs = String(content).split(/\n{2,}/);

    return (
        <div className={`space-y-2 text-xs leading-relaxed ${className}`}>
            {paragraphs.map((p, pIdx) => {
                const lines = p.split('\n');
                return (
                    <div key={pIdx} className="space-y-1">
                        {lines.map((line, lIdx) => {
                            const trimmed = line.trim();
                            const listMatch = trimmed.match(/^(\d+\.|\-|\*)\s+(.*)$/);
                            if (listMatch) {
                                const bullet = listMatch[1];
                                const rest = listMatch[2];
                                return (
                                    <div key={lIdx} className="flex items-start gap-2 pl-0.5">
                                        <span className="font-mono text-xs text-[#388bfd] font-bold shrink-0 mt-0.5">{bullet}</span>
                                        <span className="flex-grow text-[#cfd3dc]">{renderInlineText(rest)}</span>
                                    </div>
                                );
                            }
                            return (
                                <p key={lIdx} className="leading-relaxed text-[#cfd3dc]">
                                    {renderInlineText(line)}
                                </p>
                            );
                        })}
                    </div>
                );
            })}
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
                <code key={match.index} className="px-1.5 py-0.5 mx-0.5 rounded bg-[#1e1e1e] text-[#79c0ff] font-mono text-[11px] border border-[#383838] font-medium inline-block">
                    {token.slice(1, -1)}
                </code>
            );
        } else if (token.startsWith('**') && token.endsWith('**')) {
            parts.push(
                <strong key={match.index} className="font-semibold text-[#eff1f6]">
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
        setSpecTab("spec");
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

    // Active Left Pane Tab ('spec' | 'roadmap' | 'files' | 'prd')
    const [specTab, setSpecTab] = useState("spec");
    const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState(0);
    const [isSpecsCollapsed, setIsSpecsCollapsed] = useState(false);
    const [expandedHints, setExpandedHints] = useState({});

    const toggleHint = (idx) => {
        setExpandedHints(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    // Resizable Left Panel width (persisted in localStorage, default 390px)
    const [panelWidth, setPanelWidth] = useState(() => {
        try {
            const saved = localStorage.getItem("skillforge_sidepanel_width");
            return saved ? parseInt(saved, 10) || 390 : 390;
        } catch {
            return 390;
        }
    });
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);

    // Resizable Right Copilot Panel width (default 380px) & open toggle
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

    // Resizable bottom test runner drawer height
    const [terminalHeight, setTerminalHeight] = useState(240);
    const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);

    // Test Runner tab ('tests' | 'console')
    const [terminalTab, setTerminalTab] = useState("tests");

    // Test Runner execution state
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [testResults, setTestResults] = useState(null);

    // Monaco Editor Reference & Cursor Coordinates
    const editorInstanceRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

    // Command Palette Modal
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    // Terminal console logs
    const [consoleLogs, setConsoleLogs] = useState([
        `⚡ skillforge-microvm v2.4 initialized for [${project.title}]`,
        `container: sha256:8b47e2 mounted at /workspace`,
        `branch: main (tracking origin/main)`,
        `Ready. Edit code on the right and click 'Run Tests' (Ctrl+Enter).`
    ]);
    const [terminalInput, setTerminalInput] = useState("");

    // Session timer (persisted per project)
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
        level: 1,
        targetLine: null,
        codePattern: "",
        quickPrompts: [
            "Why did my test fail?",
            "Give me a subtle hint",
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
        specRules: ["Write clean, test-compliant code.", "Handle edge cases."],
        hints: ["Check the sample tests in the terminal pane."],
        testCases: [
            { name: "Unit Test 1", cmd: "test_step_1", expected: "Pass" },
            { name: "Unit Test 2", cmd: "test_step_2", expected: "Pass" }
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

        return () => {
            isMounted = false;
        };
    }, [project?.id]);

    // Format seconds into HH:MM:SS or MM:SS
    const formattedTime = useMemo(() => {
        const hrs = Math.floor(secondsElapsed / 3600);
        const mins = Math.floor((secondsElapsed % 3600) / 60);
        const secs = secondsElapsed % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, [secondsElapsed]);

    // Performance refs for resize handlers
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

    // High-performance resize listener
    useEffect(() => {
        if (!isDraggingPanel && !isDraggingTerminal && !isDraggingCopilot) return;

        document.body.style.userSelect = "none";
        document.body.style.cursor = (isDraggingPanel || isDraggingCopilot) ? "col-resize" : "row-resize";

        const handleMouseMove = (e) => {
            if (resizeRafIdRef.current) return;
            resizeRafIdRef.current = requestAnimationFrame(() => {
                resizeRafIdRef.current = null;
                if (isDraggingPanel) {
                    const newWidth = Math.max(280, Math.min(e.clientX, window.innerWidth - 450));
                    setPanelWidth(newWidth);
                } else if (isDraggingCopilot) {
                    const newWidth = Math.max(280, Math.min(window.innerWidth - e.clientX, 650));
                    setCopilotWidth(newWidth);
                } else if (isDraggingTerminal) {
                    const newHeight = Math.max(60, Math.min(window.innerHeight - e.clientY, window.innerHeight - 150));
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

    // Handle File Content Change
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

    // Reset current file to initial template
    const handleResetFile = () => {
        const original = workspaceData.files.find(f => f.name === activeFileName);
        if (original) {
            handleCodeChange(original.content);
            toast.success(`Reset ${activeFileName} to starter skeleton`);
        }
    };

    // Create New File in Workspace
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

        const targetLevel = requestedLevel !== null ? requestedLevel : (aiMentorState.level || 1);
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
                hintLevel: targetLevel
            });

            let cleanDiagnosis = advice.diagnosis || "";
            let cleanHint = advice.hint || "";
            let cleanPattern = advice.codePattern || "";
            let cleanLine = line || (typeof advice.targetLine === "number" ? advice.targetLine : (parseInt(advice.targetLine, 10) || null));
            let cleanPrompts = advice.quickPrompts || [];

            setAiMentorState(prev => ({
                ...prev,
                isLoading: false,
                diagnosis: cleanDiagnosis,
                hint: cleanHint,
                level: advice.level || targetLevel,
                targetLine: cleanLine,
                codePattern: cleanPattern,
                quickPrompts: cleanPrompts.length > 0 ? cleanPrompts : prev.quickPrompts,
                modelUsed: advice.modelUsed,
                history: prompt ? [...prev.history, { query: prompt, reply: cleanHint }] : prev.history
            }));

            if (cleanLine && cleanLine > 0) {
                jumpToLine(cleanLine);
            }
            toast("Forge Copilot ready with insights", { icon: "🤖" });
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

                toast.success(`Milestone ${currentMilestoneIndex + 1} passed all test assertions!`);

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

                toast.error("Tests failed. Review output in the bottom test runner.");
            }

            if (terminalHeight < 120) {
                setTerminalHeight(260);
            }
            setTerminalTab("tests");

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
            if ((e.ctrlKey || e.metaKey) && e.key === "p") {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
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

    return (
        <div className="h-screen w-screen bg-[#1a1a1a] text-[#eff1f6] flex flex-col overflow-hidden font-sans select-none">
            
            {/* ======================================================== */}
            {/* 1. TOP GLOBAL ACTION HEADER (LeetCode Clean Bar, h-11)    */}
            {/* ======================================================== */}
            <header className="h-11 border-b border-[#2e2e2e] bg-[#1a1a1a] px-3 flex items-center justify-between shrink-0 z-30">
                
                {/* Left: Brand, Back & Project Title Stepper */}
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <button
                        onClick={() => navigate("/projects")}
                        className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-[#262626] transition-colors"
                        title="Back to Projects"
                    >
                        <ArrowLeft size={15} />
                    </button>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-1.5 hover:opacity-85 transition-opacity shrink-0"
                        title="SkillForge Dashboard"
                    >
                        <img 
                            src="/images/skillforge-icon.png" 
                            alt="SkillForge" 
                            className="h-5 w-auto object-contain" 
                        />
                    </button>

                    <div className="h-3.5 w-px bg-[#333333] hidden sm:block shrink-0" />

                    {/* Milestone Stepper (< Stage X >) */}
                    <div className="flex items-center gap-1 min-w-0">
                        <button
                            type="button"
                            disabled={currentMilestoneIndex === 0}
                            onClick={() => handleSelectMilestone(currentMilestoneIndex - 1)}
                            className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-[#262626] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                            title="Previous Stage"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        <div className="flex items-center gap-1.5 px-1 min-w-0 text-xs">
                            <span className="font-semibold text-[#eff1f6] truncate max-w-[130px] sm:max-w-xs">
                                Stage {currentMilestoneIndex + 1}/{totalMilestones}: {currentMilestone?.title || project.title}
                            </span>
                            {isCurrentMilestoneVerified ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2cbb5d] shrink-0" title="Stage Verified" />
                            ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#388bfd] shrink-0" title="Stage Active" />
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={currentMilestoneIndex >= totalMilestones - 1}
                            onClick={() => handleSelectMilestone(currentMilestoneIndex + 1)}
                            className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-[#262626] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                            title="Next Stage"
                        >
                            <ChevronRight size={14} />
                        </button>

                        <span className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#262626] border border-[#383838] text-[#8c8c8c] uppercase ml-1">
                            {workspaceData.language || project.language || "Code"}
                        </span>
                    </div>
                </div>

                {/* Center: Action Buttons (Run, Submit, Copilot) */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Primary Run Tests Button */}
                    <button
                        onClick={handleRunTests}
                        disabled={isRunningTests}
                        className="px-3 py-1.5 rounded-lg bg-[#333333] hover:bg-[#3d3d3d] active:bg-[#282828] text-[#eff1f6] border border-[#444444] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        title="Run Tests (Ctrl+Enter)"
                    >
                        <Play size={12} fill="currentColor" className={isRunningTests ? "animate-spin text-[#388bfd]" : "text-[#8c8c8c]"} />
                        <span>{isRunningTests ? "Running..." : "Run"}</span>
                        <kbd className="hidden lg:inline text-[9px] bg-[#262626] border border-[#444444] px-1 py-0.2 rounded font-mono text-[#8c8c8c]">
                            Ctrl+'
                        </kbd>
                    </button>

                    {/* Submit Stage Button */}
                    <button
                        onClick={handleRunTests}
                        disabled={isRunningTests}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2cbb5d]/15 hover:bg-[#2cbb5d]/25 active:bg-[#2cbb5d]/35 text-[#2cbb5d] border border-[#2cbb5d]/40 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        title="Submit Stage Verification"
                    >
                        <Cloud size={13} />
                        <span>Submit</span>
                        <kbd className="hidden lg:inline text-[9px] bg-[#2cbb5d]/20 border border-[#2cbb5d]/40 px-1 py-0.2 rounded font-mono text-[#2cbb5d]">
                            ↵
                        </kbd>
                    </button>

                    {/* Dedicated Forge Copilot Action Toggle */}
                    <button
                        onClick={() => setIsCopilotOpen(prev => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm ${
                            isCopilotOpen
                                ? "bg-[#388bfd]/20 text-[#388bfd] border-[#388bfd]/40"
                                : "bg-[#333333] hover:bg-[#3d3d3d] text-[#eff1f6] border-[#444444]"
                        }`}
                        title="Toggle Forge Copilot Senior AI Mentor"
                    >
                        <Sparkles size={13} className={isCopilotOpen ? "text-[#388bfd]" : "text-[#8c8c8c]"} />
                        <span className="hidden sm:inline">Copilot</span>
                    </button>
                </div>

                {/* Right: Timer, Quick Open & Panel Toggles */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Session Timer */}
                    <div 
                        className="hidden md:flex items-center gap-1.5 text-xs font-mono text-[#8c8c8c] px-2 py-1"
                        title="Session Time Elapsed (Auto-saved)"
                    >
                        <Clock size={12} className="text-[#8c8c8c]" />
                        <span>{formattedTime}</span>
                    </div>

                    {/* Quick Command Palette */}
                    <button
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-[#262626] transition-colors"
                        title="Quick File Open (Ctrl+P)"
                    >
                        <Search size={12} />
                        <kbd className="px-1 py-0.2 bg-[#262626] border border-[#383838] rounded text-[9px] font-mono">Ctrl+P</kbd>
                    </button>

                    {/* Toggle Left Spec Panel */}
                    <button
                        onClick={() => setIsSpecsCollapsed(prev => !prev)}
                        className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-[#262626] transition-colors"
                        title={isSpecsCollapsed ? "Open Description Pane" : "Collapse Description Pane"}
                    >
                        {isSpecsCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
                    </button>
                </div>
            </header>

            {/* ======================================================== */}
            {/* 2. MAIN 3-ZONE STUDIO WORKSPACE                          */}
            {/* ======================================================== */}
            <div className="flex-grow flex p-2 gap-2 overflow-hidden bg-[#1a1a1a] relative">

                {/* ---------------------------------------------------- */}
                {/* ZONE 1: LEFT PANE (SPEC, ROADMAP, FILES, PRD)        */}
                {/* ---------------------------------------------------- */}
                {!isSpecsCollapsed && (
                    <aside 
                        style={{ width: `${panelWidth}px` }}
                        className={`bg-[#262626] border border-[#333333] rounded-lg flex flex-col shrink-0 h-full overflow-hidden shadow-sm select-text will-change-[width] ${
                            isDraggingPanel ? "select-none" : ""
                        }`}
                    >
                        {/* Tab Header Bar */}
                        <div className="h-9 bg-[#262626] border-b border-[#333333] px-2.5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
                                {[
                                    { id: "spec", label: "Description", icon: BookOpen },
                                    { id: "roadmap", label: "Roadmap", icon: Milestone, count: totalMilestones },
                                    { id: "files", label: "Files", icon: FolderTree, count: files.length },
                                    { id: "prd", label: "PRD", icon: Layers }
                                ].map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = specTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setSpecTab(tab.id)}
                                            className={`px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors rounded-md shrink-0 ${
                                                isActive
                                                    ? "bg-[#333333] text-[#eff1f6] font-semibold"
                                                    : "text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-white/5"
                                            }`}
                                        >
                                            <Icon size={12} className={isActive ? "text-[#388bfd]" : "text-[#8c8c8c]"} />
                                            <span>{tab.label}</span>
                                            {tab.count !== undefined && tab.count !== null && (
                                                <span className="text-[10px] px-1 rounded bg-[#1e1e1e] text-[#8c8c8c]">
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setIsSpecsCollapsed(true)}
                                className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-white/5 transition-colors"
                                title="Collapse Side Panel"
                            >
                                <PanelLeftClose size={13} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin select-text">
                            
                            {/* TAB 1: MILESTONE SPEC / DESCRIPTION */}
                            {specTab === "spec" && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    {/* Problem Title & Stage */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-[#eff1f6]">
                                                Stage {currentMilestoneIndex + 1}: {milestoneGuide.title}
                                            </span>
                                            {isCurrentMilestoneVerified ? (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2cbb5d]/20 text-[#2cbb5d] font-medium border border-[#2cbb5d]/40">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#388bfd]/20 text-[#388bfd] font-medium border border-[#388bfd]/40">
                                                    In Progress
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[#cfd3dc] leading-relaxed">
                                            {milestoneGuide.objective}
                                        </p>
                                    </div>

                                    {/* Specification Rules */}
                                    {milestoneGuide.specRules && milestoneGuide.specRules.length > 0 && (
                                        <div className="space-y-2 pt-1">
                                            <div className="text-[11px] font-semibold text-[#eff1f6] flex items-center gap-1.5 uppercase tracking-wide">
                                                <ShieldCheck size={13} className="text-[#388bfd]" />
                                                <span>Specification Rules</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {milestoneGuide.specRules.map((rule, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="p-2.5 rounded-lg bg-[#1f1f1f] border border-[#333333] flex items-start gap-2.5 text-[#cfd3dc]"
                                                    >
                                                        <span className="font-mono text-xs text-[#388bfd] font-bold shrink-0 mt-0.5">
                                                            {idx + 1}.
                                                        </span>
                                                        <span className="leading-relaxed">
                                                            {renderInlineText(rule)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* LeetCode Collapsible Hints Accordion */}
                                    {milestoneGuide.hints && milestoneGuide.hints.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            {milestoneGuide.hints.map((hint, hIdx) => {
                                                const isExpanded = !!expandedHints[hIdx];
                                                return (
                                                    <div key={hIdx} className="rounded-lg border border-[#333333] bg-[#1f1f1f] overflow-hidden">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleHint(hIdx)}
                                                            className="w-full px-3 py-2 flex items-center justify-between text-left text-xs font-medium text-[#eff1f6] hover:bg-[#262626] transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Lightbulb size={13} className="text-amber-400" />
                                                                <span>Hint {hIdx + 1}</span>
                                                            </div>
                                                            <ChevronDown size={14} className={`text-[#8c8c8c] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                                        </button>
                                                        {isExpanded && (
                                                            <div className="px-3 pb-3 pt-1 border-t border-[#2e2e2e] text-[#cfd3dc] leading-relaxed">
                                                                {renderInlineText(hint)}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Target Verification Checklist Accordion */}
                                    {milestoneGuide.testCases && milestoneGuide.testCases.length > 0 && (
                                        <div className="rounded-lg border border-[#333333] bg-[#1f1f1f] overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => toggleHint("targets")}
                                                className="w-full px-3 py-2 flex items-center justify-between text-left text-xs font-medium text-[#eff1f6] hover:bg-[#262626] transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Target size={13} className="text-[#388bfd]" />
                                                    <span>Target Assertions ({milestoneGuide.testCases.length})</span>
                                                </div>
                                                <ChevronDown size={14} className={`text-[#8c8c8c] transition-transform ${expandedHints["targets"] ? "rotate-180" : ""}`} />
                                            </button>
                                            {expandedHints["targets"] && (
                                                <div className="p-2 space-y-1.5 border-t border-[#2e2e2e]">
                                                    {milestoneGuide.testCases.map((tc, idx) => (
                                                        <div key={idx} className="p-2 rounded bg-[#262626] border border-[#333333] flex items-center justify-between font-mono text-[11px]">
                                                            <span className="text-[#cfd3dc] truncate">{tc.name}</span>
                                                            <span className="text-[#2cbb5d] text-[10px]">{tc.expected}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* LeetCode Footer Stats (Accepted, Rate, Topics, Like/Dislike) */}
                                    <div className="pt-4 border-t border-[#333333] space-y-3">
                                        <div className="flex items-center gap-4 text-xs text-[#8c8c8c]">
                                            <span>Accepted <strong className="text-[#eff1f6] font-mono">54,125</strong></span>
                                            <span>Acceptance Rate <strong className="text-[#eff1f6] font-mono">53.2%</strong></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-[#8c8c8c]">
                                            <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                                                <ThumbsUp size={13} />
                                                <span>354</span>
                                            </button>
                                            <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                                                <ThumbsDown size={13} />
                                            </button>
                                            <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                                                <MessageSquare size={13} />
                                                <span>163</span>
                                            </button>
                                            <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                                                <Star size={13} />
                                            </button>
                                            <span className="ml-auto flex items-center gap-1.5 text-[#2cbb5d] font-mono text-[11px]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#2cbb5d]" />
                                                <span>1860 Online</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: MILESTONE ROADMAP */}
                            {specTab === "roadmap" && (
                                <div className="space-y-3 animate-in fade-in duration-200">
                                    <div className="text-xs uppercase font-medium tracking-wider text-[#8c8c8c] flex items-center justify-between">
                                        <span>Milestone Progression</span>
                                        <span className="text-[#388bfd] font-mono font-bold">
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
                                                    className={`p-3 rounded-lg border transition-colors text-left flex items-start gap-3 ${
                                                        !isUnlocked
                                                            ? "opacity-40 bg-[#1f1f1f] border-[#333333] cursor-not-allowed"
                                                            : isActive
                                                            ? "bg-[#1f1f1f] border-[#388bfd] shadow-sm cursor-pointer"
                                                            : "bg-[#1f1f1f] border-[#333333] hover:border-[#444444] cursor-pointer"
                                                    }`}
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                                        isVerified
                                                            ? "bg-[#2cbb5d]/20 text-[#2cbb5d]"
                                                            : isActive
                                                            ? "bg-[#388bfd]/20 text-[#388bfd]"
                                                            : "bg-[#262626] text-[#8c8c8c]"
                                                    }`}>
                                                        {isVerified ? <Check size={12} /> : idx + 1}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                            <span className="font-semibold text-[#eff1f6] truncate text-xs">
                                                                {m.title}
                                                            </span>
                                                            {!isUnlocked && (
                                                                <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5 shrink-0">
                                                                    <Lock size={10} /> Locked
                                                                </span>
                                                            )}
                                                            {isVerified && (
                                                                <span className="text-[10px] font-mono text-[#2cbb5d] font-bold shrink-0">
                                                                    Passed
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-[#8c8c8c] line-clamp-1">
                                                            {m.description || "Milestone specification objectives"}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: PROJECT FILES */}
                            {specTab === "files" && (
                                <div className="space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs uppercase font-medium tracking-wider text-[#8c8c8c]">
                                            Workspace Files
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const name = prompt("Enter new file name (e.g., helper.rs, utils.py):");
                                                if (name) handleCreateFile(name);
                                            }}
                                            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#1f1f1f] hover:bg-[#333333] text-[#cfd3dc] hover:text-white transition-colors border border-[#383838]"
                                        >
                                            <Plus size={12} />
                                            <span>New File</span>
                                        </button>
                                    </div>

                                    <FileExplorerTree
                                        files={files}
                                        activeFileName={activeFileName}
                                        onSelectFile={setActiveFileName}
                                        onCreateFile={handleCreateFile}
                                    />
                                </div>
                            )}

                            {/* TAB 4: ARCHITECTURE PRD */}
                            {specTab === "prd" && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="p-3.5 rounded-lg bg-[#1f1f1f] border border-[#333333] space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-[#eff1f6] uppercase tracking-wider">
                                            <Layers size={13} className="text-[#388bfd]" />
                                            <span>System Specification</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-[#eff1f6]">{project.title}</h3>
                                        <p className="text-xs text-[#cfd3dc] leading-relaxed">
                                            {project.description}
                                        </p>
                                    </div>

                                    {project.prerequisites && project.prerequisites.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-xs uppercase font-medium tracking-wider text-[#8c8c8c]">
                                                Prerequisites & Knowledge Targets
                                            </span>
                                            <div className="space-y-1.5">
                                                {project.prerequisites.map((p, i) => (
                                                    <div key={i} className="p-2 rounded-lg bg-[#1f1f1f] border border-[#333333] flex items-center gap-2 text-xs text-[#cfd3dc]">
                                                        <CheckCircle2 size={13} className="text-[#388bfd] shrink-0" />
                                                        <span>{p}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </aside>
                )}

                {/* Resizable Vertical Divider 1 */}
                {!isSpecsCollapsed && (
                    <div
                        onMouseDown={() => setIsDraggingPanel(true)}
                        onDoubleClick={() => setPanelWidth(390)}
                        className={`w-1.5 hover:w-2 ${
                            isDraggingPanel ? "w-2 bg-[#388bfd]" : "bg-transparent hover:bg-[#388bfd]/50"
                        } transition-colors cursor-col-resize flex items-center justify-center shrink-0 select-none group z-20`}
                        title="Drag to resize pane"
                    >
                        <div className={`h-8 w-0.5 rounded-full ${isDraggingPanel ? "bg-white" : "bg-[#444444] group-hover:bg-[#388bfd]"} transition-colors`} />
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* ZONE 2: MIDDLE PANE (CODE EDITOR + TEST DRAWER)      */}
                {/* ---------------------------------------------------- */}
                <main className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden h-full">
                    
                    {/* Top Editor Card */}
                    <div className="bg-[#262626] border border-[#333333] rounded-lg flex flex-col flex-1 min-h-0 overflow-hidden shadow-sm">
                        {/* Editor Header Bar */}
                        <div className="h-9 bg-[#262626] border-b border-[#333333] px-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-semibold text-[#eff1f6] flex items-center gap-1.5">
                                    <Code2 size={13} className="text-[#388bfd]" />
                                    <span>&lt;/&gt; Code</span>
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1e1e1e] border border-[#383838] text-[#8c8c8c]">
                                    {workspaceData.language || project.language || "Code"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] font-mono text-[#8c8c8c]">
                                <button
                                    onClick={handleResetFile}
                                    className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-white/5 transition-colors"
                                    title="Reset to starter skeleton"
                                >
                                    <RotateCcw size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Editor Canvas */}
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

                        {/* Editor Footer */}
                        <div className="h-6 bg-[#262626] border-t border-[#333333] px-3 flex items-center justify-between text-[11px] font-mono text-[#8c8c8c] shrink-0">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2cbb5d]" />
                                <span>Saved</span>
                            </div>
                            <div>
                                Ln {cursorPosition.line}, Col {cursorPosition.col}
                            </div>
                        </div>
                    </div>

                    {/* Resizable Horizontal Divider between Editor and Tests */}
                    <div
                        onMouseDown={() => setIsDraggingTerminal(true)}
                        className={`h-1.5 hover:h-2 ${
                            isDraggingTerminal ? "h-2 bg-[#388bfd]" : "bg-transparent hover:bg-[#388bfd]/50"
                        } transition-colors cursor-row-resize flex items-center justify-center shrink-0 select-none group z-20`}
                        title="Drag to resize test runner"
                    >
                        <div className={`w-10 h-0.5 rounded-full ${isDraggingTerminal ? "bg-white" : "bg-[#444444] group-hover:bg-[#388bfd]"} transition-colors`} />
                    </div>

                    {/* Bottom Test Runner Card (LeetCode Testcase / Test Result style) */}
                    <div 
                        style={{ height: `${terminalHeight}px` }}
                        className="bg-[#262626] border border-[#333333] rounded-lg flex flex-col overflow-hidden shadow-sm shrink-0"
                    >
                        {/* Drawer Header Tabs */}
                        <div className="h-9 border-b border-[#333333] bg-[#262626] px-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setTerminalTab("tests")}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                                        terminalTab === "tests"
                                            ? "bg-[#333333] text-[#eff1f6] font-semibold"
                                            : "text-[#8c8c8c] hover:text-[#eff1f6]"
                                    }`}
                                >
                                    <CheckCircle2 size={12} className={testResults?.status === "passed" ? "text-[#2cbb5d]" : "text-[#8c8c8c]"} />
                                    <span>Testcase / Test Result</span>
                                    {testResults && (
                                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                                            testResults.status === "passed"
                                                ? "bg-[#2cbb5d]/20 text-[#2cbb5d]"
                                                : "bg-[#ef4743]/20 text-[#ef4743]"
                                        }`}>
                                            {testResults.passed}/{testResults.total} Passed
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setTerminalTab("console")}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                                        terminalTab === "console"
                                            ? "bg-[#333333] text-[#eff1f6] font-semibold"
                                            : "text-[#8c8c8c] hover:text-[#eff1f6]"
                                    }`}
                                >
                                    <Terminal size={12} />
                                    <span>Console Logs</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setTerminalHeight(prev => prev > 100 ? 50 : 240)}
                                className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] transition-colors"
                                title={terminalHeight > 100 ? "Minimize" : "Expand"}
                            >
                                {terminalHeight > 100 ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-grow p-3.5 overflow-y-auto font-mono text-xs select-text scrollbar-thin">
                            
                            {/* TESTS TAB */}
                            {terminalTab === "tests" && (
                                <div className="space-y-2.5">
                                    {!testResults ? (
                                        /* LeetCode exact empty state: "You must run your code first" */
                                        <div className="h-full flex flex-col items-center justify-center text-[#8c8c8c] py-8 space-y-2 select-none">
                                            <span className="text-xs">You must run your code first</span>
                                            <button
                                                type="button"
                                                onClick={handleRunTests}
                                                className="px-3 py-1 rounded bg-[#333333] hover:bg-[#3d3d3d] text-[#eff1f6] text-xs font-sans transition-colors"
                                            >
                                                Run Tests
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {/* Results Status Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#333333] text-[11px] text-[#8c8c8c] gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold font-mono text-xs ${testResults.status === "passed" ? "text-[#2cbb5d]" : "text-[#ef4743]"}`}>
                                                        {testResults.status === "passed" ? "✓ Verification Passed" : "✗ Verification Failed"}
                                                    </span>
                                                    <span>• {testResults.passed}/{testResults.total} assertions met</span>
                                                    <span>• {testResults.duration || "12ms"}</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-[#8c8c8c]">
                                                    {testResults.engineLabel || "Sandbox MicroVM"}
                                                </span>
                                            </div>

                                            {/* All Passed Banner */}
                                            {testResults.status === "passed" && (
                                                <div className="p-3 rounded-lg bg-[#2cbb5d]/10 border border-[#2cbb5d]/30 flex items-center justify-between flex-wrap gap-2 text-[#2cbb5d]">
                                                    <div className="flex items-center gap-2 font-medium text-xs">
                                                        <CheckCircle2 size={15} />
                                                        <span>Stage {currentMilestoneIndex + 1} Complete! All assertions verified successfully.</span>
                                                    </div>
                                                    {currentMilestoneIndex < totalMilestones - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectMilestone(currentMilestoneIndex + 1)}
                                                            className="px-3 py-1 rounded-md bg-[#2cbb5d] hover:bg-[#259b4c] text-black font-semibold text-xs transition-colors shadow-sm"
                                                        >
                                                            Advance to Stage {currentMilestoneIndex + 2} →
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Test Steps List */}
                                            {testResults.steps?.map((step, idx) => {
                                                const lineNum = extractLineNumber(step.output);
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className={`flex items-start sm:items-center justify-between p-2.5 rounded-lg border transition-colors gap-2.5 ${
                                                            step.passed 
                                                                ? "bg-[#1f1f1f] border-[#333333] text-[#cfd3dc]" 
                                                                : "bg-[#1f1f1f] border-[#ef4743]/40 text-[#ef4743]"
                                                        }`}
                                                    >
                                                        <div className="flex items-start sm:items-center gap-2.5 flex-grow min-w-0">
                                                            <div className="shrink-0 mt-0.5 sm:mt-0">
                                                                {step.passed ? (
                                                                    <CheckCircle2 size={15} className="text-[#2cbb5d]" />
                                                                ) : (
                                                                    <XCircle size={15} className="text-[#ef4743]" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-grow space-y-0.5">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-semibold text-xs text-[#eff1f6]">{step.name}</span>
                                                                    {lineNum && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => jumpToLine(lineNum)}
                                                                            className="px-1.5 py-0.2 rounded bg-[#262626] hover:bg-[#333333] text-[#388bfd] text-[10px] font-mono flex items-center gap-1 transition-colors border border-[#383838]"
                                                                            title={`Jump to line ${lineNum} in editor`}
                                                                        >
                                                                            <Target size={10} />
                                                                            <span>Line {lineNum}</span>
                                                                        </button>
                                                                    )}
                                                                    {!step.passed && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleAskAiMentor({
                                                                                testCase: step.name,
                                                                                error: step.output,
                                                                                line: lineNum,
                                                                                requestedLevel: 1
                                                                            })}
                                                                            className="px-2 py-0.5 rounded bg-[#388bfd]/15 hover:bg-[#388bfd]/25 text-[#388bfd] border border-[#388bfd]/30 text-[10px] font-mono flex items-center gap-1 transition-colors font-medium"
                                                                            title="Get Copilot diagnosis & graduated hint"
                                                                        >
                                                                            <Sparkles size={11} />
                                                                            <span>Ask Copilot</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {step.output && (
                                                                    <div className={`text-xs font-mono truncate max-w-2xl leading-relaxed ${step.passed ? "text-[#8c8c8c]" : "text-[#ef4743]"}`}>
                                                                        {step.output}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-[11px] font-mono shrink-0 ${step.passed ? "text-[#2cbb5d]" : "text-[#ef4743]"}`}>
                                                            {step.duration}
                                                        </span>
                                                    </div>
                                                );
                                            })}

                                            {/* Results Footer Message if Failed */}
                                            {testResults.status === "failed" && (
                                                <div className="p-2.5 rounded-lg bg-[#ef4743]/10 border border-[#ef4743]/30 text-[#ef4743] flex items-center justify-between flex-wrap gap-2">
                                                    <div className="flex items-center gap-2 font-medium text-xs">
                                                        <XCircle size={15} />
                                                        <span>Tests failed ({testResults.passed}/{testResults.total} passed). Fix errors to advance.</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAskAiMentor({
                                                            testCase: testResults.steps?.find(s => !s.passed)?.name || "Milestone Tests",
                                                            error: testResults.steps?.find(s => !s.passed)?.output || "Tests failed",
                                                            requestedLevel: 1
                                                        })}
                                                        className="px-2.5 py-1 rounded-md bg-[#388bfd]/20 hover:bg-[#388bfd]/30 border border-[#388bfd]/40 text-[#388bfd] text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Bot size={13} />
                                                        <span>Diagnose All Failures</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CONSOLE LOGS TAB */}
                            {terminalTab === "console" && (
                                <div className="space-y-2 h-full flex flex-col justify-between">
                                    <div className="space-y-1 font-mono text-xs overflow-y-auto">
                                        {consoleLogs.map((log, i) => (
                                            <div 
                                                key={i} 
                                                className={`leading-relaxed whitespace-pre-wrap ${
                                                    log.startsWith("$") 
                                                        ? "text-[#388bfd] font-bold" 
                                                        : log.includes("[stderr]") || log.includes("[fatal]") || log.includes("error") 
                                                        ? "text-[#ef4743]" 
                                                        : log.includes("✓") || log.includes("Passed") 
                                                        ? "text-[#2cbb5d]" 
                                                        : "text-[#8c8c8c]"
                                                }`}
                                            >
                                                {log}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Terminal Command Input */}
                                    <form onSubmit={handleTerminalCommand} className="flex items-center gap-2 pt-2 border-t border-[#333333] shrink-0">
                                        <span className="text-[#388bfd] font-mono font-bold">$</span>
                                        <input
                                            type="text"
                                            value={terminalInput}
                                            onChange={(e) => setTerminalInput(e.target.value)}
                                            placeholder="Type a command (test, clear, ls, help)..."
                                            className="flex-grow bg-transparent border-0 outline-none text-xs font-mono text-[#eff1f6] placeholder-[#595959]"
                                        />
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>

                </main>

                {/* Resizable Vertical Divider 2 (Between Middle Pane and Right Copilot) */}
                {isCopilotOpen && (
                    <div
                        onMouseDown={() => setIsDraggingCopilot(true)}
                        onDoubleClick={() => setCopilotWidth(380)}
                        className={`w-1.5 hover:w-2 ${
                            isDraggingCopilot ? "w-2 bg-[#388bfd]" : "bg-transparent hover:bg-[#388bfd]/50"
                        } transition-colors cursor-col-resize flex items-center justify-center shrink-0 select-none group z-20`}
                        title="Drag to resize Copilot"
                    >
                        <div className={`h-8 w-0.5 rounded-full ${isDraggingCopilot ? "bg-white" : "bg-[#444444] group-hover:bg-[#388bfd]"} transition-colors`} />
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* ZONE 3: RIGHT PANE (DEDICATED FORGE COPILOT)         */}
                {/* ---------------------------------------------------- */}
                {isCopilotOpen && (
                    <aside 
                        style={{ width: `${copilotWidth}px` }}
                        className={`bg-[#262626] border border-[#333333] rounded-lg flex flex-col shrink-0 h-full overflow-hidden shadow-sm select-text will-change-[width] ${
                            isDraggingCopilot ? "select-none" : ""
                        }`}
                    >
                        {/* Header Bar */}
                        <div className="h-9 bg-[#262626] border-b border-[#333333] px-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={13} className="text-[#388bfd]" />
                                <span className="text-xs font-semibold text-[#eff1f6]">Forge Copilot</span>
                                <button
                                    onClick={() => setIsCopilotOpen(false)}
                                    className="p-1 rounded text-[#8c8c8c] hover:text-white transition-colors ml-0.5"
                                    title="Close Copilot Panel"
                                >
                                    <X size={12} />
                                </button>
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
                                    className="p-1 rounded text-[#8c8c8c] hover:text-white hover:bg-white/5 transition-colors"
                                    title="New Conversation"
                                >
                                    <Plus size={13} />
                                </button>
                                <span className="text-[10px] font-mono text-[#8c8c8c]">
                                    {aiMentorState.modelUsed?.includes("Qwen") ? "Qwen 2.5 Coder" : "Ready"}
                                </span>
                            </div>
                        </div>

                        {/* Copilot Body */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 select-text scrollbar-thin">
                            
                            {/* Active Failing Test Alert if present */}
                            {aiMentorState.activeFailingTest && (
                                <div className="p-2 rounded-lg bg-[#1f1f1f] border border-[#ef4743]/30 text-xs text-[#eff1f6] flex items-center justify-between gap-2 shadow-sm">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <XCircle size={13} className="text-[#ef4743] shrink-0" />
                                        <span className="font-mono text-[11px] font-medium truncate">{aiMentorState.activeFailingTest}</span>
                                    </div>
                                    {aiMentorState.targetLine && (
                                        <button
                                            type="button"
                                            onClick={() => jumpToLine(aiMentorState.targetLine)}
                                            className="px-1.5 py-0.2 rounded bg-[#262626] text-[10px] font-mono text-[#388bfd] hover:text-white flex items-center gap-1 font-semibold shrink-0 border border-[#383838]"
                                        >
                                            <Target size={10} /> Line {aiMentorState.targetLine}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Guidance Level Selector */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-mono text-[#8c8c8c]">
                                    <span>Guidance Level</span>
                                    <span className="text-[10px]">Graduated Hinting</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 bg-[#1f1f1f] p-0.5 rounded-lg border border-[#333333] font-mono text-[11px]">
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
                                                    ? "bg-[#262626] text-[#eff1f6] font-semibold shadow-sm"
                                                    : "text-[#8c8c8c] hover:text-[#eff1f6]"
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Diagnosis & Hint Box or LeetCode Empty State */}
                            <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#333333] space-y-2.5">
                                {aiMentorState.isLoading ? (
                                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-[#8c8c8c]">
                                        <RefreshCw size={18} className="animate-spin text-[#388bfd]" />
                                        <span className="text-xs font-mono">Analyzing code architecture...</span>
                                    </div>
                                ) : aiMentorState.hint || aiMentorState.diagnosis ? (
                                    <div className="space-y-2.5">
                                        {aiMentorState.diagnosis && (
                                            <div className="space-y-1 border-b border-[#2e2e2e] pb-2">
                                                <div className="text-[10px] font-mono uppercase text-[#388bfd] font-semibold flex items-center gap-1">
                                                    <Sparkles size={11} />
                                                    <span>Diagnosis</span>
                                                </div>
                                                <FormattedAiContent content={aiMentorState.diagnosis} />
                                            </div>
                                        )}

                                        {aiMentorState.hint && (
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-mono uppercase text-[#eff1f6] font-semibold flex items-center justify-between">
                                                    <span className="flex items-center gap-1">
                                                        <Lightbulb size={11} className="text-amber-400" />
                                                        <span>Level {aiMentorState.level} Hint</span>
                                                    </span>
                                                    {aiMentorState.targetLine && (
                                                        <button
                                                            type="button"
                                                            onClick={() => jumpToLine(aiMentorState.targetLine)}
                                                            className="text-xs text-[#388bfd] hover:underline flex items-center gap-1 font-mono font-medium"
                                                        >
                                                            <Target size={10} /> Line {aiMentorState.targetLine}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="p-2.5 rounded-md bg-[#262626] border border-[#333333] text-[#cfd3dc]">
                                                    <FormattedAiContent content={aiMentorState.hint} />
                                                </div>
                                            </div>
                                        )}

                                        {aiMentorState.codePattern && (
                                            <div className="space-y-1 pt-1">
                                                <div className="flex items-center justify-between text-[10px] font-mono text-[#8c8c8c]">
                                                    <span>Suggested Code Pattern:</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(aiMentorState.codePattern);
                                                            toast.success("Copied to clipboard");
                                                        }}
                                                        className="hover:text-white flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#262626] border border-[#383838] text-[9px]"
                                                    >
                                                        <Copy size={10} /> Copy
                                                    </button>
                                                </div>
                                                <pre className="p-2.5 rounded-md bg-[#161616] border border-[#2e2e2e] text-[11px] font-mono text-[#cfd3dc] overflow-x-auto leading-relaxed">
                                                    <code>{aiMentorState.codePattern}</code>
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* LeetCode exact empty state 😎 */
                                    <div className="py-6 text-center space-y-2.5">
                                        <div className="text-3xl select-none">
                                            😎
                                        </div>
                                        <div className="space-y-1">
                                            <h5 className="text-xs font-semibold text-[#eff1f6]">
                                                Stuck? Copilot guides you through every line.
                                            </h5>
                                            <p className="text-[11px] text-[#8c8c8c] max-w-xs mx-auto leading-relaxed">
                                                Senior engineering mentor for diagnosing failures, reviewing architecture, and unblocking milestones.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAskAiMentor({ prompt: "Review my code architecture for this milestone" })}
                                            className="px-3 py-1.5 rounded-md bg-[#262626] hover:bg-[#333333] border border-[#383838] text-[#eff1f6] font-mono text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-sm"
                                        >
                                            <Sparkles size={11} className="text-[#388bfd]" />
                                            <span>Review Architecture</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Chat Conversation History if available */}
                            {aiMentorState.history && aiMentorState.history.length > 0 && (
                                <div className="space-y-2 pt-1 border-t border-[#333333]">
                                    <div className="text-[10px] font-mono text-[#8c8c8c] uppercase">Previous Inquiries</div>
                                    <div className="space-y-2">
                                        {aiMentorState.history.map((h, hIdx) => (
                                            <div key={hIdx} className="space-y-1 text-xs">
                                                <div className="p-2 rounded-md bg-[#262626] text-[#eff1f6] border border-[#383838]">
                                                    <span className="text-[#8c8c8c] text-[10px] block mb-0.5">You asked:</span>
                                                    {h.query}
                                                </div>
                                                <div className="p-2 rounded-md bg-[#1f1f1f] text-[#cfd3dc] border border-[#333333]">
                                                    <FormattedAiContent content={h.reply} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Prompts */}
                            <div className="space-y-1 pt-1">
                                <div className="text-[10px] uppercase font-mono font-medium text-[#8c8c8c]">
                                    Quick Prompts
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {aiMentorState.quickPrompts.map((q, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleAskAiMentor({ prompt: q })}
                                            className="px-2 py-0.5 rounded bg-[#1f1f1f] hover:bg-[#333333] border border-[#333333] text-[11px] text-[#cfd3dc] hover:text-white transition-colors text-left"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* LeetCode-Inspired Studio Composer */}
                        <div className="m-2.5 p-2.5 rounded-lg border border-[#3e3e3e] bg-[#1f1f1f] focus-within:border-[#388bfd] transition-colors flex flex-col gap-2 shrink-0">
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
                                placeholder="Shift + Enter to insert a line break."
                                rows={2}
                                className="w-full bg-transparent border-0 outline-none resize-none text-xs text-[#eff1f6] placeholder-[#8c8c8c] max-h-24 overflow-y-auto leading-relaxed"
                            />

                            {/* Bottom Toolbar inside Composer */}
                            <div className="flex items-center justify-between pt-1 border-t border-[#2e2e2e]">
                                {/* Left: Model Pill */}
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#262626] border border-[#383838] text-[10px] font-mono text-[#cfd3dc]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2cbb5d]" />
                                    <span>Qwen 2.5 Coder 32B</span>
                                </div>

                                {/* Right: Agent Switch + Circular Send Button */}
                                <div className="flex items-center gap-2.5">
                                    <div 
                                        onClick={() => setAiMentorState(prev => ({ ...prev, isAgentMode: !prev.isAgentMode }))}
                                        className="flex items-center gap-1.5 cursor-pointer select-none"
                                        title="Toggle Autonomous Agent Reasoning Mode"
                                    >
                                        <span className="text-[10px] text-[#8c8c8c] font-medium">Agent</span>
                                        <div 
                                            className={`w-7 h-3.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                                                aiMentorState.isAgentMode ? "bg-[#388bfd]" : "bg-[#383838]"
                                            }`}
                                        >
                                            <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${
                                                aiMentorState.isAgentMode ? "translate-x-3" : "translate-x-0"
                                            }`} />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!aiMentorInput.trim() || aiMentorState.isLoading) return;
                                            const query = aiMentorInput.trim();
                                            setAiMentorInput("");
                                            handleAskAiMentor({ prompt: query });
                                        }}
                                        disabled={aiMentorState.isLoading || !aiMentorInput.trim()}
                                        className="w-6 h-6 rounded-full bg-[#388bfd] hover:bg-blue-500 disabled:bg-[#333333] disabled:text-[#666666] text-white flex items-center justify-center transition-all shrink-0 shadow-sm active:scale-95"
                                        title="Send question to Forge Copilot"
                                    >
                                        <ArrowUp size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}

            </div>

            {/* ======================================================== */}
            {/* 3. FOOTER STATUS STRIP (LeetCode Style)                  */}
            {/* ======================================================== */}
            <footer className="h-6 border-t border-[#2e2e2e] bg-[#1a1a1a] px-3 flex items-center justify-between text-[11px] font-mono text-[#8c8c8c] shrink-0 select-none z-30">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[#cfd3dc]">
                        <GitBranch size={12} className="text-[#388bfd]" />
                        <span>main</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (terminalHeight < 100) setTerminalHeight(240);
                            setTerminalTab("tests");
                        }}
                        className={`flex items-center gap-1.5 transition-colors ${
                            testResults?.status === "passed"
                                ? "text-[#2cbb5d] font-semibold"
                                : testResults?.status === "failed"
                                ? "text-[#ef4743] font-semibold"
                                : "text-[#8c8c8c] hover:text-[#eff1f6]"
                        }`}
                    >
                        {testResults?.status === "passed" ? (
                            <CheckCircle2 size={12} className="text-[#2cbb5d]" />
                        ) : testResults?.status === "failed" ? (
                            <XCircle size={12} className="text-[#ef4743]" />
                        ) : (
                            <Terminal size={12} />
                        )}
                        <span>
                            {testResults
                                ? `${testResults.passed}/${testResults.total} Passed (${testResults.duration || "0ms"})`
                                : "Test Suite: Ready"}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
                    <span className="hidden sm:inline">UTF-8</span>
                    <span className="font-semibold text-[#8c8c8c] uppercase">
                        {workspaceData.language || project.language || "code"}
                    </span>
                    <span className="hidden md:inline text-[#595959]">
                        {isClientSideLanguage(workspaceData.language || project.language) ? "V8 Engine" : "MicroVM Sandbox"}
                    </span>
                </div>
            </footer>

            {/* ======================================================== */}
            {/* 4. MODALS: COMMAND PALETTE & CELEBRATION                 */}
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
                    setSpecTab(tab);
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
                            className="w-full max-w-md p-6 rounded-2xl bg-[#262626] border border-[#333333] text-center space-y-4 shadow-2xl relative overflow-hidden"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#2cbb5d]/20 border border-[#2cbb5d]/40 mx-auto flex items-center justify-center text-[#2cbb5d]">
                                <Award size={28} />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-[#eff1f6]">Project Complete!</h3>
                                <p className="text-xs text-[#8c8c8c] leading-relaxed">
                                    You have completed all 5 architectural milestones for <strong>{project.title}</strong>.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-lg bg-[#1f1f1f] border border-[#333333] text-xs text-[#cfd3dc] font-mono space-y-1">
                                <div>Total Session Time: <span className="text-[#388bfd] font-bold">{formattedTime}</span></div>
                                <div>Total Passed Assertions: <span className="text-[#2cbb5d] font-bold">{project.milestones?.reduce((acc, m) => acc + (m.testCount || 4), 0)} Tests</span></div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setShowCelebration(false)}
                                    className="flex-1 py-2 rounded-lg bg-[#333333] hover:bg-[#3d3d3d] text-xs font-semibold text-[#eff1f6] transition-colors"
                                >
                                    Stay in Workspace
                                </button>
                                <button
                                    onClick={() => navigate("/projects")}
                                    className="flex-1 py-2 rounded-lg bg-[#2cbb5d] hover:bg-[#259b4c] text-xs font-semibold text-black transition-colors"
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

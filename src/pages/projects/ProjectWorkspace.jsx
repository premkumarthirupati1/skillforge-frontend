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
    Flame
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
        <div className={`space-y-2.5 text-xs sm:text-sm leading-relaxed ${className}`}>
            {paragraphs.map((p, pIdx) => {
                const lines = p.split('\n');
                return (
                    <div key={pIdx} className="space-y-1.5">
                        {lines.map((line, lIdx) => {
                            const trimmed = line.trim();
                            const listMatch = trimmed.match(/^(\d+\.|\-|\*)\s+(.*)$/);
                            if (listMatch) {
                                const bullet = listMatch[1];
                                const rest = listMatch[2];
                                return (
                                    <div key={lIdx} className="flex items-start gap-2 pl-1">
                                        <span className="font-mono text-xs text-blue-400 font-bold shrink-0 mt-0.5">{bullet}</span>
                                        <span className="flex-grow text-slate-200">{renderInlineText(rest)}</span>
                                    </div>
                                );
                            }
                            return (
                                <p key={lIdx} className="leading-relaxed text-slate-200">
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
                <code key={match.index} className="px-1.5 py-0.5 mx-0.5 rounded bg-blue-500/20 text-blue-200 font-mono text-xs border border-blue-500/30 font-semibold inline-block">
                    {token.slice(1, -1)}
                </code>
            );
        } else if (token.startsWith('**') && token.endsWith('**')) {
            parts.push(
                <strong key={match.index} className="font-bold text-white">
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

    // Active Left Pane Tab ('spec' | 'roadmap' | 'files' | 'copilot' | 'prd')
    const [specTab, setSpecTab] = useState("spec");
    const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState(0);
    const [isSpecsCollapsed, setIsSpecsCollapsed] = useState(false);

    // Resizable Left Panel width (persisted in localStorage, default 460px)
    const [panelWidth, setPanelWidth] = useState(() => {
        try {
            const saved = localStorage.getItem("skillforge_sidepanel_width");
            return saved ? parseInt(saved, 10) || 460 : 460;
        } catch {
            return 460;
        }
    });
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);

    // Resizable bottom test runner drawer height
    const [terminalHeight, setTerminalHeight] = useState(260);
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
    const resizeRafIdRef = useRef(null);

    useEffect(() => {
        panelWidthRef.current = panelWidth;
    }, [panelWidth]);

    useEffect(() => {
        terminalHeightRef.current = terminalHeight;
    }, [terminalHeight]);

    // High-performance resize listener
    useEffect(() => {
        if (!isDraggingPanel && !isDraggingTerminal) return;

        document.body.style.userSelect = "none";
        document.body.style.cursor = isDraggingPanel ? "col-resize" : "row-resize";

        const handleMouseMove = (e) => {
            if (resizeRafIdRef.current) return;
            resizeRafIdRef.current = requestAnimationFrame(() => {
                resizeRafIdRef.current = null;
                if (isDraggingPanel) {
                    const newWidth = Math.max(320, Math.min(e.clientX, window.innerWidth - 400));
                    setPanelWidth(newWidth);
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
    }, [isDraggingPanel, isDraggingTerminal]);

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

        setSpecTab("copilot");
        setIsSpecsCollapsed(false);

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
        <div className="h-screen w-screen bg-[#070A11] text-white flex flex-col overflow-hidden font-sans select-none">
            
            {/* ======================================================== */}
            {/* 1. TOP GLOBAL ACTION HEADER                              */}
            {/* ======================================================== */}
            <header className="h-13 border-b border-white/10 bg-[#090D16] px-3.5 flex items-center justify-between shrink-0 z-30">
                
                {/* Left: Brand, Back & Project Title */}
                <div className="flex items-center gap-2.5 sm:gap-3 truncate">
                    <button
                        onClick={() => navigate("/projects")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Back to Projects"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                        title="SkillForge Dashboard"
                    >
                        <img 
                            src="/images/skillforge-icon.png" 
                            alt="SkillForge" 
                            className="h-6 w-auto object-contain" 
                        />
                    </button>

                    <div className="h-4 w-px bg-white/10 hidden sm:block" />

                    <div className="flex items-center gap-2 text-xs truncate">
                        <span className="font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-xs text-sm">
                            {project.title}
                        </span>
                        <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-bold uppercase">
                            {workspaceData.language || project.language || "Code"}
                        </span>
                    </div>
                </div>

                {/* Center: Stage Navigator, Run Tests & Copilot Trigger */}
                <div className="flex items-center gap-2 sm:gap-3">
                    
                    {/* Milestone Stepper */}
                    <div className="hidden sm:flex items-center gap-1 bg-[#05070B] border border-white/10 p-0.5 rounded-xl">
                        <button
                            type="button"
                            disabled={currentMilestoneIndex === 0}
                            onClick={() => handleSelectMilestone(currentMilestoneIndex - 1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                            title="Previous Milestone"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono">
                            <span className="text-slate-400 font-medium">Stage {currentMilestoneIndex + 1}/{totalMilestones}:</span>
                            <span className="font-bold text-white truncate max-w-[120px] lg:max-w-[160px]">
                                {currentMilestone?.title}
                            </span>
                            {isCurrentMilestoneVerified ? (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5" title="Stage Verified" />
                            ) : (
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse ml-0.5" title="Stage Active" />
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={currentMilestoneIndex >= totalMilestones - 1}
                            onClick={() => handleSelectMilestone(currentMilestoneIndex + 1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                            title="Next Milestone"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    {/* Primary Run Tests Button */}
                    <button
                        onClick={handleRunTests}
                        disabled={isRunningTests}
                        className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 active:scale-95 disabled:opacity-50 shrink-0"
                    >
                        <Play size={13} fill="currentColor" className={isRunningTests ? "animate-spin" : ""} />
                        <span>{isRunningTests ? "Running Tests..." : "Run Tests"}</span>
                        <kbd className="hidden lg:inline text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono text-blue-200">
                            Ctrl+↵
                        </kbd>
                    </button>

                    {/* Dedicated Forge Copilot Action Button */}
                    <button
                        onClick={() => {
                            setSpecTab("copilot");
                            setIsSpecsCollapsed(false);
                            if (!aiMentorState.diagnosis && testResults?.status === "failed") {
                                handleAskAiMentor({ prompt: "Diagnose my failing test assertions" });
                            }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm active:scale-95 shrink-0 ${
                            specTab === "copilot" && !isSpecsCollapsed
                                ? "bg-blue-600/30 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                : "bg-white/5 hover:bg-blue-600/20 text-blue-300 border-blue-500/30 hover:text-white"
                        }`}
                        title="Open Forge Copilot Senior AI Mentor"
                    >
                        <Sparkles size={14} className="text-blue-400 animate-pulse" />
                        <span className="hidden md:inline font-mono">Forge Copilot</span>
                    </button>
                </div>

                {/* Right: Timer, Quick Open & Panel Toggle */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    
                    {/* Session Timer */}
                    <div 
                        className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 transition-colors"
                        title="Session Time Elapsed (Auto-saved)"
                    >
                        <Clock size={12} className="text-blue-400 animate-pulse" />
                        <span>{formattedTime}</span>
                    </div>

                    {/* Quick Command Palette */}
                    <button
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                        title="Quick File Open (Ctrl+P)"
                    >
                        <Search size={12} className="text-blue-400" />
                        <kbd className="px-1 py-0.2 bg-black/40 rounded text-[10px] font-mono">Ctrl+P</kbd>
                    </button>

                    {/* Toggle Left Spec Panel */}
                    <button
                        onClick={() => setIsSpecsCollapsed(prev => !prev)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title={isSpecsCollapsed ? "Open Spec Panel" : "Collapse Spec Panel"}
                    >
                        {isSpecsCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                    </button>
                </div>
            </header>

            {/* ======================================================== */}
            {/* 2. MAIN 2-COLUMN SPLIT STUDIO                            */}
            {/* ======================================================== */}
            <div className="flex-grow flex overflow-hidden relative">

                {/* ---------------------------------------------------- */}
                {/* LEFT PANE: SPEC, ROADMAP, FILES & COPILOT HUB        */}
                {/* ---------------------------------------------------- */}
                {!isSpecsCollapsed && (
                    <aside 
                        style={{ width: `${panelWidth}px` }}
                        className={`border-r border-white/10 bg-[#080C14] flex flex-col shrink-0 h-full overflow-hidden relative z-10 will-change-[width] ${
                            isDraggingPanel ? "select-none" : ""
                        }`}
                    >
                        {/* Segmented Top Nav Tabs */}
                        <div className="flex items-center justify-between border-b border-white/10 bg-[#06090F] px-2 h-10 shrink-0">
                            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
                                {[
                                    { id: "spec", label: "Spec", icon: BookOpen },
                                    { id: "roadmap", label: "Roadmap", icon: Milestone, count: totalMilestones },
                                    { id: "files", label: "Files", icon: FolderTree, count: files.length },
                                    { id: "copilot", label: "Copilot", icon: Sparkles, count: testResults?.status === "failed" ? "!" : null },
                                    { id: "prd", label: "PRD", icon: Layers }
                                ].map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = specTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setSpecTab(tab.id)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                                                isActive
                                                    ? "bg-blue-600/20 text-white border border-blue-500/40 shadow-sm"
                                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                            }`}
                                        >
                                            <Icon size={12} className={isActive ? "text-blue-400" : ""} />
                                            <span>{tab.label}</span>
                                            {tab.count !== undefined && tab.count !== null && (
                                                <span className={`text-[9px] px-1 rounded-full font-mono font-bold ${
                                                    tab.count === "!" 
                                                        ? "bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse" 
                                                        : "bg-white/10 text-slate-300"
                                                }`}>
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setIsSpecsCollapsed(true)}
                                className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                                title="Collapse Side Panel"
                            >
                                <PanelLeftClose size={14} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 font-sans text-xs scrollbar-thin select-text">
                            
                            {/* TAB 1: MILESTONE SPEC */}
                            {specTab === "spec" && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    {/* Milestone Header Card */}
                                    <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-white/10 space-y-2 relative overflow-hidden shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                Stage {currentMilestoneIndex + 1} of {totalMilestones}
                                            </span>
                                            {isCurrentMilestoneVerified ? (
                                                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 size={13} /> Verified
                                                </span>
                                            ) : (
                                                <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> Active In-Progress
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-base font-bold text-white tracking-tight">
                                            {milestoneGuide.title}
                                        </h2>
                                        <p className="text-slate-300 leading-relaxed text-xs">
                                            {milestoneGuide.objective}
                                        </p>
                                    </div>

                                    {/* Specification Rules */}
                                    {milestoneGuide.specRules && milestoneGuide.specRules.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                                                <ShieldCheck size={14} className="text-blue-400" />
                                                <span>Production Specification Rules</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {milestoneGuide.specRules.map((rule, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-colors flex items-start gap-2.5"
                                                    >
                                                        <span className="font-mono text-xs text-blue-400 font-bold shrink-0 mt-0.5">
                                                            {idx + 1}.
                                                        </span>
                                                        <span className="text-slate-200 leading-relaxed">
                                                            {renderInlineText(rule)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Verification Test Suite Checklist */}
                                    {milestoneGuide.testCases && milestoneGuide.testCases.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                                                <Target size={14} className="text-cyan-400" />
                                                <span>Verification Checklist ({milestoneGuide.testCases.length} Targets)</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {milestoneGuide.testCases.map((tc, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2"
                                                    >
                                                        <div className="flex items-center gap-2 truncate">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                                                            <span className="font-mono text-slate-200 truncate">{tc.name}</span>
                                                        </div>
                                                        {tc.expected && (
                                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5 shrink-0">
                                                                {tc.expected}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Banner */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={handleRunTests}
                                            disabled={isRunningTests}
                                            className="w-full py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <Play size={13} fill="currentColor" />
                                            <span>Run Automated Tests For This Stage</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: MILESTONE ROADMAP */}
                            {specTab === "roadmap" && (
                                <div className="space-y-3 animate-in fade-in duration-200">
                                    <div className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center justify-between">
                                        <span>Milestone Progression</span>
                                        <span className="text-blue-400 font-mono font-bold">
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
                                                    className={`p-3.5 rounded-xl border transition-all text-left flex items-start gap-3 ${
                                                        !isUnlocked
                                                            ? "opacity-50 bg-black/20 border-white/5 cursor-not-allowed"
                                                            : isActive
                                                            ? "bg-blue-600/15 border-blue-500/40 shadow-sm cursor-pointer"
                                                            : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04] cursor-pointer"
                                                    }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                                        isVerified
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                                            : isActive
                                                            ? "bg-blue-500/30 text-white border border-blue-400"
                                                            : "bg-white/5 text-slate-400 border border-white/10"
                                                    }`}>
                                                        {isVerified ? <Check size={12} /> : idx + 1}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                            <span className="font-semibold text-white truncate text-xs">
                                                                {m.title}
                                                            </span>
                                                            {!isUnlocked && (
                                                                <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5 shrink-0">
                                                                    <Lock size={10} /> Locked
                                                                </span>
                                                            )}
                                                            {isVerified && (
                                                                <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                                                                    Passed
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 line-clamp-1">
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
                                        <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                                            Workspace Files
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const name = prompt("Enter new file name (e.g., helper.rs, utils.py):");
                                                if (name) handleCreateFile(name);
                                            }}
                                            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
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

                            {/* TAB 4: FORGE COPILOT */}
                            {specTab === "copilot" && (
                                <div className="space-y-3.5 animate-in fade-in duration-200">
                                    {/* Mentor Header Card (Matte Developer Styling) */}
                                    <div className="p-3 rounded-xl bg-[#141416] border border-neutral-800 space-y-1.5 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-blue-400">
                                                    <Sparkles size={14} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-white">Forge Copilot</span>
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                                                        AI Mentor
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="text-[10px] font-mono text-neutral-400">
                                                {aiMentorState.modelUsed?.includes("Qwen") ? "Qwen 2.5 Coder" : "Ready"}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                                            Senior engineering mentor for diagnosing failing assertions, reviewing architecture, and unblocking milestones.
                                        </p>
                                    </div>

                                    {/* Active Failing Test Alert if present */}
                                    {aiMentorState.activeFailingTest && (
                                        <div className="p-2.5 rounded-xl bg-neutral-800/90 border border-neutral-700/60 text-xs text-neutral-200 flex items-center justify-between gap-2 shadow-sm">
                                            <div className="flex items-center gap-2 truncate">
                                                <XCircle size={14} className="text-rose-400 shrink-0" />
                                                <span className="font-mono font-medium truncate">{aiMentorState.activeFailingTest}</span>
                                            </div>
                                            {aiMentorState.targetLine && (
                                                <button
                                                    type="button"
                                                    onClick={() => jumpToLine(aiMentorState.targetLine)}
                                                    className="px-2 py-0.5 rounded bg-neutral-700/70 text-[11px] font-mono text-blue-300 hover:text-white flex items-center gap-1 font-semibold shrink-0"
                                                >
                                                    <Target size={11} /> Line {aiMentorState.targetLine}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Guidance Level Selector */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                                            <span className="font-medium text-neutral-300">Guidance Level</span>
                                            <span className="text-neutral-500 text-[11px]">Graduated Hinting</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 bg-[#141416] p-1 rounded-xl border border-neutral-800 font-mono text-xs">
                                            {[
                                                { lvl: 1, label: "1. Nudge", title: "Conceptual guidance" },
                                                { lvl: 2, label: "2. Pinpoint", title: "Pinpoints exact flaw" },
                                                { lvl: 3, label: "3. Structure", title: "Idiomatic code pattern" }
                                            ].map(tab => (
                                                <button
                                                    key={tab.lvl}
                                                    type="button"
                                                    onClick={() => handleAskAiMentor({ requestedLevel: tab.lvl })}
                                                    className={`py-1.5 px-1 rounded-lg text-center transition-all text-xs ${
                                                        aiMentorState.level === tab.lvl
                                                            ? "bg-neutral-800 text-white border border-neutral-700/60 shadow-sm font-semibold"
                                                            : "text-neutral-400 hover:text-white"
                                                    }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Diagnosis & Hint Box */}
                                    <div className="p-3.5 rounded-2xl bg-[#18181b] border border-neutral-800 space-y-3">
                                        {aiMentorState.isLoading ? (
                                            <div className="py-6 flex flex-col items-center justify-center gap-2 text-neutral-400">
                                                <RefreshCw size={20} className="animate-spin text-blue-400" />
                                                <span className="text-xs font-mono">Forge Copilot is analyzing your code...</span>
                                            </div>
                                        ) : aiMentorState.hint || aiMentorState.diagnosis ? (
                                            <div className="space-y-3">
                                                {aiMentorState.diagnosis && (
                                                    <div className="space-y-1.5 border-b border-neutral-800 pb-2.5">
                                                        <div className="text-[11px] font-mono uppercase text-blue-400 font-semibold flex items-center gap-1">
                                                            <Sparkles size={12} />
                                                            <span>Diagnosis</span>
                                                        </div>
                                                        <FormattedAiContent content={aiMentorState.diagnosis} />
                                                    </div>
                                                )}

                                                {aiMentorState.hint && (
                                                    <div className="space-y-1.5">
                                                        <div className="text-[11px] font-mono uppercase text-neutral-300 font-semibold flex items-center justify-between">
                                                            <span className="flex items-center gap-1">
                                                                <Lightbulb size={12} className="text-amber-400" />
                                                                <span>Level {aiMentorState.level} Hint</span>
                                                            </span>
                                                            {aiMentorState.targetLine && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => jumpToLine(aiMentorState.targetLine)}
                                                                    className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono font-medium"
                                                                >
                                                                    <Target size={11} /> Line {aiMentorState.targetLine}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-[#202024] border border-neutral-800 text-neutral-200">
                                                            <FormattedAiContent content={aiMentorState.hint} />
                                                        </div>
                                                    </div>
                                                )}

                                                {aiMentorState.codePattern && (
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                                                            <span>Suggested Code Pattern:</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(aiMentorState.codePattern);
                                                                    toast.success("Copied to clipboard");
                                                                }}
                                                                className="hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700/60 text-[10px]"
                                                            >
                                                                <Copy size={11} /> Copy
                                                            </button>
                                                        </div>
                                                        <pre className="p-3 rounded-xl bg-[#141416] border border-neutral-800 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed">
                                                            <code>{aiMentorState.codePattern}</code>
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* LeetCode-inspired empty state */
                                            <div className="py-6 text-center space-y-3">
                                                <div className="text-3xl select-none">
                                                    😎
                                                </div>
                                                <div className="space-y-1">
                                                    <h5 className="text-xs font-semibold text-neutral-200">
                                                        Stuck? Forge Copilot guides you through every line.
                                                    </h5>
                                                    <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                                                        Run tests or ask a question to diagnose assertions without spoiling your solution.
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAskAiMentor({ prompt: "Review my code architecture for this milestone" })}
                                                    className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-neutral-200 font-mono text-xs font-medium transition-all inline-flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <Sparkles size={12} className="text-blue-400" />
                                                    <span>Review Code Architecture</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Prompts */}
                                    <div className="space-y-1.5">
                                        <div className="text-[11px] uppercase font-mono font-medium tracking-wider text-neutral-400">
                                            Quick Prompts
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {aiMentorState.quickPrompts.map((q, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleAskAiMentor({ prompt: q })}
                                                    className="px-2.5 py-1 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 text-xs text-neutral-300 hover:text-white transition-all text-left"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Interactive Chat Composer (LeetCode-inspired Clean Studio Style) */}
                                    <div className="rounded-2xl border border-neutral-700/60 bg-[#1e1e22] focus-within:border-neutral-500 p-3 transition-colors shadow-sm">
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
                                            rows={1}
                                            className="w-full bg-transparent border-0 outline-none resize-none text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 max-h-24 overflow-y-auto leading-relaxed"
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
                                                    onClick={() => setAiMentorState(prev => ({ ...prev, isAgentMode: !prev.isAgentMode }))}
                                                    className="flex items-center gap-1.5 cursor-pointer select-none"
                                                    title="Toggle Autonomous Agent Reasoning Mode"
                                                >
                                                    <span className="text-[11px] text-neutral-400 font-medium">Agent</span>
                                                    <div 
                                                        className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                                                            aiMentorState.isAgentMode ? "bg-blue-600" : "bg-neutral-700"
                                                        }`}
                                                    >
                                                        <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                                                            aiMentorState.isAgentMode ? "translate-x-3.5" : "translate-x-0"
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
                                                    className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-sm active:scale-95"
                                                    title="Send question to Forge Copilot"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 5: ARCHITECTURE PRD */}
                            {specTab === "prd" && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-white/10 space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                                            <Layers size={14} className="text-blue-400" />
                                            <span>Architecture & System Spec</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-white">{project.title}</h3>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            {project.description}
                                        </p>
                                    </div>

                                    {project.prerequisites && project.prerequisites.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                                                Prerequisites & Knowledge Targets
                                            </span>
                                            <div className="space-y-1.5">
                                                {project.prerequisites.map((p, i) => (
                                                    <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-xs text-slate-300">
                                                        <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
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

                {/* ---------------------------------------------------- */}
                {/* 3. RESIZABLE VERTICAL SPLIT DIVIDER                  */}
                {/* ---------------------------------------------------- */}
                {!isSpecsCollapsed && (
                    <div
                        onMouseDown={() => setIsDraggingPanel(true)}
                        onDoubleClick={() => setPanelWidth(460)}
                        className={`w-1.5 hover:w-2 ${
                            isDraggingPanel ? "w-2 bg-blue-500 shadow-[0_0_10px_#2563eb]" : "bg-[#05070B] hover:bg-blue-500/40 active:bg-blue-500"
                        } transition-colors cursor-col-resize flex items-center justify-center shrink-0 select-none group z-20`}
                        title="Drag to resize pane (Double-click to reset)"
                    >
                        <div className={`h-8 w-0.5 rounded-full ${isDraggingPanel ? "bg-white" : "bg-white/20 group-hover:bg-blue-400"} transition-colors`} />
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* 4. RIGHT PANE: CODE EDITOR (TOP) & TEST DRAWER (BTM) */}
                {/* ---------------------------------------------------- */}
                <main className="flex-grow flex flex-col h-full overflow-hidden bg-[#070A11] relative min-w-0">
                    
                    {/* Monaco Code Studio Editor Canvas */}
                    <div className={`flex-grow flex flex-col overflow-hidden min-h-0 ${isDraggingPanel || isDraggingTerminal ? "pointer-events-none select-none" : ""}`}>
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

                    {/* Resizable Horizontal Test Drawer Divider */}
                    <div
                        onMouseDown={() => setIsDraggingTerminal(true)}
                        className={`h-1.5 hover:h-2 ${
                            isDraggingTerminal ? "h-2 bg-blue-500 shadow-[0_0_10px_#2563eb]" : "bg-[#0A0E17] hover:bg-blue-500/40 active:bg-blue-500"
                        } transition-colors cursor-row-resize flex items-center justify-center border-t border-white/10 shrink-0 select-none group z-20`}
                        title="Drag to resize test runner console"
                    >
                        <div className={`w-12 h-0.5 rounded-full ${isDraggingTerminal ? "bg-white" : "bg-white/20 group-hover:bg-blue-400"} transition-colors`} />
                    </div>

                    {/* Integrated Test Runner & Console Drawer */}
                    <div 
                        className="bg-[#05070B] flex flex-col shrink-0 overflow-hidden will-change-[height]"
                        style={{ height: `${terminalHeight}px` }}
                    >
                        {/* Drawer Header Tabs */}
                        <div className="h-9 border-b border-white/10 bg-[#080C14] px-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setTerminalTab("tests")}
                                    className={`px-3 py-1 text-xs font-bold font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                                        terminalTab === "tests"
                                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <CheckCircle2 size={13} />
                                    <span>Automated Tests</span>
                                    {testResults && (
                                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                                            testResults.status === "passed" 
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                        }`}>
                                            {testResults.passed}/{testResults.total} Passed
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setTerminalTab("console")}
                                    className={`px-3 py-1 text-xs font-bold font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                                        terminalTab === "console"
                                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <Terminal size={13} />
                                    <span>Terminal Logs</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setTerminalHeight(prev => prev > 100 ? 50 : 280)}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                    title={terminalHeight > 100 ? "Minimize Drawer" : "Expand Drawer"}
                                >
                                    {terminalHeight > 100 ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                                </button>
                            </div>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-grow p-3.5 overflow-y-auto font-mono text-xs space-y-2 select-text scrollbar-thin">
                            
                            {/* TESTS TAB */}
                            {terminalTab === "tests" && (
                                <div className="space-y-3">
                                    {!testResults ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-500 space-y-2">
                                            <Play size={22} className="text-blue-500/40" />
                                            <div>Click <strong>Run Tests</strong> or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">Ctrl+Enter</kbd> to execute this milestone's test harness.</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {/* Results Status Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-white/5 text-[11px] text-slate-400 gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold font-mono text-xs ${testResults.status === "passed" ? "text-emerald-400" : "text-rose-400"}`}>
                                                        {testResults.status === "passed" ? "✓ VERIFICATION PASSED" : "✗ VERIFICATION FAILED"}
                                                    </span>
                                                    <span>• {testResults.passed}/{testResults.total} assertions met</span>
                                                    <span>• {testResults.duration || "12ms"}</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500">
                                                    Runner: {testResults.engineLabel || "Sandbox MicroVM"}
                                                </span>
                                            </div>

                                            {/* All Passed Celebration Banner */}
                                            {testResults.status === "passed" && (
                                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-2 text-emerald-300">
                                                    <div className="flex items-center gap-2 font-bold text-xs">
                                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                                        <span>Stage {currentMilestoneIndex + 1} Complete! All test assertions verified successfully.</span>
                                                    </div>
                                                    {currentMilestoneIndex < totalMilestones - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectMilestone(currentMilestoneIndex + 1)}
                                                            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md active:scale-95"
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
                                                        className={`flex items-start sm:items-center justify-between p-3 rounded-xl border transition-all gap-2.5 ${
                                                            step.passed 
                                                                ? "bg-emerald-500/[0.04] border-emerald-500/20 text-slate-200" 
                                                                : "bg-rose-500/[0.06] border-rose-500/30 text-rose-200"
                                                        }`}
                                                    >
                                                        <div className="flex items-start sm:items-center gap-2.5 flex-grow min-w-0">
                                                            <div className="shrink-0 mt-0.5 sm:mt-0">
                                                                {step.passed ? (
                                                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                                                ) : (
                                                                    <XCircle size={16} className="text-rose-400" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-grow space-y-0.5">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-bold text-sm text-slate-100">{step.name}</span>
                                                                    {lineNum && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => jumpToLine(lineNum)}
                                                                            className="px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1 transition-colors font-semibold"
                                                                            title={`Jump to line ${lineNum} in editor`}
                                                                        >
                                                                            <Target size={11} />
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
                                                                            className="px-2.5 py-0.5 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95 font-semibold"
                                                                            title="Get AI diagnosis & graduated hints for this test"
                                                                        >
                                                                            <Sparkles size={12} className="text-blue-300 animate-pulse" />
                                                                            <span>Explain & Get Hint</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {step.output && (
                                                                    <div className={`text-xs sm:text-sm font-mono truncate max-w-2xl leading-relaxed ${step.passed ? "text-slate-400" : "text-rose-300 font-semibold"}`}>
                                                                        {step.output}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-xs font-mono shrink-0 font-medium ${step.passed ? "text-emerald-400" : "text-rose-400"}`}>
                                                            {step.duration}
                                                        </span>
                                                    </div>
                                                );
                                            })}

                                            {/* Results Footer Message if Failed */}
                                            {testResults.status === "failed" && (
                                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between flex-wrap gap-2.5">
                                                    <div className="flex items-center gap-2 font-bold text-xs text-rose-200">
                                                        <XCircle size={16} className="text-rose-400 shrink-0" />
                                                        <span>Tests Failed ({testResults.passed}/{testResults.total} passed). Fix errors to verify this milestone.</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAskAiMentor({
                                                            testCase: testResults.steps?.find(s => !s.passed)?.name || "Milestone Tests",
                                                            error: testResults.steps?.find(s => !s.passed)?.output || "Tests failed",
                                                            requestedLevel: 1
                                                        })}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                                    >
                                                        <Bot size={14} className="text-blue-300 animate-pulse" />
                                                        <span>Forge Copilot: Diagnose All Failures</span>
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
                                                        ? "text-cyan-400 font-bold" 
                                                        : log.includes("[stderr]") || log.includes("[fatal]") || log.includes("error") 
                                                        ? "text-rose-400" 
                                                        : log.includes("✓") || log.includes("Passed") 
                                                        ? "text-emerald-400" 
                                                        : "text-slate-300"
                                                }`}
                                            >
                                                {log}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Terminal Command Input */}
                                    <form onSubmit={handleTerminalCommand} className="flex items-center gap-2 pt-2 border-t border-white/10 shrink-0">
                                        <span className="text-blue-400 font-mono font-bold">$</span>
                                        <input
                                            type="text"
                                            value={terminalInput}
                                            onChange={(e) => setTerminalInput(e.target.value)}
                                            placeholder="Type a command (test, clear, ls, help)..."
                                            className="flex-grow bg-transparent border-0 outline-none text-xs font-mono text-white placeholder-slate-600"
                                        />
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>

                </main>
            </div>

            {/* ======================================================== */}
            {/* 5. FOOTER STATUS STRIP                                   */}
            {/* ======================================================== */}
            <footer className="h-6 border-t border-white/10 bg-[#080C14] px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 select-none z-30">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-300">
                        <GitBranch size={12} className="text-blue-400" />
                        <span>main</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (terminalHeight < 100) setTerminalHeight(260);
                            setTerminalTab("tests");
                        }}
                        className={`flex items-center gap-1.5 transition-colors ${
                            testResults?.status === "passed"
                                ? "text-emerald-400 font-bold"
                                : testResults?.status === "failed"
                                ? "text-rose-400 font-bold"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        {testResults?.status === "passed" ? (
                            <CheckCircle2 size={12} className="text-emerald-400" />
                        ) : testResults?.status === "failed" ? (
                            <XCircle size={12} className="text-rose-400" />
                        ) : (
                            <Terminal size={12} className="text-blue-400" />
                        )}
                        <span>
                            {testResults
                                ? `${testResults.passed}/${testResults.total} Tests Passed (${testResults.duration || "0ms"})`
                                : "Test Suite: Ready"}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
                    <span className="hidden sm:inline">UTF-8</span>
                    <span className="font-bold text-blue-400 uppercase">
                        {workspaceData.language || project.language || "code"}
                    </span>
                    <span className="hidden md:inline text-slate-500">
                        {isClientSideLanguage(workspaceData.language || project.language) ? "V8 Engine" : "MicroVM Sandbox"}
                    </span>
                </div>
            </footer>

            {/* ======================================================== */}
            {/* 6. MODALS: COMMAND PALETTE & CELEBRATION                 */}
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
                            className="w-full max-w-md p-6 rounded-3xl bg-[#090D16] border border-blue-500/30 text-center space-y-4 shadow-2xl relative overflow-hidden"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <Award size={32} />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white">Project Complete!</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    You have completed all 5 architectural milestones for <strong>{project.title}</strong>.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono space-y-1">
                                <div>Total Session Time: <span className="text-blue-400 font-bold">{formattedTime}</span></div>
                                <div>Total Passed Assertions: <span className="text-emerald-400 font-bold">{project.milestones?.reduce((acc, m) => acc + (m.testCount || 4), 0)} Tests</span></div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setShowCelebration(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
                                >
                                    Stay in Workspace
                                </button>
                                <button
                                    onClick={() => navigate("/projects")}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-xs font-bold text-white transition-all shadow-lg hover:from-blue-500 hover:to-blue-400"
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

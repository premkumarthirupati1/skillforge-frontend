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
    GripHorizontal,
    GripVertical,
    Code2,
    Milestone,
    Target,
    Folder,
    FolderTree,
    Search,
    Command,
    Bot,
    Send,
    BrainCircuit,
    Lightbulb,
    Zap,
    RefreshCw
} from "lucide-react";
import { PROJECTS } from "../../data/projectsData";
import { getProjectWorkspaceData } from "../../data/projectWorkspacesData";
import { executeProjectTests, isClientSideLanguage } from "../../services/codeRunnerService";
import { fetchAiMentorAdvice } from "../../services/aiMentorService";
import CodeStudioEditor from "../../components/workspace/CodeStudioEditor";
import CommandPalette from "../../components/workspace/CommandPalette";
import FileExplorerTree from "../../components/workspace/FileExplorerTree";
import toast from "react-hot-toast";

export default function ProjectWorkspace() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    // Find project metadata
    const project = useMemo(() => {
        return PROJECTS.find(p => p.id === projectId) || PROJECTS[0];
    }, [projectId]);

    // Load workspace starter files and milestone guides
    const workspaceData = useMemo(() => {
        return getProjectWorkspaceData(project.id, project);
    }, [project]);

    // State: Current active milestone (0-indexed, restored from saved progress)
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

    // State: Verified Milestones set (Milestones unlocked and passed by test suite)
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

    // Strict Progression Rule: Stage 1 is unlocked. Stage N requires Stage N-1 to be verified!
    const isMilestoneUnlocked = (idx) => {
        if (idx === 0) return true;
        return verifiedMilestones.has(idx - 1);
    };

    // Safe milestone switcher that strictly prevents jumping ahead
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

    // State: File editor contents (persisted per project)
    const [files, setFiles] = useState(() => {
        const saved = localStorage.getItem(`skillforge_files_${project.id}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Stale cache migration: check if files have mismatched language syntax
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

    // State: Active Sidebar Navigation ('explorer' | 'roadmap' | 'spec' | 'prereq' | 'prd' | 'hints')
    const [specTab, setSpecTab] = useState("spec");
    const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState(0);
    const [isSpecsCollapsed, setIsSpecsCollapsed] = useState(false);

    // State: Resizable Side Panel width (persisted in localStorage)
    const [panelWidth, setPanelWidth] = useState(() => {
        try {
            const saved = localStorage.getItem("skillforge_sidepanel_width");
            return saved ? parseInt(saved, 10) || 380 : 380;
        } catch {
            return 380;
        }
    });
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);

    // Note: Prerequisites & Objectives are verified automatically by compiler test assertions, not manual user clicks

    // State: Resizable terminal drawer height
    const [terminalHeight, setTerminalHeight] = useState(240);
    const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);

    // State: Terminal tab ('tests' | 'console')
    const [terminalTab, setTerminalTab] = useState("tests");

    // State: Test Runner execution state
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [testResults, setTestResults] = useState(null);

    // State: Monaco Editor Reference & Cursor Coordinates
    const editorInstanceRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

    // State: Command Palette Modal
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    // State: Terminal console output
    const [consoleLogs, setConsoleLogs] = useState([
        `⚡ skillforge-microvm v2.4 initialized for [${project.title}]`,
        `container: sha256:8b47e2 mounted at /workspace`,
        `branch: main (tracking origin/main)`,
        `Ready. Edit code in the center pane and click 'Run Tests'.`
    ]);
    const [terminalInput, setTerminalInput] = useState("");

    // State: Session timer (persisted per project in localStorage)
    const [secondsElapsed, setSecondsElapsed] = useState(() => {
        try {
            const saved = localStorage.getItem(`skillforge_timer_${project.id}`);
            return saved ? parseInt(saved, 10) || 0 : 0;
        } catch {
            return 0;
        }
    });
    const [showCelebration, setShowCelebration] = useState(false);

    // State: AI Mentor (Forge Copilot)
    const [aiMentorState, setAiMentorState] = useState({
        isLoading: false,
        diagnosis: null,
        hint: null,
        level: 1, // 1: Nudge, 2: Pinpoint, 3: Fix Structure
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
        history: []
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

    // Session timer ticker (persists elapsed seconds to localStorage on every tick)
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsElapsed(prev => {
                const next = prev + 1;
                try {
                    localStorage.setItem(`skillforge_timer_${project.id}`, next.toString());
                } catch (e) { /* ignore */ }
                return next;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [project.id]);

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

    // Performance refs for butter-smooth, 60fps drag-to-resize without layout thrashing
    const panelWidthRef = useRef(panelWidth);
    const terminalHeightRef = useRef(terminalHeight);
    const resizeRafIdRef = useRef(null);

    useEffect(() => {
        panelWidthRef.current = panelWidth;
    }, [panelWidth]);

    useEffect(() => {
        terminalHeightRef.current = terminalHeight;
    }, [terminalHeight]);

    // High-performance unified resize listener (RAF-throttled, zero listener churn, auto-layout trigger)
    useEffect(() => {
        if (!isDraggingPanel && !isDraggingTerminal) return;

        // Prevent browser selection / ghost drag during resize
        document.body.style.userSelect = "none";
        document.body.style.cursor = isDraggingPanel ? "col-resize" : "row-resize";

        const handleMouseMove = (e) => {
            if (resizeRafIdRef.current) return;
            resizeRafIdRef.current = requestAnimationFrame(() => {
                resizeRafIdRef.current = null;
                if (isDraggingPanel) {
                    // Left activity bar is 48px wide
                    const newWidth = Math.max(200, Math.min(e.clientX - 48, 800));
                    setPanelWidth(newWidth);
                } else if (isDraggingTerminal) {
                    const newHeight = Math.max(50, Math.min(window.innerHeight - e.clientY, window.innerHeight - 120));
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

            // Instantly inform Monaco to snap to new container dimensions
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

    // Regex Helper to extract line number from compiler diagnostic output
    const extractLineNumber = (output = "") => {
        const match = output.match(/line (\d+)/i) || output.match(/:(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    };

    // Trigger Forge Copilot / AI Coding Mentor
    const handleAskAiMentor = async ({ 
        testCase = null, 
        error = null, 
        line = null, 
        prompt = null, 
        requestedLevel = null 
    } = {}) => {
        // Open the AI Mentor panel in the sidebar
        setSpecTab("copilot");
        setIsSpecsCollapsed(false);

        const targetLevel = requestedLevel !== null ? requestedLevel : (aiMentorState.level || 1);
        const failingName = testCase || aiMentorState.activeFailingTest || (testResults?.steps?.find(s => !s.passed)?.name) || "Active Milestone Tests";
        const failingErr = error || (testResults?.steps?.find(s => !s.passed)?.output) || testResults?.error || "";

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
                activeFileName,
                userCode: activeCode,
                testResults: testResults || (failingErr ? { steps: [{ name: failingName, passed: false, output: failingErr }] } : null),
                userQuery: prompt || (failingName ? `Why is test '${failingName}' failing: ${failingErr}` : ""),
                hintLevel: targetLevel
            });

            setAiMentorState(prev => ({
                ...prev,
                isLoading: false,
                diagnosis: advice.diagnosis,
                hint: advice.hint,
                level: advice.level || targetLevel,
                targetLine: line || advice.targetLine,
                codePattern: advice.codePattern || "",
                quickPrompts: advice.quickPrompts || prev.quickPrompts,
                modelUsed: advice.modelUsed,
                history: prompt ? [...prev.history, { query: prompt, reply: advice.hint }] : prev.history
            }));

            if ((line || advice.targetLine) && (line > 0 || advice.targetLine > 0)) {
                const targetL = line || advice.targetLine;
                jumpToLine(targetL);
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

    // Handle Run Tests Action
    const handleRunTests = async () => {
        if (isRunningTests) return;
        setIsRunningTests(true);

        const language = (workspaceData.language || project.language || "rust").toLowerCase();
        const isClient = isClientSideLanguage(language);

        // Terminal announcement
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

            // Stream compiler output & stdout/stderr to terminal logs
            if (result.stdout) {
                setConsoleLogs(prev => [...prev, result.stdout]);
            }
            if (result.stderr) {
                setConsoleLogs(prev => [...prev, `[stderr] ${result.stderr}`]);
            }

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

                // Mark current milestone verified!
                setVerifiedMilestones(prev => {
                    const next = new Set(prev);
                    next.add(currentMilestoneIndex);
                    try {
                        localStorage.setItem(`skillforge_verified_${project.id}`, JSON.stringify([...next]));
                    } catch (e) {}
                    return next;
                });

                // Persist progress to local user builds
                try {
                    const savedBuilds = JSON.parse(localStorage.getItem("skillforge_user_builds") || "[]");
                    const existingIdx = savedBuilds.findIndex(b => b.projectId === project.id);
                    const newEntry = {
                        projectId: project.id,
                        title: project.title,
                        currentMilestone: Math.min((project.milestones?.length || 5), currentMilestoneIndex + 2),
                        lastActive: new Date().toISOString(),
                        status: currentMilestoneIndex + 1 === (project.milestones?.length || 5) ? "completed" : "in_progress"
                    };
                    if (existingIdx !== -1) {
                        savedBuilds[existingIdx] = newEntry;
                    } else {
                        savedBuilds.push(newEntry);
                    }
                    localStorage.setItem("skillforge_user_builds", JSON.stringify(savedBuilds));
                } catch (e) {
                    console.error("Failed to update user builds", e);
                }

                toast.success(`Milestone ${currentMilestoneIndex + 1} passed all test assertions!`);

                // Check if final milestone was passed
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

                // Pre-seed AI Mentor with the first failing step
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

                toast.error("Tests failed. Review output in the bottom test drawer.");
            }

            // Ensure test drawer is visible
            if (terminalHeight < 120) {
                setTerminalHeight(240);
            }
            setTerminalTab("tests");

        } catch (err) {
            toast.error(`Execution error: ${err.message}`);
            setConsoleLogs(prev => [...prev, `[fatal] Execution aborted: ${err.message}`]);
        } finally {
            setIsRunningTests(false);
        }
    };

    // Global Keyboard Shortcuts (Ctrl+P, Ctrl+Enter)
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

    // Handle terminal input command
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

    // Activity Bar Navigation Items
    const activityNavItems = [
        { id: "explorer", label: "Files", icon: FolderTree, count: files.length },
        { id: "roadmap", label: "Roadmap", icon: Milestone, count: project.milestones?.length || 5 },
        { id: "spec", label: "Spec Guide", icon: BookOpen },
        { id: "copilot", label: "Forge AI", icon: Bot, count: testResults?.status === "failed" ? "!" : null },
        { id: "prereq", label: "Prereqs", icon: CheckCircle2, count: (project.prerequisites?.length || 0) },
        { id: "prd", label: "Full PRD", icon: Layers }
    ];

    const handleActivityNavClick = (tabId) => {
        if (!isSpecsCollapsed && specTab === tabId) {
            setIsSpecsCollapsed(true);
        } else {
            setIsSpecsCollapsed(false);
            setSpecTab(tabId);
        }
    };

    return (
        <div className="h-screen w-screen bg-[#070A11] text-white flex flex-col overflow-hidden font-sans">
            
            {/* ======================================================== */}
            {/* TOP NAVIGATION HEADER BAR                                */}
            {/* ======================================================== */}
            <header className="h-12 border-b border-white/10 bg-[#090D16] px-3 flex items-center justify-between shrink-0 select-none z-30">
                
                {/* Left: Project Brand & Path Breadcrumb */}
                <div className="flex items-center gap-2 sm:gap-3 truncate">
                    <button
                        onClick={() => navigate("/projects")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Back to Project Catalog"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div className="h-4 w-px bg-white/10 hidden sm:block" />

                    <div className="flex items-center gap-1.5 text-xs truncate">
                        <span className="text-slate-400 font-mono hidden md:inline">projects</span>
                        <ChevronRight size={12} className="text-slate-600 hidden md:inline" />
                        <span className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">{project.title}</span>
                    </div>

                    {/* Active Milestone Progress Indicator */}
                    <div className="hidden lg:flex items-center gap-2 pl-2">
                        <div className="flex items-center gap-1 bg-[#05070B] border border-blue-500/20 px-2.5 py-1 rounded-full text-[11px] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-slate-300 font-bold">Stage {currentMilestoneIndex + 1}:</span>
                            <span className="text-cyan-300 truncate max-w-[140px]">{currentMilestone?.title}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Command Search, Timer & Run Action */}
                <div className="flex items-center gap-2 sm:gap-3">
                    
                    {/* Command Palette Trigger */}
                    <button
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                        title="Open Command Palette (Ctrl+P)"
                    >
                        <Search size={12} className="text-cyan-400" />
                        <span className="font-mono text-[11px]">Quick Open</span>
                        <kbd className="px-1 py-0.2 bg-black/40 rounded text-[10px] font-mono">Ctrl+P</kbd>
                    </button>

                    {/* Session Timer (Auto-persisted) */}
                    <div 
                        className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 transition-colors cursor-help"
                        title="Session Time Elapsed (Auto-saved across browser refreshes)"
                    >
                        <Clock size={12} className="text-cyan-400 animate-pulse" />
                        <span>{formattedTime}</span>
                    </div>

                    {/* Run Tests Button */}
                    <button
                        onClick={handleRunTests}
                        disabled={isRunningTests}
                        className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        <Play size={13} fill="currentColor" className={isRunningTests ? "animate-spin" : ""} />
                        <span>{isRunningTests ? "Running..." : "Run Tests"}</span>
                        <kbd className="hidden md:inline text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono text-blue-200">
                            Ctrl+↵
                        </kbd>
                    </button>
                </div>
            </header>

            {/* ======================================================== */}
            {/* WORKSPACE MIDDLE BODY                                    */}
            {/* ======================================================== */}
            <div className="flex-grow flex overflow-hidden relative">

                {/* ---------------------------------------------------- */}
                {/* 1. ACTIVITY BAR (VS Code Far Left Strip, 48px)       */}
                {/* ---------------------------------------------------- */}
                <div className="w-12 bg-[#05070B] border-r border-white/10 shrink-0 flex flex-col justify-between py-2 items-center select-none z-20">
                    {/* Top Section: Navigation Panes */}
                    <div className="flex flex-col items-center gap-1.5 w-full">
                        {activityNavItems.map(item => {
                            const Icon = item.icon;
                            const isActive = !isSpecsCollapsed && specTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleActivityNavClick(item.id)}
                                    className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                        isActive 
                                            ? "bg-blue-600/20 text-cyan-400 shadow-md" 
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                                    title={item.label}
                                >
                                    {isActive && (
                                        <div className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                                    )}
                                    <Icon size={16} />
                                    {item.count !== undefined && item.count !== null && (
                                        <span className={`absolute -bottom-0.5 -right-0.5 text-[8px] font-mono px-1 rounded-full border ${
                                            item.count === "!" 
                                                ? "bg-purple-600 text-white border-purple-400 font-extrabold animate-pulse shadow-[0_0_8px_#c084fc]" 
                                                : "bg-blue-500/30 text-cyan-200 border-blue-500/40"
                                        }`}>
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom Section: Command Palette & Settings */}
                    <div className="flex flex-col items-center gap-1.5 w-full">
                        <button
                            type="button"
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Command Palette (Ctrl+P)"
                        >
                            <Command size={15} />
                        </button>
                    </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* 2. RESIZABLE SIDE PANEL (Explorer / Spec / Roadmap)  */}
                {/* ---------------------------------------------------- */}
                {!isSpecsCollapsed && (
                    <aside 
                        style={{ width: `${panelWidth}px` }}
                        className={`border-r border-white/10 bg-[#090D16] flex flex-col shrink-0 h-full overflow-hidden relative z-10 will-change-[width] ${
                            isDraggingPanel ? "select-none" : ""
                        }`}
                    >
                        {/* Header Tabs */}
                        <div className="flex items-center justify-between border-b border-white/10 bg-[#070A11] px-3 h-10 shrink-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                                {specTab === "explorer" && <FolderTree size={13} className="text-cyan-400" />}
                                {specTab === "roadmap" && <Milestone size={13} className="text-cyan-400" />}
                                {specTab === "spec" && <BookOpen size={13} className="text-cyan-400" />}
                                {(specTab === "copilot" || specTab === "hints") && <Bot size={13} className="text-purple-400" />}
                                {specTab === "prereq" && <CheckCircle2 size={13} className="text-cyan-400" />}
                                {specTab === "prd" && <Layers size={13} className="text-cyan-400" />}
                                <span>
                                    {specTab === "explorer" && "Project Files"}
                                    {specTab === "roadmap" && "Milestone Roadmap"}
                                    {specTab === "spec" && "Milestone Spec"}
                                    {(specTab === "copilot" || specTab === "hints") && "Forge AI Copilot"}
                                    {specTab === "prereq" && "Prerequisites"}
                                    {specTab === "prd" && "Architecture PRD"}
                                </span>
                            </span>

                            <button
                                onClick={() => setIsSpecsCollapsed(true)}
                                className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5 transition-colors text-[10px]"
                                title="Collapse Side Panel"
                            >
                                <ChevronLeft size={14} />
                            </button>
                        </div>

                        {/* Side Panel Content Body */}
                        <div className="flex-grow overflow-y-auto">
                            
                            {/* TAB: FILE EXPLORER */}
                            {specTab === "explorer" && (
                                <FileExplorerTree
                                    files={files}
                                    activeFileName={activeFileName}
                                    onSelectFile={setActiveFileName}
                                    onResetFile={handleResetFile}
                                    onCreateFile={handleCreateFile}
                                    repoName={workspaceData.repoName}
                                />
                            )}

                            {/* TAB: INTERACTIVE ROADMAP */}
                            {specTab === "roadmap" && (
                                <div className="p-5 space-y-4 animate-in fade-in duration-200">
                                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900/20 via-indigo-950/20 to-transparent border border-blue-500/20 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold uppercase text-blue-400">{project.track}</span>
                                            <span className="text-[10px] font-mono text-cyan-300 font-bold">
                                                {verifiedMilestones.size} / {project.milestones?.length || 5} Verified
                                            </span>
                                        </div>
                                        <h3 className="text-xs font-bold text-white">Full Architecture Roadmap</h3>
                                        <p className="text-[11px] text-slate-400 leading-normal">
                                            Milestones unlock sequentially. Pass all tests in each stage to advance.
                                        </p>
                                    </div>

                                    {/* Stages List */}
                                    <div className="space-y-2">
                                        {project.milestones?.map((m, idx) => {
                                            const isVerified = verifiedMilestones.has(idx);
                                            const isActive = idx === currentMilestoneIndex;
                                            const isSelected = idx === selectedRoadmapIdx;
                                            const unlocked = isMilestoneUnlocked(idx);

                                            return (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedRoadmapIdx(idx);
                                                        if (!unlocked) {
                                                            toast.error(`Stage ${idx + 1} is locked! Complete all tests in Stage ${idx} first.`, {
                                                                icon: "🔒",
                                                                id: `locked_click_${idx}`
                                                            });
                                                        }
                                                    }}
                                                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 relative ${
                                                        isSelected
                                                            ? "bg-blue-600/15 border-blue-500/50 text-white shadow-md"
                                                            : isActive
                                                            ? "bg-cyan-500/10 border-cyan-500/30 text-white"
                                                            : isVerified
                                                            ? "bg-emerald-500/5 border-emerald-500/20 text-slate-300"
                                                            : "bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 opacity-70"
                                                    }`}
                                                >
                                                    {/* Status Icon */}
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        isVerified 
                                                            ? "bg-emerald-500 text-black shadow-sm" 
                                                            : isActive 
                                                            ? "bg-cyan-400 text-black font-extrabold shadow-[0_0_10px_#38bdf8]" 
                                                            : unlocked
                                                            ? "bg-[#05070B] border border-blue-500/30 text-blue-300"
                                                            : "bg-[#05070B] border border-white/10 text-slate-600"
                                                    }`}>
                                                        {isVerified ? (
                                                            <Check size={14} className="stroke-[3]" />
                                                        ) : !unlocked ? (
                                                            <Lock size={12} className="text-slate-500" />
                                                        ) : (
                                                            idx + 1
                                                        )}
                                                    </div>

                                                    {/* Title & Status */}
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <div className={`font-bold text-xs truncate ${!unlocked ? "text-slate-500" : ""}`}>
                                                                {m.title}
                                                            </div>
                                                            <span className={`text-[10px] font-mono shrink-0 ${
                                                                isVerified 
                                                                    ? "text-emerald-400 font-bold" 
                                                                    : !unlocked 
                                                                    ? "text-slate-600 flex items-center gap-1" 
                                                                    : "text-cyan-400"
                                                            }`}>
                                                                {!unlocked ? (
                                                                    <span className="flex items-center gap-1"><Lock size={10} /> Locked</span>
                                                                ) : (
                                                                    `${m.testCount || 4} Tests`
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] font-mono mt-0.5">
                                                            {isVerified ? (
                                                                <span className="text-emerald-400 font-semibold">✓ Completed & Verified</span>
                                                            ) : isActive ? (
                                                                <span className="text-cyan-300 font-bold">● Active Workspace (Target)</span>
                                                            ) : unlocked ? (
                                                                <span className="text-blue-400">Ready to start</span>
                                                            ) : (
                                                                <span className="text-amber-500/70">🔒 Requires Stage {idx} completion</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Milestone Detail & Objective Card */}
                                    {(() => {
                                        const selectedMilestone = project.milestones?.[selectedRoadmapIdx] || project.milestones?.[0];
                                        const selectedGuide = workspaceData.milestoneGuides?.[selectedRoadmapIdx];
                                        const isSelectedVerified = verifiedMilestones.has(selectedRoadmapIdx);
                                        const isSelectedActive = selectedRoadmapIdx === currentMilestoneIndex;
                                        const isSelectedUnlocked = isMilestoneUnlocked(selectedRoadmapIdx);

                                        return (
                                            <div className="p-4 rounded-xl bg-[#05070B] border border-white/10 space-y-3 mt-2">
                                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                            Stage {selectedRoadmapIdx + 1}
                                                        </span>
                                                        <span className="text-xs font-bold text-white truncate max-w-[170px]">
                                                            {selectedMilestone?.title}
                                                        </span>
                                                    </div>
                                                    {isSelectedVerified ? (
                                                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                                                            <CheckCircle2 size={12} /> Verified
                                                        </span>
                                                    ) : isSelectedActive ? (
                                                        <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 font-bold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-mono text-amber-500/90 flex items-center gap-1 font-bold">
                                                            <Lock size={11} /> Locked
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Objective Description */}
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                        Stage Objective
                                                    </div>
                                                    <p className="text-xs text-slate-300 leading-relaxed">
                                                        {selectedGuide?.objective || "Implement architecture according to specification guidelines."}
                                                    </p>
                                                </div>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                                        <div className="text-[10px] text-slate-400 uppercase">Test Suite</div>
                                                        <div className="font-bold text-cyan-300">{selectedGuide?.testCases?.length || selectedMilestone?.testCount || 4} Tests</div>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                                        <div className="text-[10px] text-slate-400 uppercase">Constraints</div>
                                                        <div className="font-bold text-indigo-300">{selectedGuide?.specRules?.length || 2} Constraints</div>
                                                    </div>
                                                </div>

                                                {/* Milestone Action Button (strictly enforces progression lock) */}
                                                {isSelectedActive ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSpecTab("spec")}
                                                        className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                                                    >
                                                        <span>● Active Stage · Open Spec & Tests</span>
                                                        <ChevronRight size={13} />
                                                    </button>
                                                ) : isSelectedUnlocked ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectMilestone(selectedRoadmapIdx)}
                                                        className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                                                    >
                                                        <span>Switch Workspace to Stage {selectedRoadmapIdx + 1}</span>
                                                        <ChevronRight size={13} />
                                                    </button>
                                                ) : (
                                                    <div className="space-y-2 pt-1">
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                                                        >
                                                            <Lock size={13} className="text-amber-400" />
                                                            <span>Locked · Complete Stage {selectedRoadmapIdx} First</span>
                                                        </button>
                                                        <p className="text-[10px] text-amber-500/80 text-center font-mono">
                                                            Cannot jump ahead. Fix and pass tests in Stage {selectedRoadmapIdx} to unlock.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                </div>
                            )}

                            {/* TAB: SPEC GUIDE */}
                            {specTab === "spec" && (
                                <div className="p-5 space-y-5 animate-in fade-in duration-200">
                                    <div className="space-y-1 border-b border-white/10 pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold uppercase">
                                                Stage {currentMilestoneIndex + 1} of {project.milestones?.length || 5}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-mono">
                                                {milestoneGuide.testCases?.length || 4} Test Assertions
                                            </span>
                                        </div>
                                        <h2 className="text-sm font-bold text-white">
                                            {milestoneGuide.title}
                                        </h2>
                                    </div>

                                    {/* Objective */}
                                    <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-200 leading-relaxed">
                                        {milestoneGuide.objective}
                                    </div>

                                    {/* Specification Rules Checklist */}
                                    <div className="space-y-2">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-blue-400">
                                                <ShieldCheck size={13} />
                                                <span>Production Rules & Spec</span>
                                            </span>
                                            <span className="text-[10px] font-mono text-cyan-400">
                                                {milestoneGuide.specRules?.length || 0} constraints
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            {milestoneGuide.specRules?.map((rule, idx) => (
                                                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                                                    <CheckCircle2 size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                                                    <span className="leading-relaxed">{rule}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Test Assertions Target Table */}
                                    <div className="space-y-2">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <Terminal size={13} className="text-cyan-400" />
                                            <span>Target Verification Test Harness</span>
                                        </div>
                                        <div className="space-y-1.5 font-mono text-xs">
                                            {milestoneGuide.testCases?.map((tc, idx) => (
                                                <div key={idx} className="p-2.5 rounded-xl bg-[#05070B] border border-white/10 space-y-1">
                                                    <div className="flex items-center justify-between font-bold text-slate-200">
                                                        <span className="truncate pr-1">✓ {tc.name}</span>
                                                        <span className="text-[9px] text-blue-400 uppercase">Harness</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 truncate">
                                                        Expects: <span className="text-emerald-400">{tc.expected}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: PREREQUISITES & OBJECTIVES (AUTOMATED VERIFICATION ONLY) */}
                            {specTab === "prereq" && (
                                <div className="p-5 space-y-4 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <div>
                                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                                <CheckCircle2 size={15} className="text-cyan-400" />
                                                <span>Objectives & Toolchain</span>
                                            </h2>
                                            <p className="text-[11px] text-slate-400">
                                                Stage {currentMilestoneIndex + 1} validation criteria & environment.
                                            </p>
                                        </div>
                                        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded ${
                                            isCurrentMilestoneVerified 
                                                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
                                                : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                                        }`}>
                                            {isCurrentMilestoneVerified ? "All Verified" : "Pending Tests"}
                                        </span>
                                    </div>

                                    {/* Automated Verification Notice Banner */}
                                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2.5">
                                        <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-white block">Automated Verification</span>
                                            <span className="text-[11px] text-slate-300">
                                                Objectives cannot be checked manually. Write code in the editor and click <b>Run Tests</b> to verify milestone completion.
                                            </span>
                                        </div>
                                    </div>

                                    {/* System Runtime Box */}
                                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900/20 via-cyan-900/10 to-transparent border border-blue-500/20 space-y-1.5">
                                        <span className="text-[10px] font-mono font-bold uppercase text-cyan-300">Active Compiler Sandbox</span>
                                        <div className="text-xs text-slate-200 font-mono">
                                            {isClientSideLanguage(workspaceData.language || project.language)
                                                ? "Client-Side In-Browser V8 (0ms server latency)"
                                                : "Backend Sandbox Service (/api/runner/execute)"}
                                        </div>
                                    </div>

                                    {/* Milestone-Specific Concepts & Objectives */}
                                    {milestoneGuide.prerequisites && milestoneGuide.prerequisites.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center justify-between">
                                                <span className="flex items-center gap-1.5">
                                                    <Target size={13} className="text-cyan-400" />
                                                    <span>Stage {currentMilestoneIndex + 1} Objectives</span>
                                                </span>
                                                <span className={`text-[10px] font-mono ${isCurrentMilestoneVerified ? "text-emerald-400" : "text-amber-400"}`}>
                                                    {isCurrentMilestoneVerified ? "Verified" : "Run Tests to verify"}
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {milestoneGuide.prerequisites.map((p, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`w-full p-2.5 rounded-xl border transition-all flex items-start gap-2.5 text-xs ${
                                                            isCurrentMilestoneVerified
                                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200" 
                                                                : "bg-white/5 border-white/10 text-slate-300"
                                                        }`}
                                                    >
                                                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                                            isCurrentMilestoneVerified 
                                                                ? "bg-emerald-500 border-emerald-400 text-black" 
                                                                : "border-white/20 bg-[#05070B] text-slate-500"
                                                        }`}>
                                                            {isCurrentMilestoneVerified ? (
                                                                <Check size={11} className="stroke-[3]" />
                                                            ) : (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                                            )}
                                                        </div>
                                                        <span className="flex-grow">{p}</span>
                                                        <span className={`text-[10px] font-mono shrink-0 ${
                                                            isCurrentMilestoneVerified ? "text-emerald-400 font-bold" : "text-slate-500"
                                                        }`}>
                                                            {isCurrentMilestoneVerified ? "✓ Passed" : "Pending"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Project-Wide Toolchain */}
                                    <div className="space-y-2">
                                        <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                            <ShieldCheck size={13} className="text-blue-400" />
                                            <span>Required Toolchain & Knowledge</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {(project.prerequisites || []).map((p, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-full p-2.5 rounded-xl border border-white/5 bg-white/[0.03] flex items-start gap-2.5 text-xs text-slate-300"
                                                >
                                                    <div className="mt-0.5 w-4 h-4 rounded bg-blue-500/20 border border-blue-500/30 text-cyan-300 flex items-center justify-center shrink-0 text-[10px] font-mono font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <span>{p}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: PRD */}
                            {specTab === "prd" && (
                                <div className="p-5 space-y-4 animate-in fade-in duration-200">
                                    <h2 className="text-sm font-bold text-white">Product Requirements Document (PRD)</h2>
                                    <p className="text-xs text-slate-400 leading-relaxed">{project.description}</p>
                                    <div className="space-y-2 pt-2">
                                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Key Skills Mastered</h3>
                                        <ul className="space-y-1.5 text-xs">
                                            {project.keySkills?.map((skill, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                                                    <span>{skill}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* TAB: FORGE AI COPILOT / AI MENTOR */}
                            {(specTab === "copilot" || specTab === "hints") && (
                                <div className="p-4 space-y-4 animate-in fade-in duration-200">
                                    
                                    {/* Mentor Header Card */}
                                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#0E0F1E] to-[#070A11] border border-purple-500/30 space-y-2 relative overflow-hidden shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                                                    <Bot size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                                        <span>Forge Copilot</span>
                                                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold">
                                                            Staff AI
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        Pedagogical Senior Debugger
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                                <span className="text-[10px] font-mono text-purple-300">
                                                    {aiMentorState.modelUsed ? (aiMentorState.modelUsed.includes("Gemini") ? "Gemini 1.5" : "Diagnostic Engine") : "Ready"}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-purple-200/80 leading-relaxed">
                                            Analyzes failing assertions, unblocks architecture, and provides graduated hints without spoiling your solution.
                                        </p>
                                    </div>

                                    {/* Active Test Case Context Bar */}
                                    {aiMentorState.activeFailingTest && (
                                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 truncate">
                                                <XCircle size={14} className="text-rose-400 shrink-0" />
                                                <span className="font-bold font-mono truncate">{aiMentorState.activeFailingTest}</span>
                                            </div>
                                            {aiMentorState.targetLine && (
                                                <button
                                                    type="button"
                                                    onClick={() => jumpToLine(aiMentorState.targetLine)}
                                                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-[10px] font-mono text-rose-200 flex items-center gap-1 transition-colors shrink-0"
                                                >
                                                    <Target size={10} />
                                                    <span>Line {aiMentorState.targetLine}</span>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Graduated Hint Level Selector */}
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                                            <span>Guidance Level</span>
                                            <span className="text-[9px] font-mono text-purple-400">Graduated Hinting</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 bg-[#05070B] p-1 rounded-xl border border-white/5 text-[11px] font-mono">
                                            {[
                                                { lvl: 1, label: "1. Nudge", title: "Conceptual guidance" },
                                                { lvl: 2, label: "2. Pinpoint", title: "Pinpoints exact flaw" },
                                                { lvl: 3, label: "3. Structure", title: "Code pattern" }
                                            ].map(tab => (
                                                <button
                                                    key={tab.lvl}
                                                    type="button"
                                                    onClick={() => handleAskAiMentor({ requestedLevel: tab.lvl })}
                                                    className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                                                        aiMentorState.level === tab.lvl
                                                            ? "bg-purple-600 text-white font-bold shadow"
                                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                                    }`}
                                                    title={tab.title}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Diagnosis & Hint Box */}
                                    <div className="p-3.5 rounded-2xl bg-[#05070B] border border-white/10 space-y-3">
                                        {aiMentorState.isLoading ? (
                                            <div className="py-6 flex flex-col items-center justify-center gap-2 text-purple-300">
                                                <RefreshCw size={20} className="animate-spin text-purple-400" />
                                                <span className="text-xs font-mono">Consulting Forge Copilot...</span>
                                            </div>
                                        ) : aiMentorState.hint || aiMentorState.diagnosis ? (
                                            <div className="space-y-3">
                                                {/* Diagnosis summary */}
                                                {aiMentorState.diagnosis && (
                                                    <div className="space-y-1 border-b border-white/10 pb-2.5">
                                                        <div className="text-[10px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1.5">
                                                            <Sparkles size={11} />
                                                            <span>Diagnosis</span>
                                                        </div>
                                                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                                            {aiMentorState.diagnosis}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Hint Body */}
                                                {aiMentorState.hint && (
                                                    <div className="space-y-1.5">
                                                        <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center justify-between">
                                                            <span className="flex items-center gap-1.5">
                                                                <Lightbulb size={12} />
                                                                <span>Level {aiMentorState.level} Hint</span>
                                                            </span>
                                                            {aiMentorState.targetLine && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => jumpToLine(aiMentorState.targetLine)}
                                                                    className="text-[10px] text-cyan-300 hover:underline flex items-center gap-1"
                                                                >
                                                                    <Target size={10} />
                                                                    <span>Jump to Line {aiMentorState.targetLine}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-100 leading-relaxed">
                                                            {aiMentorState.hint}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Code Pattern Snippet (if available) */}
                                                {aiMentorState.codePattern && (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                                            <span>Suggested Structural Pattern:</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(aiMentorState.codePattern);
                                                                    toast.success("Snippet copied to clipboard");
                                                                }}
                                                                className="hover:text-white flex items-center gap-1 transition-colors"
                                                            >
                                                                <Copy size={11} />
                                                                <span>Copy</span>
                                                            </button>
                                                        </div>
                                                        <pre className="p-2.5 rounded-xl bg-[#090D16] border border-white/10 text-[11px] font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                                                            <code>{aiMentorState.codePattern}</code>
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="py-4 text-center space-y-2">
                                                <Bot size={28} className="mx-auto text-purple-400/60" />
                                                <p className="text-xs text-slate-300">
                                                    No active errors detected yet. Run tests or choose a quick prompt below to analyze your code.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAskAiMentor({ prompt: "Review my code architecture for this milestone" })}
                                                    className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 font-mono text-xs font-bold transition-all"
                                                >
                                                    ✨ Ask Copilot to Review Code
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Action Prompts */}
                                    <div className="space-y-2">
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                            Quick Prompts
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(aiMentorState.quickPrompts || [
                                                "Why did my test fail?",
                                                "Give me a subtle hint",
                                                "Explain milestone architecture",
                                                "Check my code for edge cases"
                                            ]).map((q, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleAskAiMentor({ prompt: q })}
                                                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/30 text-[11px] text-slate-300 hover:text-purple-200 transition-all text-left"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Interactive Chat Input */}
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!aiMentorInput.trim() || aiMentorState.isLoading) return;
                                            const query = aiMentorInput.trim();
                                            setAiMentorInput("");
                                            handleAskAiMentor({ prompt: query });
                                        }}
                                        className="flex items-center gap-1.5 pt-1"
                                    >
                                        <input
                                            type="text"
                                            value={aiMentorInput}
                                            onChange={(e) => setAiMentorInput(e.target.value)}
                                            placeholder="Ask Forge Copilot a question..."
                                            className="flex-grow px-3 py-2 rounded-xl bg-[#05070B] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500/50 transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            disabled={aiMentorState.isLoading || !aiMentorInput.trim()}
                                            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-all shrink-0 active:scale-95"
                                            title="Send query to Forge Copilot"
                                        >
                                            <Send size={14} />
                                        </button>
                                    </form>

                                    {/* Static Milestone Reference Accordion */}
                                    <div className="space-y-2 pt-2 border-t border-white/10">
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <BookOpen size={12} className="text-blue-400" />
                                            <span>Curated Spec Hints</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {milestoneGuide.hints?.map((hint, idx) => (
                                                <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 leading-relaxed">
                                                    <span className="font-bold text-blue-300 font-mono mr-1.5">#{idx + 1}</span>
                                                    <span>{hint}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}

                        </div>
                    </aside>
                )}

                {/* ---------------------------------------------------- */}
                {/* 3. HORIZONTAL DRAGGABLE RESIZER HANDLE               */}
                {/* ---------------------------------------------------- */}
                {!isSpecsCollapsed && (
                    <div
                        onMouseDown={() => setIsDraggingPanel(true)}
                        onDoubleClick={() => setPanelWidth(380)}
                        className={`w-1.5 hover:w-2 ${
                            isDraggingPanel ? "w-2 bg-blue-500 shadow-[0_0_10px_#2563eb]" : "bg-[#05070B] hover:bg-blue-500/40 active:bg-blue-500"
                        } transition-colors cursor-col-resize flex items-center justify-center shrink-0 select-none group z-10`}
                        title="Drag to resize panel (Double-click to reset)"
                    >
                        <div className={`h-8 w-0.5 rounded-full ${isDraggingPanel ? "bg-white" : "bg-white/20 group-hover:bg-blue-400"} transition-colors`} />
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* 4. CENTER CODE EDITOR & RESIZABLE TEST DRAWER        */}
                {/* ---------------------------------------------------- */}
                <main className="flex-grow flex flex-col h-full overflow-hidden bg-[#070A11] relative">
                    
                    {/* Monaco Code Studio Editor */}
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

                    {/* Draggable Terminal Drawer Resizer */}
                    <div
                        onMouseDown={() => setIsDraggingTerminal(true)}
                        className={`h-1.5 hover:h-2 ${
                            isDraggingTerminal ? "h-2 bg-blue-500 shadow-[0_0_10px_#2563eb]" : "bg-[#0A0E17] hover:bg-blue-500/40 active:bg-blue-500"
                        } transition-colors cursor-row-resize flex items-center justify-center border-t border-white/10 shrink-0 select-none group z-10`}
                        title="Drag to resize test runner drawer"
                    >
                        <div className={`w-12 h-0.5 rounded-full ${isDraggingTerminal ? "bg-white" : "bg-white/20 group-hover:bg-blue-400"} transition-colors`} />
                    </div>

                    {/* Integrated Terminal & Test Runner Drawer */}
                    <div 
                        className="bg-[#05070B] flex flex-col shrink-0 overflow-hidden will-change-[height]"
                        style={{ height: `${terminalHeight}px` }}
                    >
                        {/* Drawer Tabs */}
                        <div className="h-9 border-b border-white/10 bg-[#0A0E17] px-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setTerminalTab("tests")}
                                    className={`px-3 py-1 text-xs font-bold font-mono rounded flex items-center gap-1.5 transition-all ${
                                        terminalTab === "tests"
                                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <CheckCircle2 size={13} />
                                    <span>Automated Tests</span>
                                    {testResults && (
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                            testResults.status === "passed" 
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                        }`}>
                                            {testResults.passed}/{testResults.total}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setTerminalTab("console")}
                                    className={`px-3 py-1 text-xs font-bold font-mono rounded flex items-center gap-1.5 transition-all ${
                                        terminalTab === "console"
                                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <Terminal size={13} />
                                    <span>Terminal & Logs</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setTerminalHeight(prev => prev > 100 ? 50 : 260)}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                    title={terminalHeight > 100 ? "Minimize Drawer" : "Expand Drawer"}
                                >
                                    {terminalHeight > 100 ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                                </button>
                            </div>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-grow p-4 overflow-y-auto font-mono text-xs space-y-2 select-text">
                            
                            {/* TESTS TAB */}
                            {terminalTab === "tests" && (
                                <div className="space-y-3">
                                    {!testResults ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-500 space-y-2">
                                            <Play size={24} className="text-blue-500/40" />
                                            <div>Click <strong>Run Tests</strong> or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">Ctrl+Enter</kbd> to execute this milestone's test harness.</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-white/5 text-[11px] text-slate-400 gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-300">Suite: {milestoneGuide.title}</span>
                                                    {testResults.engineLabel && (
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/20 text-[10px] font-mono">
                                                            {testResults.engineLabel}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-mono text-cyan-300">Duration: {testResults.duration || "0ms"}</span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-300 ${testResults.status === "passed" ? "bg-emerald-500" : "bg-rose-500"}`} 
                                                    style={{ width: `${Math.round(((testResults.passed || 0) / (testResults.total || 1)) * 100)}%` }}
                                                />
                                            </div>

                                            {/* Steps */}
                                            {testResults.steps?.map((step, idx) => {
                                                const lineNum = extractLineNumber(step.output);
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className={`flex items-start sm:items-center justify-between p-2.5 rounded-xl border transition-all gap-2 ${
                                                            step.passed 
                                                                ? "bg-emerald-500/[0.04] border-emerald-500/20 text-slate-200" 
                                                                : "bg-rose-500/[0.06] border-rose-500/30 text-rose-200"
                                                        }`}
                                                    >
                                                        <div className="flex items-start sm:items-center gap-2.5 flex-grow min-w-0">
                                                            <div className="shrink-0 mt-0.5 sm:mt-0">
                                                                {step.passed ? (
                                                                    <CheckCircle2 size={15} className="text-emerald-400" />
                                                                ) : (
                                                                    <XCircle size={15} className="text-rose-400" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-grow">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-bold text-xs">{step.name}</span>
                                                                    {lineNum && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => jumpToLine(lineNum)}
                                                                            className="px-1.5 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/40 text-cyan-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
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
                                                                            className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-[10px] font-mono flex items-center gap-1 transition-all shadow-sm active:scale-95"
                                                                            title="Get AI diagnosis & graduated hints for this test"
                                                                        >
                                                                            <Sparkles size={11} className="text-purple-300 animate-pulse" />
                                                                            <span>Explain & Get Hint</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {step.output && (
                                                                    <div className={`text-[11px] font-mono truncate max-w-xl ${step.passed ? "text-slate-400" : "text-rose-300 font-bold"}`}>
                                                                        {step.output}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-[11px] font-mono shrink-0 ${step.passed ? "text-emerald-400" : "text-rose-400"}`}>
                                                            {step.duration}
                                                        </span>
                                                    </div>
                                                );
                                            })}

                                            {/* Results Footer Message */}
                                            {testResults.status === "failed" && (
                                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between flex-wrap gap-2">
                                                    <div className="flex items-center gap-2 font-bold text-xs">
                                                        <XCircle size={16} className="text-rose-400 shrink-0" />
                                                        <span>Tests Failed ({testResults.passed}/{testResults.total} passed). Fix errors to verify this milestone.</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAskAiMentor({
                                                                testCase: testResults.steps?.find(s => !s.passed)?.name || "Milestone Tests",
                                                                error: testResults.steps?.find(s => !s.passed)?.output || "Tests failed",
                                                                requestedLevel: 1
                                                            })}
                                                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                                        >
                                                            <Bot size={13} className="text-purple-300 animate-pulse" />
                                                            <span>Forge Copilot: Diagnose All Failures</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setTerminalTab("console")}
                                                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Terminal size={12} />
                                                            <span>View Raw Logs</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {testResults.status === "passed" && (
                                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between flex-wrap gap-2">
                                                    <div className="flex items-center gap-2 font-bold text-xs">
                                                        <CheckCircle2 size={16} className="shrink-0" />
                                                        <span>All {testResults.passed} assertions passed! Milestone {currentMilestoneIndex + 1} verified.</span>
                                                    </div>
                                                    {currentMilestoneIndex + 1 < (project.milestones?.length || 5) && (
                                                        <button
                                                            onClick={() => {
                                                                handleSelectMilestone(currentMilestoneIndex + 1);
                                                                setTestResults(null);
                                                            }}
                                                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                                                        >
                                                            <span>Advance to Milestone {currentMilestoneIndex + 2}</span>
                                                            <ChevronRight size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CONSOLE TAB */}
                            {terminalTab === "console" && (
                                <div className="space-y-1">
                                    {consoleLogs.map((log, i) => (
                                        <div key={i} className="text-slate-300">
                                            {log}
                                        </div>
                                    ))}
                                    
                                    <form onSubmit={handleTerminalCommand} className="flex items-center gap-2 pt-2">
                                        <span className="text-emerald-400 font-bold">skillforge@sandbox:~$</span>
                                        <input 
                                            type="text"
                                            value={terminalInput}
                                            onChange={(e) => setTerminalInput(e.target.value)}
                                            placeholder="Type command (test, ls, clear)..."
                                            className="flex-grow bg-transparent text-white focus:outline-none border-none font-mono text-xs"
                                        />
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>

                </main>

            </div>

            {/* Global Drag Overlay (captures mouse events across window, prevents Monaco/DOM from stealing cursor focus) */}
            {(isDraggingPanel || isDraggingTerminal) && (
                <div 
                    className="fixed inset-0 z-[99999] select-none"
                    style={{ 
                        cursor: isDraggingPanel ? "col-resize" : "row-resize",
                        pointerEvents: "auto" 
                    }}
                />
            )}

            {/* ======================================================== */}
            {/* 5. VS CODE-STYLE STATUS BAR (Bottom 24px)                 */}
            {/* ======================================================== */}
            <footer className="h-6 bg-[#04060A] border-t border-white/10 px-3 flex items-center justify-between text-[11px] font-mono select-none text-slate-400 shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <div 
                        className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" 
                        onClick={() => setIsCommandPaletteOpen(true)} 
                        title="Git Branch (Ctrl+P)"
                    >
                        <GitBranch size={12} className="text-cyan-400" />
                        <span>main</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (terminalHeight < 100) setTerminalHeight(240);
                            setTerminalTab("tests");
                        }}
                        className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all ${
                            testResults?.status === "passed"
                                ? "text-emerald-400 hover:bg-emerald-500/10"
                                : testResults?.status === "failed"
                                ? "text-rose-400 hover:bg-rose-500/10"
                                : "text-slate-400 hover:text-white"
                        }`}
                        title="Click to view test suite"
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
                                ? `${testResults.passed}/${testResults.total} Tests (${testResults.duration || "0ms"})`
                                : "Test Runner: Ready"}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <span className="hover:text-white" title="Cursor Line and Column">
                        Ln {cursorPosition.line}, Col {cursorPosition.col}
                    </span>
                    <span className="hidden md:inline hover:text-white" title="Indentation">Spaces: 4</span>
                    <span className="hidden sm:inline hover:text-white" title="Encoding">UTF-8</span>
                    <span className="hover:text-cyan-300 font-bold uppercase" title="Language Mode">
                        {workspaceData.language || project.language || "code"}
                    </span>
                    <span className="hidden lg:inline text-[10px] text-slate-500 font-mono" title="Execution Engine">
                        {isClientSideLanguage(workspaceData.language || project.language)
                            ? "Client-Side V8"
                            : "Backend Sandbox Service"}
                    </span>
                </div>
            </footer>

            {/* ======================================================== */}
            {/* COMMAND PALETTE MODAL                                    */}
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

            {/* ======================================================== */}
            {/* CELEBRATION MODAL ON MILESTONE COMPLETION                */}
            {/* ======================================================== */}
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
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <Award size={32} />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white">Project Complete!</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    You have completed all 5 architectural milestones for <strong>{project.title}</strong>.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono space-y-1">
                                <div>Total Session Time: <span className="text-cyan-400 font-bold">{formattedTime}</span></div>
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
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-xs font-bold text-white transition-all shadow-lg hover:from-blue-500 hover:to-cyan-400"
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

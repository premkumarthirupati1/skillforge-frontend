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
    Bot
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
                <code key={match.index} className="px-1.5 py-0.5 mx-0.5 rounded bg-[#18181b] text-[#388bfd] font-mono text-[11px] border border-[#27272a] font-medium inline-block">
                    {token.slice(1, -1)}
                </code>
            );
        } else if (token.startsWith('**') && token.endsWith('**')) {
            parts.push(
                <strong key={match.index} className="font-semibold text-[#f4f4f5]">
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

    // Left Pane Tab ('spec' | 'roadmap' | 'files' | 'prd')
    const [specTab, setSpecTab] = useState("spec");
    const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState(0);
    const [isSpecsCollapsed, setIsSpecsCollapsed] = useState(false);
    const [expandedHints, setExpandedHints] = useState({});

    const toggleHint = (idx) => {
        setExpandedHints(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    // Panel Widths (Docked Proportions)
    const [panelWidth, setPanelWidth] = useState(() => {
        try {
            const saved = localStorage.getItem("skillforge_sidepanel_width");
            return saved ? parseInt(saved, 10) || 360 : 360;
        } catch {
            return 360;
        }
    });
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);

    // Right Copilot Panel width & toggle
    const [isCopilotOpen, setIsCopilotOpen] = useState(true);
    const [copilotWidth, setCopilotWidth] = useState(() => {
        try {
            const saved = localStorage.getItem("skillforge_copilot_width");
            return saved ? parseInt(saved, 10) || 370 : 370;
        } catch {
            return 370;
        }
    });
    const [isDraggingCopilot, setIsDraggingCopilot] = useState(false);

    // Bottom execution panel height & toggle
    const [terminalHeight, setTerminalHeight] = useState(230);
    const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);
    const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);

    // Test Runner tab ('tests' | 'console')
    const [terminalTab, setTerminalTab] = useState("tests");

    // Execution state
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [testResults, setTestResults] = useState(null);

    // Distraction Free Mode (maximizes Monaco editor)
    const [isDistractionFree, setIsDistractionFree] = useState(false);

    const toggleDistractionFree = () => {
        if (!isDistractionFree) {
            setIsSpecsCollapsed(true);
            setIsCopilotOpen(false);
            setIsTerminalCollapsed(true);
            setIsDistractionFree(true);
            toast("Distraction-free mode activated", { icon: "🎯" });
        } else {
            setIsSpecsCollapsed(false);
            setIsCopilotOpen(true);
            setIsTerminalCollapsed(false);
            setIsDistractionFree(false);
        }
    };

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
        hints: ["Check the sample tests in the execution drawer."],
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
                    const newWidth = Math.max(260, Math.min(e.clientX - 44, window.innerWidth - 450));
                    setPanelWidth(newWidth);
                } else if (isDraggingCopilot) {
                    const newWidth = Math.max(280, Math.min(window.innerWidth - e.clientX, 600));
                    setCopilotWidth(newWidth);
                } else if (isDraggingTerminal) {
                    const newHeight = Math.max(80, Math.min(window.innerHeight - e.clientY - 24, window.innerHeight - 180));
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

        const isAgent = Boolean(aiMentorState.isAgentMode);
        const targetLevel = requestedLevel !== null ? requestedLevel : (isAgent ? 3 : (prompt ? 2 : (aiMentorState.level || 1)));
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
            toast("Forge Copilot updated", { icon: "⚡" });
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

                toast.error("Tests failed. Review output in the execution drawer.");
            }

            // Auto-open execution panel if closed
            setIsTerminalCollapsed(false);
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

    // Global Keyboard Shortcuts
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "p") {
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

    return (
        <div className="h-screen w-screen bg-[#121214] text-[#f4f4f5] flex flex-col overflow-hidden font-sans select-none antialiased">
            
            {/* ======================================================== */}
            {/* 1. TOP GLOBAL TOOLBAR (Docked, 48px Height, Crisp Zinc) */}
            {/* ======================================================== */}
            <header className="h-12 border-b border-[#27272a] bg-[#141416] px-3 flex items-center justify-between shrink-0 z-30 select-none">
                
                {/* Left: Brand, Back, Stage Navigation & Project Name */}
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <button
                        onClick={() => navigate("/projects")}
                        className="p-1.5 rounded-md text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors"
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

                    <div className="h-4 w-px bg-[#27272a] hidden sm:block shrink-0 mx-0.5" />

                    {/* Stage Stepper Navigation (< Stage X of N: Title >) */}
                    <div className="flex items-center gap-1 min-w-0">
                        <button
                            type="button"
                            disabled={currentMilestoneIndex === 0}
                            onClick={() => handleSelectMilestone(currentMilestoneIndex - 1)}
                            className="p-1 rounded text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#27272a] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                            title="Previous Stage"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-[#1c1c1f] border border-[#27272a] min-w-0 text-xs">
                            <span className="font-semibold text-[#f4f4f5] truncate max-w-[130px] sm:max-w-xs">
                                Stage {currentMilestoneIndex + 1} of {totalMilestones}: {currentMilestone?.title || project.title}
                            </span>
                            {isCurrentMilestoneVerified ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" title="Stage Verified" />
                            ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#388bfd] shrink-0" title="Stage In Progress" />
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={currentMilestoneIndex >= totalMilestones - 1}
                            onClick={() => handleSelectMilestone(currentMilestoneIndex + 1)}
                            className="p-1 rounded text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#27272a] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                            title="Next Stage"
                        >
                            <ChevronRight size={14} />
                        </button>

                        <span className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1c1c1f] border border-[#27272a] text-[#a1a1aa] uppercase ml-1">
                            {workspaceData.language || project.language || "Code"}
                        </span>
                    </div>
                </div>

                {/* Center: Primary Run & Submit Workflow */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Run Tests Button */}
                    <button
                        onClick={handleRunTests}
                        disabled={isRunningTests}
                        className="px-3 py-1.5 rounded-md bg-[#27272a] hover:bg-[#323236] active:bg-[#1e1e21] text-[#f4f4f5] border border-[#3f3f46] text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        title="Run Tests & Diagnostics (Ctrl+Enter)"
                    >
                        <Play size={12} fill="currentColor" className={isRunningTests ? "animate-spin text-[#388bfd]" : "text-[#22c55e]"} />
                        <span>{isRunningTests ? "Running..." : "Run"}</span>
                        <kbd className="hidden lg:inline text-[9px] bg-[#18181b] border border-[#3f3f46] px-1 py-0.2 rounded font-mono text-[#a1a1aa]">
                            Ctrl+↵
                        </kbd>
                    </button>

                    {/* Submit Verification Button */}
                    <button
                        onClick={handleRunTests}
                        disabled={isRunningTests}
                        className="px-3.5 py-1.5 rounded-md bg-[#22c55e]/15 hover:bg-[#22c55e]/25 active:bg-[#22c55e]/35 text-[#22c55e] border border-[#22c55e]/30 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        title="Submit Stage Verification"
                    >
                        <Cloud size={13} />
                        <span>Submit</span>
                    </button>

                    {/* Forge Copilot Toggle Button */}
                    <button
                        onClick={() => setIsCopilotOpen(prev => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all shadow-sm ${
                            isCopilotOpen
                                ? "bg-[#388bfd]/15 text-[#388bfd] border-[#388bfd]/35"
                                : "bg-[#27272a] hover:bg-[#323236] text-[#f4f4f5] border-[#3f3f46]"
                        }`}
                        title="Toggle Forge Copilot Assistant"
                    >
                        <img 
                            src="/images/forge-copilot-icon-transparent.png" 
                            alt="Copilot" 
                            className="w-4 h-4 rounded object-contain shrink-0" 
                        />
                        <span className="hidden sm:inline">Copilot</span>
                    </button>
                </div>

                {/* Right: Timer, Command Palette & Distraction-Free Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Session Timer */}
                    <div 
                        className="hidden md:flex items-center gap-1.5 text-xs font-mono text-[#a1a1aa] px-2 py-1"
                        title="Active Session Time (Auto-saved)"
                    >
                        <Clock size={12} className="text-[#71717a]" />
                        <span>{formattedTime}</span>
                    </div>

                    {/* Command Palette Trigger */}
                    <button
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors border border-transparent hover:border-[#3f3f46]"
                        title="Quick File Open (Ctrl+P)"
                    >
                        <Search size={12} />
                        <kbd className="px-1 py-0.2 bg-[#18181b] border border-[#27272a] rounded text-[9px] font-mono">Ctrl+P</kbd>
                    </button>

                    {/* Distraction Free Toggle */}
                    <button
                        onClick={toggleDistractionFree}
                        className={`p-1.5 rounded-md text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors ${
                            isDistractionFree ? "text-[#388bfd] bg-[#388bfd]/10" : ""
                        }`}
                        title={isDistractionFree ? "Exit Focus Mode" : "Distraction-Free Focus Mode"}
                    >
                        {isDistractionFree ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </header>

            {/* ======================================================== */}
            {/* 2. MAIN INTEGRATED IDE WORKSPACE (Docked Edge-to-Edge)   */}
            {/* ======================================================== */}
            <div className="flex-grow flex overflow-hidden bg-[#121214] relative">

                {/* ---------------------------------------------------- */}
                {/* SLIM ACTIVITY BAR (Leftmost Icon Rail: 44px wide)     */}
                {/* ---------------------------------------------------- */}
                <div className="w-11 bg-[#141416] border-r border-[#27272a] flex flex-col items-center justify-between py-2 shrink-0 z-20 select-none">
                    <div className="flex flex-col items-center gap-2">
                        {[
                            { id: "spec", icon: BookOpen, title: "Milestone Spec & Tasks" },
                            { id: "roadmap", icon: Milestone, title: "Milestone Progression Roadmap" },
                            { id: "files", icon: FolderTree, title: "Project File Explorer" },
                            { id: "prd", icon: Layers, title: "System PRD & Architecture" }
                        ].map(item => {
                            const Icon = item.icon;
                            const isActive = !isSpecsCollapsed && specTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        if (isSpecsCollapsed) {
                                            setIsSpecsCollapsed(false);
                                            setSpecTab(item.id);
                                        } else if (specTab === item.id) {
                                            setIsSpecsCollapsed(true);
                                        } else {
                                            setSpecTab(item.id);
                                        }
                                    }}
                                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                                        isActive
                                            ? "bg-[#27272a] text-[#388bfd] shadow-sm"
                                            : "text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]"
                                    }`}
                                    title={item.title}
                                >
                                    <Icon size={16} />
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsSpecsCollapsed(prev => !prev)}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1c1c1f] transition-colors"
                            title={isSpecsCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isSpecsCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                        </button>
                    </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* ZONE 1: LEARNING & SPEC PANEL (Left Drawer)          */}
                {/* ---------------------------------------------------- */}
                {!isSpecsCollapsed && (
                    <aside 
                        style={{ width: `${panelWidth}px` }}
                        className={`bg-[#161618] border-r border-[#27272a] flex flex-col shrink-0 h-full overflow-hidden select-text will-change-[width] ${
                            isDraggingPanel ? "select-none" : ""
                        }`}
                    >
                        {/* Drawer Header Tabs */}
                        <div className="h-9 bg-[#18181b] border-b border-[#27272a] px-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-1">
                                {[
                                    { id: "spec", label: "Spec", icon: BookOpen },
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
                                            className={`px-2 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors rounded shrink-0 ${
                                                isActive
                                                    ? "bg-[#27272a] text-[#f4f4f5] font-semibold"
                                                    : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]"
                                            }`}
                                        >
                                            <Icon size={12} className={isActive ? "text-[#388bfd]" : "text-[#71717a]"} />
                                            <span>{tab.label}</span>
                                            {tab.count !== undefined && tab.count !== null && (
                                                <span className="text-[10px] px-1 rounded bg-[#121214] text-[#a1a1aa] font-mono">
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setIsSpecsCollapsed(true)}
                                className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors"
                                title="Collapse Panel"
                            >
                                <PanelLeftClose size={13} />
                            </button>
                        </div>

                        {/* Drawer Content Area */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin select-text">
                            
                            {/* TAB 1: MILESTONE SPEC / REQUIREMENTS */}
                            {specTab === "spec" && (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    {/* Stage Title & Status */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-bold text-[#f4f4f5]">
                                                Stage {currentMilestoneIndex + 1}: {milestoneGuide.title}
                                            </span>
                                            {isCurrentMilestoneVerified ? (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#22c55e] font-medium border border-[#22c55e]/30">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#388bfd]/15 text-[#388bfd] font-medium border border-[#388bfd]/30">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[#a1a1aa] leading-relaxed">
                                            {milestoneGuide.objective}
                                        </p>
                                    </div>

                                    {/* Specification Rules */}
                                    {milestoneGuide.specRules && milestoneGuide.specRules.length > 0 && (
                                        <div className="space-y-2 pt-1">
                                            <div className="text-[11px] font-semibold text-[#f4f4f5] flex items-center gap-1.5 uppercase tracking-wide">
                                                <ShieldCheck size={13} className="text-[#388bfd]" />
                                                <span>Specification Requirements</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {milestoneGuide.specRules.map((rule, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="p-2.5 rounded-md bg-[#18181b] border border-[#27272a] flex items-start gap-2.5 text-[#d4d4d8]"
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

                                    {/* Graduated Hints Accordion */}
                                    {milestoneGuide.hints && milestoneGuide.hints.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            {milestoneGuide.hints.map((hint, hIdx) => {
                                                const isExpanded = !!expandedHints[hIdx];
                                                return (
                                                    <div key={hIdx} className="rounded-md border border-[#27272a] bg-[#18181b] overflow-hidden">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleHint(hIdx)}
                                                            className="w-full px-3 py-2 flex items-center justify-between text-left text-xs font-medium text-[#f4f4f5] hover:bg-[#1f1f23] transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Lightbulb size={13} className="text-amber-400" />
                                                                <span>Hint {hIdx + 1}</span>
                                                            </div>
                                                            <ChevronDown size={14} className={`text-[#71717a] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                                        </button>
                                                        {isExpanded && (
                                                            <div className="px-3 pb-3 pt-1 border-t border-[#27272a] text-[#a1a1aa] leading-relaxed">
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
                                        <div className="rounded-md border border-[#27272a] bg-[#18181b] overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => toggleHint("targets")}
                                                className="w-full px-3 py-2 flex items-center justify-between text-left text-xs font-medium text-[#f4f4f5] hover:bg-[#1f1f23] transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Target size={13} className="text-[#388bfd]" />
                                                    <span>Target Assertions ({milestoneGuide.testCases.length})</span>
                                                </div>
                                                <ChevronDown size={14} className={`text-[#71717a] transition-transform ${expandedHints["targets"] ? "rotate-180" : ""}`} />
                                            </button>
                                            {expandedHints["targets"] && (
                                                <div className="p-2 space-y-1.5 border-t border-[#27272a]">
                                                    {milestoneGuide.testCases.map((tc, idx) => (
                                                        <div key={idx} className="p-2 rounded bg-[#141416] border border-[#27272a] flex items-center justify-between font-mono text-[11px]">
                                                            <span className="text-[#d4d4d8] truncate">{tc.name}</span>
                                                            <span className="text-[#22c55e] text-[10px]">{tc.expected}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Advance Next Stage Button when Verified */}
                                    {isCurrentMilestoneVerified && currentMilestoneIndex < totalMilestones - 1 && (
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectMilestone(currentMilestoneIndex + 1)}
                                                className="w-full py-2 px-3 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <span>Advance to Stage {currentMilestoneIndex + 2}</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 2: ROADMAP */}
                            {specTab === "roadmap" && (
                                <div className="space-y-3 animate-in fade-in duration-150">
                                    <div className="text-xs uppercase font-medium tracking-wider text-[#71717a] flex items-center justify-between">
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
                                                    className={`p-3 rounded-md border transition-all text-left flex items-start gap-3 ${
                                                        !isUnlocked
                                                            ? "opacity-40 bg-[#18181b] border-[#27272a] cursor-not-allowed"
                                                            : isActive
                                                            ? "bg-[#18181b] border-[#388bfd] shadow-sm cursor-pointer"
                                                            : "bg-[#18181b] border-[#27272a] hover:border-[#3f3f46] cursor-pointer"
                                                    }`}
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                                        isVerified
                                                            ? "bg-[#22c55e]/20 text-[#22c55e]"
                                                            : isActive
                                                            ? "bg-[#388bfd]/20 text-[#388bfd]"
                                                            : "bg-[#27272a] text-[#71717a]"
                                                    }`}>
                                                        {isVerified ? <Check size={12} /> : idx + 1}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                            <span className="font-semibold text-[#f4f4f5] truncate text-xs">
                                                                {m.title}
                                                            </span>
                                                            {!isUnlocked && (
                                                                <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5 shrink-0">
                                                                    <Lock size={10} /> Locked
                                                                </span>
                                                            )}
                                                            {isVerified && (
                                                                <span className="text-[10px] font-mono text-[#22c55e] font-bold shrink-0">
                                                                    Passed
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-[#71717a] line-clamp-1">
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
                                <div className="space-y-3 animate-in fade-in duration-150">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs uppercase font-medium tracking-wider text-[#71717a]">
                                            Workspace Files
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const name = prompt("Enter new file name (e.g., helper.rs, utils.py):");
                                                if (name) handleCreateFile(name);
                                            }}
                                            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] hover:text-white transition-colors border border-[#27272a]"
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
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    <div className="p-3.5 rounded-md bg-[#18181b] border border-[#27272a] space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider">
                                            <Layers size={13} className="text-[#388bfd]" />
                                            <span>System Architecture</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-[#f4f4f5]">{project.title}</h3>
                                        <p className="text-xs text-[#a1a1aa] leading-relaxed">
                                            {project.description}
                                        </p>
                                    </div>

                                    {project.prerequisites && project.prerequisites.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-xs uppercase font-medium tracking-wider text-[#71717a]">
                                                Prerequisites & Architecture Targets
                                            </span>
                                            <div className="space-y-1.5">
                                                {project.prerequisites.map((p, i) => (
                                                    <div key={i} className="p-2 rounded-md bg-[#18181b] border border-[#27272a] flex items-center gap-2 text-xs text-[#d4d4d8]">
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

                {/* Resizable Hairline Splitter 1 */}
                {!isSpecsCollapsed && (
                    <div
                        onMouseDown={() => setIsDraggingPanel(true)}
                        onDoubleClick={() => setPanelWidth(360)}
                        className={`w-1 hover:w-1.5 ${
                            isDraggingPanel ? "bg-[#388bfd]" : "bg-[#27272a] hover:bg-[#388bfd]/70"
                        } transition-colors cursor-col-resize shrink-0 select-none z-20`}
                        title="Drag to resize panel"
                    />
                )}

                {/* ---------------------------------------------------- */}
                {/* ZONE 2: CENTER WORKSPACE (MONACO + EXECUTION DRAWER)  */}
                {/* ---------------------------------------------------- */}
                <main className="flex-1 min-w-0 flex flex-col overflow-hidden h-full bg-[#1e1e1e]">
                    
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

                    {/* Resizable Hairline Splitter between Monaco and Execution Panel */}
                    {!isTerminalCollapsed && (
                        <div
                            onMouseDown={() => setIsDraggingTerminal(true)}
                            className={`h-1 hover:h-1.5 ${
                                isDraggingTerminal ? "bg-[#388bfd]" : "bg-[#27272a] hover:bg-[#388bfd]/70"
                            } transition-colors cursor-row-resize shrink-0 select-none z-20`}
                            title="Drag to resize execution drawer"
                        />
                    )}

                    {/* Bottom Execution Panel */}
                    <div 
                        style={{ height: isTerminalCollapsed ? "28px" : `${terminalHeight}px` }}
                        className="bg-[#141416] border-t border-[#27272a] flex flex-col overflow-hidden shrink-0 transition-all duration-150"
                    >
                        {/* Drawer Header Bar */}
                        <div className="h-7 border-b border-[#27272a] bg-[#18181b] px-3 flex items-center justify-between shrink-0 select-none">
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => {
                                        setIsTerminalCollapsed(false);
                                        setTerminalTab("tests");
                                    }}
                                    className={`px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                                        !isTerminalCollapsed && terminalTab === "tests"
                                            ? "bg-[#27272a] text-[#f4f4f5] font-semibold"
                                            : "text-[#a1a1aa] hover:text-[#f4f4f5]"
                                    }`}
                                >
                                    <CheckCircle2 size={12} className={testResults?.status === "passed" ? "text-[#22c55e]" : "text-[#71717a]"} />
                                    <span>Test Results</span>
                                    {testResults && (
                                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                                            testResults.status === "passed"
                                                ? "bg-[#22c55e]/15 text-[#22c55e]"
                                                : "bg-[#ef4444]/15 text-[#ef4444]"
                                        }`}>
                                            {testResults.passed}/{testResults.total}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        setIsTerminalCollapsed(false);
                                        setTerminalTab("console");
                                    }}
                                    className={`px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                                        !isTerminalCollapsed && terminalTab === "console"
                                            ? "bg-[#27272a] text-[#f4f4f5] font-semibold"
                                            : "text-[#a1a1aa] hover:text-[#f4f4f5]"
                                    }`}
                                >
                                    <Terminal size={12} />
                                    <span>Console Logs</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsTerminalCollapsed(prev => !prev)}
                                    className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] transition-colors"
                                    title={isTerminalCollapsed ? "Expand Drawer" : "Collapse Drawer"}
                                >
                                    {isTerminalCollapsed ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                                </button>
                            </div>
                        </div>

                        {/* Drawer Body */}
                        {!isTerminalCollapsed && (
                            <div className="flex-grow p-3 overflow-y-auto font-mono text-xs select-text scrollbar-thin">
                                
                                {/* TESTS TAB */}
                                {terminalTab === "tests" && (
                                    <div className="space-y-2">
                                        {!testResults ? (
                                            <div className="h-full flex flex-col items-center justify-center text-[#71717a] py-6 space-y-2 select-none">
                                                <span className="text-xs">No test runs yet. Run your code to verify milestone assertions.</span>
                                                <button
                                                    type="button"
                                                    onClick={handleRunTests}
                                                    className="px-3 py-1 rounded bg-[#27272a] hover:bg-[#323236] text-[#f4f4f5] text-xs font-sans transition-colors border border-[#3f3f46]"
                                                >
                                                    Run Tests (Ctrl+Enter)
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {/* Header Status */}
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1.5 border-b border-[#27272a] text-[11px] text-[#a1a1aa] gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-semibold font-mono text-xs ${testResults.status === "passed" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                                                            {testResults.status === "passed" ? "✓ All Assertions Passed" : "✗ Verification Failed"}
                                                        </span>
                                                        <span>• {testResults.passed}/{testResults.total} passed</span>
                                                        <span>• {testResults.duration || "12ms"}</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-[#71717a]">
                                                        {testResults.engineLabel || "Sandbox MicroVM"}
                                                    </span>
                                                </div>

                                                {/* Passed Banner */}
                                                {testResults.status === "passed" && (
                                                    <div className="p-2.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/25 flex items-center justify-between flex-wrap gap-2 text-[#22c55e]">
                                                        <div className="flex items-center gap-2 font-medium text-xs">
                                                            <CheckCircle2 size={14} />
                                                            <span>Stage {currentMilestoneIndex + 1} passed! Requirements verified successfully.</span>
                                                        </div>
                                                        {currentMilestoneIndex < totalMilestones - 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSelectMilestone(currentMilestoneIndex + 1)}
                                                                className="px-2.5 py-1 rounded bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold text-xs transition-colors"
                                                            >
                                                                Advance to Stage {currentMilestoneIndex + 2} →
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Steps List */}
                                                {testResults.steps?.map((step, idx) => {
                                                    const lineNum = extractLineNumber(step.output);
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`flex items-start sm:items-center justify-between p-2 rounded-md border transition-colors gap-2 ${
                                                                step.passed 
                                                                    ? "bg-[#18181b] border-[#27272a] text-[#d4d4d8]" 
                                                                    : "bg-[#18181b] border-[#ef4444]/35 text-[#ef4444]"
                                                            }`}
                                                        >
                                                            <div className="flex items-start sm:items-center gap-2 flex-grow min-w-0">
                                                                <div className="shrink-0 mt-0.5 sm:mt-0">
                                                                    {step.passed ? (
                                                                        <CheckCircle2 size={14} className="text-[#22c55e]" />
                                                                    ) : (
                                                                        <XCircle size={14} className="text-[#ef4444]" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-grow space-y-0.5">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="font-semibold text-xs text-[#f4f4f5]">{step.name}</span>
                                                                        {lineNum && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => jumpToLine(lineNum)}
                                                                                className="px-1.5 py-0.2 rounded bg-[#1c1c1f] hover:bg-[#27272a] text-[#388bfd] text-[10px] font-mono flex items-center gap-1 transition-colors border border-[#27272a]"
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
                                                                                title="Ask Copilot for diagnosis"
                                                                            >
                                                                                <Sparkles size={11} />
                                                                                <span>Ask Copilot</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {step.output && (
                                                                        <div className={`text-xs font-mono truncate max-w-2xl leading-relaxed ${step.passed ? "text-[#71717a]" : "text-[#ef4444]"}`}>
                                                                            {step.output}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className={`text-[11px] font-mono shrink-0 ${step.passed ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                                                                {step.duration}
                                                            </span>
                                                        </div>
                                                    );
                                                })}

                                                {/* Failed Diagnostic Action */}
                                                {testResults.status === "failed" && (
                                                    <div className="p-2 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/25 text-[#ef4444] flex items-center justify-between flex-wrap gap-2">
                                                        <div className="flex items-center gap-2 font-medium text-xs">
                                                            <XCircle size={14} />
                                                            <span>Tests failed ({testResults.passed}/{testResults.total} passed). Fix errors to complete stage.</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAskAiMentor({
                                                                testCase: testResults.steps?.find(s => !s.passed)?.name || "Milestone Tests",
                                                                error: testResults.steps?.find(s => !s.passed)?.output || "Tests failed",
                                                                requestedLevel: 1
                                                            })}
                                                            className="px-2.5 py-0.5 rounded bg-[#388bfd]/20 hover:bg-[#388bfd]/30 border border-[#388bfd]/35 text-[#388bfd] text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Bot size={13} />
                                                            <span>Diagnose Failures</span>
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
                                                            ? "text-[#ef4444]" 
                                                            : log.includes("✓") || log.includes("Passed") 
                                                            ? "text-[#22c55e]" 
                                                            : "text-[#a1a1aa]"
                                                    }`}
                                                >
                                                    {log}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Terminal Prompt Input */}
                                        <form onSubmit={handleTerminalCommand} className="flex items-center gap-2 pt-2 border-t border-[#27272a] shrink-0">
                                            <span className="text-[#388bfd] font-mono font-bold">$</span>
                                            <input
                                                type="text"
                                                value={terminalInput}
                                                onChange={(e) => setTerminalInput(e.target.value)}
                                                placeholder="Type a command (test, clear, ls, help)..."
                                                className="flex-grow bg-transparent border-0 outline-none text-xs font-mono text-[#f4f4f5] placeholder-[#52525b]"
                                            />
                                        </form>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                </main>

                {/* Resizable Hairline Splitter 2 (Between Editor and Right Copilot) */}
                {isCopilotOpen && (
                    <div
                        onMouseDown={() => setIsDraggingCopilot(true)}
                        onDoubleClick={() => setCopilotWidth(370)}
                        className={`w-1 hover:w-1.5 ${
                            isDraggingCopilot ? "bg-[#388bfd]" : "bg-[#27272a] hover:bg-[#388bfd]/70"
                        } transition-colors cursor-col-resize shrink-0 select-none z-20`}
                        title="Drag to resize Copilot"
                    />
                )}

                {/* ---------------------------------------------------- */}
                {/* ZONE 3: FORGE COPILOT (Right Docked Panel)           */}
                {/* ---------------------------------------------------- */}
                {isCopilotOpen && (
                    <aside 
                        style={{ width: `${copilotWidth}px` }}
                        className={`bg-[#161618] border-l border-[#27272a] flex flex-col shrink-0 h-full overflow-hidden select-text will-change-[width] ${
                            isDraggingCopilot ? "select-none" : ""
                        }`}
                    >
                        {/* Header Bar */}
                        <div className="h-9 bg-[#18181b] border-b border-[#27272a] px-3 flex items-center justify-between shrink-0 select-none">
                            <div className="flex items-center gap-1.5">
                                <img 
                                    src="/images/forge-copilot-icon-transparent.png" 
                                    alt="Forge Copilot" 
                                    className="w-4 h-4 rounded object-contain shrink-0" 
                                />
                                <span className="text-xs font-semibold text-[#f4f4f5]">Forge Copilot</span>
                            </div>

                            <div className="flex items-center gap-1.5">
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
                                    className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors"
                                    title="New Conversation"
                                >
                                    <Plus size={13} />
                                </button>
                                <button
                                    onClick={() => setIsCopilotOpen(false)}
                                    className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors"
                                    title="Close Copilot Panel"
                                >
                                    <PanelRightClose size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Copilot Body */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 select-text scrollbar-thin">
                            
                            {/* Active Failing Test Alert if present */}
                            {aiMentorState.activeFailingTest && (
                                <div className="p-2 rounded-md bg-[#18181b] border border-[#ef4444]/30 text-xs text-[#f4f4f5] flex items-center justify-between gap-2 shadow-sm">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <XCircle size={13} className="text-[#ef4444] shrink-0" />
                                        <span className="font-mono text-[11px] font-medium truncate">{aiMentorState.activeFailingTest}</span>
                                    </div>
                                    {aiMentorState.targetLine && (
                                        <button
                                            type="button"
                                            onClick={() => jumpToLine(aiMentorState.targetLine)}
                                            className="px-1.5 py-0.2 rounded bg-[#1c1c1f] text-[10px] font-mono text-[#388bfd] hover:text-white flex items-center gap-1 font-semibold shrink-0 border border-[#27272a]"
                                        >
                                            <Target size={10} /> Line {aiMentorState.targetLine}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Graduated Guidance Level Selector */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-mono text-[#71717a]">
                                    <span>Guidance Level</span>
                                    <span className="text-[10px]">Graduated Hinting</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 bg-[#18181b] p-0.5 rounded-md border border-[#27272a] font-mono text-[11px]">
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
                                                    ? "bg-[#27272a] text-[#f4f4f5] font-semibold shadow-sm"
                                                    : "text-[#71717a] hover:text-[#f4f4f5]"
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Milestone Diagnostic & Hint Box */}
                            {(aiMentorState.isLoading || aiMentorState.hint || aiMentorState.diagnosis || (!aiMentorState.history || aiMentorState.history.length === 0)) && (
                                <div className="p-3 rounded-md bg-[#18181b] border border-[#27272a] space-y-2.5">
                                    {aiMentorState.isLoading ? (
                                        <div className="py-6 flex flex-col items-center justify-center gap-2 text-[#71717a]">
                                            <RefreshCw size={16} className="animate-spin text-[#388bfd]" />
                                            <span className="text-xs font-mono">Analyzing code architecture...</span>
                                        </div>
                                    ) : aiMentorState.hint || aiMentorState.diagnosis ? (
                                        <div className="space-y-2.5">
                                            {aiMentorState.diagnosis && (
                                                <div className="space-y-1 border-b border-[#27272a] pb-2">
                                                    <div className="text-[10px] font-mono uppercase text-[#388bfd] font-semibold flex items-center gap-1">
                                                        <Sparkles size={11} />
                                                        <span>Diagnosis</span>
                                                    </div>
                                                    <div className="break-words [overflow-wrap:anywhere] max-w-full text-xs">
                                                        <FormattedAiContent content={aiMentorState.diagnosis} />
                                                    </div>
                                                </div>
                                            )}

                                            {aiMentorState.hint && (
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-mono uppercase text-[#f4f4f5] font-semibold flex items-center justify-between">
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
                                                    <div className="p-2.5 rounded bg-[#141416] border border-[#27272a] text-[#d4d4d8] break-words [overflow-wrap:anywhere] max-w-full overflow-hidden">
                                                        <FormattedAiContent content={aiMentorState.hint} />
                                                    </div>
                                                </div>
                                            )}

                                            {aiMentorState.codePattern && (
                                                <div className="space-y-1 pt-1">
                                                    <div className="flex items-center justify-between text-[10px] font-mono text-[#71717a]">
                                                        <span>Suggested Code Pattern:</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(aiMentorState.codePattern);
                                                                toast.success("Copied to clipboard");
                                                            }}
                                                            className="hover:text-white flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#141416] border border-[#27272a] text-[9px]"
                                                        >
                                                            <Copy size={10} /> Copy
                                                        </button>
                                                    </div>
                                                    <pre className="p-2.5 rounded bg-[#121214] border border-[#27272a] text-[11px] font-mono text-[#d4d4d8] overflow-x-auto leading-relaxed">
                                                        <code>{aiMentorState.codePattern}</code>
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-5 text-center space-y-2 select-none">
                                            <div className="flex justify-center mb-1">
                                                <img 
                                                    src="/images/forge-copilot-icon-transparent.png" 
                                                    alt="Forge Copilot" 
                                                    className="w-12 h-12 rounded-xl object-contain" 
                                                />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h5 className="text-xs font-semibold text-[#f4f4f5]">
                                                    Forge Copilot Senior AI Mentor
                                                </h5>
                                                <p className="text-[11px] text-[#71717a] max-w-xs mx-auto leading-relaxed">
                                                    Context-aware guidance for reviewing architecture, graduated hints, and debugging tests.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleAskAiMentor({ prompt: "Review my code architecture for this milestone" })}
                                                className="px-3 py-1 rounded bg-[#27272a] hover:bg-[#323236] border border-[#3f3f46] text-[#f4f4f5] font-mono text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-sm"
                                            >
                                                <Sparkles size={11} className="text-[#388bfd]" />
                                                <span>Review Architecture</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Chat History Stream */}
                            {aiMentorState.history && aiMentorState.history.length > 0 && (
                                <div className="space-y-2.5 pt-1 border-t border-[#27272a]">
                                    <div className="flex items-center justify-between text-[10px] font-mono text-[#71717a] uppercase">
                                        <span>Copilot Discussion</span>
                                        <button
                                            type="button"
                                            onClick={() => setAiMentorState(prev => ({ ...prev, history: [] }))}
                                            className="text-[9px] hover:text-[#f4f4f5] text-[#71717a] underline cursor-pointer"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {aiMentorState.history.map((h, hIdx) => (
                                            <div key={hIdx} className="space-y-1.5 text-xs">
                                                {/* Developer query bubble */}
                                                <div className="p-2.5 rounded-md bg-[#18181b] text-[#f4f4f5] border border-[#27272a] break-words [overflow-wrap:anywhere] max-w-full">
                                                    <div className="flex items-center gap-1.5 text-[#71717a] text-[10px] font-mono mb-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#388bfd]" />
                                                        <span>You asked:</span>
                                                    </div>
                                                    <p className="text-xs text-[#f4f4f5] leading-relaxed font-medium">{h.query}</p>
                                                </div>

                                                {/* Copilot answer bubble */}
                                                <div className="p-2.5 rounded-md bg-[#141416] text-[#d4d4d8] border border-[#27272a] space-y-2 break-words [overflow-wrap:anywhere] max-w-full overflow-hidden">
                                                    {h.diagnosis && (
                                                        <div className="text-[10px] font-mono text-[#388bfd] font-semibold flex items-center justify-between border-b border-[#27272a] pb-1.5">
                                                            <span className="flex items-center gap-1.5">
                                                                <img 
                                                                    src="/images/forge-copilot-icon-transparent.png" 
                                                                    alt="Forge Copilot" 
                                                                    className="w-3.5 h-3.5 rounded object-contain shrink-0" 
                                                                />
                                                                <span>{h.diagnosis}</span>
                                                            </span>
                                                            {h.isAgent && (
                                                                <span className="px-1.5 py-0.2 rounded bg-blue-900/40 border border-blue-500/40 text-[9px] text-blue-300">
                                                                    Agent Audit
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="break-words [overflow-wrap:anywhere] max-w-full overflow-hidden">
                                                        <FormattedAiContent content={h.reply} />
                                                    </div>
                                                    {h.codePattern && (
                                                        <div className="space-y-1 pt-1 border-t border-[#27272a]">
                                                            <div className="flex items-center justify-between text-[10px] font-mono text-[#71717a]">
                                                                <span>Suggested Code Pattern:</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(h.codePattern);
                                                                        toast.success("Copied to clipboard");
                                                                    }}
                                                                    className="hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[9px]"
                                                                >
                                                                    <Copy size={10} /> Copy
                                                                </button>
                                                            </div>
                                                            <pre className="p-2 rounded bg-[#121214] border border-[#27272a] text-[11px] font-mono text-[#d4d4d8] overflow-x-auto leading-relaxed">
                                                                <code>{h.codePattern}</code>
                                                            </pre>
                                                        </div>
                                                    )}
                                                    {h.targetLine && (
                                                        <div className="pt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => jumpToLine(h.targetLine)}
                                                                className="text-[10px] text-[#388bfd] hover:underline flex items-center gap-1 font-mono font-medium"
                                                            >
                                                                <Target size={10} /> Jump to Line {h.targetLine}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Action Prompt Chips */}
                            <div className="space-y-1 pt-1">
                                <div className="text-[10px] uppercase font-mono font-medium text-[#71717a]">
                                    Quick Prompts
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {aiMentorState.quickPrompts.map((q, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleAskAiMentor({ prompt: q })}
                                            className="px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[11px] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors text-left"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Anchored Bottom Composer */}
                        <div className="p-2.5 border-t border-[#27272a] bg-[#141416] flex flex-col gap-2 shrink-0 select-none">
                            <div className="p-2 rounded-md border border-[#27272a] bg-[#18181b] focus-within:border-[#388bfd] transition-colors flex flex-col gap-2">
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
                                    placeholder="Ask Forge Copilot... (Shift + Enter for newline)"
                                    rows={2}
                                    className="w-full bg-transparent border-0 outline-none resize-none text-xs text-[#f4f4f5] placeholder-[#71717a] max-h-24 overflow-y-auto leading-relaxed select-text"
                                />

                                <div className="flex items-center justify-between pt-1 border-t border-[#27272a]">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#a1a1aa]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                                        <span>Qwen 2.5 Coder</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div 
                                            onClick={() => setAiMentorState(prev => ({ ...prev, isAgentMode: !prev.isAgentMode }))}
                                            className="flex items-center gap-1.5 cursor-pointer select-none"
                                            title="Toggle Autonomous Agent Reasoning Mode"
                                        >
                                            <span className="text-[10px] text-[#71717a] font-medium">Agent</span>
                                            <div 
                                                className={`w-6 h-3 rounded-full transition-colors relative flex items-center px-0.5 ${
                                                    aiMentorState.isAgentMode ? "bg-[#388bfd]" : "bg-[#27272a]"
                                                }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full bg-white transition-transform ${
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
                                            className="w-6 h-6 rounded-md bg-[#388bfd] hover:bg-blue-600 disabled:bg-[#27272a] disabled:text-[#71717a] text-white flex items-center justify-center transition-all shrink-0 active:scale-95"
                                            title="Send question"
                                        >
                                            <ArrowUp size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}

            </div>

            {/* ======================================================== */}
            {/* 3. FOOTER STATUS STRIP (Hairline Docked 24px Bar)       */}
            {/* ======================================================== */}
            <footer className="h-6 border-t border-[#27272a] bg-[#141416] px-3 flex items-center justify-between text-[11px] font-mono text-[#71717a] shrink-0 select-none z-30">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[#a1a1aa]">
                        <GitBranch size={12} className="text-[#388bfd]" />
                        <span>main</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setIsTerminalCollapsed(false);
                            setTerminalTab("tests");
                        }}
                        className={`flex items-center gap-1.5 transition-colors ${
                            testResults?.status === "passed"
                                ? "text-[#22c55e] font-semibold"
                                : testResults?.status === "failed"
                                ? "text-[#ef4444] font-semibold"
                                : "text-[#71717a] hover:text-[#f4f4f5]"
                        }`}
                    >
                        {testResults?.status === "passed" ? (
                            <CheckCircle2 size={12} className="text-[#22c55e]" />
                        ) : testResults?.status === "failed" ? (
                            <XCircle size={12} className="text-[#ef4444]" />
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
                    <span className="font-semibold text-[#a1a1aa] uppercase">
                        {workspaceData.language || project.language || "code"}
                    </span>
                    <span className="hidden md:inline text-[#52525b]">
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
                            className="w-full max-w-md p-6 rounded-2xl bg-[#18181b] border border-[#27272a] text-center space-y-4 shadow-2xl relative overflow-hidden"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 mx-auto flex items-center justify-center text-[#22c55e]">
                                <Award size={28} />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-[#f4f4f5]">Project Complete!</h3>
                                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                                    You have completed all {totalMilestones} architectural milestones for <strong>{project.title}</strong>.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-lg bg-[#141416] border border-[#27272a] text-xs text-[#d4d4d8] font-mono space-y-1">
                                <div>Total Session Time: <span className="text-[#388bfd] font-bold">{formattedTime}</span></div>
                                <div>Total Passed Assertions: <span className="text-[#22c55e] font-bold">{project.milestones?.reduce((acc, m) => acc + (m.testCount || 4), 0)} Tests</span></div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setShowCelebration(false)}
                                    className="flex-1 py-2 rounded-lg bg-[#27272a] hover:bg-[#323236] text-xs font-semibold text-[#f4f4f5] transition-colors"
                                >
                                    Stay in Workspace
                                </button>
                                <button
                                    onClick={() => navigate("/projects")}
                                    className="flex-1 py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-xs font-semibold text-black transition-colors"
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

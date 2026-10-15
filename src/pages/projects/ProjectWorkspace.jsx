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
    ChevronDown, 
    ArrowLeft, 
    FileCode, 
    Terminal, 
    BookOpen, 
    Sparkles, 
    Copy, 
    Check, 
    RotateCcw, 
    ShieldCheck, 
    Layers, 
    Cpu, 
    Maximize2, 
    Minimize2,
    Code2,
    Info,
    HelpCircle,
    Award
} from "lucide-react";
import { PROJECTS } from "../../data/projectsData";
import { getProjectWorkspaceData } from "../../data/projectWorkspacesData";
import CodeStudioEditor from "../../components/workspace/CodeStudioEditor";
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

    // State: Current active milestone (1-indexed)
    const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
    const currentMilestone = project.milestones?.[currentMilestoneIndex] || project.milestones?.[0];

    // State: File editor contents (persisted per project)
    const [files, setFiles] = useState(() => {
        const saved = localStorage.getItem(`skillforge_files_${project.id}`);
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* fallback */ }
        }
        return workspaceData.files;
    });

    const [activeFileName, setActiveFileName] = useState(workspaceData.files[0]?.name || "main.rs");
    const activeFile = files.find(f => f.name === activeFileName) || files[0];

    // State: Left panel tab ('spec' | 'prd' | 'hints')
    const [specTab, setSpecTab] = useState("spec");

    // State: Terminal tab ('tests' | 'console' | 'diff')
    const [terminalTab, setTerminalTab] = useState("tests");

    // State: Test Runner execution state
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [allMilestonesPassed, setAllMilestonesPassed] = useState(false);

    // State: Terminal console output
    const [consoleLogs, setConsoleLogs] = useState([
        `⚡ skillforge-microvm initialized for [${project.title}]`,
        `container: sha256:8b47e2 mounted at /workspace`,
        `branch: main (tracking origin/main)`,
        `Ready. Edit code in the center pane and click 'Run Tests'.`
    ]);
    const [terminalInput, setTerminalInput] = useState("");

    // State: Interactive spec checklist checkboxes
    const [completedChecklist, setCompletedChecklist] = useState({});

    // State: Session timer
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [copiedCode, setCopiedCode] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

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
            setSecondsElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format seconds into MM:SS or HH:MM:SS
    const formattedTime = useMemo(() => {
        const mins = Math.floor(secondsElapsed / 60);
        const secs = secondsElapsed % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, [secondsElapsed]);

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

    // Copy code to clipboard
    const handleCopyCode = () => {
        navigator.clipboard.writeText(activeFile.content);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast.success("Code copied to clipboard!");
    };

    // Run Automated Test Suite
    const handleRunTests = () => {
        if (isRunningTests) return;
        setIsRunningTests(true);
        setTerminalTab("tests");
        setTestResults({ status: "running", steps: [] });

        const cases = milestoneGuide.testCases || [
            { name: "TCP Handshake", expected: "Port 6379 open" },
            { name: "PING command handshake", expected: "PONG" },
            { name: "Concurrent connections", expected: "5/5 connected" }
        ];

        // Progressive simulation of test execution
        let currentStep = 0;
        const steps = [];

        const interval = setInterval(() => {
            if (currentStep < cases.length) {
                const tc = cases[currentStep];
                steps.push({
                    name: tc.name,
                    passed: true,
                    duration: (Math.random() * 4 + 1.2).toFixed(1) + "ms",
                    output: `✓ Asserted: ${tc.expected}`
                });
                setTestResults({ status: "running", steps: [...steps] });
                currentStep++;
            } else {
                clearInterval(interval);
                setIsRunningTests(false);
                setTestResults({
                    status: "passed",
                    total: cases.length,
                    passed: cases.length,
                    duration: "18.4ms",
                    steps
                });

                // Record milestone completion in user builds
                updateUserBuildProgress(currentMilestoneIndex + 1);

                setShowCelebration(true);
                toast.success(`🎉 Milestone ${currentMilestoneIndex + 1} verified! All test assertions passed.`);
            }
        }, 550);
    };

    // Update build progress in localStorage
    const updateUserBuildProgress = (milestoneNum) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const saved = localStorage.getItem("skillforge_user_builds");
            let builds = saved ? JSON.parse(saved) : [];

            const totalM = project.milestones?.length || 5;
            const percent = Math.min(100, Math.round((milestoneNum / totalM) * 100));

            const existingIndex = builds.findIndex(b => b.projectId === project.id);
            if (existingIndex >= 0) {
                builds[existingIndex].currentMilestone = milestoneNum;
                builds[existingIndex].percent = percent;
                builds[existingIndex].lastActivity = "Just now";
            } else {
                builds.unshift({
                    id: project.id,
                    projectId: project.id,
                    title: project.title,
                    track: project.track,
                    currentMilestone: milestoneNum,
                    totalMilestones: totalM,
                    percent,
                    testsPassed: milestoneNum * 4,
                    totalTests: totalM * 4,
                    branch: `feat/milestone-${milestoneNum}`,
                    lastActivity: "Just now",
                    status: percent === 100 ? "Completed" : "Active Runtime",
                    tech: project.techStack
                });
            }
            localStorage.setItem("skillforge_user_builds", JSON.stringify(builds));
        } catch (e) {
            console.error("Failed to update user builds", e);
        }
    };

    // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to run tests
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleRunTests();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isRunningTests, milestoneGuide]);

    // Handle Terminal command submission
    const handleTerminalCommand = (e) => {
        e.preventDefault();
        if (!terminalInput.trim()) return;

        const cmd = terminalInput.trim();
        setConsoleLogs(prev => [...prev, `$ ${cmd}`]);

        if (cmd === "test" || cmd === "npm test" || cmd === "cargo test") {
            handleRunTests();
        } else if (cmd === "clear") {
            setConsoleLogs([]);
        } else if (cmd === "git status") {
            setConsoleLogs(prev => [
                ...prev,
                `On branch feat/milestone-${currentMilestoneIndex + 1}`,
                `Changes staged for commit:`,
                `  modified: ${activeFile.path}`,
                `working tree clean`
            ]);
        } else {
            setConsoleLogs(prev => [
                ...prev,
                `Executing ${cmd}... command exited with code 0 (12ms)`
            ]);
        }

        setTerminalInput("");
    };

    return (
        <div className="min-h-screen h-screen flex flex-col bg-[#070A11] text-slate-100 font-sans select-none overflow-hidden">
            
            {/* ======================================================== */}
            {/* TOP BAR / WORKSPACE HEADER                               */}
            {/* ======================================================== */}
            <header className="h-14 border-b border-white/10 bg-[#0A0E17] px-4 flex items-center justify-between shrink-0 z-30">
                
                {/* Left: Brand & Breadcrumbs */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/projects")}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
                        title="Back to Projects Forge"
                    >
                        <ArrowLeft size={14} />
                        <span className="hidden sm:inline">Forge</span>
                    </button>

                    <div className="h-4 w-px bg-white/10" />

                    <div className="flex items-center gap-2">
                        <div className="w-6 h-5 rounded-md bg-[#05070B] border border-blue-500/40 flex items-center justify-center shrink-0">
                            <img src="/images/code-anvil-logo.png" alt="Anvil" className="h-3 w-auto object-contain" />
                        </div>
                        <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                            {project.title}
                        </h1>
                        <span className="hidden md:inline text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {project.track}
                        </span>
                    </div>
                </div>

                {/* Center: Milestone Stepper */}
                <div className="hidden lg:flex items-center gap-1.5 bg-[#05070B] p-1 rounded-xl border border-white/5 text-xs font-mono">
                    {project.milestones?.map((m, idx) => {
                        const active = idx === currentMilestoneIndex;
                        const isPast = idx < currentMilestoneIndex;
                        return (
                            <button
                                key={m.id}
                                onClick={() => {
                                    setCurrentMilestoneIndex(idx);
                                    setTestResults(null);
                                }}
                                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                                    active 
                                        ? "bg-blue-600 text-white font-bold shadow-sm" 
                                        : isPast 
                                        ? "text-emerald-400 hover:bg-white/5" 
                                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                }`}
                            >
                                {isPast ? <CheckCircle2 size={12} className="text-emerald-400" /> : <span>M{idx + 1}</span>}
                                <span className="truncate max-w-[90px]">{m.title.split(" ")[0]}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Right: Stats & Run Action */}
                <div className="flex items-center gap-3">
                    
                    {/* Session Timer */}
                    <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        <Clock size={12} className="text-cyan-400" />
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
            {/* WORKSPACE BODY (3-PANE LAYOUT)                           */}
            {/* ======================================================== */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">

                {/* ---------------------------------------------------- */}
                {/* PANE 1: SPECIFICATION & ARCHITECTURAL GUIDE (LEFT)   */}
                {/* ---------------------------------------------------- */}
                <aside className="w-full md:w-[380px] lg:w-[420px] border-r border-white/10 bg-[#090D16] flex flex-col shrink-0 h-1/3 md:h-auto overflow-hidden">
                    
                    {/* Left Pane Header Tabs */}
                    <div className="flex items-center justify-between border-b border-white/10 bg-[#070A11] px-3 pt-2">
                        <div className="flex items-center gap-1">
                            {[
                                { id: "spec", label: "Milestone Guide", icon: BookOpen },
                                { id: "prd", label: "Full PRD", icon: Layers },
                                { id: "hints", label: "Hints & Tips", icon: HelpCircle }
                            ].map(tab => {
                                const Icon = tab.icon;
                                const active = specTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSpecTab(tab.id)}
                                        className={`px-3 py-2 text-xs font-bold rounded-t-lg flex items-center gap-1.5 transition-all ${
                                            active 
                                                ? "bg-[#090D16] text-white border-t-2 border-blue-500 shadow-sm" 
                                                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                        }`}
                                    >
                                        <Icon size={13} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <span className="text-[11px] font-mono text-cyan-400 font-bold pr-2">
                            M{currentMilestoneIndex + 1}/{project.milestones?.length || 5}
                        </span>
                    </div>

                    {/* Left Pane Content Body */}
                    <div className="flex-grow overflow-y-auto p-5 space-y-6 select-text text-sm leading-relaxed text-slate-300">
                        
                        {/* TAB 1: MILESTONE SPEC */}
                        {specTab === "spec" && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                
                                {/* Milestone Title & Objective */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold uppercase">
                                            Stage {currentMilestoneIndex + 1}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {milestoneGuide.testCases?.length || 4} automated assertions
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-white">
                                        {milestoneGuide.title}
                                    </h2>
                                    <p className="text-xs text-slate-400 leading-normal">
                                        {milestoneGuide.objective}
                                    </p>
                                </div>

                                {/* Spec Rules & Architectural Checklist */}
                                <div className="space-y-3 pt-2 border-t border-white/10">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <ShieldCheck size={14} className="text-blue-400" />
                                        <span>Architectural Checklist</span>
                                    </h3>

                                    <div className="space-y-2">
                                        {milestoneGuide.specRules?.map((rule, idx) => {
                                            const key = `m${currentMilestoneIndex}_rule_${idx}`;
                                            const checked = !!completedChecklist[key];
                                            return (
                                                <label 
                                                    key={idx}
                                                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors text-xs"
                                                >
                                                    <input 
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => setCompletedChecklist(prev => ({ ...prev, [key]: e.target.checked }))}
                                                        className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0 focus:outline-none"
                                                    />
                                                    <span className={checked ? "line-through text-slate-500" : "text-slate-300"}>
                                                        {rule}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Test Cases Requirements Breakdown */}
                                <div className="space-y-3 pt-2 border-t border-white/10">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Terminal size={14} className="text-cyan-400" />
                                        <span>Target Test Assertions</span>
                                    </h3>

                                    <div className="space-y-2 font-mono text-xs">
                                        {milestoneGuide.testCases?.map((tc, idx) => (
                                            <div key={idx} className="p-2.5 rounded-xl bg-[#05070B] border border-white/5 space-y-1">
                                                <div className="flex items-center justify-between text-slate-300 font-bold">
                                                    <span>{idx + 1}. {tc.name}</span>
                                                    <span className="text-[10px] text-blue-400 uppercase">Harness</span>
                                                </div>
                                                {tc.cmd && (
                                                    <div className="text-[11px] text-cyan-300/80">
                                                        $ {tc.cmd}
                                                    </div>
                                                )}
                                                <div className="text-[11px] text-slate-400">
                                                    Expects: <span className="text-emerald-400">{tc.expected}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* TAB 2: FULL PRD */}
                        {specTab === "prd" && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <h2 className="text-base font-bold text-white">Production Requirement Document (PRD)</h2>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {project.description}
                                </p>

                                <div className="space-y-2 pt-2">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Key Skills Mastered</h3>
                                    <ul className="space-y-1 text-xs">
                                        {project.keySkills?.map((skill, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                                                <span>{skill}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">All Milestones</h3>
                                    <div className="space-y-2">
                                        {project.milestones?.map((m, i) => (
                                            <div key={m.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                                                <span className="font-bold text-white">M{i + 1}: {m.title}</span>
                                                <span className="text-[11px] text-slate-400">{m.testCount} tests</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: HINTS */}
                        {specTab === "hints" && (
                            <div className="space-y-3 animate-in fade-in duration-200">
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <Sparkles size={16} className="text-amber-400" />
                                    <span>Engineering Hints & Walkthrough</span>
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Stuck? Use these architectural hints to unblock your implementation without giving away the entire solution.
                                </p>

                                <div className="space-y-2.5 pt-2">
                                    {milestoneGuide.hints?.map((hint, idx) => (
                                        <div key={idx} className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-200 leading-relaxed space-y-1">
                                            <div className="font-bold text-blue-300">Hint #{idx + 1}</div>
                                            <div>{hint}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </aside>

                {/* ---------------------------------------------------- */}
                {/* PANE 2 & 3: CODE EDITOR & LIVE TERMINAL (RIGHT/CENTER) */}
                {/* ---------------------------------------------------- */}
                <main className="flex-grow flex flex-col h-2/3 md:h-auto overflow-hidden bg-[#070A11]">
                    
                    {/* Interactive CodeStudio Editor */}
                    <div className="flex-grow flex flex-col overflow-hidden">
                        <CodeStudioEditor
                            files={files}
                            activeFileName={activeFileName}
                            onSelectFile={setActiveFileName}
                            onChangeCode={handleCodeChange}
                            onResetFile={handleResetFile}
                        />
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* PANE 3: INTEGRATED TERMINAL & TEST RUNNER DRAWER      */}
                    {/* ---------------------------------------------------- */}
                    <div className="h-64 sm:h-72 border-t border-white/10 bg-[#05070B] flex flex-col shrink-0">
                        
                        {/* Terminal Tab Bar */}
                        <div className="h-9 border-b border-white/10 bg-[#0A0E17] px-4 flex items-center justify-between">
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
                                        <span className={`px-1.5 py-0.2 rounded text-[10px] ${testResults.status === "passed" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>
                                            {testResults.passed || 0}/{milestoneGuide.testCases?.length || 4}
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
                                    <span>Console Terminal</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>microVM: Online</span>
                                </span>
                            </div>
                        </div>

                        {/* Terminal Body */}
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
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[11px] text-slate-400">
                                                <span>Test Suite: {milestoneGuide.title}</span>
                                                <span>Duration: {testResults.duration || "Running..."}</span>
                                            </div>

                                            {testResults.steps?.map((step, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                                        <span className="text-slate-200 font-bold">{step.name}</span>
                                                        <span className="text-slate-500 text-[11px]">{step.output}</span>
                                                    </div>
                                                    <span className="text-emerald-400 text-[11px]">{step.duration}</span>
                                                </div>
                                            ))}

                                            {testResults.status === "passed" && (
                                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 font-bold">
                                                        <CheckCircle2 size={16} />
                                                        <span>All {testResults.passed} tests passed! Milestone {currentMilestoneIndex + 1} complete.</span>
                                                    </div>
                                                    {currentMilestoneIndex + 1 < (project.milestones?.length || 5) && (
                                                        <button
                                                            onClick={() => {
                                                                setCurrentMilestoneIndex(prev => prev + 1);
                                                                setTestResults(null);
                                                            }}
                                                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
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
                                        <span className="text-emerald-400 font-bold">skillforge@microvm:~$</span>
                                        <input 
                                            type="text"
                                            value={terminalInput}
                                            onChange={(e) => setTerminalInput(e.target.value)}
                                            placeholder="Type command (test, git status, clear)..."
                                            className="flex-grow bg-transparent text-white focus:outline-none border-none font-mono text-xs"
                                        />
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>

                </main>

            </div>

            {/* ======================================================== */}
            {/* CELEBRATION MODAL ON MILESTONE COMPLETION                */}
            {/* ======================================================== */}
            <AnimatePresence>
                {showCelebration && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md p-6 rounded-3xl bg-[#090D16] border border-blue-500/30 text-white text-center space-y-5 shadow-2xl"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                                <Award size={32} className="text-white" />
                            </div>

                            <div className="space-y-1.5">
                                <h3 className="text-xl font-black">
                                    Milestone {currentMilestoneIndex + 1} Verified!
                                </h3>
                                <p className="text-xs text-slate-400">
                                    All automated test suites executed cleanly. Your progress has been committed to your active workspace build.
                                </p>
                            </div>

                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-mono flex items-center justify-between">
                                <span className="text-slate-400">Overall Progress</span>
                                <span className="text-cyan-400 font-bold">
                                    {Math.round(((currentMilestoneIndex + 1) / (project.milestones?.length || 5)) * 100)}%
                                </span>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setShowCelebration(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
                                >
                                    Stay on Milestone
                                </button>
                                {currentMilestoneIndex + 1 < (project.milestones?.length || 5) ? (
                                    <button
                                        onClick={() => {
                                            setShowCelebration(false);
                                            setCurrentMilestoneIndex(prev => prev + 1);
                                            setTestResults(null);
                                        }}
                                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                                    >
                                        <span>Next Milestone</span>
                                        <ChevronRight size={14} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setShowCelebration(false);
                                            navigate("/projects?tab=builds");
                                        }}
                                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                                    >
                                        View in Portfolio
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api";
import { 
    Search, 
    Filter, 
    Terminal, 
    Layers, 
    Cpu, 
    Globe, 
    Sparkles, 
    Sliders, 
    Clock, 
    Star, 
    Users, 
    ArrowRight, 
    CheckCircle2, 
    Flame,
    Code2,
    Play,
    GitBranch,
    Github,
    ExternalLink,
    Hammer,
    Check,
    RotateCcw,
    Zap,
    ShieldCheck,
    Award,
    ChevronRight,
    User
} from "lucide-react";
import NavBar from "../../components/NavBar";
import ProjectLaunchModal from "../../components/ProjectLaunchModal";
import { PROJECTS, PROJECT_TRACKS, DIFFICULTY_LEVELS } from "../../data/projectsData";

// Community project submissions & showcases
const COMMUNITY_SHOWCASE = [
    {
        id: "showcase-1",
        author: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        projectTitle: "Production Redis Clone in Rust",
        stars: 142,
        benchmarks: "128,000 req/sec • 1.2ms p99",
        githubUrl: "https://github.com",
        highlights: "Implemented multi-threaded epoll I/O loop with zero memory allocations on GET commands.",
        badge: "Top Architecture"
    },
    {
        id: "showcase-2",
        author: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
        projectTitle: "Real-Time Collaborative Canvas (CRDTs)",
        stars: 98,
        benchmarks: "60 FPS • 50 concurrent cursors",
        githubUrl: "https://github.com",
        highlights: "Built custom fractional indexing algorithm to eliminate conflict resolution server latency.",
        badge: "Staff Pick"
    },
    {
        id: "showcase-3",
        author: "Marcus Thorne",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        projectTitle: "Distributed Job Scheduler with Raft Consensus",
        stars: 76,
        benchmarks: "Zero data loss under simulated partition",
        githubUrl: "https://github.com",
        highlights: "Added automated heartbeats with jittered election timeouts matching HashiCorp Nomad specs.",
        badge: "Systems Master"
    }
];

export default function ProjectsGallery() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get("tab") || "specs";

    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    // Load active user builds only if authenticated
    const [userBuilds, setUserBuilds] = useState(() => {
        if (!isLoggedIn) return [];
        try {
            const saved = localStorage.getItem("skillforge_user_builds");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Synchronize user builds with backend database
    useEffect(() => {
        if (!isLoggedIn) return;
        api.get("/projects/builds")
            .then(res => {
                if (res.data?.builds && Array.isArray(res.data.builds) && res.data.builds.length > 0) {
                    const mapped = res.data.builds.map(b => ({
                        id: b.projectId,
                        projectId: b.projectId,
                        title: b.projectTitle || b.projectId,
                        track: b.track || "Systems",
                        currentMilestone: b.currentMilestone || 1,
                        totalMilestones: 5,
                        percent: b.percent || 0,
                        branch: "main",
                        lastActivity: new Date(b.lastActive || Date.now()).toLocaleDateString(),
                        status: b.status === "completed" ? "Verified" : "Active Runtime",
                        tech: []
                    }));
                    setUserBuilds(mapped);
                }
            })
            .catch(() => { /* fallback to local storage */ });
    }, [isLoggedIn]);

    const setTab = (tab) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("tab", tab);
            return next;
        });
    };

    const handleStartProject = (project) => {
        if (!isLoggedIn) {
            toast.error("Please sign in to launch the workspace and track your progress", { icon: "🔒" });
            navigate("/login", { state: { from: `/projects/${project.id}/workspace` } });
            return;
        }

        setUserBuilds(prev => {
            const exists = prev.find(b => b.projectId === project.id);
            if (exists) return prev;
            const newBuild = {
                id: project.id,
                projectId: project.id,
                title: project.title,
                track: project.track,
                currentMilestone: 1,
                totalMilestones: project.milestones?.length || 5,
                percent: 0,
                testsPassed: 0,
                totalTests: project.milestones?.reduce((acc, m) => acc + (m.testCount || 0), 0) || 25,
                branch: "main",
                lastActivity: "Just now",
                status: "Active Runtime",
                tech: project.techStack
            };
            const updated = [newBuild, ...prev];
            try {
                localStorage.setItem("skillforge_user_builds", JSON.stringify(updated));
            } catch (e) {
                console.error("Failed to save build to localStorage", e);
            }
            return updated;
        });

        setActiveModalProject(project);
    };

    const [selectedTrack, setSelectedTrack] = useState("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeModalProject, setActiveModalProject] = useState(null);

    // Sandbox terminal state
    const [terminalLogs, setTerminalLogs] = useState([
        "skillforge-sandbox-daemon v2.4.0 started on x86_64-linux",
        "container: image sha256:7f49a2... mounted on /workspace",
        "environment ready. Select a verification harness below."
    ]);
    const [isRunningTests, setIsRunningTests] = useState(false);

    const handleRunTerminalCommand = (cmd) => {
        if (isRunningTests) return;
        setIsRunningTests(true);
        setTerminalLogs(prev => [...prev, `$ ${cmd}`, "Spawning test runner process..."]);

        setTimeout(() => {
            if (cmd === "npm test" || cmd === "cargo test") {
                setTerminalLogs(prev => [
                    ...prev,
                    "✓ Test suite 1: Connection & TCP Handshake (4/4 passed)",
                    "✓ Test suite 2: Binary Serialization (8/8 passed)",
                    "✓ Test suite 3: Thread-safe TTL Eviction (6/6 passed)",
                    "🎉 ALL 18 TESTS PASSED. Milestone 2 verified! Ready for Milestone 3."
                ]);
            } else if (cmd === "git status") {
                setTerminalLogs(prev => [
                    ...prev,
                    "On branch feat/exponential-backoff",
                    "Changes staged for commit:",
                    "  modified: internal/worker/pool.go",
                    "  modified: internal/queue/redis.go",
                    "working tree clean"
                ]);
            } else {
                setTerminalLogs(prev => [
                    ...prev,
                    "Execution finished with exit code 0 (24ms)"
                ]);
            }
            setIsRunningTests(false);
        }, 1200);
    };

    // Track icon lookup helper
    const getTrackIcon = (iconName) => {
        switch (iconName) {
            case "Cpu": return <Cpu size={14} />;
            case "Globe": return <Globe size={14} />;
            case "Sparkles": return <Sparkles size={14} />;
            case "Terminal": return <Terminal size={14} />;
            case "Sliders": return <Sliders size={14} />;
            default: return <Layers size={14} />;
        }
    };

    // Filter projects based on track, difficulty, and query
    const filteredProjects = useMemo(() => {
        return PROJECTS.filter(p => {
            const matchesTrack = selectedTrack === "all" || p.track === selectedTrack;
            const matchesDiff = selectedDifficulty === "all" || p.difficulty === selectedDifficulty;
            const matchesSearch = searchQuery.trim() === "" || 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesTrack && matchesDiff && matchesSearch;
        });
    }, [selectedTrack, selectedDifficulty, searchQuery]);

    const activeProjectFromBuild = (buildProjectId) => {
        return PROJECTS.find(p => p.id === buildProjectId) || PROJECTS[0];
    };

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-blue-600/30 selection:text-white">
            <NavBar />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[70vw] h-[350px] bg-blue-600/10 blur-[130px] rounded-full" />
                <div className="absolute top-[40rem] -right-32 w-[35vw] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
                
                {/* ======================================================== */}
                {/* 1. HERO SECTION                                         */}
                {/* ======================================================== */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
                        <div className="w-5 h-4 rounded bg-[#070A11] border border-blue-400/30 flex items-center justify-center shrink-0">
                            <img src="/images/code-anvil-logo.png" alt="Anvil" className="h-2.5 w-auto object-contain" />
                        </div>
                        <span>The Project Forge • Interactive Engineering Ecosystem</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                        Build Real Systems. <br className="hidden sm:inline" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400">
                            Not Just Syntax.
                        </span>
                    </h1>

                    <p className="text-brand-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        An autonomous engineering workspace. Build production distributed architectures from real PRDs, run automated test suites, and sync verified builds directly to your portfolio.
                    </p>
                </div>

                {/* ======================================================== */}
                {/* 2. STATS RIBBON                                         */}
                {/* ======================================================== */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm text-center">
                    <div className="p-3">
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">8</div>
                        <div className="text-xs text-brand-muted font-medium mt-1">Production Specs</div>
                    </div>
                    <div className="p-3 border-l border-brand-border">
                        <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">50+</div>
                        <div className="text-xs text-brand-muted font-medium mt-1">Automated Test Suites</div>
                    </div>
                    <div className="p-3 border-l border-brand-border">
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">100%</div>
                        <div className="text-xs text-brand-muted font-medium mt-1">Real-World Code</div>
                    </div>
                    <div className="p-3 border-l border-brand-border">
                        <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">GitHub</div>
                        <div className="text-xs text-brand-muted font-medium mt-1">One-Click Portfolio Sync</div>
                    </div>
                </div>

                {/* ======================================================== */}
                {/* 3. DEDICATED FORGE WORKSPACE TOOLBAR (CAPABILITY SWITCHER)*/}
                {/* ======================================================== */}
                <div className="flex items-center justify-center pt-2">
                    <div className="inline-flex p-1.5 rounded-2xl bg-brand-surface border border-brand-border shadow-sm gap-1.5 overflow-x-auto max-w-full">
                        {[
                            { id: "specs", label: "Engineering Specs", count: PROJECTS.length, icon: Layers },
                            { id: "builds", label: "My Active Builds", count: isLoggedIn ? userBuilds.length : 0, icon: Cpu },
                            { id: "sandbox", label: "Sandbox IDE", count: "Online", icon: Terminal },
                            { id: "showcase", label: "Showcase & Reviews", count: COMMUNITY_SHOWCASE.length, icon: Sparkles },
                        ].map(tab => {
                            const Icon = tab.icon;
                            const active = currentTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setTab(tab.id)}
                                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap ${
                                        active
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                            : "text-brand-muted hover:text-brand-text hover:bg-brand-elevated"
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                        active ? "bg-white/20 text-white font-black" : "bg-brand-elevated text-brand-muted"
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ======================================================== */}
                {/* TAB 1: ENGINEERING SPECS CATALOG                        */}
                {/* ======================================================== */}
                {currentTab === "specs" && (
                    <div className="space-y-10 animate-in fade-in duration-300">
                        
                        {/* Quick Resume Tray: ONLY renders if user is signed in AND has active builds */}
                        {isLoggedIn && userBuilds.length > 0 && (
                            <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-cyan-500/5 border border-blue-500/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        <Hammer size={14} />
                                        <span>In-Progress Workspaces ({userBuilds.length})</span>
                                    </div>
                                    <button 
                                        onClick={() => setTab("builds")}
                                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        <span>View All Builds</span>
                                        <ChevronRight size={13} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userBuilds.map(build => (
                                        <div 
                                            key={build.id}
                                            className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-between gap-4 shadow-sm hover:border-blue-500/40 transition-colors"
                                        >
                                            <div className="space-y-1.5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                                                        {build.branch}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {build.title}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-brand-muted">
                                                    <span>Milestone {build.currentMilestone}/{build.totalMilestones} ({build.percent}%)</span>
                                                    <span>•</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{build.testsPassed}/{build.totalTests} tests passed</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/projects/${build.projectId}/workspace`)}
                                                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 transition-all shadow-sm flex items-center gap-1.5"
                                            >
                                                <Play size={12} fill="currentColor" />
                                                <span>Resume</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search and Difficulty Filter Controls */}
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                                <div className="relative flex-grow max-w-md">
                                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input 
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, tech (Redis, Go, React, AST)..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-text placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                    <span className="text-xs text-brand-muted font-medium mr-1 hidden sm:inline">
                                        Difficulty:
                                    </span>
                                    {DIFFICULTY_LEVELS.map(diff => (
                                        <button
                                            key={diff.id}
                                            onClick={() => setSelectedDifficulty(diff.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                                selectedDifficulty === diff.id
                                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                                                    : "bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text"
                                            }`}
                                        >
                                            {diff.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Track Tabs */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-border">
                                {PROJECT_TRACKS.map(track => {
                                    const active = selectedTrack === track.id;
                                    return (
                                        <button
                                            key={track.id}
                                            onClick={() => setSelectedTrack(track.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                                                active
                                                    ? "bg-blue-600 text-white shadow-sm"
                                                    : "bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-elevated"
                                            }`}
                                        >
                                            {getTrackIcon(track.icon)}
                                            <span>{track.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Projects Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    <span>Available Engineering Specs</span>
                                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                                        {filteredProjects.length}
                                    </span>
                                </h3>
                            </div>

                            {filteredProjects.length === 0 ? (
                                <div className="text-center py-16 bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-sm">
                                    <Terminal size={36} className="mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Projects Match Your Filter</h4>
                                    <p className="text-sm text-brand-muted mb-4">Try clearing your search query or selecting "All Tracks".</p>
                                    <button
                                        onClick={() => { setSelectedTrack("all"); setSelectedDifficulty("all"); setSearchQuery(""); }}
                                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors shadow-sm"
                                    >
                                        Reset All Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProjects.map(project => (
                                        <div
                                            key={project.id}
                                            className="group relative flex flex-col justify-between rounded-3xl bg-brand-surface border border-brand-border hover:border-blue-500/50 p-6 transition-all duration-300 shadow-sm hover:shadow-lg dark:hover:shadow-[0_15px_35px_rgba(37,99,235,0.15)] overflow-hidden"
                                        >
                                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${project.colorTheme}`} />

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                                                        <Flame size={12} className="text-blue-500 dark:text-blue-400" />
                                                        <span>{project.badge}</span>
                                                    </span>

                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                                                        project.difficulty === "advanced" 
                                                            ? "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30" 
                                                            : project.difficulty === "intermediate"
                                                            ? "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30"
                                                            : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                                                    }`}>
                                                        {project.difficulty}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                                                        {project.title}
                                                    </h4>
                                                    <p className="text-xs text-brand-muted mt-1.5 leading-relaxed line-clamp-2">
                                                        {project.tagline}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {project.techStack.map(tech => (
                                                        <span 
                                                            key={tech}
                                                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="pt-2 border-t border-brand-border/60 space-y-1.5">
                                                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                                        <span>Milestones</span>
                                                        <span className="text-blue-600 dark:text-blue-400 font-bold">{project.milestones.length} Steps</span>
                                                    </div>
                                                    <ul className="space-y-1 text-xs text-brand-muted">
                                                        {project.milestones.slice(0, 2).map((m) => (
                                                            <li key={m.id} className="flex items-center gap-1.5 truncate">
                                                                <CheckCircle2 size={12} className="text-emerald-500 dark:text-slate-500 shrink-0" />
                                                                <span className="truncate text-slate-700 dark:text-slate-300">{m.title}</span>
                                                            </li>
                                                        ))}
                                                        {project.milestones.length > 2 && (
                                                            <li className="text-[11px] text-slate-400 dark:text-slate-500 italic pl-4">
                                                                + {project.milestones.length - 2} more architectural steps
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="pt-6 mt-6 border-t border-brand-border/60 flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-xs text-brand-muted font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={13} className="text-slate-400 dark:text-slate-500" />
                                                        <span>{project.timeEstimate}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users size={13} className="text-slate-400 dark:text-slate-500" />
                                                        <span>{project.popularity.toLocaleString()}</span>
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => handleStartProject(project)}
                                                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2.5 active:scale-95 group/btn"
                                                >
                                                    <div className="w-6 h-5 rounded-md bg-[#070A11] border border-blue-400/40 flex items-center justify-center shrink-0 shadow-sm group-hover/btn:border-cyan-300 transition-colors">
                                                        <img 
                                                            src="/images/code-anvil-logo.png" 
                                                            alt="The Code Anvil" 
                                                            className="h-3 w-auto object-contain drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]" 
                                                        />
                                                    </div>
                                                    <span>Start Project</span>
                                                    <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* ======================================================== */}
                {/* TAB 2: MY ACTIVE BUILDS (DEDICATED WORKSPACE MANAGER)    */}
                {/* ======================================================== */}
                {currentTab === "builds" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Build Workspaces</h3>
                                <p className="text-xs sm:text-sm text-brand-muted">Resume container environments and push code to your verified portfolio.</p>
                            </div>
                            <button
                                onClick={() => setTab("specs")}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-sm"
                            >
                                <Play size={13} fill="currentColor" />
                                <span>Start New Build from Specs</span>
                            </button>
                        </div>

                        {!isLoggedIn ? (
                            <div className="py-16 px-6 rounded-3xl bg-brand-surface border border-brand-border text-center space-y-6 max-w-xl mx-auto shadow-sm">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                                    <ShieldCheck size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Sign In to Save Your Workspaces
                                    </h4>
                                    <p className="text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
                                        Your container builds, milestone test verifications, and custom code commits are tied to your SkillForge account. Sign in to start or resume your active builds.
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-3 pt-2">
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => navigate("/signup")}
                                        className="px-6 py-2.5 rounded-xl bg-brand-elevated hover:bg-brand-surface border border-brand-border text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                                    >
                                        Create Free Account
                                    </button>
                                </div>
                            </div>
                        ) : userBuilds.length === 0 ? (
                            <div className="py-16 px-6 rounded-3xl bg-brand-surface border border-brand-border text-center space-y-6 max-w-xl mx-auto shadow-sm">
                                <div className="w-16 h-16 rounded-2xl bg-brand-elevated border border-brand-border text-brand-muted mx-auto flex items-center justify-center">
                                    <Layers size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                                        No Active Builds Yet
                                    </h4>
                                    <p className="text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
                                        You don't have any ongoing builds. Pick an engineering specification from our catalog to launch your first cloud sandbox.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={() => setTab("specs")}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2"
                                    >
                                        <Play size={13} fill="currentColor" />
                                        <span>Browse Engineering Specs</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {userBuilds.map(build => (
                                    <div 
                                        key={build.id}
                                        className="p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-sm hover:border-blue-500/40 transition-all space-y-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
                                                        {build.status}
                                                    </span>
                                                    <span className="text-xs text-brand-muted font-mono flex items-center gap-1">
                                                        <GitBranch size={12} /> {build.branch}
                                                    </span>
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {build.title}
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {build.tech.map(t => (
                                                        <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-elevated text-brand-muted border border-brand-border">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <button
                                                    onClick={() => navigate(`/projects/${build.projectId}/workspace`)}
                                                    className="px-4 py-2.5 rounded-xl bg-brand-elevated hover:bg-brand-surface border border-brand-border text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
                                                >
                                                    <Terminal size={14} className="text-blue-500" />
                                                    <span>Open Terminal</span>
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/projects/${build.projectId}/workspace`)}
                                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                                                >
                                                    <Play size={13} fill="currentColor" />
                                                    <span>Resume Workspace</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress Bar & Test Suite Breakdown */}
                                        <div className="pt-4 border-t border-brand-border/60 space-y-2">
                                            <div className="flex items-center justify-between text-xs font-mono">
                                                <span className="text-slate-500 dark:text-slate-400">Milestone {build.currentMilestone} of {build.totalMilestones} Completed</span>
                                                <span className="text-blue-600 dark:text-blue-400 font-bold">{build.percent}% Overall Progress</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                                                    style={{ width: `${build.percent}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-brand-muted pt-1">
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> {build.testsPassed} of {build.totalTests} automated test harnesses verified
                                                </span>
                                                <span>Last modified {build.lastActivity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ======================================================== */}
                {/* TAB 3: IN-BROWSER SANDBOX IDE & COMPILER RUNTIME         */}
                {/* ======================================================== */}
                {currentTab === "sandbox" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Terminal size={20} className="text-blue-500" />
                                    <span>Compiler Runtime & In-Browser Sandbox</span>
                                </h3>
                                <p className="text-xs sm:text-sm text-brand-muted">Isolated Linux microVM container running live automated test runners.</p>
                            </div>
                            <button
                                onClick={() => navigate('/projects/redis-clone/workspace')}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
                            >
                                <Play size={13} fill="currentColor" />
                                <span>Launch Full Workspace</span>
                            </button>
                        </div>

                        {/* Interactive Sandbox Terminal */}
                        <div className="rounded-3xl bg-[#070A11] border border-blue-500/30 overflow-hidden shadow-2xl text-slate-200">
                            
                            {/* Terminal Top Bar */}
                            <div className="p-4 bg-[#0A0E17] border-b border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                                        <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                                        <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                                    </div>
                                    <span className="text-slate-400 font-bold">skillforge-container: x86_64 Linux 6.6</span>
                                </div>

                                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>Status: Connected</span>
                                    </span>
                                    <span>RAM: 2.1 / 8.0 GB</span>
                                    <span>CPU: 4 vCPUs</span>
                                </div>
                            </div>

                            {/* Quick Test Command Buttons */}
                            <div className="p-3 bg-white/5 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs font-mono">
                                <span className="text-slate-400 text-[11px] uppercase mr-1">Quick Commands:</span>
                                {[
                                    { label: "npm test", cmd: "npm test" },
                                    { label: "cargo test", cmd: "cargo test" },
                                    { label: "git status", cmd: "git status" },
                                    { label: "clear logs", cmd: "clear" }
                                ].map(c => (
                                    <button
                                        key={c.label}
                                        disabled={isRunningTests}
                                        onClick={() => {
                                            if (c.cmd === "clear") {
                                                setTerminalLogs(["skillforge-sandbox ready."]);
                                            } else {
                                                handleRunTerminalCommand(c.cmd);
                                            }
                                        }}
                                        className="px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-cyan-300 transition-colors shrink-0 disabled:opacity-50"
                                    >
                                        $ {c.label}
                                    </button>
                                ))}
                            </div>

                            {/* Terminal Output Logs */}
                            <div className="p-6 font-mono text-xs space-y-2 min-h-[260px] max-h-[420px] overflow-y-auto selection:bg-blue-500/40">
                                {terminalLogs.map((log, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`flex items-start gap-2 ${
                                            log.startsWith("✓") 
                                                ? "text-emerald-400 font-bold" 
                                                : log.startsWith("🎉")
                                                ? "text-cyan-300 font-black"
                                                : log.startsWith("$")
                                                ? "text-blue-400 font-bold"
                                                : "text-slate-300"
                                        }`}
                                    >
                                        <span className="text-slate-600 select-none">&gt;</span>
                                        <span>{log}</span>
                                    </div>
                                ))}
                                {isRunningTests && (
                                    <div className="flex items-center gap-2 text-cyan-400 animate-pulse pt-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                        <span>Running milestone test assertions...</span>
                                    </div>
                                )}
                            </div>

                            {/* Terminal Footer */}
                            <div className="p-3 bg-[#0A0E17] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                <span>WebSocket channel: wss://forge.skillforge.dev/runtime/v1</span>
                                <span>Latency: 14ms</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* TAB 4: COMMUNITY SHOWCASE & PEER REVIEWS                 */}
                {/* ======================================================== */}
                {currentTab === "showcase" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles size={20} className="text-blue-500" />
                                    <span>Community Project Showcase</span>
                                </h3>
                                <p className="text-xs sm:text-sm text-brand-muted">Top verified architectures built by SkillForge engineers. Explore code and benchmarks.</p>
                            </div>
                            <button
                                onClick={() => alert("Submit Project: Once your test suite hits 100% pass rate, your repo is automatically eligible for the community leaderboard!")}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <Award size={14} />
                                <span>Submit Build for Review</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {COMMUNITY_SHOWCASE.map(item => (
                                <div
                                    key={item.id}
                                    className="p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-sm hover:border-blue-500/40 transition-all space-y-4 flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold uppercase">
                                                {item.badge}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-500">
                                                <Star size={13} fill="currentColor" />
                                                <span>{item.stars}</span>
                                            </span>
                                        </div>

                                        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                                            {item.projectTitle}
                                        </h4>

                                        <p className="text-xs text-brand-muted leading-relaxed">
                                            {item.highlights}
                                        </p>

                                        <div className="p-2.5 rounded-xl bg-brand-elevated border border-brand-border font-mono text-[11px] text-blue-600 dark:text-cyan-300">
                                            ⚡ {item.benchmarks}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <img 
                                                src={item.avatar} 
                                                alt={item.author} 
                                                className="w-6 h-6 rounded-full object-cover border border-brand-border"
                                            />
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{item.author}</span>
                                        </div>

                                        <a 
                                            href={item.githubUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"
                                        >
                                            <Github size={13} />
                                            <span>View Code</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* Launch Workspace & Logo Transition Modal */}
            <ProjectLaunchModal
                project={activeModalProject}
                isOpen={!!activeModalProject}
                onClose={() => setActiveModalProject(null)}
            />

        </div>
    );
}

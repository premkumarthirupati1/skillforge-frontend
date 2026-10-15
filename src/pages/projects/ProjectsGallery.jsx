import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    Play
} from "lucide-react";
import NavBar from "../../components/NavBar";
import ProjectLaunchModal from "../../components/ProjectLaunchModal";
import { PROJECTS, PROJECT_TRACKS, DIFFICULTY_LEVELS } from "../../data/projectsData";

export default function ProjectsGallery() {
    const [selectedTrack, setSelectedTrack] = useState("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeModalProject, setActiveModalProject] = useState(null);

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

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-blue-600/30 selection:text-white">
            <NavBar />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[70vw] h-[350px] bg-blue-600/10 blur-[130px] rounded-full" />
                <div className="absolute top-[40rem] -right-32 w-[35vw] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
                
                {/* ======================================================== */}
                {/* 1. HERO SECTION                                         */}
                {/* ======================================================== */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
                        <div className="w-5 h-4 rounded bg-[#070A11] border border-blue-400/30 flex items-center justify-center shrink-0">
                            <img src="/images/code-anvil-logo.png" alt="Anvil" className="h-2.5 w-auto object-contain" />
                        </div>
                        <span>The Project Forge • Interactive Engineering</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                        Build Real Systems. <br className="hidden sm:inline" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                            Not Just Syntax.
                        </span>
                    </h1>

                    <p className="text-brand-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Graduate from tutorial hell. Work like an engineer at top tech companies with real architectural PRDs, automated test suites, and in-browser sandboxing.
                    </p>
                </div>

                {/* ======================================================== */}
                {/* 2. STATS & ARCHITECTURAL HIGHLIGHTS RIBBON              */}
                {/* ======================================================== */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-brand-surface/60 border border-brand-border backdrop-blur-sm text-center">
                    <div className="p-3">
                        <div className="text-2xl sm:text-3xl font-black text-white">8</div>
                        <div className="text-xs text-brand-muted font-medium mt-1">Production Specs</div>
                    </div>
                    <div className="p-3 border-l border-brand-border/60">
                        <div className="text-2xl sm:text-3xl font-black text-blue-400">50+</div>
                        <div className="text-xs text-brand-muted font-medium mt-1">Automated Test Suites</div>
                    </div>
                    <div className="p-3 border-l border-brand-border/60">
                        <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
                        <div className="text-xs text-brand-muted font-medium mt-1">Real-World Code</div>
                    </div>
                    <div className="p-3 border-l border-brand-border/60">
                        <div className="text-2xl sm:text-3xl font-black text-emerald-400">GitHub</div>
                        <div className="text-xs text-brand-muted font-medium mt-1">One-Click Portfolio Sync</div>
                    </div>
                </div>

                {/* ======================================================== */}
                {/* 3. TRACK & DIFFICULTY FILTER BAR + SEARCH               */}
                {/* ======================================================== */}
                <div className="space-y-4">
                    
                    {/* Search and Difficulty Header Row */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        
                        {/* Search Bar */}
                        <div className="relative flex-grow max-w-md">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, tech (Redis, Go, React, AST)..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-text placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Difficulty Dropdown / Level Pills */}
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
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text"
                                    }`}
                                >
                                    {diff.label}
                                </button>
                            ))}
                        </div>

                    </div>

                    {/* Track Tabs Row */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-border/60">
                        {PROJECT_TRACKS.map(track => {
                            const active = selectedTrack === track.id;
                            return (
                                <button
                                    key={track.id}
                                    onClick={() => setSelectedTrack(track.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                                        active
                                            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                            : "bg-brand-surface/70 border border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-surface"
                                    }`}
                                >
                                    {getTrackIcon(track.icon)}
                                    <span>{track.label}</span>
                                </button>
                            );
                        })}
                    </div>

                </div>

                {/* ======================================================== */}
                {/* 4. PROJECT CARDS GRID                                   */}
                {/* ======================================================== */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                            <span>Available Engineering Specs</span>
                            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                                {filteredProjects.length}
                            </span>
                        </h3>
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-16 bg-brand-surface/40 border border-brand-border rounded-3xl p-8">
                            <Terminal size={36} className="mx-auto text-slate-500 mb-3" />
                            <h4 className="text-lg font-bold text-white mb-1">No Projects Match Your Filter</h4>
                            <p className="text-sm text-brand-muted mb-4">Try clearing your search query or selecting "All Tracks".</p>
                            <button
                                onClick={() => { setSelectedTrack("all"); setSelectedDifficulty("all"); setSearchQuery(""); }}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map(project => (
                                <div
                                    key={project.id}
                                    className="group relative flex flex-col justify-between rounded-3xl bg-brand-surface/80 border border-brand-border hover:border-blue-500/40 p-6 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(37,99,235,0.15)] overflow-hidden"
                                >
                                    {/* Subtle Top Gradient Bar */}
                                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${project.colorTheme}`} />

                                    <div className="space-y-4">
                                        
                                        {/* Card Top Row: Badge & Level */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                                                <Flame size={12} className="text-blue-400" />
                                                <span>{project.badge}</span>
                                            </span>

                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                                                project.difficulty === "advanced" 
                                                    ? "text-purple-400 bg-purple-500/10 border-purple-500/30" 
                                                    : project.difficulty === "intermediate"
                                                    ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
                                                    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                                            }`}>
                                                {project.difficulty}
                                            </span>
                                        </div>

                                        {/* Project Title & Tagline */}
                                        <div>
                                            <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                                                {project.title}
                                            </h4>
                                            <p className="text-xs text-brand-muted mt-1.5 leading-relaxed line-clamp-2">
                                                {project.tagline}
                                            </p>
                                        </div>

                                        {/* Tech Stack Chips */}
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {project.techStack.map(tech => (
                                                <span 
                                                    key={tech}
                                                    className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] font-mono text-slate-300 border border-white/5"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Key Milestones List */}
                                        <div className="pt-2 border-t border-brand-border/40 space-y-1.5">
                                            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                                <span>Milestones</span>
                                                <span className="text-blue-400">{project.milestones.length} Steps</span>
                                            </div>
                                            <ul className="space-y-1 text-xs text-brand-muted">
                                                {project.milestones.slice(0, 2).map((m, idx) => (
                                                    <li key={m.id} className="flex items-center gap-1.5 truncate">
                                                        <CheckCircle2 size={12} className="text-slate-500 shrink-0" />
                                                        <span className="truncate">{m.title}</span>
                                                    </li>
                                                ))}
                                                {project.milestones.length > 2 && (
                                                    <li className="text-[11px] text-slate-500 italic pl-4">
                                                        + {project.milestones.length - 2} more architectural steps
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                    </div>

                                    {/* Bottom Meta & Action */}
                                    <div className="pt-6 mt-6 border-t border-brand-border/60 flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-xs text-brand-muted font-medium">
                                            <span className="flex items-center gap-1">
                                                <Clock size={13} className="text-slate-500" />
                                                <span>{project.timeEstimate}</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={13} className="text-slate-500" />
                                                <span>{project.popularity.toLocaleString()}</span>
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => setActiveModalProject(project)}
                                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2.5 active:scale-95 group/btn"
                                        >
                                            {/* High-contrast dark chip ensures white anvil and electric blue bracket NEVER mix with the button */}
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

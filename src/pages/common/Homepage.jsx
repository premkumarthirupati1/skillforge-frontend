import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../../components/NavBar";
import SkillForgeLogo from "../../components/SkillForgeLogo";
import api from "../../api";
import StarRating from "../../components/StarRating";
import { getImageUrl } from "../../utils/imageHelper";
import {
    ArrowRight,
    ArrowUpRight,
    Terminal,
    Layers,
    Cpu,
    Server,
    Smartphone,
    Shield,
    CheckCircle2,
    Sparkles,
    Check,
    Copy,
    Code2,
    Play,
    Zap,
    BookOpen,
    Sliders,
    Volume2,
    Database,
    Network,
    GitBranch,
    RefreshCw,
    ExternalLink
} from "lucide-react";

export default function HomePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Course catalog state
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    // Interactive workspace preview state
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [testRunStatus, setTestRunStatus] = useState("passed"); // "running" | "passed"
    const [copiedPreviewCode, setCopiedPreviewCode] = useState(false);

    // Fetch featured courses from API
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/course/public');
                const data = Array.isArray(res.data) ? res.data : (res.data?.result || res.data?.courses || []);
                setCourses(data);
            } catch (err) {
                console.debug("Featured courses remote fetch fallback:", err.message);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    // Guaranteed high-quality fallback courses if API returns empty/offline
    const fallbackFeaturedCourses = [
        {
            _id: "course-node-mastery",
            title: "Node.js Mastery",
            difficulty: "ADVANCED",
            description: "Build robust backend applications, RESTful microservices, and high-concurrency event loops with Node.js and Express.",
            price: 2499,
            currency: "₹",
            averageRating: 4.9,
            reviewCount: 248,
            duration: "18 hrs",
            lessonsCount: 42,
            instructorName: "Arun Verma",
            instructorRole: "Principal Backend Engineer",
            category: "Backend Engineering",
            tags: ["Node.js", "Express", "Microservices", "REST APIs"],
            gradient: "from-emerald-600/30 via-teal-900/20 to-slate-950",
            icon: Server
        },
        {
            _id: "course-fullstack-dev",
            title: "Full-Stack Development",
            difficulty: "INTERMEDIATE",
            description: "Build complete modern web applications from frontend UI in React to scalable relational databases in PostgreSQL.",
            price: 3199,
            currency: "₹",
            averageRating: 4.8,
            reviewCount: 312,
            duration: "26 hrs",
            lessonsCount: 64,
            instructorName: "Sarah Chen",
            instructorRole: "Senior Full-Stack Architect",
            category: "Full-Stack Web",
            tags: ["React", "TypeScript", "Node.js", "PostgreSQL"],
            gradient: "from-blue-600/30 via-indigo-900/20 to-slate-950",
            icon: Terminal
        },
        {
            _id: "course-system-design",
            title: "Distributed Systems & Cloud Architecture",
            difficulty: "ADVANCED",
            description: "Master consensus algorithms, horizontal scaling, partition tolerance, caching topologies, and event-driven architecture.",
            price: 3999,
            currency: "₹",
            averageRating: 5.0,
            reviewCount: 185,
            duration: "22 hrs",
            lessonsCount: 48,
            instructorName: "Marcus Thorne",
            instructorRole: "Distinguished Systems Architect",
            category: "System Design",
            tags: ["Distributed Systems", "Kubernetes", "Kafka", "Docker"],
            gradient: "from-purple-600/30 via-violet-900/20 to-slate-950",
            icon: Layers
        }
    ];

    // Merge fetched courses with fallback to guarantee clean, non-blank cards
    const displayCourses = courses.length > 0 ? courses.slice(0, 3) : fallbackFeaturedCourses;

    // Interactive product preview trigger simulation
    const handleReRunPreviewTests = () => {
        setTestRunStatus("running");
        setIsPlayingPreview(true);
        setTimeout(() => {
            setTestRunStatus("passed");
            setIsPlayingPreview(false);
        }, 1200);
    };

    const previewCodeSnippet = `import { createAudioGraph } from "@skillforge/audio";

export function playSequence(bpm = 120, steps = 16) {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // 1. Build oscillator & gain audio graph
    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(ctx.destination);

    // 2. Schedule frequency automation
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.start();
    return { active: true, nodes: 3 };
}

// 3. Verify audio graph & automated assertions
await runTests();`;

    const handleCopyPreviewCode = () => {
        navigator.clipboard.writeText(previewCodeSnippet);
        setCopiedPreviewCode(true);
        setTimeout(() => setCopiedPreviewCode(false), 2000);
    };

    // Six curated learning paths (Part 6)
    const learningPaths = [
        {
            id: "fullstack",
            title: "Full-Stack Development",
            description: "React, Node.js, databases and APIs",
            icon: Terminal,
            path: "/courses?search=fullstack",
            color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
        },
        {
            id: "ai-ml",
            title: "AI & Machine Learning",
            description: "ML concepts, models and AI applications",
            icon: Cpu,
            path: "/courses?search=ai",
            color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
        },
        {
            id: "system-design",
            title: "System Design",
            description: "Architecture, scalability and distributed systems",
            icon: Layers,
            path: "/courses?search=design",
            color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
        },
        {
            id: "cloud-devops",
            title: "Cloud & DevOps",
            description: "Deployment, infrastructure and automation",
            icon: Server,
            path: "/courses?search=cloud",
            color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
        },
        {
            id: "mobile",
            title: "Mobile Engineering",
            description: "Modern mobile application development",
            icon: Smartphone,
            path: "/courses?search=mobile",
            color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
        },
        {
            id: "cybersecurity",
            title: "Cybersecurity",
            description: "Security principles and defensive engineering",
            icon: Shield,
            path: "/courses?search=security",
            color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
        }
    ];

    // Three featured real engineering projects (Part 7)
    const featuredProjects = [
        {
            id: "audio-synthesizer",
            title: "Web Audio Synthesizer",
            difficulty: "Advanced",
            difficultyColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
            description: "Build an interactive audio engine, oscillator graph, and step sequencer.",
            tags: ["JavaScript", "Web Audio API", "Automated tests"],
            language: "JavaScript",
            track: "Creative Engineering",
            route: "/projects/audio-synthesizer",
            accent: "from-pink-500/20 via-purple-500/10 to-transparent",
            icon: Volume2
        },
        {
            id: "redis-clone",
            title: "Build Your Own Redis Server",
            difficulty: "Advanced",
            difficultyColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
            description: "Implement RESP protocol parsing, TCP sockets, and concurrent in-memory storage.",
            tags: ["Rust / Go", "RESP Protocol", "TCP Sockets"],
            language: "Rust & Go",
            track: "Systems & Sockets",
            route: "/projects/redis-clone",
            accent: "from-blue-500/20 via-cyan-500/10 to-transparent",
            icon: Database
        },
        {
            id: "collaborative-canvas",
            title: "Real-Time Collaborative Canvas (CRDTs)",
            difficulty: "Intermediate",
            difficultyColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
            description: "Build multiplayer presence, fractional indexing, and zero-conflict canvas syncing.",
            tags: ["TypeScript", "WebSockets", "Canvas API"],
            language: "TypeScript",
            track: "Distributed Web",
            route: "/projects/collaborative-canvas",
            accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
            icon: Network
        }
    ];

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-500 flex flex-col font-sans relative overflow-x-hidden selection:bg-brand-primary/30">
            
            {/* ========================================================================= */}
            {/* PART 1 — NAVBAR                                                           */}
            {/* ========================================================================= */}
            <NavBar />

            {/* ========================================================================= */}
            {/* PART 2 — HERO SECTION                                                     */}
            {/* ========================================================================= */}
            <header className="relative pt-16 pb-14 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24 flex flex-col items-center justify-center text-center overflow-hidden border-b border-brand-border/60">
                
                {/* Subtle Ambient Background Grid & Restrained Blue Glow */}
                <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-25 pointer-events-none z-0" />
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] max-w-[900px] h-[450px] pointer-events-none z-0 opacity-25 dark:opacity-15 flex justify-center blur-[120px]">
                    <div className="w-[50%] h-full bg-blue-600/40 rounded-full mix-blend-screen" />
                    <div className="w-[40%] h-full bg-indigo-500/30 rounded-full mix-blend-screen -ml-20" />
                </div>

                <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6 sm:space-y-8">
                    
                    {/* Eyebrow Pill Badge: LEARN · PRACTISE · BUILD */}
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface/90 backdrop-blur-md border border-brand-border text-xs font-mono font-bold tracking-widest uppercase text-brand-muted shadow-sm hover:border-brand-primary/40 transition-colors"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span>LEARN · PRACTISE · BUILD</span>
                    </motion.div>

                    {/* Two-Line Headline */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl sm:text-6xl lg:text-7xl font-black text-brand-text leading-[1.08] tracking-tight drop-shadow-sm"
                    >
                        Forge the skills. <br />
                        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                            Build your future.
                        </span>
                    </motion.h1>

                    {/* Reduced Paragraph (Two lines on desktop) */}
                    <motion.p 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                        className="text-base sm:text-lg lg:text-xl text-brand-muted leading-relaxed max-w-2xl mx-auto font-normal"
                    >
                        Master in-demand technologies through expert-led courses, hands-on coding challenges, and real-world projects.
                    </motion.p>

                    {/* Primary & Secondary Action CTAs */}
                    <motion.div 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
                    >
                        {/* Primary Button: Explore courses ↗ */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/courses")}
                            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base transition-all shadow-[0_0_25px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 active:scale-95 shrink-0"
                        >
                            <span>Explore courses</span>
                            <ArrowUpRight size={17} />
                        </motion.button>

                        {/* Secondary Button: Enter workspace */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(token ? "/projects" : "/projects")}
                            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-surface/90 hover:bg-brand-elevated border border-brand-border hover:border-brand-primary/50 text-brand-text font-bold text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 shrink-0"
                        >
                            <span>Enter workspace</span>
                        </motion.button>
                    </motion.div>

                    {/* Three Micro-Highlights */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                        className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-3 text-xs sm:text-sm text-brand-muted font-medium"
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Expert-led courses</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>Hands-on coding</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>Real projects</span>
                        </div>
                    </motion.div>

                </div>
            </header>

            {/* ========================================================================= */}
            {/* PART 3 — PRODUCT PREVIEW: SHOW WHAT SKILLFORGE ACTUALLY DOES              */}
            {/* ========================================================================= */}
            <section className="py-14 sm:py-20 bg-gradient-to-b from-brand-bg via-brand-surface/30 to-brand-bg relative z-10 border-b border-brand-border/60">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    
                    {/* Section Eyebrow */}
                    <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold uppercase tracking-wider text-blue-500">
                            <Terminal size={13} />
                            <span>Inside SkillForge</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                            Interactive workspace
                        </h2>
                        <p className="text-sm sm:text-base text-brand-muted">
                            Work directly in a real compiler sandbox with automated tests, instant diagnostics, and architecture specifications.
                        </p>
                    </div>

                    {/* Realistic Editor Frame */}
                    <motion.div 
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6 }}
                        className="bg-[#090D16] border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden font-mono text-left"
                    >
                        {/* Editor Window Titlebar */}
                        <div className="px-4 py-3 bg-[#06080F] border-b border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
                                    skillforge-workspace · audio-sequencer
                                </span>
                            </div>

                            {/* Active Tab */}
                            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-md border border-slate-800 text-xs text-slate-300">
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">JS</span>
                                <span className="text-slate-200 font-semibold">sequencer.js</span>
                            </div>

                            {/* Copy & Re-run Action */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopyPreviewCode}
                                    className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
                                    title="Copy Code"
                                >
                                    {copiedPreviewCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                    <span className="hidden sm:inline">{copiedPreviewCode ? "Copied" : "Copy"}</span>
                                </button>
                                <button
                                    onClick={handleReRunPreviewTests}
                                    disabled={isPlayingPreview}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                                >
                                    <RefreshCw size={12} className={isPlayingPreview ? "animate-spin" : ""} />
                                    <span>Run Tests</span>
                                </button>
                            </div>
                        </div>

                        {/* Split Workspace View: Left Task Pane + Right Code Editor */}
                        <div className="grid md:grid-cols-12 min-h-[380px]">
                            
                            {/* Left: Spec / Task Pane */}
                            <div className="md:col-span-4 bg-[#080B14] p-5 sm:p-6 border-b md:border-b-0 md:border-r border-slate-800/80 space-y-5 font-sans">
                                <div>
                                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400 block mb-1">
                                        YOUR TASK
                                    </span>
                                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                        Build an audio sequencer
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        Implement the oscillator and audio graph according to the milestone spec.
                                    </p>
                                </div>

                                <div className="space-y-2.5 pt-2">
                                    <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                                        Verification Checklist
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5">
                                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                                            <span>Create audio nodes</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5">
                                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                                            <span>Implement sequencing</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5">
                                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                                            <span>Pass automated tests</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 text-[11px] text-slate-500 font-mono">
                                    Milestone 1 of 5 · Web Audio Engine
                                </div>
                            </div>

                            {/* Right: Code Editor Display */}
                            <div className="md:col-span-8 p-5 sm:p-6 bg-[#090D16] overflow-x-auto text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
                                <pre className="tab-4">
                                    <code>
{`// Inside SkillForge Interactive Workspace
import { createAudioGraph } from "@skillforge/audio";

export function playSequence(bpm = 120, steps = 16) {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // 1. Build oscillator & gain audio graph
    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(ctx.destination);

    // 2. Schedule frequency automation
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.start();
    return { active: true, nodes: 3 };
}

// 3. Automated test suite runner
await runTests();`}
                                    </code>
                                </pre>
                            </div>

                        </div>

                        {/* Bottom Status Drawer: Tests passed 4/4 */}
                        <div className="px-5 py-3 bg-[#06080F] border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    <span>{testRunStatus === "running" ? "Running verification..." : "Tests passed: 4/4"}</span>
                                </div>
                                <span className="text-slate-500 hidden md:inline">0ms latency · V8 Sandbox Engine</span>
                            </div>

                            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                                <span>Oscillator: Ready</span>
                                <span>Envelope: Verified</span>
                                <span className="text-blue-400 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/projects/audio-synthesizer")}>
                                    Open full project ↗
                                </span>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* PART 4 — FEATURED COURSES                                                 */}
            {/* ========================================================================= */}
            <section id="featured-courses" className="py-20 sm:py-28 max-w-7xl mx-auto px-6 relative z-10 w-full">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
                    <div className="max-w-2xl space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold uppercase tracking-wider text-blue-500">
                            <BookOpen size={13} />
                            <span>Catalog</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-text tracking-tight">
                            Featured courses
                        </h2>
                        <p className="text-base sm:text-lg text-brand-muted">
                            Learn from structured, practical courses.
                        </p>
                    </div>

                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors shrink-0 group"
                    >
                        <span>View all courses</span>
                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Course Grid with Guaranteed Thumbnail & Non-Blank Images */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayCourses.map((course, idx) => {
                        const difficulty = course.difficulty || "INTERMEDIATE";
                        const price = course.price !== undefined ? course.price : 2499;
                        const rating = course.averageRating || 4.9;
                        const reviews = course.reviewCount || 140 + idx * 80;
                        const fallbackGradient = fallbackFeaturedCourses[idx % fallbackFeaturedCourses.length].gradient;
                        const IconComponent = fallbackFeaturedCourses[idx % fallbackFeaturedCourses.length].icon;

                        return (
                            <motion.div
                                key={course._id || idx}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.45, delay: idx * 0.1 }}
                                whileHover={{ y: -6 }}
                                onClick={() => navigate(course._id.startsWith("course-") ? "/courses" : `/course/${course._id}`)}
                                className="group bg-brand-surface rounded-2xl border border-brand-border overflow-hidden transition-all duration-300 cursor-pointer hover:border-brand-primary/50 hover:shadow-xl hover:shadow-brand-primary/10 flex flex-col justify-between"
                            >
                                {/* Branded Cover Image Container (GUARANTEED NEVER BLANK) */}
                                <div className="h-52 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                                    
                                    {/* Ambient mesh gradient background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} opacity-80 group-hover:scale-105 transition-transform duration-500`} />
                                    
                                    {/* Grid background on cover */}
                                    <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

                                    {/* Actual thumbnail if available, with graceful error fallback */}
                                    {course.thumbnail ? (
                                        <img
                                            src={getImageUrl(course.thumbnail)}
                                            alt={course.title}
                                            className="w-full h-full object-cover relative z-10 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 space-y-2">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
                                                <IconComponent size={24} />
                                            </div>
                                            <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                                                {course.category || "Engineering Track"}
                                            </span>
                                        </div>
                                    )}

                                    {/* Difficulty Badge */}
                                    <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                                        {difficulty}
                                    </div>

                                    {/* Price Badge */}
                                    <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-md bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-600/40">
                                        {Number(price) === 0 ? "FREE" : `₹${price.toLocaleString()}`}
                                    </div>
                                </div>

                                {/* Course Content Card Body */}
                                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                                    
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors line-clamp-1">
                                            {course.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-brand-muted line-clamp-2 leading-relaxed">
                                            {course.description}
                                        </p>
                                    </div>

                                    {/* Rating & Duration */}
                                    <div className="flex items-center justify-between text-xs text-brand-muted pt-2 border-t border-brand-border/60">
                                        <div className="flex items-center gap-1.5">
                                            <StarRating rating={rating} readOnly size={12} />
                                            <span className="font-bold text-brand-text">{rating.toFixed(1)}</span>
                                            <span>({reviews})</span>
                                        </div>
                                        <span>{course.duration || "20 hrs"}</span>
                                    </div>

                                    {/* Course Action Link */}
                                    <div className="pt-2 flex items-center justify-between">
                                        <span className="text-xs text-brand-muted font-medium">
                                            {course.instructorName || "SkillForge Faculty"}
                                        </span>
                                        <span className="text-xs font-bold text-blue-500 group-hover:text-blue-400 flex items-center gap-1">
                                            Course details <ArrowUpRight size={13} />
                                        </span>
                                    </div>

                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* PART 5 — HOW SKILLFORGE WORKS (LEARN → PRACTISE → BUILD)                  */}
            {/* ========================================================================= */}
            <section className="py-20 sm:py-28 bg-brand-surface/40 relative z-10 border-y border-brand-border/60">
                <div className="max-w-6xl mx-auto px-6">
                    
                    {/* Section Header */}
                    <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold uppercase tracking-wider text-blue-500">
                            <span>The SkillForge Method</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-text tracking-tight">
                            How SkillForge works
                        </h2>
                        <p className="text-base sm:text-lg text-brand-muted">
                            Move beyond passive video watching with active compilation and verifiable feedback.
                        </p>
                    </div>

                    {/* Horizontal 3-Step Layout on Desktop with Connecting Line */}
                    <div className="relative">
                        
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] -translate-y-6 h-0.5 border-t-2 border-dashed border-brand-border pointer-events-none z-0" />

                        <div className="grid md:grid-cols-3 gap-8 sm:gap-12 relative z-10">
                            
                            {/* Step 01 / LEARN */}
                            <motion.div 
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-brand-bg rounded-2xl p-7 border border-brand-border shadow-sm flex flex-col space-y-4 hover:border-brand-primary/40 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold tracking-widest text-blue-500">
                                        01 / LEARN
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                                        1
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-brand-text">
                                    Learn with structure
                                </h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    Follow courses and learning paths that help you progress from fundamentals to advanced concepts.
                                </p>
                            </motion.div>

                            {/* Step 02 / PRACTISE */}
                            <motion.div 
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-brand-bg rounded-2xl p-7 border border-brand-border shadow-sm flex flex-col space-y-4 hover:border-brand-primary/40 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold tracking-widest text-indigo-500">
                                        02 / PRACTISE
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                                        2
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-brand-text">
                                    Apply what you learn
                                </h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    Solve coding challenges, implement requirements, and use tests to validate your work.
                                </p>
                            </motion.div>

                            {/* Step 03 / BUILD */}
                            <motion.div 
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-brand-bg rounded-2xl p-7 border border-brand-border shadow-sm flex flex-col space-y-4 hover:border-brand-primary/40 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold tracking-widest text-cyan-400">
                                        03 / BUILD
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                                        3
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-brand-text">
                                    Create real projects
                                </h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    Move beyond isolated exercises and apply your skills to larger engineering projects.
                                </p>
                            </motion.div>

                        </div>

                    </div>

                </div>
            </section>

            {/* ========================================================================= */}
            {/* PART 6 — EXPLORE LEARNING PATHS                                           */}
            {/* ========================================================================= */}
            <section className="py-20 sm:py-28 max-w-7xl mx-auto px-6 relative z-10 w-full">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
                    <div className="max-w-2xl space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold uppercase tracking-wider text-blue-500">
                            <Layers size={13} />
                            <span>Curated Curricula</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-text tracking-tight">
                            Choose your path
                        </h2>
                        <p className="text-base sm:text-lg text-brand-muted">
                            Find the skills you want to master.
                        </p>
                    </div>

                    <Link
                        to="/tracks"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors shrink-0 group"
                    >
                        <span>Explore all</span>
                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>

                {/* The 6 Curated Learning Paths Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {learningPaths.map((path, idx) => {
                        const Icon = path.icon;
                        return (
                            <motion.div
                                key={path.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-30px" }}
                                transition={{ duration: 0.4, delay: idx * 0.08 }}
                                whileHover={{ y: -5 }}
                                onClick={() => navigate(path.path)}
                                className="group p-7 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-brand-primary/5 min-h-[200px]"
                            >
                                <div className="space-y-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${path.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={22} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                                            {path.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                                            {path.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center gap-1 text-xs font-bold text-blue-500 group-hover:text-blue-400">
                                    <span>Explore path</span>
                                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </section>

            {/* ========================================================================= */}
            {/* PART 7 — FEATURED PROJECTS                                                */}
            {/* ========================================================================= */}
            <section className="py-20 sm:py-28 bg-brand-surface/40 relative z-10 border-t border-brand-border/60">
                <div className="max-w-7xl mx-auto px-6">
                    
                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
                        <div className="max-w-2xl space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold uppercase tracking-wider text-blue-500">
                                <Code2 size={13} />
                                <span>From concepts to creation</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-text tracking-tight">
                                Put your knowledge to work on practical builds.
                            </h2>
                        </div>

                        <Link
                            to="/projects"
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors shrink-0 group"
                        >
                            <span>All projects</span>
                            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>

                    {/* Featured Projects Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {featuredProjects.map((project, idx) => {
                            const Icon = project.icon;
                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.45, delay: idx * 0.12 }}
                                    whileHover={{ y: -6 }}
                                    onClick={() => navigate(project.route)}
                                    className="group bg-brand-bg rounded-2xl border border-brand-border overflow-hidden transition-all duration-300 cursor-pointer hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/10 flex flex-col justify-between"
                                >
                                    {/* Project Preview Header */}
                                    <div className="p-6 pb-4 bg-gradient-to-b from-slate-900 to-transparent relative border-b border-brand-border/40">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                                                <Icon size={20} />
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${project.difficultyColor}`}>
                                                {project.difficulty}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                                            {project.title}
                                        </h3>
                                    </div>

                                    {/* Description and Tech Tags */}
                                    <div className="p-6 pt-4 flex flex-col flex-grow justify-between space-y-4">
                                        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                                            {project.description}
                                        </p>

                                        {/* Technology Tags */}
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {project.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-[11px] font-mono text-slate-400"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Explore project link */}
                                        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                                            <span className="text-xs text-brand-muted font-mono">
                                                {project.language}
                                            </span>
                                            <span className="text-xs font-bold text-blue-500 group-hover:text-blue-400 flex items-center gap-1">
                                                Explore project <ArrowUpRight size={13} />
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* ========================================================================= */}
            {/* PART 8 — WHY SKILLFORGE?                                                  */}
            {/* ========================================================================= */}
            <section className="py-20 sm:py-28 max-w-6xl mx-auto px-6 relative z-10 w-full">
                
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-text tracking-tight">
                        A better way to develop your skills
                    </h2>
                </div>

                {/* Three Benefits */}
                <div className="grid md:grid-cols-3 gap-8">
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="p-8 rounded-2xl bg-brand-surface border border-brand-border space-y-3 shadow-sm hover:border-brand-primary/40 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                            <BookOpen size={22} />
                        </div>
                        <h3 className="text-xl font-bold text-brand-text">
                            Structured learning
                        </h3>
                        <p className="text-sm text-brand-muted leading-relaxed">
                            Courses and paths designed around clear learning goals.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="p-8 rounded-2xl bg-brand-surface border border-brand-border space-y-3 shadow-sm hover:border-brand-primary/40 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                            <Code2 size={22} />
                        </div>
                        <h3 className="text-xl font-bold text-brand-text">
                            Hands-on practice
                        </h3>
                        <p className="text-sm text-brand-muted leading-relaxed">
                            Work with code, challenges, and automated feedback.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="p-8 rounded-2xl bg-brand-surface border border-brand-border space-y-3 shadow-sm hover:border-brand-primary/40 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                            <Zap size={22} />
                        </div>
                        <h3 className="text-xl font-bold text-brand-text">
                            Practical projects
                        </h3>
                        <p className="text-sm text-brand-muted leading-relaxed">
                            Apply your knowledge to meaningful engineering work.
                        </p>
                    </motion.div>

                </div>

            </section>

            {/* ========================================================================= */}
            {/* PART 9 — FINAL CALL TO ACTION                                             */}
            {/* ========================================================================= */}
            <section className="py-24 sm:py-32 relative overflow-hidden bg-[#070A12] border-t border-brand-border/60">
                
                {/* Background Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-[#070A12] to-indigo-950/40 pointer-events-none" />
                <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto px-6 relative z-10 text-center space-y-6"
                >
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 block">
                        YOUR NEXT CHAPTER STARTS HERE
                    </span>

                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                        Learn something. Build something.
                    </h2>

                    <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
                        Choose your next course, sharpen your skills, and turn what you learn into something real.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => navigate("/courses")}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 active:scale-95"
                        >
                            <span>Explore courses</span>
                            <ArrowUpRight size={18} />
                        </button>
                        <button
                            onClick={() => navigate(token ? "/projects" : "/projects")}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold text-base transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <span>Enter workspace</span>
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* ========================================================================= */}
            {/* PART 10 — FOOTER                                                          */}
            {/* ========================================================================= */}
            <footer className="bg-brand-bg border-t border-brand-border py-16 text-brand-muted text-sm font-sans">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-brand-border/60">
                        
                        {/* Brand Column */}
                        <div className="col-span-2 space-y-4">
                            <SkillForgeLogo size="md" />
                            <p className="text-sm text-brand-muted leading-relaxed max-w-sm">
                                Learn, practise, and build with purpose.
                            </p>
                        </div>

                        {/* Column 1: Learn */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-text">
                                Learn
                            </h4>
                            <ul className="space-y-2 text-xs sm:text-sm">
                                <li>
                                    <Link to="/courses" className="hover:text-brand-text transition-colors">Courses</Link>
                                </li>
                                <li>
                                    <Link to="/tracks" className="hover:text-brand-text transition-colors">Learning paths</Link>
                                </li>
                                <li>
                                    <Link to="/challenges" className="hover:text-brand-text transition-colors">Challenges</Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 2: Platform */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-text">
                                Platform
                            </h4>
                            <ul className="space-y-2 text-xs sm:text-sm">
                                <li>
                                    <Link to="/projects" className="hover:text-brand-text transition-colors">Projects</Link>
                                </li>
                                <li>
                                    <Link to="/community" className="hover:text-brand-text transition-colors">Community</Link>
                                </li>
                                <li>
                                    <Link to="/help" className="hover:text-brand-text transition-colors">Help and support</Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Company & Legal */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-text">
                                Company
                            </h4>
                            <ul className="space-y-2 text-xs sm:text-sm">
                                <li>
                                    <Link to="/about" className="hover:text-brand-text transition-colors">About</Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="hover:text-brand-text transition-colors">Contact</Link>
                                </li>
                                <li className="pt-2">
                                    <span className="text-[11px] font-mono uppercase tracking-wider text-brand-subtle block mb-1">Legal</span>
                                    <div className="space-y-1.5">
                                        <div><Link to="/privacy" className="hover:text-brand-text transition-colors">Privacy policy</Link></div>
                                        <div><Link to="/terms" className="hover:text-brand-text transition-colors">Terms and conditions</Link></div>
                                        <div><Link to="/refund" className="hover:text-brand-text transition-colors">Refund policy</Link></div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Bottom Copyright */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
                        <p>© 2026 SkillForge. All rights reserved.</p>
                        <p className="text-brand-subtle">Engineered for serious software developers.</p>
                    </div>
                </div>
            </footer>

        </div>
    );
}

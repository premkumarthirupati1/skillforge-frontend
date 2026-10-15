import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NavBar from "../components/NavBar";
import api from "../api";
import StarRating from "../components/StarRating";
import { getImageUrl } from "../utils/imageHelper";
import {
    ArrowRight,
    Terminal,
    Layers,
    Cpu,
    Server,
    Smartphone,
    Shield,
    ChevronRight,
    Code2,
    Award,
    Zap,
    PlayCircle,
    CheckCircle2,
    Sparkles,
    Check,
    Copy,
    Code,
    Compass
} from "lucide-react";

function HomePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [activeTab, setActiveTab] = useState("sandbox");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchFeaturedCourses = async () => {
            try {
                const res = await api.get('/course/public');
                const data = Array.isArray(res.data) ? res.data : (res.data?.result || res.data?.courses || []);
                setCourses(data);
            } catch (err) {
                console.error("Failed to load featured courses for homepage:", err);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchFeaturedCourses();
    }, []);

    const codeSnippets = {
        sandbox: {
            filename: "sandbox.ts",
            language: "typescript",
            code: `import { createSandbox } from "@skillforge/cloud";

// 1. Provision live container sandbox in 300ms
const lab = await createSandbox({
  runtime: "node-20-alpine",
  packages: ["fastify", "prisma", "typescript"]
});

// 2. Attach live AI Tutor & automated test suite
lab.connectAITutor({ mode: "context-aware" });
await lab.runTestSuite(); // All 14 tests passing`
        },
        architecture: {
            filename: "cluster.go",
            language: "go",
            code: `package main

import "github.com/skillforge/microservice"

func main() {
    cluster := microservice.NewCluster("k8s-us-east")
    cluster.AutoIngress(8080)
    cluster.BalanceLoad(microservice.RoundRobin)
    cluster.ServeWithGracefulShutdown()
}`
        },
        ai: {
            filename: "evaluator.py",
            language: "python",
            code: `from skillforge.ai import CodeEvaluator

evaluator = CodeEvaluator(model="gemini-2.5-pro")
report = evaluator.analyze(
    code_solution=student_submission,
    benchmark="production-ready"
)
# Result: 100/100 • Zero memory leaks • O(log n)`
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippets[activeTab].code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const partners = [
        "Vercel", "Stripe", "Linear", "Docker", "Supabase", "Cloudflare", "GitHub", "Kubernetes", "AWS", "Datadog"
    ];

    const categories = [
        { id: "fullstack", title: "Full-Stack Development", icon: <Terminal size={24} />, desc: "Master modern web architectures with React and Node.js.", query: "react" },
        { id: "ai", title: "Machine Learning & AI", icon: <Cpu size={24} />, desc: "Build production-ready LLM applications and models.", query: "python" },
        { id: "sysdesign", title: "System Design", icon: <Layers size={24} />, desc: "Architect resilient, highly scalable distributed systems.", query: "design" },
        { id: "cloud", title: "Cloud & DevOps", icon: <Server size={24} />, desc: "Deploy and scale with Docker, Kubernetes, and AWS.", query: "docker" },
        { id: "mobile", title: "Mobile Engineering", icon: <Smartphone size={24} />, desc: "Build cross-platform iOS & Android mobile apps.", query: "mobile" },
        { id: "cyber", title: "Cybersecurity", icon: <Shield size={24} />, desc: "Defend networks and master modern web security.", query: "security" }
    ];

    const features = [
        { 
            title: "Production-Grade Curriculum", 
            desc: "No more 'todo apps'. Build real-world platforms complete with payment gateways, websockets, and scalable databases.", 
            icon: <Code2 className="text-brand-primary" size={28} /> 
        },
        { 
            title: "Verifiable Diplomas", 
            desc: "Earn cryptographically verifiable certificates with unique hash IDs to showcase your credentials on LinkedIn.", 
            icon: <Award className="text-brand-secondary" size={28} /> 
        },
        { 
            title: "Interactive Cloud Sandboxes", 
            desc: "Learn by doing with instant in-browser runtimes, automated test suites, and AI code reviews built for focus.", 
            icon: <Zap className="text-brand-cyan" size={28} /> 
        },
    ];

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-500 flex flex-col font-sans relative overflow-x-hidden selection:bg-brand-primary/30">
            <NavBar />

            {/* ========================================================================= */}
            {/* 1. HERO SECTION */}
            {/* ========================================================================= */}
            <header className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 flex flex-col items-center justify-center text-center overflow-hidden">
                
                {/* Visual Ambient Background */}
                <div className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-40 pointer-events-none z-0" />
                
                {/* Stunning Gradient Orbs with subtle float */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] max-w-[1200px] h-[600px] pointer-events-none z-0 opacity-40 dark:opacity-20 flex justify-center blur-[120px]">
                    <div className="w-[45%] h-full bg-brand-primary/40 rounded-full mix-blend-multiply dark:mix-blend-screen animate-ambient-glow" />
                    <div className="w-[45%] h-full bg-brand-secondary/40 rounded-full mix-blend-multiply dark:mix-blend-screen animate-float-slow" />
                    <div className="w-[35%] h-full bg-brand-cyan/40 rounded-full mix-blend-multiply dark:mix-blend-screen animate-ambient-glow -ml-32" />
                </div>

                <div className="max-w-5xl mx-auto px-6 relative z-10 space-y-6 sm:space-y-8">
                    
                    {/* Badge */}
                    <motion.div 
                        initial={{ opacity: 0, y: -15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-surface/80 backdrop-blur-md border border-brand-border shadow-sm hover:border-brand-primary/50 transition-colors cursor-pointer group"
                        onClick={() => navigate("/course-showcase")}
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-primary"></span>
                        </span>
                        <span className="text-xs sm:text-sm font-semibold tracking-wide text-brand-muted group-hover:text-brand-text transition-colors">
                            SkillForge 2.0 is live • Zero fluff, 100% production code
                        </span>
                        <ArrowRight size={14} className="text-brand-muted group-hover:text-brand-text group-hover:translate-x-0.5 transition-all" />
                    </motion.div>

                    {/* Headline with Spring Reveal */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-black text-brand-text leading-[1.08] tracking-tighter text-glow drop-shadow-sm"
                    >
                        Forge the skills. <br className="hidden sm:block" />
                        <span className="bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-cyan bg-clip-text text-transparent">
                            Build your future.
                        </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="text-base sm:text-xl text-brand-muted leading-relaxed max-w-3xl mx-auto font-medium"
                    >
                        A premium developer platform where serious engineers build real-world systems. Master modern architectures through structured learning, automated sandboxes, and production-grade projects.
                    </motion.p>

                    {/* Action Buttons with Interactive Springs */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-4 justify-center pt-2 sm:pt-4"
                    >
                        {token ? (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate("/dashboard")}
                                className="group relative overflow-hidden bg-brand-text text-brand-bg px-8 py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-brand-text/10 flex items-center justify-center gap-3 transition-colors"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Enter Workspace
                                    <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                                </span>
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate("/signup")}
                                className="group relative overflow-hidden bg-brand-primary text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-brand-primary/30 flex items-center justify-center gap-3 transition-colors"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Learning for Free
                                    <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                                </span>
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate("/course-showcase")}
                            className="group bg-brand-surface/90 backdrop-blur-md border border-brand-border text-brand-text px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-brand-elevated hover:border-brand-primary/40 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                        >
                            <PlayCircle size={20} className="text-brand-primary group-hover:scale-110 transition-transform" />
                            Explore Curriculum
                        </motion.button>
                    </motion.div>

                    {/* Key Platform Highlights Pill Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
                        className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2"
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface/90 border border-brand-border text-xs sm:text-sm font-semibold text-brand-muted shadow-sm hover:border-brand-primary/40 transition-colors">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Instant In-Browser Sandboxes</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface/90 border border-brand-border text-xs sm:text-sm font-semibold text-brand-muted shadow-sm hover:border-brand-primary/40 transition-colors">
                            <Sparkles size={14} className="text-brand-primary" />
                            <span>Real-Time AI Code Reviewer</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface/90 border border-brand-border text-xs sm:text-sm font-semibold text-brand-muted shadow-sm hover:border-brand-primary/40 transition-colors">
                            <CheckCircle2 size={14} className="text-brand-primary" />
                            <span>Verifiable Diplomas</span>
                        </div>
                    </motion.div>

                    {/* ================================================================= */}
                    {/* INTERACTIVE DEVELOPER SANDBOX PREVIEW (THE HERO SIGNATURE PIECE) */}
                    {/* ================================================================= */}
                    <motion.div 
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
                        className="mt-6 sm:mt-8 max-w-4xl mx-auto w-full relative"
                    >
                        {/* Terminal Window Card */}
                        <motion.div 
                            animate={{ y: [-4, 4, -4] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-left font-mono relative border-glow"
                        >
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[#070a12] border-b border-slate-800/80">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ef4444]/80" />
                                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]/80" />
                                    <div className="w-3 h-3 rounded-full bg-[#10b981]/80" />
                                    <span className="text-xs text-slate-500 ml-2 hidden sm:inline">~/skillforge/runtime</span>
                                </div>

                                {/* Tabs Switcher */}
                                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                                    {Object.entries(codeSnippets).map(([key, item]) => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveTab(key)}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                                                activeTab === key
                                                    ? "bg-brand-primary text-white shadow-sm"
                                                    : "text-slate-400 hover:text-slate-200"
                                            }`}
                                        >
                                            {item.filename}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleCopy}
                                    className="text-slate-400 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-800 flex items-center gap-1 text-xs"
                                    title="Copy Code"
                                >
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                                </button>
                            </div>

                            {/* Code Area */}
                            <div className="p-5 sm:p-6 overflow-x-auto text-xs sm:text-sm leading-relaxed text-slate-200 font-mono bg-[#0b0f19]">
                                <pre>
                                    <code>{codeSnippets[activeTab].code}</code>
                                </pre>
                            </div>

                            {/* Terminal Status Bar */}
                            <div className="px-5 py-2.5 bg-[#070a12]/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                        Interactive Runtime Ready
                                    </span>
                                    <span className="text-slate-600 hidden sm:inline">•</span>
                                    <span className="hidden sm:inline text-slate-400">Memory: 18MB / 512MB</span>
                                </div>
                                <span className="text-brand-primary font-bold">SkillForge Kernel v2.4</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* ================================================================= */}
                    {/* INFINITE MARQUEE TICKER (TRUSTED PARTNERS) */}
                    {/* ================================================================= */}
                    <div className="pt-10 sm:pt-14 overflow-hidden mask-marquee w-full">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-6">
                            Architected for modern engineering teams & learners
                        </p>
                        <div className="flex gap-12 whitespace-nowrap animate-marquee">
                            {[...partners, ...partners].map((name, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2.5 text-lg font-black tracking-tight text-brand-muted/70 hover:text-brand-primary transition-colors cursor-pointer select-none"
                                >
                                    <div className="w-2 h-2 rounded-full bg-brand-primary/60" />
                                    <span>{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* ========================================================================= */}
            {/* 2. VALUE PROPOSITION / FEATURES */}
            {/* ========================================================================= */}
            <section className="py-24 bg-brand-surface/40 relative z-10 border-y border-brand-border overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                            Built for the modern developer
                        </h2>
                        <p className="text-brand-muted text-lg leading-relaxed">
                            We stripped away the fluff. No 10-hour videos of reading slides. SkillForge is designed to get your hands dirty with real code as fast as possible.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.5, delay: idx * 0.15 }}
                                whileHover={{ y: -6 }}
                                className="group bg-brand-bg rounded-2xl p-8 border border-brand-border shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 hover:border-brand-primary/40 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-brand-elevated rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-primary/10 transition-all duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-brand-text group-hover:text-brand-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-brand-muted leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 3. CATEGORY EXPLORER */}
            {/* ========================================================================= */}
            <section className="py-28 max-w-7xl mx-auto px-6 relative z-10 w-full">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
                >
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight mb-4">
                            Master your domain
                        </h2>
                        <p className="text-brand-muted text-lg leading-relaxed">
                            Whether you're building the next high-scale startup or enterprise infrastructure, we have a curated roadmap for you.
                        </p>
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-30px" }}
                            transition={{ duration: 0.45, delay: idx * 0.08 }}
                            whileHover={{ y: -6 }}
                            onClick={() => navigate(`/courses?search=${cat.query}`)}
                            className="group p-8 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-2xl hover:shadow-brand-primary/10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center mb-6 text-brand-text group-hover:text-brand-primary group-hover:border-brand-primary/30 group-hover:scale-110 transition-all shadow-sm">
                                    {cat.icon}
                                </div>
                                <h3 className="text-xl font-bold text-brand-text mb-3 group-hover:text-brand-primary transition-colors">
                                    {cat.title}
                                </h3>
                                <p className="text-brand-muted leading-relaxed">
                                    {cat.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 4. FEATURED COURSES */}
            {/* ========================================================================= */}
            <section className="py-28 bg-brand-surface/40 relative z-10 border-t border-brand-border">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
                    >
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight mb-4">
                                Premium curriculum
                            </h2>
                            <p className="text-brand-muted text-lg leading-relaxed">
                                Our top-rated courses taught by industry veterans. Stop watching tutorials and start building real systems.
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => navigate("/course-showcase")}
                            className="px-6 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm font-bold text-brand-text hover:border-brand-primary/50 hover:text-brand-primary transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
                        >
                            View entire library <ChevronRight size={16} />
                        </motion.button>
                    </motion.div>

                    {loadingCourses ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-brand-bg rounded-2xl p-5 border border-brand-border animate-pulse space-y-4">
                                    <div className="h-48 bg-brand-elevated rounded-xl" />
                                    <div className="h-6 bg-brand-elevated rounded-md w-3/4 mt-4" />
                                    <div className="h-4 bg-brand-elevated rounded-md w-full" />
                                    <div className="h-4 bg-brand-elevated rounded-md w-5/6" />
                                </div>
                            ))}
                        </div>
                    ) : courses.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.slice(0, 3).map((course, idx) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                                    whileHover={{ y: -8 }}
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="group bg-brand-bg rounded-2xl border border-brand-border overflow-hidden transition-all duration-300 cursor-pointer hover:border-brand-primary/40 hover:shadow-2xl hover:shadow-brand-primary/10 flex flex-col"
                                >
                                    <div className="h-56 bg-brand-elevated relative overflow-hidden">
                                        <img
                                            src={getImageUrl(course.thumbnail)}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md border border-black/10 dark:border-white/10 text-brand-text px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest shadow-lg">
                                            {course.difficulty}
                                        </div>
                                        <div className="absolute top-4 right-4 bg-brand-primary text-white px-3 py-1 rounded-md text-xs font-black shadow-lg shadow-brand-primary/30">
                                            {Number(course.price) === 0 ? "FREE" : `$${course.price}`}
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-black text-brand-text mb-3 line-clamp-1 group-hover:text-brand-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        
                                        {course.reviewCount > 0 && (
                                            <div className="flex items-center gap-1.5 mb-3 bg-brand-surface w-max px-2 py-1 rounded-md">
                                                <StarRating rating={course.averageRating} readOnly size={12} />
                                                <span className="text-xs font-bold text-brand-muted">{course.averageRating?.toFixed(1)} ({course.reviewCount})</span>
                                            </div>
                                        )}
                                        
                                        <p className="text-brand-muted line-clamp-2 mb-6 leading-relaxed flex-grow">
                                            {course.description}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {Array.isArray(course.tags) && course.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="text-xs font-semibold px-2.5 py-1 bg-brand-surface text-brand-muted rounded-md border border-brand-border">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 5. CTA SECTION */}
            {/* ========================================================================= */}
            <section className="py-28 relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-text" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-secondary/20 mix-blend-overlay" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto px-6 relative z-10 text-center"
                >
                    <h2 className="text-5xl md:text-6xl font-black text-brand-bg tracking-tight mb-6">
                        Ready to level up?
                    </h2>
                    <p className="text-xl text-brand-bg/70 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join thousands of developers upgrading their engineering skills. Start learning today for free.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(token ? "/dashboard" : "/signup")}
                        className="bg-brand-primary text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white hover:text-brand-text transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 mx-auto"
                    >
                        {token ? "Return to Workspace" : "Create Free Account"}
                        <ArrowRight size={20} />
                    </motion.button>
                    
                    <div className="mt-8 flex items-center justify-center gap-6 text-brand-bg/50 text-sm font-medium">
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-primary" /> No credit card required</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-primary" /> Cancel anytime</span>
                    </div>
                </motion.div>
            </section>

            {/* Simple Footer */}
            <footer className="bg-brand-bg border-t border-brand-border py-12 text-center text-brand-muted font-medium">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 font-bold text-brand-text">
                        <Terminal size={18} /> SkillForge
                    </div>
                    <p className="text-sm">© {new Date().getFullYear()} SkillForge Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;

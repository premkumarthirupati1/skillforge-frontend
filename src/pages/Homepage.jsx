import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    Users,
    CheckCircle2
} from "lucide-react";

function HomePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

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

    const categories = [
        { id: "fullstack", title: "Full-Stack Development", icon: <Terminal size={24} />, desc: "Master modern web architectures with React and Node.js.", query: "react" },
        { id: "ai", title: "Machine Learning", icon: <Cpu size={24} />, desc: "Build production-ready LLM applications and models.", query: "python" },
        { id: "sysdesign", title: "System Design", icon: <Layers size={24} />, desc: "Architect resilient, highly scalable distributed systems.", query: "design" },
        { id: "cloud", title: "Cloud & DevOps", icon: <Server size={24} />, desc: "Deploy and scale with Docker, Kubernetes, and AWS.", query: "docker" },
        { id: "mobile", title: "Mobile Engineering", icon: <Smartphone size={24} />, desc: "Build cross-platform iOS & Android mobile apps.", query: "mobile" },
        { id: "cyber", title: "Cybersecurity", icon: <Shield size={24} />, desc: "Defend networks and master modern web security.", query: "security" }
    ];

    const features = [
        { title: "Production-Grade Curriculum", desc: "No more 'todo apps'. Build real-world platforms, complete with payment gateways, websockets, and scalable databases.", icon: <Code2 className="text-brand-primary" size={32} /> },
        { title: "Verifiable Certificates", desc: "Earn stunning, industry-recognized certificates with verifiable IDs upon course completion to showcase on your LinkedIn.", icon: <Award className="text-brand-secondary" size={32} /> },
        { title: "Interactive Learning", desc: "Learn by doing with interactive video players, progress tracking, and beautiful student dashboards built for focus.", icon: <Zap className="text-brand-cyan" size={32} /> },
    ];

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-500 flex flex-col font-sans relative overflow-x-hidden selection:bg-brand-primary/30">
            <NavBar />

            {/* ========================================================================= */}
            {/* 1. HERO SECTION */}
            {/* ========================================================================= */}
            <header className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 flex flex-col items-center justify-center text-center overflow-hidden">
                
                {/* Visual Ambient Background */}
                <div className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-40 pointer-events-none z-0" />
                
                {/* Stunning Gradient Orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] max-w-[1200px] h-[600px] pointer-events-none z-0 opacity-40 dark:opacity-20 flex justify-center blur-[120px]">
                    <div className="w-[40%] h-full bg-brand-primary/40 rounded-full mix-blend-multiply dark:mix-blend-screen animate-blob" />
                    <div className="w-[40%] h-full bg-brand-secondary/40 rounded-full mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
                    <div className="w-[40%] h-full bg-brand-cyan/40 rounded-full mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000 -ml-32" />
                </div>

                <div className="max-w-5xl mx-auto px-6 relative z-10 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-bg/50 backdrop-blur-md border border-brand-border shadow-sm hover:border-brand-primary/50 transition-colors cursor-pointer group">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-primary"></span>
                        </span>
                        <span className="text-xs sm:text-sm font-semibold tracking-wide text-brand-muted group-hover:text-brand-text transition-colors">
                            SkillForge 2.0 is now live for developers
                        </span>
                        <ArrowRight size={14} className="text-brand-muted group-hover:text-brand-text transition-colors" />
                    </div>

                    {/* Headline */}
                    <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-brand-text leading-[1.05] tracking-tighter text-glow drop-shadow-sm">
                        Forge the skills. <br className="hidden sm:block" />
                        <span className="bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-cyan bg-clip-text text-transparent">
                            Build your future.
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg sm:text-2xl text-brand-muted leading-relaxed max-w-3xl mx-auto font-medium">
                        A premium developer platform where serious people come to build serious skills. Master software engineering through structured learning and production-grade projects.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        {token ? (
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="group bg-brand-text text-brand-bg px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-brand-text/90 hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-3"
                            >
                                Enter Workspace
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate("/signup")}
                                className="group bg-brand-text text-brand-bg px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-brand-text/90 hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-3"
                            >
                                Start Learning for Free
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                        <button
                            onClick={() => navigate("/course-showcase")}
                            className="group bg-brand-surface/80 backdrop-blur-sm border border-brand-border text-brand-text px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-elevated hover:border-brand-primary/30 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                        >
                            <PlayCircle size={20} className="text-brand-primary group-hover:scale-110 transition-transform" />
                            Explore Curriculum
                        </button>
                    </div>

                    {/* Social Proof Mini */}
                    <div className="pt-12 flex flex-col items-center justify-center gap-4 text-brand-subtle">
                        <p className="text-sm font-bold uppercase tracking-widest">Trusted by engineers at</p>
                        <div className="flex gap-8 opacity-50 grayscale contrast-200">
                            {/* Abstract generic logos for effect */}
                            <div className="text-xl font-black italic tracking-tighter">Acme Corp</div>
                            <div className="text-xl font-black tracking-widest">GLOBAL</div>
                            <div className="text-xl font-black italic font-serif">TechNova</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========================================================================= */}
            {/* 2. VALUE PROPOSITION / FEATURES */}
            {/* ========================================================================= */}
            <section className="py-24 bg-brand-surface/30 relative z-10 border-y border-brand-border overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Built for the modern developer</h2>
                        <p className="text-brand-muted text-lg leading-relaxed">
                            We stripped away the fluff. No 10-hour videos of reading slides. SkillForge is designed to get your hands dirty with real code as fast as possible.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-brand-bg rounded-2xl p-8 border border-brand-border shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 hover:-translate-y-1">
                                <div className="w-14 h-14 bg-brand-elevated rounded-xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-brand-muted leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 3. CATEGORY EXPLORER */}
            {/* ========================================================================= */}
            <section className="py-32 max-w-7xl mx-auto px-6 relative z-10 w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight mb-4">
                            Master your domain
                        </h2>
                        <p className="text-brand-muted text-lg leading-relaxed">
                            Whether you're building the next billion-dollar startup or scaling enterprise infrastructure, we have a curated roadmap for you.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => navigate(`/courses?search=${cat.query}`)}
                            className="group p-8 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-primary/10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center mb-6 text-brand-text group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-colors shadow-sm">
                                    {cat.icon}
                                </div>
                                <h3 className="text-xl font-bold text-brand-text mb-3">
                                    {cat.title}
                                </h3>
                                <p className="text-brand-muted leading-relaxed">
                                    {cat.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 4. FEATURED COURSES */}
            {/* ========================================================================= */}
            <section className="py-32 bg-brand-surface/50 relative z-10 border-t border-brand-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight mb-4">
                                Premium curriculum
                            </h2>
                            <p className="text-brand-muted text-lg leading-relaxed">
                                Our top-rated courses taught by industry veterans. Stop watching tutorials and start building real systems.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/course-showcase")}
                            className="px-6 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm font-bold text-brand-text hover:border-brand-primary/50 hover:text-brand-primary transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
                        >
                            View entire library <ChevronRight size={16} />
                        </button>
                    </div>

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
                            {courses.slice(0, 3).map((course) => (
                                <div
                                    key={course._id}
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="group bg-brand-bg rounded-2xl border border-brand-border overflow-hidden transition-all duration-300 cursor-pointer hover:border-brand-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-primary/10 flex flex-col"
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
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 5. CTA SECTION */}
            {/* ========================================================================= */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-text" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-secondary/20 mix-blend-overlay" />
                
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-5xl md:text-6xl font-black text-brand-bg tracking-tight mb-6">
                        Ready to level up?
                    </h2>
                    <p className="text-xl text-brand-bg/70 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join thousands of developers upgrading their engineering skills. Start learning today for free.
                    </p>
                    <button
                        onClick={() => navigate(token ? "/dashboard" : "/signup")}
                        className="bg-brand-primary text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white hover:text-brand-text hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3 mx-auto"
                    >
                        {token ? "Return to Workspace" : "Create Free Account"}
                        <ArrowRight size={20} />
                    </button>
                    
                    <div className="mt-8 flex items-center justify-center gap-6 text-brand-bg/50 text-sm font-medium">
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-primary" /> No credit card required</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-primary" /> Cancel anytime</span>
                    </div>
                </div>
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

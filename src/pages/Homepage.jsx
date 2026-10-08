import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import StarRating from "../components/StarRating";
import {
    ArrowRight,
    Terminal,
    Layers,
    Cpu,
    Server,
    Smartphone,
    Shield,
    ChevronRight,
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
        { id: "fullstack", title: "Full-Stack Development", icon: <Terminal size={20} className="text-brand-text" />, desc: "Master modern web architectures.", query: "react" },
        { id: "ai", title: "Machine Learning", icon: <Cpu size={20} className="text-brand-text" />, desc: "Build LLM applications and models.", query: "python" },
        { id: "sysdesign", title: "System Design", icon: <Layers size={20} className="text-brand-text" />, desc: "Architect resilient distributed systems.", query: "design" },
        { id: "cloud", title: "Cloud & DevOps", icon: <Server size={20} className="text-brand-text" />, desc: "Deploy and scale with Docker & AWS.", query: "docker" },
        { id: "mobile", title: "Mobile Engineering", icon: <Smartphone size={20} className="text-brand-text" />, desc: "Cross-platform iOS & Android apps.", query: "mobile" },
        { id: "cyber", title: "Cybersecurity", icon: <Shield size={20} className="text-brand-text" />, desc: "Defend networks and master security.", query: "security" }
    ];

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-page flex flex-col font-sans relative overflow-x-hidden">
            <NavBar />

            {/* ========================================================================= */}
            {/* 1. HERO SECTION */}
            {/* ========================================================================= */}
            <header className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 flex flex-col items-center justify-center text-center min-h-[85vh]">
                
                {/* Visual Ambient Background */}
                <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none z-0 animate-ambient-glow" />
                
                <div className="absolute top-[30%] left-[60%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-brand-secondary/10 blur-[100px] rounded-full pointer-events-none z-0 animate-float-slow" />

                <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-hero">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                        <span className="text-xs font-semibold tracking-wide text-brand-muted">
                            SkillForge 2.0 is Live
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-7xl font-black text-brand-text leading-[1.05] tracking-tight text-glow">
                        Forge the skills. <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-cyan bg-clip-text text-transparent">
                            Build your future.
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg sm:text-xl text-brand-muted leading-relaxed max-w-2xl mx-auto font-medium">
                        A premium developer platform where serious people come to build serious skills. Master engineering through structured learning and production-grade projects.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        {token ? (
                            <>
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="group bg-brand-text text-brand-bg px-8 py-3.5 rounded-lg font-bold transition-all hover:bg-brand-text/90 flex items-center justify-center gap-2"
                                >
                                    Go to Dashboard
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate("/course-showcase")}
                                    className="bg-brand-surface border border-brand-border text-brand-text px-8 py-3.5 rounded-lg font-medium hover:bg-brand-elevated hover:border-brand-primary/30 transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    Explore Skills
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="group bg-brand-text text-brand-bg px-8 py-3.5 rounded-lg font-bold transition-all hover:bg-brand-text/90 flex items-center justify-center gap-2"
                                >
                                    Start Learning
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate("/course-showcase")}
                                    className="bg-brand-surface border border-brand-border text-brand-text px-8 py-3.5 rounded-lg font-medium hover:bg-brand-elevated hover:border-brand-primary/30 transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    Explore Skills
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ========================================================================= */}
            {/* 2. CATEGORY EXPLORER */}
            {/* ========================================================================= */}
            <section className="py-24 max-w-7xl mx-auto px-6 relative z-10 border-t border-brand-border w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-text tracking-tight">
                            Explore High-Demand Domains
                        </h2>
                        <p className="text-brand-subtle mt-2 text-sm">Curated roadmaps for the modern engineer.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => navigate(`/courses?search=${cat.query}`)}
                            className="group p-6 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 transition-all duration-card cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)]"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center mb-5">
                                    {cat.icon}
                                </div>
                                <h3 className="text-lg font-bold text-brand-text mb-2">
                                    {cat.title}
                                </h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    {cat.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 3. FEATURED COURSES */}
            {/* ========================================================================= */}
            <section className="py-24 bg-brand-bg relative z-10 border-t border-brand-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-brand-text tracking-tight">
                                Featured Learning Paths
                            </h2>
                            <p className="text-brand-subtle mt-2 text-sm">Top tier content for career growth.</p>
                        </div>
                        <button
                            onClick={() => navigate("/course-showcase")}
                            className="text-sm font-medium text-brand-primary hover:text-brand-primary/80 flex items-center gap-1.5 transition-colors"
                        >
                            View entire library <ChevronRight size={16} />
                        </button>
                    </div>

                    {loadingCourses ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-brand-surface rounded-xl p-5 border border-brand-border animate-pulse space-y-4">
                                    <div className="h-40 bg-brand-elevated rounded-lg" />
                                    <div className="h-5 bg-brand-elevated rounded-md w-3/4" />
                                    <div className="h-4 bg-brand-elevated rounded-md w-full" />
                                </div>
                            ))}
                        </div>
                    ) : courses.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.slice(0, 6).map((course) => (
                                <div
                                    key={course._id}
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="group bg-brand-surface rounded-xl border border-brand-border overflow-hidden transition-all duration-card cursor-pointer hover:border-brand-primary/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] flex flex-col"
                                >
                                    <div className="h-44 bg-brand-elevated relative overflow-hidden">
                                        <img
                                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${course.thumbnail?.replace(/\\/g, "/")}`}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-card opacity-80 group-hover:opacity-100"
                                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                                        />
                                        <div className="absolute top-3 left-3 bg-brand-bg/80 backdrop-blur border border-brand-border text-brand-text px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                            {course.difficulty}
                                        </div>
                                        <div className="absolute top-3 right-3 bg-brand-bg/80 backdrop-blur border border-brand-border text-brand-text px-2 py-0.5 rounded text-[10px] font-bold">
                                            {Number(course.price) === 0 ? "FREE" : `$${course.price}`}
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold text-brand-text mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        
                                        {course.reviewCount > 0 && (
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <StarRating rating={course.averageRating} readOnly size={12} />
                                                <span className="text-[11px] font-medium text-brand-muted">{course.averageRating?.toFixed(1)} ({course.reviewCount})</span>
                                            </div>
                                        )}
                                        
                                        <p className="text-sm text-brand-muted line-clamp-2 mb-4 leading-relaxed flex-grow">
                                            {course.description}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-1.5 mt-auto">
                                            {Array.isArray(course.tags) && course.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="text-[10px] font-medium px-2 py-0.5 bg-brand-elevated text-brand-subtle rounded border border-brand-border">
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
        </div>
    );
}

export default HomePage;

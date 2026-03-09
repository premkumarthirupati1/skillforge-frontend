import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { ArrowRight, CheckCircle2, PlayCircle, Star, Users, Zap } from "lucide-react";

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <NavBar />

            {/* HERO SECTION */}
            <main className="relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* LEFT SIDE: VALUE PROPOSITION */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                    New Courses Added Weekly
                                </span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                                Learn Skills That <span className="text-blue-600">Shape</span> Your Future
                            </h1>

                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                                Build real-world expertise with structured paths designed by industry leaders.
                                Join 10,000+ students mastering the craft of modern development.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    Get Started Free
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <button
                                    onClick={() => navigate("/course-showcase")}
                                    className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    <PlayCircle size={20} />
                                    Explore Library
                                </button>
                            </div>

                            {/* Trust Badge */}
                            <div className="flex items-center gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                            U{i}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-slate-500">
                                    Trusted by <span className="text-slate-900 dark:text-white font-bold">500+</span> global companies
                                </p>
                            </div>
                        </div>

                        {/* RIGHT SIDE: INTERACTIVE FEATURE CARD */}
                        <div className="relative">
                            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 lg:p-12 overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <Zap size={120} className="text-blue-600" />
                                </div>

                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 relative">
                                    The SkillForge <br /> Difference
                                </h2>

                                <div className="space-y-6 relative">
                                    {[
                                        { icon: <Zap size={20} className="text-amber-500" />, title: "Structured Paths", desc: "No more tutorial hell. Follow a clear roadmap." },
                                        { icon: <PlayCircle size={20} className="text-blue-500" />, title: "Project-Based", desc: "Build real apps while you learn the theory." },
                                        { icon: <Star size={20} className="text-purple-500" />, title: "Interactive Quizzes", desc: "Validate your knowledge with instant feedback." },
                                        { icon: <Users size={20} className="text-emerald-500" />, title: "Expert Support", desc: "Get help from mentors when you're stuck." },
                                    ].map((feature, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="shrink-0 w-12 h-12 bg-white dark:bg-slate-950 shadow-sm border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{feature.title}</h4>
                                                <p className="text-sm text-slate-500">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Floating "Success" Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 hidden md:flex items-center gap-3 animate-bounce">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-tighter text-slate-400">Success Rate</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white">98%</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default HomePage;
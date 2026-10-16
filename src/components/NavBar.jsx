import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sun,
    Moon,
    ShoppingCart,
    Heart,
    User,
    LogOut,
    ChevronDown,
    Search,
    GraduationCap,
    Sparkles
} from "lucide-react";
import SearchBar from "./SearchBar";
import SkillForgeLogo from "./SkillForgeLogo";
import api from "../api";
import { useForgeCopilot } from "../context/ForgeCopilotContext";

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { toggleCopilot } = useForgeCopilot();

    const token = localStorage.getItem("token");

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Logout request failed", err);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        navigate('/');
    };

    // Theme management
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === "dark" ? "light" : "dark");
    };

    // Scroll listener for Vercel-like glassy effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isProjectMode = location.pathname.startsWith('/project');

    return (
        <nav className={`sticky top-0 w-full z-50 transition-all duration-500 border-b ${
            scrolled 
            ? 'bg-brand-bg/85 backdrop-blur-md border-brand-border shadow-sm' 
            : 'bg-brand-bg border-transparent'
        }`}>
            <div className="w-full px-4 sm:px-8 md:px-12 h-16 flex justify-between items-center gap-4">

                {/* LOGO SECTION */}
                <div className="flex items-center gap-8">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer shrink-0 flex items-center"
                        onClick={() => navigate(isProjectMode ? "/projects" : "/dashboard")}
                    >
                        {isProjectMode ? (
                            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                                {/* Dark Mode Anvil (White Anvil) */}
                                <img 
                                    src="/images/code-anvil-logo.png" 
                                    alt="SkillForge Projects - The Code Anvil" 
                                    className="h-6 w-auto object-contain hidden dark:block drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                                />
                                {/* Light Mode Anvil (Slate Anvil) */}
                                <img 
                                    src="/images/code-anvil-logo-light.png" 
                                    alt="SkillForge Projects - The Code Anvil" 
                                    className="h-6 w-auto object-contain block dark:hidden drop-shadow-[0_0_6px_rgba(37,99,235,0.3)]"
                                />
                                <div className="flex items-center gap-1.5 border-l border-slate-300 dark:border-white/15 pl-2.5">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight hidden sm:inline">
                                        SkillForge
                                    </span>
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/15 dark:bg-blue-500/20 px-2 py-0.5 rounded-md">
                                        Projects
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <SkillForgeLogo size="md" />
                        )}
                    </motion.div>
                </div>

                {/* MIDDLE NAVIGATION */}
                <div className="hidden md:flex items-center gap-6">
                    {isProjectMode ? (
                        [
                            { name: 'Specs & PRDs', tab: 'specs' },
                            { name: 'Active Builds', tab: 'builds' },
                            { name: 'Sandbox IDE', tab: 'sandbox' },
                            { name: 'Showcase', tab: 'showcase' },
                        ].map((item) => (
                            <Link 
                                key={item.tab}
                                to={`/projects?tab=${item.tab}`}
                                className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors duration-200"
                            >
                                {item.name}
                            </Link>
                        ))
                    ) : (
                        [
                            { name: 'Courses', path: '/courses' },
                            { name: 'Tracks', path: '/tracks' },
                            { name: 'Challenges', path: '/challenges' },
                            { name: 'Community', path: '/community' },
                        ].map((item) => (
                            <Link 
                                key={item.name}
                                to={item.path}
                                className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors duration-200"
                            >
                                {item.name}
                            </Link>
                        ))
                    )}
                </div>

                {/* ACTION SECTION */}
                <div className="flex items-center gap-2 sm:gap-4 transition-all duration-300">
                    
                    {/* DEDICATED MODE SWITCHER BUTTON */}
                    {isProjectMode ? (
                        /* Return to Curriculum Button */
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate("/courses")}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-sm group shrink-0"
                            title="Return to Course Curriculum"
                        >
                            <GraduationCap size={15} className="text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="hidden sm:inline">Back to Courses</span>
                            <span className="sm:hidden">Courses</span>
                        </motion.button>
                    ) : (
                        /* Enter The Projects Forge Button */
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate("/projects")}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-blue-600/10 hover:from-blue-600/20 hover:to-indigo-600/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.12)] group shrink-0"
                            title="Launch Projects Forge Workspace"
                        >
                            <div className="w-5 h-4 rounded bg-[#070A11] border border-blue-400/40 flex items-center justify-center shrink-0 shadow-sm group-hover:border-cyan-400 transition-colors">
                                <img src="/images/code-anvil-logo.png" alt="Anvil" className="h-2.5 w-auto object-contain" />
                            </div>
                            <span className="hidden sm:inline font-mono tracking-tight">Projects Forge</span>
                            <span className="text-[9px] font-mono uppercase bg-blue-500/20 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold tracking-wider">
                                Enter
                            </span>
                        </motion.button>
                    )}

                    <div className="hidden lg:flex relative group w-44 xl:w-56">
                        <SearchBar placeholder="Search..." />
                    </div>

                    {/* Forge Copilot Assistant Trigger */}
                    <button
                        onClick={toggleCopilot}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-text hover:text-brand-primary transition-all duration-300 shrink-0 text-xs font-semibold shadow-sm group"
                        title="Open Forge Copilot"
                        aria-label="Open Forge Copilot"
                    >
                        <Sparkles size={14} className="text-brand-primary group-hover:scale-110 transition-transform" />
                        <span className="hidden xl:inline">Forge Copilot</span>
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-muted hover:text-brand-primary transition-all duration-300 shrink-0"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    {token ? (
                        <>
                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 transition-all duration-300"
                                >
                                    <div className="w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary shadow-[0_0_10px_rgba(37,99,235,0.2)]">
                                        <User size={12} />
                                    </div>
                                    <ChevronDown size={14} className={`text-brand-muted transition-transform duration-300 mr-1.5 ${menuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-3 w-48 bg-brand-elevated shadow-2xl shadow-black/50 rounded-xl border border-brand-border p-1.5 animate-in fade-in zoom-in-95 duration-200">
                                        <button onClick={() => {navigate("/profile"); setMenuOpen(false);}} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm font-medium text-brand-text hover:bg-brand-surface rounded-lg transition-colors">
                                            <User size={14} className="text-brand-primary" />
                                            Profile
                                        </button>
                                        
                                        {localStorage.getItem("role") === "instructor" && (
                                            <button onClick={() => {navigate("/studio"); setMenuOpen(false);}} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors mt-1">
                                                <div className="w-3.5 h-3.5 border-2 border-current rounded-sm flex items-center justify-center shrink-0">
                                                    <div className="w-1 h-1 bg-current rounded-full" />
                                                </div>
                                                Creator Studio
                                            </button>
                                        )}

                                        <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1">
                                            <LogOut size={14} />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate("/login")} 
                                className="text-sm font-semibold text-brand-muted hover:text-brand-text px-2.5 py-1.5 transition-colors hidden sm:block"
                            >
                                Sign In
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate("/signup")} 
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] shrink-0"
                            >
                                Get started
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
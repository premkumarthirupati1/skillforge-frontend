import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sun,
    Moon,
    User,
    LogOut,
    ChevronDown,
    GraduationCap,
    Sliders,
    Sparkles,
    LayoutDashboard,
    Compass,
    Layers,
    Menu,
    X,
    Terminal
} from "lucide-react";
import SearchBar from "./SearchBar";
import SkillForgeLogo from "./SkillForgeLogo";
import { useAuth } from "../context/AuthContext";
import { useForgeCopilot } from "../context/ForgeCopilotContext";

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { toggleCopilot } = useForgeCopilot();
    const { user, token, logout, isAuthenticated } = useAuth();

    const handleLogout = async () => {
        setMenuOpen(false);
        setMobileOpen(false);
        await logout();
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
        setTheme(prev => (prev === "dark" ? "light" : "dark"));
    };

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 15) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Active link check
    const isActive = (path) => location.pathname === path;
    const isProjectMode = location.pathname.startsWith("/projects");

    const navLinks = [
        { name: "Courses", path: "/courses", badge: null },
        { name: "Projects", path: "/projects", badge: "Forge", isForge: true },
        { name: "Challenges", path: "/challenges", badge: null },
        { name: "Community", path: "/community", badge: null },
    ];

    return (
        <nav
            className={`sticky top-0 z-50 transition-all duration-300 h-16 sm:h-18 flex items-center ${
                scrolled
                    ? "bg-[#04060A]/90 backdrop-blur-2xl border-b border-white/10 shadow-xl shadow-black/40"
                    : "bg-[#04060A]/70 backdrop-blur-xl border-b border-white/5"
            }`}
        >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
                
                {/* 1. BRAND & PRIMARY DESKTOP NAV */}
                <div className="flex items-center gap-4 lg:gap-8 shrink-0">
                    <Link to="/" className="shrink-0 flex items-center">
                        <SkillForgeLogo size="sm" className="h-7 w-auto" />
                    </Link>

                    {/* Central Frosted Pill Nav */}
                    <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                        {navLinks.map((link) => {
                            const active = link.isForge ? isProjectMode : isActive(link.path);
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                                        active
                                            ? "text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25 border border-indigo-400/30 font-bold"
                                            : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                                    }`}
                                >
                                    <span>{link.name}</span>
                                    {link.badge && (
                                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md font-bold tracking-wider ${
                                            active
                                                ? "bg-white/20 text-white"
                                                : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                                        }`}>
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* 2. RIGHT ACTION SUITE */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    
                    {/* Compact Search Bar (Desktop) */}
                    <div className="hidden xl:flex relative w-44 2xl:w-52">
                        <SearchBar placeholder="Search tracks..." />
                    </div>

                    {/* Workspace Direct Link (For Logged In Users) */}
                    {(token || isAuthenticated) && (
                        <Link
                            to="/dashboard"
                            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                isActive("/dashboard")
                                    ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                                    : "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <LayoutDashboard size={13} className="text-indigo-400" />
                            <span>Workspace</span>
                        </Link>
                    )}

                    {/* Forge Copilot Trigger Pill */}
                    <button
                        onClick={toggleCopilot}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-indigo-500/30 hover:border-indigo-400 text-slate-200 hover:text-white transition-all shrink-0 text-xs font-semibold shadow-sm group"
                        title="Open Forge Copilot AI Assistant"
                        aria-label="Open Forge Copilot"
                    >
                        <img 
                            src="/images/forge-copilot-icon-transparent.png" 
                            alt="Copilot" 
                            className="w-4 h-4 rounded object-contain group-hover:scale-110 transition-transform" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="hidden sm:inline font-mono text-[11px] font-bold text-cyan-300">Copilot</span>
                    </button>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all shrink-0"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                    </button>

                    {/* User Profile / Auth Action */}
                    {(token || isAuthenticated) ? (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 transition-all shrink-0"
                            >
                                <div className="w-6 h-6 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                                    {(user?.name || user?.username || "U")[0].toUpperCase()}
                                </div>
                                <span className="hidden md:inline text-xs font-medium text-slate-200 max-w-[100px] truncate">
                                    {user?.name || user?.username || "Account"}
                                </span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 mr-1 ${menuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#0D111A] border border-white/10 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 z-50 backdrop-blur-2xl">
                                    <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                                        <p className="text-xs font-bold text-white truncate">{user?.name || "Developer"}</p>
                                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                                    </div>

                                    <button onClick={() => {navigate("/dashboard"); setMenuOpen(false);}} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
                                        <LayoutDashboard size={14} className="text-indigo-400" />
                                        Student Dashboard
                                    </button>

                                    <button onClick={() => {navigate("/profile"); setMenuOpen(false);}} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 rounded-xl transition-colors mt-0.5">
                                        <User size={14} className="text-indigo-400" />
                                        Profile & Security
                                    </button>

                                    <button onClick={() => {navigate("/settings"); setMenuOpen(false);}} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 rounded-xl transition-colors mt-0.5">
                                        <Sliders size={14} className="text-cyan-400" />
                                        Preferences & Settings
                                    </button>
                                    
                                    {(user?.role === "instructor" || localStorage.getItem("role") === "instructor") && (
                                        <button onClick={() => {navigate("/studio"); setMenuOpen(false);}} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors mt-0.5">
                                            <GraduationCap size={14} />
                                            Creator Studio
                                        </button>
                                    )}

                                    <button onClick={handleLogout} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-1 border-t border-white/10 pt-2">
                                        <LogOut size={14} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-2.5">
                            <button 
                                onClick={() => navigate("/login")} 
                                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors hidden sm:block"
                            >
                                Sign In
                            </button>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/signup")} 
                                className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/25 shrink-0 border border-indigo-400/30"
                            >
                                Get Started
                            </motion.button>
                        </div>
                    )}

                    {/* Mobile Menu Hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white shrink-0"
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>

                </div>

            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b border-white/10 bg-[#04060A]/95 backdrop-blur-2xl px-4 py-4 space-y-2 absolute top-full left-0 right-0 shadow-2xl"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium ${
                                    isActive(link.path)
                                        ? "bg-indigo-500/15 text-indigo-400 font-bold"
                                        : "text-slate-300 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <span>{link.name}</span>
                                {link.badge && (
                                    <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">
                                        {link.badge}
                                    </span>
                                )}
                            </Link>
                        ))}

                        <div className="pt-2 border-t border-white/10">
                            <Link
                                to="/projects"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20"
                            >
                                <Terminal size={14} />
                                <span>Launch Projects Forge</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export default NavBar;

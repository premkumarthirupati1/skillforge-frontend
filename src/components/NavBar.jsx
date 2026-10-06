import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
    Sun,
    Moon,
    ShoppingCart,
    Heart,
    User,
    LogOut,
    ChevronDown,
    Search
} from "lucide-react";
import SearchBar from "../pages/SearchBar";
import api from "../api";

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const token = localStorage.getItem("token");

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Logout request failed", err);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
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

    return (
        <nav className={`sticky top-0 w-full z-50 transition-all duration-500 border-b ${
            scrolled 
            ? 'bg-brand-bg/80 backdrop-blur-md border-brand-border shadow-sm' 
            : 'bg-brand-bg border-transparent'
        }`}>
            <div className="w-full px-8 md:px-12 h-16 flex justify-between items-center gap-4">

                {/* LOGO SECTION */}
                <div className="flex items-center gap-8">
                    <h1
                        className="text-xl font-bold text-brand-text cursor-pointer tracking-tight shrink-0 flex items-center gap-2"
                        onClick={() => navigate("/dashboard")}
                    >
                        SkillForge
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                    </h1>
                </div>

                {/* MIDDLE NAVIGATION */}
                <div className="hidden md:flex items-center gap-6">
                    {['Learn', 'Skills', 'Projects', 'Challenges', 'Community'].map((item) => (
                        <Link 
                            key={item}
                            to={`/${item.toLowerCase()}`}
                            className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors duration-200"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                {/* ACTION SECTION */}
                <div className="flex items-center gap-4 transition-all duration-300">
                    <div className="hidden md:flex relative group w-64">
                        <SearchBar placeholder="Search courses..." />
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-muted hover:text-brand-primary transition-all duration-300"
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
                                    <div className="w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary shadow-[0_0_10px_rgba(99,102,241,0.2)]">
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
                        <button onClick={() => navigate("/login")} className="bg-brand-text text-brand-bg hover:bg-brand-text/90 px-5 py-1.5 rounded-md text-sm font-semibold transition-all">Sign In</button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
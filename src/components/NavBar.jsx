import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Search,
    Sun,
    Moon,
    ShoppingCart,
    Heart,
    User,
    LayoutDashboard,
    LogOut,
    BookOpen,
    ShieldCheck,
    ChevronDown,
    X
} from "lucide-react";

function NavBar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

    const searchRef = useRef(null);
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    // Close search when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchExpanded(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/course-showcase?search=${searchQuery}`);
            setSearchExpanded(false);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate('/');
    }
    const toggleDark = () => {
        const html = document.documentElement;
        if (html.classList.contains("dark")) {
            html.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDark(false);
        } else {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDark(true);
        }
    };

    return (
        <nav className="sticky top-0 w-full z-50 transition-all duration-300 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center gap-4">

                {/* LOGO SECTION */}
                <div className={`flex items-center gap-8 transition-all duration-300 ${searchExpanded ? 'opacity-0 scale-95 md:opacity-100 md:scale-100' : 'opacity-100'}`}>
                    <h1
                        className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer tracking-tighter shrink-0"
                        onClick={() => navigate("/dashboard")}
                    >
                        SkillForge
                    </h1>
                </div>

                {/* SEARCH BAR SECTION */}
                <div ref={searchRef} className={`flex-grow flex justify-center transition-all duration-500 ease-in-out ${searchExpanded ? 'max-w-md' : 'max-w-[40px] md:max-w-xs'}`}>
                    <form onSubmit={handleSearch} className="relative w-full group">
                        <input
                            type="text"
                            placeholder="Search for courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchExpanded(true)}
                            className={`w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500/30 rounded-2xl py-2.5 pl-11 pr-10 outline-none transition-all duration-500 text-sm font-medium ${searchExpanded ? 'opacity-100 shadow-lg shadow-blue-500/5' : 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setSearchExpanded(!searchExpanded)}
                            className="absolute left-0 top-0 h-full px-3 text-slate-400 group-hover:text-blue-500 transition-colors z-10"
                        >
                            <Search size={20} />
                        </button>
                        {searchExpanded && (
                            <button
                                type="button"
                                onClick={() => { setSearchExpanded(false); setSearchQuery(""); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </form>
                </div>

                {/* ACTION SECTION */}
                <div className={`flex items-center gap-3 transition-all duration-300 ${searchExpanded ? 'hidden lg:flex' : 'flex'}`}>
                    {token ? (
                        <>
                            <div className="hidden sm:flex items-center border-r border-slate-200 dark:border-slate-800 pr-4 mr-1 gap-2">
                                <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative">
                                    <Heart size={20} />
                                </button>
                                <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <ShoppingCart size={20} />
                                </button>
                            </div>

                            <button onClick={toggleDark} className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all">
                                {isDark ? <Sun size={20} /> : <Moon size={20} className="text-slate-600" />}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                        <User size={16} />
                                    </div>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-800 p-2">
                                        <button onClick={() => navigate("/profile")} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                            <User size={16} className="text-purple-500" />
                                            Profile
                                        </button>
                                        <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors mt-2">
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <button onClick={() => navigate("/login")} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold">Sign In</button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
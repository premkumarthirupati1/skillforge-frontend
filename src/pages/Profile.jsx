import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    BookOpen, 
    Grid, 
    Trophy, 
    User, 
    HelpCircle, 
    LogOut, 
    Bell,
    Hammer,
    Github,
    Twitter,
    Linkedin,
    Globe,
    Mail,
    Save,
    XCircle
} from "lucide-react";

function Profile() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [socials, setSocials] = useState({ github: "", twitter: "", linkedin: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.classList.add("dark");
        api.get('/user/profile').then(res => {
            const data = (Array.isArray(res.data) ? res.data[0] : res.data) || {};
            setUser(data);
            setName(data.name || "");
            setBio(data.bio || "");
            setSocials(data.socials || { github: "", twitter: "", linkedin: "" });
        }).catch(err => console.error("Fetch error:", err));
    }, []);

    const updateProfile = async () => {
        setLoading(true);
        try {
            const res = await api.put('/user/profile', { name, bio, socials });
            setUser(res.data);
        } catch (err) {
            alert("Update Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setName(user?.name || "");
        setBio(user?.bio || "");
        setSocials(user?.socials || { github: "", twitter: "", linkedin: "" });
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {}
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        navigate("/");
    };

    const handleSocialChange = (e) => {
        setSocials({ ...socials, [e.target.name]: e.target.value });
    };

    // Sidebar Navigation Items
    const navItems = [
        { name: "Dashboard", icon: <LayoutDashboard size={20} />, active: false, path: "/dashboard" },
        { name: "My Courses", icon: <BookOpen size={20} />, active: false, path: "/dashboard" },
        { name: "Catalog", icon: <Grid size={20} />, active: false, path: "/course-showcase" },
        { name: "Achievements", icon: <Trophy size={20} />, active: false, path: "/dashboard" },
        { name: "Profile", icon: <User size={20} />, active: true, path: "/profile" },
    ];

    if (!user) {
        return (
            <div className="min-h-screen bg-[#131419] flex items-center justify-center text-brand-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0E0F14] text-white font-sans overflow-hidden">
            
            {/* ========================================== */}
            {/* SIDEBAR                                    */}
            {/* ========================================== */}
            <aside className="w-[280px] bg-[#1C1D24] flex flex-col h-full border-r border-white/5 relative z-20">
                <div className="p-8 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="relative flex items-center justify-center w-8 h-8">
                        <div className="absolute inset-0 bg-brand-primary blur-md opacity-50 rounded-full"></div>
                        <Hammer className="text-white relative z-10" size={24} />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full blur-[2px] -mt-1 -mr-1 mix-blend-screen"></div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">SkillForge</h1>
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-4">
                    {navItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${
                                item.active 
                                ? "bg-[#28255A] text-brand-primary shadow-[0_0_20px_rgba(99,102,241,0.15)] border border-brand-primary/20" 
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <span className={item.active ? "text-brand-primary" : "text-gray-400"}>
                                {item.icon}
                            </span>
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="px-6 pb-8 space-y-2">
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        <HelpCircle size={20} /> Help
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all mt-4">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* ========================================== */}
            {/* MAIN CONTENT                               */}
            {/* ========================================== */}
            <main className="flex-1 bg-[#131419] h-full overflow-y-auto custom-scrollbar">
                <div className="max-w-[1200px] mx-auto p-10 pb-20">
                    
                    {/* Header */}
                    <header className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Account Settings
                        </h2>
                        <div className="flex items-center gap-6">
                            <div onClick={() => navigate('/profile')} className="flex items-center gap-3 bg-[#1C1D24] px-4 py-2 rounded-full border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`} 
                                    alt="Avatar" 
                                    className="w-8 h-8 rounded-full bg-[#2A2B35]"
                                />
                                <span className="text-sm font-medium text-gray-300">{user.email}</span>
                            </div>
                            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                                <Bell size={24} />
                            </button>
                        </div>
                    </header>

                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* LEFT COLUMN: SETTINGS FORM */}
                        <div className="flex-1 space-y-8">
                            <section className="bg-[#1C1D24] border border-white/5 rounded-2xl shadow-lg overflow-hidden">
                                <div className="p-8 border-b border-white/5">
                                    <h3 className="text-xl font-bold text-white tracking-tight mb-2">Public Profile</h3>
                                    <p className="text-gray-400 text-sm">Personalize how others see you on SkillForge.</p>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <User size={14} className="text-brand-primary" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#131419] text-white border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Globe size={14} className="text-brand-primary" />
                                            Biography
                                        </label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="w-full bg-[#131419] text-white border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all h-32 resize-none font-medium"
                                            placeholder="Tell us about yourself and your goals..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Mail size={14} className="text-brand-primary" />
                                            Social Links
                                        </label>
                                        <div className="space-y-4 bg-[#131419] p-6 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                                                    <Github size={18} />
                                                </div>
                                                <input
                                                    name="github"
                                                    value={socials.github}
                                                    onChange={handleSocialChange}
                                                    placeholder="GitHub URL"
                                                    className="flex-1 bg-transparent border-b border-white/10 p-2 text-white focus:outline-none focus:border-brand-primary transition-all text-sm font-medium placeholder-gray-600"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-[#1DA1F2]/20 flex items-center justify-center text-[#1DA1F2]">
                                                    <Twitter size={18} />
                                                </div>
                                                <input
                                                    name="twitter"
                                                    value={socials.twitter}
                                                    onChange={handleSocialChange}
                                                    placeholder="Twitter URL"
                                                    className="flex-1 bg-transparent border-b border-white/10 p-2 text-white focus:outline-none focus:border-[#1DA1F2] transition-all text-sm font-medium placeholder-gray-600"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-[#0077B5]/20 flex items-center justify-center text-[#0077B5]">
                                                    <Linkedin size={18} />
                                                </div>
                                                <input
                                                    name="linkedin"
                                                    value={socials.linkedin}
                                                    onChange={handleSocialChange}
                                                    placeholder="LinkedIn URL"
                                                    className="flex-1 bg-transparent border-b border-white/10 p-2 text-white focus:outline-none focus:border-[#0077B5] transition-all text-sm font-medium placeholder-gray-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/5 flex gap-4 justify-end border-t border-white/5">
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <span className="flex items-center gap-2">
                                            <XCircle size={18} />
                                            Reset
                                        </span>
                                    </button>
                                    <button
                                        onClick={updateProfile}
                                        disabled={loading}
                                        className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)] disabled:opacity-50"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Save size={18} />
                                            {loading ? 'Saving...' : 'Save Profile'}
                                        </span>
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: PREVIEW CARD */}
                        <div className="w-full lg:w-[380px]">
                            <div className="bg-[#1C1D24] rounded-2xl overflow-hidden border border-white/5 shadow-lg sticky top-8">
                                <div className="h-32 bg-gradient-to-br from-brand-primary/30 to-brand-secondary/30 relative">
                                    <div className="absolute inset-0 bg-brand-primary/10 backdrop-blur-sm mix-blend-overlay"></div>
                                </div>
                                <div className="px-8 pb-8 relative text-center">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-[#131419] p-1.5 -mt-12 relative z-10">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`}
                                            alt="avatar"
                                            className="w-full h-full rounded-full bg-[#2A2B35]"
                                        />
                                    </div>
                                    <h3 className="text-xl font-black text-white mt-4 tracking-tight">
                                        {name || user?.email?.split('@')[0] || "Student"}
                                    </h3>
                                    <p className="text-brand-primary font-bold text-xs uppercase tracking-widest mt-1">
                                        {user.role}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-4 leading-relaxed font-medium">
                                        {bio || "No biography provided yet. Add a short bio to let others know more about you."}
                                    </p>

                                    <div className="flex justify-center gap-4 mt-8">
                                        {socials.github && (
                                            <a href={socials.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:scale-110 transition-transform">
                                                <Github size={18} />
                                            </a>
                                        )}
                                        {socials.twitter && (
                                            <a href={socials.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_15px_rgba(29,161,242,0.4)]">
                                                <Twitter size={18} />
                                            </a>
                                        )}
                                        {socials.linkedin && (
                                            <a href={socials.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,119,181,0.4)]">
                                                <Linkedin size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #131419; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #2A2B35; 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #3f4150; 
                }
            `}} />
        </div>
    );
}

export default Profile;

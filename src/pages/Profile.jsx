import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
    User, 
    Github,
    Twitter,
    Linkedin,
    Globe,
    Mail,
    Save,
    XCircle
} from "lucide-react";
import NavBar from "../components/NavBar";

function Profile() {
    const [user, setUser] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [socials, setSocials] = useState({ github: "", twitter: "", linkedin: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        
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
            const formData = new FormData();
            formData.append("name", name);
            formData.append("bio", bio);
            formData.append("socials", JSON.stringify(socials));
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await api.put('/user/profile', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setUser(res.data);
            setAvatarFile(null);
            toast.success("Profile saved successfully!");
        } catch (err) {
            toast.error("Profile update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setName(user?.name || "");
        setBio(user?.bio || "");
        setSocials(user?.socials || { github: "", twitter: "", linkedin: "" });
        setAvatarPreview(null);
        setAvatarFile(null);
    };

    const handleSocialChange = (e) => {
        setSocials({ ...socials, [e.target.name]: e.target.value });
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-brand-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans flex flex-col">
            <NavBar />
            
            <main className="flex-1 max-w-7xl w-full mx-auto p-10 pb-20">
                {/* Header */}
                <header className="mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Account Settings
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your public profile and preferences.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-10">

                    {/* LEFT COLUMN: SETTINGS FORM */}
                    <div className="flex-1 space-y-8">
                        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-8 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-xl font-bold tracking-tight mb-2">Public Profile</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Personalize how others see you on SkillForge.</p>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={14} className="text-brand-primary" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium"
                                        placeholder="Your full name"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Globe size={14} className="text-brand-primary" />
                                        Biography
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all h-32 resize-none font-medium"
                                        placeholder="Tell us about yourself and your goals..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Mail size={14} className="text-brand-primary" />
                                        Social Links
                                    </label>
                                    <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-gray-400">
                                                <Github size={18} />
                                            </div>
                                            <input
                                                name="github"
                                                value={socials.github}
                                                onChange={handleSocialChange}
                                                placeholder="GitHub URL"
                                                className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-800 p-2 focus:outline-none focus:border-brand-primary transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-gray-600"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-[#1DA1F2]/10 dark:bg-[#1DA1F2]/20 flex items-center justify-center text-[#1DA1F2]">
                                                <Twitter size={18} />
                                            </div>
                                            <input
                                                name="twitter"
                                                value={socials.twitter}
                                                onChange={handleSocialChange}
                                                placeholder="Twitter URL"
                                                className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-800 p-2 focus:outline-none focus:border-[#1DA1F2] transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-gray-600"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-[#0077B5]/10 dark:bg-[#0077B5]/20 flex items-center justify-center text-[#0077B5]">
                                                <Linkedin size={18} />
                                            </div>
                                            <input
                                                name="linkedin"
                                                value={socials.linkedin}
                                                onChange={handleSocialChange}
                                                placeholder="LinkedIn URL"
                                                className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-800 p-2 focus:outline-none focus:border-[#0077B5] transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-gray-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-white/5 flex gap-4 justify-end border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
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
                        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg sticky top-8">
                            <div className="h-32 bg-gradient-to-br from-brand-primary/30 to-brand-secondary/30 relative">
                                <div className="absolute inset-0 bg-brand-primary/10 backdrop-blur-sm mix-blend-overlay"></div>
                            </div>
                            <div className="px-8 pb-8 relative text-center">
                                <div className="w-24 h-24 mx-auto rounded-full bg-white dark:bg-[#131419] p-1.5 -mt-12 relative z-10 group cursor-pointer">
                                    <label className="w-full h-full block relative cursor-pointer rounded-full overflow-hidden">
                                        <img
                                            src={avatarPreview || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`}
                                            alt="avatar"
                                            className="w-full h-full rounded-full bg-slate-200 dark:bg-[#2A2B35] object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                                        </div>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setAvatarFile(file);
                                                    setAvatarPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <h3 className="text-xl font-black mt-4 tracking-tight">
                                    {name || user?.email?.split('@')[0] || "Student"}
                                </h3>
                                <p className="text-brand-primary font-bold text-xs uppercase tracking-widest mt-1">
                                    {user.role}
                                </p>
                                <p className="text-slate-500 dark:text-gray-400 text-sm mt-4 leading-relaxed font-medium">
                                    {bio || "No biography provided yet. Add a short bio to let others know more about you."}
                                </p>

                                <div className="flex justify-center gap-4 mt-8">
                                    {socials.github && (
                                        <a href={socials.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center text-slate-700 dark:text-white hover:scale-110 transition-transform">
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
            </main>
        </div>
    );
}

export default Profile;

import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
// Swapped X for XCircle to ensure Vite compatibility, and added Globe for bio icon
import { Github, Twitter, Linkedin, User, Mail, Globe, Save, XCircle, LogOut, CloudCog } from "lucide-react";

function Profile() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [socials, setSocials] = useState({ github: "", twitter: "", linkedin: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/user/profile').then(res => {
            // Added safe check for data array
            const data = (Array.isArray(res.data) ? res.data[0] : res.data) || {};
            console.log(data);
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleSocialChange = (e) => {
        setSocials({ ...socials, [e.target.name]: e.target.value });
    };

    if (!user) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="animate-bounce text-blue-600 font-black text-xl tracking-tighter">SkillForge</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <NavBar />

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* LEFT COLUMN: SETTINGS FORM */}
                    <div className="flex-1 space-y-8">
                        <section className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
                                    <p className="text-slate-500 text-sm">Personalize your digital identity.</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-2xl transition-all text-sm font-bold"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <User size={14} className="text-blue-500" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 dark:focus:border-blue-500/40 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-slate-800 dark:text-slate-100"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Globe size={14} className="text-purple-500" />
                                                Short Bio
                                            </label>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${bio.length > 150 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {bio.length} / 160
                                            </span>
                                        </div>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows="4"
                                            maxLength="160"
                                            placeholder="A little bit about you..."
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none text-slate-800 dark:text-slate-100 leading-relaxed"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Social Connections</h3>
                                    <div className="grid gap-4">
                                        {[
                                            { id: 'github', icon: <Github size={18} />, label: 'GitHub' },
                                            { id: 'twitter', icon: <Twitter size={18} />, label: 'Twitter' },
                                            { id: 'linkedin', icon: <Linkedin size={18} />, label: 'LinkedIn' }
                                        ].map((platform) => (
                                            <div key={platform.id} className="group relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                    {platform.icon}
                                                </div>
                                                <input
                                                    type="text"
                                                    name={platform.id}
                                                    value={socials[platform.id]}
                                                    onChange={handleSocialChange}
                                                    placeholder={`${platform.label} handle`}
                                                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/20 rounded-2xl p-4 pl-12 focus:ring-4 focus:ring-blue-500/5 outline-none transition text-sm font-medium"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-slate-800/30 flex items-center gap-4">
                                <button
                                    onClick={updateProfile}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {loading ? "SAVING..." : "SAVE CHANGES"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                                >
                                    <XCircle size={18} />
                                    Cancel
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: STICKY PREVIEW */}
                    <div className="w-full lg:w-96">
                        <div className="sticky top-12">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-none transition-all duration-500 hover:rotate-1">
                                <div className="h-32 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative">
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                                </div>
                                <div className="px-8 pb-10 text-center -mt-16 relative z-10">
                                    <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[2.5rem] mx-auto p-1.5 shadow-2xl mb-6 transform transition-transform hover:scale-105">
                                        <div className="w-full h-full bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center text-4xl font-black text-blue-600">
                                            {name ? name[0].toUpperCase() : "?"}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white truncate tracking-tight">{name || "Your Name"}</h2>
                                    <p className="text-sm text-blue-500 font-bold mb-6 flex items-center justify-center gap-1.5">
                                        <Mail size={14} /> {user.email || 'email@example.com'}
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 min-h-[80px]">
                                        {bio || "Your story starts here. Update your bio to let people know who you are."}
                                    </p>

                                    <div className="flex justify-center gap-5 text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-8">
                                        <Github size={20} className={socials.github ? "text-slate-900 dark:text-white" : "opacity-20"} />
                                        <Twitter size={20} className={socials.twitter ? "text-blue-400" : "opacity-20"} />
                                        <Linkedin size={20} className={socials.linkedin ? "text-blue-700" : "opacity-20"} />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Card Preview</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Profile;
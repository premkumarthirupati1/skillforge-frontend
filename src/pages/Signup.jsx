import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { User, Mail, Lock, GraduationCap, Presentation, ArrowRight, Loader2, AlertCircle } from "lucide-react";

function Signup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student"
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError("");
    };

    const selectRole = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/signup", formData);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <NavBar />

            <div className="flex items-center justify-center py-16 px-6">
                <div className="w-full max-w-xl relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 relative z-10">

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Join SkillForge
                            </h2>
                            <p className="text-slate-500 mt-2 text-sm font-medium">
                                Start your learning or teaching journey today.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* ROLE SELECTION CARDS */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Your Role</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => selectRole("student")}
                                        className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === "student"
                                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                                : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"
                                            }`}
                                    >
                                        <GraduationCap size={24} className={formData.role === "student" ? "text-blue-500" : "text-slate-400"} />
                                        <span className={`text-sm font-bold ${formData.role === "student" ? "text-blue-600 dark:text-blue-400" : "text-slate-500"}`}>Student</span>
                                    </div>
                                    <div
                                        onClick={() => selectRole("instructor")}
                                        className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === "instructor"
                                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                                : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"
                                            }`}
                                    >
                                        <Presentation size={24} className={formData.role === "instructor" ? "text-blue-500" : "text-slate-400"} />
                                        <span className={`text-sm font-bold ${formData.role === "instructor" ? "text-blue-600 dark:text-blue-400" : "text-slate-500"}`}>Instructor</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            placeholder="Jane Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="jane@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Create Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="Min. 8 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-slate-500 text-sm font-medium">
                                Already part of the forge?{" "}
                                <button onClick={() => navigate("/login")} className="text-blue-600 font-bold hover:underline">
                                    Login here
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
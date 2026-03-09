import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
// Using the Lucide icons you just installed
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing again
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/login", formData);

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);

            // Navigate to dashboard as it's the personal home
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <NavBar />

            <div className="flex items-center justify-center py-20 px-6">
                <div className="w-full max-w-md relative">
                    {/* Background Decorative Blob */}
                    <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 relative z-10">

                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-slate-500 mt-2 text-sm font-medium">
                                Enter your credentials to access your portal
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold animate-shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 rounded-2xl p-4 pl-12 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                                    <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-blue-500 hover:underline">Forgot?</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 rounded-2xl p-4 pl-12 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-slate-500 text-sm font-medium">
                                Don't have an account?{" "}
                                <Link to="/signup" className="text-blue-600 font-bold hover:underline underline-offset-4">
                                    Create one for free
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-slate-400 text-xs font-medium">
                        &copy; 2026 SkillForge LMS. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
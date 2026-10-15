import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api";
import NavBar from "../../components/NavBar";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck, Terminal, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const cleanEmail = formData.email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(cleanEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!formData.password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/login", {
                email: cleanEmail,
                password: formData.password
            });

            localStorage.setItem("token", res.data.token);
            if (res.data.refreshToken) {
                localStorage.setItem("refreshToken", res.data.refreshToken);
            }
            if (res.data.user) {
                localStorage.setItem("userId", res.data.user.id);
                localStorage.setItem("role", res.data.user.role);
                localStorage.setItem("userName", res.data.user.name || "");
                localStorage.setItem("userEmail", res.data.user.email);
            }

            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Incorrect credentials. Please check your email and password.";
            setError(errorMsg);
            toast.error(errorMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-page flex flex-col relative overflow-hidden">
            <NavBar />
            
            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center py-16 sm:py-24 px-6 relative z-10">
                <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
                    
                    {/* LEFT COLUMN: Animated Developer Showcase (Desktop Only) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="hidden lg:flex lg:col-span-6 flex-col space-y-6"
                    >
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface/80 border border-brand-border w-max shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-xs font-bold text-brand-muted">
                                SkillForge Developer Gateway
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl xl:text-5xl font-black text-brand-text tracking-tight leading-[1.15]">
                            Welcome back to your <br />
                            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-cyan bg-clip-text text-transparent">
                                Engineering Workspace.
                            </span>
                        </h1>

                        <p className="text-brand-muted text-base leading-relaxed">
                            Log in to access your interactive sandboxes, resume code exercises, and build production systems with the community.
                        </p>

                        {/* Mini Terminal Preview */}
                        <motion.div 
                            animate={{ y: [-3, 3, -3] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 shadow-xl border-glow"
                        >
                            <div className="flex items-center gap-1.5 pb-3 border-b border-slate-800/80 mb-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                <span className="text-slate-500 text-[11px] ml-2">auth-session.sh</span>
                            </div>
                            <p className="text-slate-400">$ skillforge auth --status</p>
                            <p className="text-emerald-400 mt-1">✓ TLS 1.3 encrypted tunnel active</p>
                            <p className="text-slate-300 mt-1">✓ Interactive sandboxes ready for deployment</p>
                            <p className="text-brand-primary mt-1">✓ AI Tutor waiting in workspace</p>
                        </motion.div>

                        {/* Key Value Checklist */}
                        <div className="pt-2 grid grid-cols-2 gap-3 text-xs font-semibold text-brand-muted">
                            <span className="flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-brand-primary shrink-0" />
                                100% Real Code
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-brand-primary shrink-0" />
                                Instant Sandboxes
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-brand-primary shrink-0" />
                                Verifiable Certificates
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-brand-primary shrink-0" />
                                AI Code Reviewer
                            </span>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: The Login Form */}
                    <div className="lg:col-span-6 w-full max-w-[440px] mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 25, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="bg-brand-surface border border-brand-border rounded-2xl p-8 sm:p-9 shadow-2xl relative backdrop-blur-xl"
                        >
                            <div className="mb-8">
                                <h2 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                                    Sign In
                                </h2>
                                <p className="text-brand-subtle mt-1.5 text-sm">
                                    Enter your credentials to enter your workspace.
                                </p>
                            </div>

                            {/* Animated Error Alert */}
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -3, 3, 0] }}
                                    transition={{ duration: 0.4 }}
                                    className="mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm font-medium"
                                >
                                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            required
                                            placeholder="you@domain.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                            Password
                                        </label>
                                        <Link 
                                            to="/forgot-password" 
                                            className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            autoComplete="current-password"
                                            required
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-3 pl-10 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text transition-colors p-1"
                                            tabIndex={-1}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            <span>Signing In...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Continue to Workspace</span>
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-brand-border text-center">
                                <p className="text-brand-subtle text-sm">
                                    Don't have an account?{" "}
                                    <Link to="/signup" className="text-brand-text font-bold hover:text-brand-primary transition-colors">
                                        Create free account
                                    </Link>
                                </p>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;

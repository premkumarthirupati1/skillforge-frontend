import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import NavBar from "../../components/NavBar";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck, Terminal, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
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
            const res = await login(cleanEmail, formData.password);

            if (res.requiresOtp) {
                toast(res.message || "Please verify your email address to continue.", { icon: "🔒" });
                navigate("/signup", { 
                    state: { 
                        requiresOtp: true, 
                        email: cleanEmail 
                    } 
                });
                return;
            }

            toast.success("Welcome back!");
            const destination = location.state?.from?.pathname || location.state?.from || "/dashboard";
            navigate(destination, { replace: true });
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Incorrect credentials. Please check your email and password.";
            setError(errorMsg);
            toast.error(errorMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col relative overflow-hidden selection:bg-brand-primary/30 selection:text-white">
            <NavBar />
            
            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none z-0" />
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-primary/20 via-brand-secondary/15 to-transparent blur-[140px] rounded-full pointer-events-none z-0 animate-ambient-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-cyan/15 blur-[130px] rounded-full pointer-events-none z-0" />

            <div className="flex-grow flex items-center justify-center py-12 sm:py-20 px-4 sm:px-6 relative z-10">
                <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
                    
                    {/* LEFT COLUMN: Developer Showcase */}
                    <motion.div 
                        initial={{ opacity: 0, x: -25 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="hidden lg:flex lg:col-span-6 flex-col space-y-6 pr-4"
                    >
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface/80 border border-brand-border/80 w-max shadow-sm backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                            <span className="text-xs font-semibold text-brand-muted">
                                Developer Gateway · Secure Access
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl xl:text-5xl font-black text-brand-text tracking-tight leading-[1.15]">
                            Welcome back to your <br />
                            <span className="bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-cyan bg-clip-text text-transparent">
                                Engineering Workspace.
                            </span>
                        </h1>

                        <p className="text-brand-muted text-sm sm:text-base leading-relaxed">
                            Log in to access your interactive sandboxes, resume system design projects, and get instant AI code reviews with Forge Copilot.
                        </p>

                        {/* Mini Terminal Preview */}
                        <div className="glass-card-elevated rounded-2xl p-4 font-mono text-xs text-slate-300 shadow-xl border border-brand-border/80 relative overflow-hidden">
                            <div className="flex items-center gap-1.5 pb-3 border-b border-white/[0.08] mb-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-emerald/80" />
                                <span className="text-brand-subtle text-[11px] ml-2">auth-session.sh</span>
                            </div>
                            <p className="text-brand-subtle">$ skillforge auth --status</p>
                            <p className="text-brand-emerald mt-1">✓ TLS 1.3 encrypted tunnel active</p>
                            <p className="text-slate-300 mt-1">✓ Cloud microservice sandboxes ready</p>
                            <p className="text-brand-cyan mt-1">✓ Forge Copilot AI assistant ready</p>
                        </div>

                        {/* Key Value Checklist */}
                        <div className="pt-2 grid grid-cols-2 gap-3 text-xs font-semibold text-brand-muted">
                            <span className="flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-brand-primary shrink-0" />
                                Real Code Sandboxes
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-brand-primary shrink-0" />
                                Real-Time Compiler
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
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                            className="glass-card-elevated rounded-3xl p-7 sm:p-9 shadow-2xl relative border border-brand-border/80"
                        >
                            <div className="mb-7">
                                <h2 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                                    Sign In
                                </h2>
                                <p className="text-brand-muted mt-1 text-xs sm:text-sm">
                                    Enter your credentials to enter your workspace.
                                </p>
                            </div>

                            {/* Animated Error Alert */}
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -3, 3, 0] }}
                                    transition={{ duration: 0.35 }}
                                    className="mb-5 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs sm:text-sm font-medium"
                                >
                                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                                            className="w-full bg-brand-surface/90 text-brand-text placeholder-brand-subtle border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
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
                                            className="text-xs font-semibold text-brand-primary hover:underline transition-colors"
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
                                            className="w-full bg-brand-surface/90 text-brand-text placeholder-brand-subtle border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono"
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
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white font-bold py-3 rounded-xl transition-all shadow-glow-primary/40 hover:shadow-glow-primary/60 flex items-center justify-center gap-2 mt-3 disabled:opacity-70 disabled:cursor-not-allowed group text-sm border border-white/10"
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

                            <div className="mt-7 pt-5 border-t border-brand-border/60 text-center">
                                <p className="text-brand-muted text-xs sm:text-sm">
                                    Don't have an account?{" "}
                                    <Link to="/signup" className="text-brand-primary font-bold hover:underline transition-colors">
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

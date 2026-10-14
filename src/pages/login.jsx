import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center py-24 px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-hero">
                <div className="w-full max-w-[420px]">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 sm:p-9 shadow-2xl relative backdrop-blur-xl">
                        <div className="mb-8">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
                                Welcome back
                            </h2>
                            <p className="text-brand-subtle mt-1.5 text-sm">
                                Enter your credentials to continue building.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm font-medium animate-in fade-in duration-200">
                                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                                <span>{error}</span>
                            </div>
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 flex items-center justify-center gap-2 mt-3 disabled:opacity-70 disabled:cursor-not-allowed group text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Continue</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-brand-border text-center">
                            <p className="text-brand-subtle text-sm">
                                Don't have an account?{" "}
                                <Link to="/signup" className="text-brand-text font-bold hover:text-brand-primary transition-colors">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

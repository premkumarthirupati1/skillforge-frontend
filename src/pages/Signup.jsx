import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { 
    User, 
    Mail, 
    Lock, 
    GraduationCap, 
    Presentation, 
    ArrowRight, 
    Loader2, 
    AlertCircle, 
    Eye, 
    EyeOff, 
    Check, 
    X 
} from "lucide-react";
import { toast } from "react-hot-toast";

function Signup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
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

    // Calculate password criteria
    const hasMinLength = formData.password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialOrUpper = /[^a-zA-Z0-9]/.test(formData.password) || /[A-Z]/.test(formData.password);

    const criteriaMet = [hasMinLength, hasLetter, hasNumber, hasSpecialOrUpper].filter(Boolean).length;
    
    // Password Strength Meter
    const getStrengthInfo = () => {
        if (!formData.password) return { label: "", color: "bg-slate-700", width: "0%" };
        if (criteriaMet === 1) return { label: "Weak", color: "bg-red-500", width: "25%" };
        if (criteriaMet === 2) return { label: "Fair", color: "bg-amber-500", width: "50%" };
        if (criteriaMet === 3) return { label: "Good", color: "bg-blue-500", width: "75%" };
        return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    };

    const strength = getStrengthInfo();
    const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
    const passwordsDoNotMatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Name validation
        const cleanName = formData.name.trim();
        if (!cleanName || cleanName.length < 2) {
            setError("Please enter your full name (at least 2 characters).");
            return;
        }

        // 2. Email validation
        const cleanEmail = formData.email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        // 3. Password length and composition
        if (!hasMinLength) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (!hasLetter || !hasNumber) {
            setError("Password must contain at least one letter and one number.");
            return;
        }

        // 4. Confirm password match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match. Please re-enter.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/signup", {
                name: cleanName,
                email: cleanEmail,
                password: formData.password,
                role: formData.role
            });

            // Store credentials and auto-login
            if (res.data?.token) {
                localStorage.setItem("token", res.data.token);
                if (res.data.user) {
                    localStorage.setItem("userId", res.data.user.id);
                    localStorage.setItem("role", res.data.user.role);
                    localStorage.setItem("userName", res.data.user.name || cleanName);
                    localStorage.setItem("userEmail", res.data.user.email);
                }
                toast.success("Account created successfully! Welcome to SkillForge.");
                navigate("/dashboard");
            } else {
                toast.success("Account created! Please sign in.");
                navigate("/login");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[650px] max-h-[650px] bg-brand-secondary/10 blur-[100px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center py-24 px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-hero">
                <div className="w-full max-w-[520px]">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 sm:p-10 shadow-2xl relative backdrop-blur-xl">
                        
                        <div className="mb-8">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
                                Join SkillForge
                            </h2>
                            <p className="text-brand-subtle mt-1.5 text-sm">
                                Start your engineering journey with world-class interactive courses.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm font-medium animate-in fade-in duration-200">
                                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            
                            {/* ROLE SELECTION */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                    I am joining as a...
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => selectRole("student")}
                                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-center gap-2.5 ${formData.role === "student"
                                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-sm ring-1 ring-brand-primary/30"
                                            : "border-brand-border bg-brand-elevated text-brand-muted hover:border-brand-primary/50"
                                            }`}
                                    >
                                        <GraduationCap size={18} />
                                        <span className="text-sm">Student</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => selectRole("instructor")}
                                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-center gap-2.5 ${formData.role === "instructor"
                                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-sm ring-1 ring-brand-primary/30"
                                            : "border-brand-border bg-brand-elevated text-brand-muted hover:border-brand-primary/50"
                                            }`}
                                    >
                                        <Presentation size={18} />
                                        <span className="text-sm">Instructor</span>
                                    </button>
                                </div>
                            </div>

                            {/* NAME & EMAIL FIELDS */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={16} />
                                        <input
                                            type="text"
                                            name="name"
                                            autoComplete="name"
                                            required
                                            placeholder="Prem Kumar"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={16} />
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
                            </div>

                            {/* PASSWORD FIELD */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                    Create Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete="new-password"
                                        required
                                        placeholder="Min. 8 characters"
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

                                {/* PASSWORD STRENGTH METER */}
                                {formData.password && (
                                    <div className="pt-2 space-y-2 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-brand-muted font-medium">Strength:</span>
                                            <span className={`font-bold ${
                                                strength.label === 'Strong' ? 'text-emerald-400' :
                                                strength.label === 'Good' ? 'text-blue-400' :
                                                strength.label === 'Fair' ? 'text-amber-400' : 'text-red-400'
                                            }`}>
                                                {strength.label}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-brand-elevated rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-300 rounded-full ${strength.color}`} 
                                                style={{ width: strength.width }} 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                                            <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-brand-subtle'}`}>
                                                {hasMinLength ? <Check size={12} /> : <X size={12} />} 8+ characters
                                            </span>
                                            <span className={`flex items-center gap-1 ${(hasLetter && hasNumber) ? 'text-emerald-400' : 'text-brand-subtle'}`}>
                                                {(hasLetter && hasNumber) ? <Check size={12} /> : <X size={12} />} Letters & numbers
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CONFIRM PASSWORD FIELD */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                        Confirm Password
                                    </label>
                                    {passwordsMatch && (
                                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                            <Check size={13} /> Passwords match
                                        </span>
                                    )}
                                    {passwordsDoNotMatch && (
                                        <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                                            <X size={13} /> Passwords do not match
                                        </span>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={16} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        autoComplete="new-password"
                                        required
                                        placeholder="Re-enter your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border rounded-xl py-3 pl-10 pr-11 text-sm focus:outline-none focus:ring-2 transition-all font-mono ${
                                            passwordsDoNotMatch
                                                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                                : passwordsMatch
                                                ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
                                                : "border-brand-border focus:border-brand-primary focus:ring-brand-primary/20"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text transition-colors p-1"
                                        tabIndex={-1}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-brand-border text-center">
                            <p className="text-brand-subtle text-sm">
                                Already part of the forge?{" "}
                                <button onClick={() => navigate("/login")} className="text-brand-text font-bold hover:text-brand-primary transition-colors">
                                    Sign in
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

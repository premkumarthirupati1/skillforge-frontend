import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";
import NavBar from "../../components/NavBar";
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
    X,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    RotateCw,
    ArrowLeft
} from "lucide-react";
import { toast } from "react-hot-toast";

function Signup() {
    const navigate = useNavigate();
    const location = useLocation();

    // OTP Verification State
    const [step, setStep] = useState("form"); // "form" | "otp"
    const [otpEmail, setOtpEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const inputRefs = useRef([]);

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

    // Resend OTP countdown timer
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Handle redirected state from Login page
    useEffect(() => {
        if (location.state?.requiresOtp && location.state?.email) {
            setOtpEmail(location.state.email);
            setStep("otp");
            setResendCooldown(60);
        }
    }, [location.state]);

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
        if (!formData.password) return { label: "", color: "bg-brand-border", width: "0%" };
        if (criteriaMet === 1) return { label: "Weak", color: "bg-red-500", width: "25%" };
        if (criteriaMet === 2) return { label: "Fair", color: "bg-brand-amber", width: "50%" };
        if (criteriaMet === 3) return { label: "Good", color: "bg-brand-primary", width: "75%" };
        return { label: "Strong", color: "bg-brand-emerald", width: "100%" };
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

            // If OTP verification required, transition to OTP step
            if (res.data?.requiresOtp) {
                setOtpEmail(cleanEmail);
                setStep("otp");
                setResendCooldown(60);
                setOtp(["", "", "", "", "", ""]);
                toast.success(res.data.message || "Verification code sent to your email!");
                return;
            }

            // Direct login fallback
            if (res.data?.token) {
                localStorage.setItem("token", res.data.token);
                if (res.data.refreshToken) {
                    localStorage.setItem("refreshToken", res.data.refreshToken);
                }
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

    // OTP Handlers
    const handleOtpChange = (index, value) => {
        const cleanValue = value.replace(/\D/g, "");
        const char = cleanValue.slice(-1);

        const newOtp = [...otp];
        newOtp[index] = char || "";
        setOtp(newOtp);
        if (error) setError("");

        // Advance to next input
        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto verify if all 6 digits entered
        const fullCode = newOtp.join("");
        if (fullCode.length === 6 && newOtp.every((d) => d !== "")) {
            handleVerifyOtp(fullCode);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData) {
            const digits = pastedData.split("");
            const newOtp = [...otp];
            digits.forEach((digit, idx) => {
                if (idx < 6) newOtp[idx] = digit;
            });
            setOtp(newOtp);
            const focusIndex = Math.min(digits.length, 5);
            inputRefs.current[focusIndex]?.focus();

            if (pastedData.length === 6) {
                handleVerifyOtp(pastedData);
            }
        }
    };

    const handleVerifyOtp = async (codeOverride) => {
        const code = codeOverride || otp.join("");
        if (code.length !== 6) {
            setError("Please enter the complete 6-digit verification code.");
            return;
        }

        setVerifying(true);
        setError("");

        try {
            const res = await api.post("/auth/verify-otp", {
                email: otpEmail,
                otp: code
            });

            if (res.data?.token) {
                localStorage.setItem("token", res.data.token);
                if (res.data.refreshToken) {
                    localStorage.setItem("refreshToken", res.data.refreshToken);
                }
                if (res.data.user) {
                    localStorage.setItem("userId", res.data.user.id);
                    localStorage.setItem("role", res.data.user.role);
                    localStorage.setItem("userName", res.data.user.name || formData.name);
                    localStorage.setItem("userEmail", res.data.user.email || otpEmail);
                }
                toast.success("Email verified successfully! Welcome to SkillForge.");
                navigate("/dashboard");
            } else {
                toast.success("Email verified! Please sign in with your credentials.");
                navigate("/login");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Invalid or expired verification code.";
            setError(errorMsg);
            toast.error(errorMsg);
            console.error(err);
        } finally {
            setVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || resending) return;

        setResending(true);
        setError("");

        try {
            const res = await api.post("/auth/resend-otp", { email: otpEmail });
            toast.success(res.data?.message || "Verification code resent!");
            setResendCooldown(60);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to resend code. Please try again.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col relative overflow-hidden selection:bg-brand-primary/30 selection:text-white">
            <NavBar />

            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none z-0" />
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-brand-secondary/15 blur-[140px] rounded-full pointer-events-none z-0 animate-ambient-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-cyan/15 blur-[130px] rounded-full pointer-events-none z-0" />

            <div className="flex-grow flex items-center justify-center py-12 sm:py-20 px-4 sm:px-6 relative z-10">
                <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
                    
                    {/* LEFT COLUMN: Developer Showcase */}
                    <motion.div 
                        initial={{ opacity: 0, x: -25 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="hidden lg:flex lg:col-span-5 flex-col space-y-6 pr-2"
                    >
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface/80 border border-brand-border/80 w-max shadow-sm backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                            <span className="text-xs font-semibold text-brand-muted">
                                Fast-Track Developer Onboarding
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl xl:text-5xl font-black text-brand-text tracking-tight leading-[1.15]">
                            Forge your skills as a <br />
                            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-cyan bg-clip-text text-transparent">
                                Systems Engineer.
                            </span>
                        </h1>

                        <p className="text-brand-muted text-sm sm:text-base leading-relaxed">
                            Join ambitious developers mastering real-world microservices, distributed architectures, and AI engineering workflows.
                        </p>

                        {/* Mini Terminal Preview */}
                        <div className="glass-card-elevated rounded-2xl p-4 font-mono text-xs text-slate-300 shadow-xl border border-brand-border/80 relative overflow-hidden">
                            <div className="flex items-center gap-1.5 pb-3 border-b border-white/[0.08] mb-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-amber/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-emerald/80" />
                                <span className="text-brand-subtle text-[11px] ml-2">quickstart.sh</span>
                            </div>
                            <p className="text-brand-subtle">$ npx create-skillforge-workspace</p>
                            <p className="text-brand-emerald mt-1">✓ Cloud container sandbox initialized</p>
                            <p className="text-slate-300 mt-1">✓ 50+ Production project tracks unlocked</p>
                            <p className="text-brand-cyan mt-1">✓ Verifiable certificate ledger linked</p>
                        </div>

                        {/* Value Checklist */}
                        <div className="space-y-2.5 pt-2 text-xs font-semibold text-brand-muted">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-brand-primary shrink-0" />
                                <span>Zero credit card required to start</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-brand-primary shrink-0" />
                                <span>In-browser cloud developer sandboxes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-brand-primary shrink-0" />
                                <span>Cryptographically verifiable LinkedIn certificates</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Signup Card */}
                    <div className="lg:col-span-7 w-full max-w-[500px] mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                            className="glass-card-elevated rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-brand-border/80"
                        >
                            {/* Animated Error Alert */}
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -3, 3, 0] }}
                                    transition={{ duration: 0.35 }}
                                    className="mb-4 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs sm:text-sm font-medium"
                                >
                                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            {step === "otp" ? (
                                <motion.div
                                    key="otp-step"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    {/* OTP Header */}
                                    <div className="flex items-center gap-3.5 mb-5">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center text-brand-primary shadow-inner">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight">
                                                Verify Your Email
                                            </h2>
                                            <p className="text-brand-muted text-xs mt-0.5">
                                                Enter the 6-digit code sent to your inbox.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email Info & Change Button */}
                                    <div className="p-3 bg-brand-surface/80 border border-brand-border/60 rounded-xl text-xs text-brand-muted mb-5 flex items-center justify-between">
                                        <div className="truncate pr-2">
                                            <span className="text-brand-subtle">Sent to: </span>
                                            <strong className="text-brand-text font-semibold">{otpEmail}</strong>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep("form");
                                                setError("");
                                            }}
                                            className="text-brand-primary hover:underline font-bold shrink-0 flex items-center gap-1 text-xs transition-colors"
                                        >
                                            <ArrowLeft size={13} /> Change
                                        </button>
                                    </div>

                                    {/* 6 SEGMENTED OTP INPUTS */}
                                    <div className="space-y-2 mb-5">
                                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider block text-center">
                                            6-Digit Verification Code
                                        </label>
                                        <div className="flex justify-between items-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                                            {otp.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    ref={(el) => (inputRefs.current[idx] = el)}
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                                    autoFocus={idx === 0}
                                                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border border-brand-border bg-brand-surface text-brand-text focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 transition-all outline-none"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* VERIFY BUTTON */}
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => handleVerifyOtp()}
                                        disabled={verifying || otp.join("").length !== 6}
                                        className="w-full bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white font-bold py-3 rounded-xl transition-all shadow-glow-primary/40 hover:shadow-glow-primary/60 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group text-sm border border-white/10"
                                    >
                                        {verifying ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                <span>Verifying Code...</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={16} />
                                                <span>Verify & Launch Workspace</span>
                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </motion.button>

                                    {/* RESEND & EXPIRY TIMER */}
                                    <div className="mt-5 text-center space-y-1.5">
                                        <div className="text-xs text-brand-muted">
                                            {resendCooldown > 0 ? (
                                                <span className="flex items-center justify-center gap-1.5 font-medium text-brand-subtle">
                                                    <RotateCw size={12} className="animate-spin text-brand-primary" />
                                                    Resend new code in <strong className="text-brand-text font-bold">{resendCooldown}s</strong>
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleResendOtp}
                                                    disabled={resending}
                                                    className="text-brand-primary hover:underline font-bold inline-flex items-center gap-1.5 transition-colors"
                                                >
                                                    {resending && <Loader2 size={13} className="animate-spin" />}
                                                    Didn't receive code? Resend
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-brand-subtle">
                                            Check your spam folder if the code doesn't arrive within 10 seconds.
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="mb-5">
                                        <h2 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                                            Create Free Account
                                        </h2>
                                        <p className="text-brand-muted mt-1 text-xs sm:text-sm">
                                            Start building production systems today.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                                        
                                        {/* ROLE SELECTION */}
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                                Joining as:
                                            </label>
                                            <div className="grid grid-cols-2 gap-2 bg-brand-surface/80 p-1 rounded-xl border border-brand-border relative">
                                                <button
                                                    type="button"
                                                    onClick={() => selectRole("student")}
                                                    className={`relative z-10 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                                                        formData.role === "student" ? "text-white" : "text-brand-muted hover:text-brand-text"
                                                    }`}
                                                >
                                                    {formData.role === "student" && (
                                                        <motion.div 
                                                            layoutId="role-indicator"
                                                            className="absolute inset-0 bg-gradient-to-r from-brand-primary to-indigo-600 rounded-lg shadow-sm -z-10"
                                                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                                                        />
                                                    )}
                                                    <GraduationCap size={15} />
                                                    <span>Student</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => selectRole("instructor")}
                                                    className={`relative z-10 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                                                        formData.role === "instructor" ? "text-white" : "text-brand-muted hover:text-brand-text"
                                                    }`}
                                                >
                                                    {formData.role === "instructor" && (
                                                        <motion.div 
                                                            layoutId="role-indicator"
                                                            className="absolute inset-0 bg-gradient-to-r from-brand-primary to-indigo-600 rounded-lg shadow-sm -z-10"
                                                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                                                        />
                                                    )}
                                                    <Presentation size={15} />
                                                    <span>Instructor</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* NAME & EMAIL FIELDS */}
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                                    Full Name
                                                </label>
                                                <div className="relative group">
                                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={15} />
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        autoComplete="name"
                                                        required
                                                        placeholder="Jane Developer"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        className="w-full bg-brand-surface/90 text-brand-text placeholder-brand-subtle border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                                    Email Address
                                                </label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={15} />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        autoComplete="email"
                                                        required
                                                        placeholder="you@domain.com"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="w-full bg-brand-surface/90 text-brand-text placeholder-brand-subtle border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
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
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={15} />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    autoComplete="new-password"
                                                    required
                                                    placeholder="Min. 8 characters"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full bg-brand-surface/90 text-brand-text placeholder-brand-subtle border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary rounded-xl py-2 pl-9 pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text transition-colors p-1"
                                                    tabIndex={-1}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>

                                            {/* PASSWORD STRENGTH METER */}
                                            {formData.password && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="pt-1 space-y-1"
                                                >
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-brand-muted font-medium text-[10px]">Password Strength:</span>
                                                        <span className={`font-bold text-[10px] ${
                                                            strength.label === 'Strong' ? 'text-brand-emerald' :
                                                            strength.label === 'Good' ? 'text-brand-primary' :
                                                            strength.label === 'Fair' ? 'text-brand-amber' : 'text-red-400'
                                                        }`}>
                                                            {strength.label}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1 bg-brand-surface rounded-full overflow-hidden">
                                                        <motion.div 
                                                            className={`h-full rounded-full ${strength.color}`} 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: strength.width }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* CONFIRM PASSWORD FIELD */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                                    Confirm Password
                                                </label>
                                                {passwordsMatch && (
                                                    <span className="text-[11px] font-semibold text-brand-emerald flex items-center gap-1">
                                                        <Check size={11} /> Matches
                                                    </span>
                                                )}
                                                {passwordsDoNotMatch && (
                                                    <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
                                                        <X size={11} /> Does not match
                                                    </span>
                                                )}
                                            </div>
                                            <div className="relative group">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={15} />
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    autoComplete="new-password"
                                                    required
                                                    placeholder="Re-enter your password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`w-full bg-brand-surface/90 text-brand-text placeholder-brand-subtle border rounded-xl py-2 pl-9 pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all font-mono ${
                                                        passwordsDoNotMatch
                                                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                                            : passwordsMatch
                                                            ? "border-brand-emerald/50 focus:border-brand-emerald focus:ring-brand-emerald/20"
                                                            : "border-brand-border hover:border-brand-primary/40 focus:border-brand-primary focus:ring-brand-primary/20"
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text transition-colors p-1"
                                                    tabIndex={-1}
                                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
                                                    <span>Creating Workspace...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Create Free Account</span>
                                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </motion.button>
                                    </form>

                                    <div className="mt-5 pt-4 border-t border-brand-border/60 text-center">
                                        <p className="text-brand-muted text-xs sm:text-sm">
                                            Already have an account?{" "}
                                            <button onClick={() => navigate("/login")} className="text-brand-primary font-bold hover:underline transition-colors">
                                                Sign in
                                            </button>
                                        </p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Signup;

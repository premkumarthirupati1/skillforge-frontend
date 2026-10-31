import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../../api";
import NavBar from "../../components/NavBar";
import { 
    Lock, 
    KeyRound, 
    Eye, 
    EyeOff, 
    Check, 
    X, 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft, 
    ShieldAlert 
} from "lucide-react";

function ResetPassword() {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const navigate = useNavigate();

    const [isVerifying, setIsVerifying] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [verificationError, setVerificationError] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setIsVerifying(false);
            setIsTokenValid(false);
            setVerificationError("Invalid reset link. Missing token or email parameter.");
            return;
        }

        const verifyToken = async () => {
            try {
                await api.post(`/auth/forgot-password/${token}/${email}`);
                setIsTokenValid(true);
            } catch (err) {
                const errorMsg = err.response?.data?.message || "This password reset link is invalid or has expired.";
                setVerificationError(errorMsg);
                setIsTokenValid(false);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token, email]);

    // Password criteria analysis
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialOrUpper = /[^a-zA-Z0-9]/.test(password) || /[A-Z]/.test(password);

    const criteriaMet = [hasMinLength, hasLetter, hasNumber, hasSpecialOrUpper].filter(Boolean).length;

    const getStrengthInfo = () => {
        if (!password) return { label: "", color: "bg-brand-border", width: "0%" };
        if (criteriaMet === 1) return { label: "Weak", color: "bg-red-500", width: "25%" };
        if (criteriaMet === 2) return { label: "Fair", color: "bg-brand-amber", width: "50%" };
        if (criteriaMet === 3) return { label: "Good", color: "bg-brand-primary", width: "75%" };
        return { label: "Strong", color: "bg-brand-emerald", width: "100%" };
    };

    const strength = getStrengthInfo();
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordsDoNotMatch = confirmPassword.length > 0 && password !== confirmPassword;

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!hasMinLength) {
            setFormError("Password must be at least 8 characters long.");
            return;
        }

        if (!hasLetter || !hasNumber) {
            setFormError("Password must contain at least one letter and one number.");
            return;
        }

        if (password !== confirmPassword) {
            setFormError("Passwords do not match. Please verify.");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post(`/auth/reset-password/${email}`, { password, token });
            setIsSuccess(true);
            toast.success("Password updated successfully!");

            setTimeout(() => {
                navigate("/login");
            }, 2500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to update password. Please try again.";
            setFormError(errorMsg);
            toast.error(errorMsg);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col relative overflow-hidden selection:bg-brand-primary/30 selection:text-white">
            <NavBar />

            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none z-0" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/15 blur-[140px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 relative z-10">
                <div className="w-full max-w-[460px]">
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="glass-card-elevated rounded-3xl p-7 sm:p-9 shadow-2xl relative border border-brand-border/80"
                    >
                        {/* STATE 1: Token Verifying */}
                        {isVerifying && (
                            <div className="py-12 text-center space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center mx-auto shadow-sm">
                                    <Loader2 size={26} className="animate-spin text-brand-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-text">
                                    Verifying Security Token
                                </h3>
                                <p className="text-brand-muted text-xs max-w-xs mx-auto">
                                    Authenticating your recovery link. This takes just a moment...
                                </p>
                            </div>
                        )}

                        {/* STATE 2: Token Invalid / Expired */}
                        {!isVerifying && !isTokenValid && (
                            <div className="text-center space-y-4 py-3">
                                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-sm">
                                    <ShieldAlert size={26} />
                                </div>

                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight">
                                        Link Expired or Invalid
                                    </h3>
                                    <p className="text-brand-muted text-xs mt-1.5 leading-relaxed">
                                        {verificationError || "This password recovery link has expired or has already been used. Security links are valid for 15 minutes."}
                                    </p>
                                </div>

                                <div className="space-y-2.5 pt-2">
                                    <Link
                                        to="/forgot-password"
                                        className="w-full bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white font-bold py-3 px-6 rounded-xl transition-all shadow-glow-primary/40 flex items-center justify-center gap-2 text-sm border border-white/10"
                                    >
                                        <span>Request New Reset Link</span>
                                        <ArrowRight size={16} />
                                    </Link>

                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors pt-2"
                                    >
                                        <ArrowLeft size={14} />
                                        <span>Back to Sign In</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* STATE 3: Success State */}
                        {!isVerifying && isTokenValid && isSuccess && (
                            <div className="py-4 text-center space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center mx-auto shadow-sm">
                                    <CheckCircle2 size={30} />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-brand-text tracking-tight">
                                        Password Updated!
                                    </h3>
                                    <p className="text-brand-muted text-xs sm:text-sm mt-1">
                                        Your account credentials have been successfully updated.
                                    </p>
                                </div>

                                <div className="p-3 bg-brand-surface/80 border border-brand-border/60 rounded-xl">
                                    <p className="text-xs text-brand-muted">
                                        Redirecting you to the sign-in screen now...
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate("/login")}
                                    className="w-full bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white font-bold py-3 px-6 rounded-xl transition-all shadow-glow-primary/40 flex items-center justify-center gap-2 text-sm border border-white/10"
                                >
                                    <span>Sign In Now</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* STATE 4: Form Input */}
                        {!isVerifying && isTokenValid && !isSuccess && (
                            <>
                                <div className="mb-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold mb-3">
                                        <KeyRound size={13} />
                                        <span>Security Recovery</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                                        Create New Password
                                    </h2>
                                    <p className="text-brand-muted mt-1 text-xs sm:text-sm">
                                        Set a secure new password for <span className="font-semibold text-brand-text">{email}</span>.
                                    </p>
                                </div>

                                {formError && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -3, 3, 0] }}
                                        transition={{ duration: 0.35 }}
                                        className="mb-5 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs sm:text-sm font-medium"
                                    >
                                        <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                                        <span>{formError}</span>
                                    </motion.div>
                                )}

                                <form onSubmit={handlePasswordReset} className="space-y-4" noValidate>
                                    
                                    {/* NEW PASSWORD INPUT */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                            New Password
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors">
                                                <Lock size={16} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    if (formError) setFormError("");
                                                }}
                                                disabled={isSubmitting}
                                                className="w-full bg-brand-surface/90 text-brand-text placeholder-brand-subtle border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-11 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono"
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

                                        {/* PASSWORD STRENGTH BAR */}
                                        {password.length > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-brand-subtle text-[10px]">Password strength:</span>
                                                    <span className={`font-bold text-[10px] ${
                                                        criteriaMet <= 1 ? "text-red-400" :
                                                        criteriaMet === 2 ? "text-brand-amber" :
                                                        criteriaMet === 3 ? "text-brand-primary" : "text-brand-emerald"
                                                    }`}>
                                                        {strength.label}
                                                    </span>
                                                </div>
                                                <div className="h-1 w-full bg-brand-surface rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-300 rounded-full ${strength.color}`} 
                                                        style={{ width: strength.width }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONFIRM PASSWORD INPUT */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                                Confirm New Password
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
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors">
                                                <Lock size={16} />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value);
                                                    if (formError) setFormError("");
                                                }}
                                                disabled={isSubmitting}
                                                className={`w-full bg-brand-surface/90 text-brand-text placeholder-brand-subtle border rounded-xl py-2.5 pl-10 pr-11 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all font-mono ${
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
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white font-bold py-3 rounded-xl transition-all shadow-glow-primary/40 hover:shadow-glow-primary/60 flex items-center justify-center gap-2 mt-3 disabled:opacity-70 disabled:cursor-not-allowed group text-sm border border-white/10"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Updating Password...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Save & Continue</span>
                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;

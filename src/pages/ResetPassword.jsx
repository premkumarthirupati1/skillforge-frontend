import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api";
import NavBar from "../components/NavBar";
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
        if (criteriaMet === 2) return { label: "Fair", color: "bg-amber-500", width: "50%" };
        if (criteriaMet === 3) return { label: "Good", color: "bg-blue-500", width: "75%" };
        return { label: "Strong", color: "bg-emerald-500", width: "100%" };
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
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-page flex flex-col relative overflow-hidden">
            <NavBar />

            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center py-24 px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-hero">
                <div className="w-full max-w-[460px]">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 sm:p-9 shadow-2xl relative backdrop-blur-xl">

                        {/* STATE 1: Token Verifying */}
                        {isVerifying && (
                            <div className="py-12 text-center space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center mx-auto shadow-lg shadow-brand-primary/10">
                                    <Loader2 size={28} className="animate-spin text-brand-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-text">
                                    Verifying Security Token
                                </h3>
                                <p className="text-brand-subtle text-xs max-w-xs mx-auto">
                                    Authenticating your recovery link. This takes just a moment...
                                </p>
                            </div>
                        )}

                        {/* STATE 2: Token Invalid / Expired */}
                        {!isVerifying && !isTokenValid && (
                            <div className="text-center space-y-5">
                                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
                                    <ShieldAlert size={28} />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-extrabold text-brand-text tracking-tight">
                                        Link Expired or Invalid
                                    </h3>
                                    <p className="text-brand-subtle text-xs mt-2 leading-relaxed">
                                        {verificationError || "This password recovery link has expired or has already been used. Security links are valid for 15 minutes."}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Link
                                        to="/forgot-password"
                                        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-primary/25 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <span>Request New Reset Link</span>
                                        <ArrowRight size={16} />
                                    </Link>

                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors pt-2"
                                    >
                                        <ArrowLeft size={16} />
                                        <span>Back to Sign In</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* STATE 3: Success State */}
                        {!isVerifying && isTokenValid && isSuccess && (
                            <div className="py-6 text-center space-y-5">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
                                    <CheckCircle2 size={32} />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-extrabold text-brand-text tracking-tight">
                                        Password Updated!
                                    </h3>
                                    <p className="text-brand-subtle text-sm mt-1.5">
                                        Your account credentials have been successfully updated.
                                    </p>
                                </div>

                                <div className="p-3.5 bg-brand-elevated border border-brand-border rounded-xl">
                                    <p className="text-xs text-brand-muted">
                                        Redirecting you to the sign-in screen now...
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate("/login")}
                                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-primary/25 flex items-center justify-center gap-2 text-sm"
                                >
                                    <span>Sign In Now</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* STATE 4: Form Input */}
                        {!isVerifying && isTokenValid && !isSuccess && (
                            <>
                                <div className="mb-7">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold mb-3">
                                        <KeyRound size={13} />
                                        <span>Security Recovery</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
                                        Create New Password
                                    </h2>
                                    <p className="text-brand-subtle mt-1.5 text-xs sm:text-sm">
                                        Set a secure new password for <span className="font-semibold text-brand-text">{email}</span>.
                                    </p>
                                </div>

                                {formError && (
                                    <div className="mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm font-medium animate-in fade-in duration-200">
                                        <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                <form onSubmit={handlePasswordReset} className="space-y-5" noValidate>
                                    
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

                                        {/* PASSWORD STRENGTH BAR */}
                                        {password.length > 0 && (
                                            <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-brand-subtle">Password strength:</span>
                                                    <span className={`font-semibold ${
                                                        criteriaMet <= 1 ? "text-red-400" :
                                                        criteriaMet === 2 ? "text-amber-400" :
                                                        criteriaMet === 3 ? "text-blue-400" : "text-emerald-400"
                                                    }`}>
                                                        {strength.label}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-brand-elevated rounded-full overflow-hidden border border-brand-border/40">
                                                    <div 
                                                        className={`h-full transition-all duration-300 rounded-full ${strength.color}`} 
                                                        style={{ width: strength.width }}
                                                    />
                                                </div>

                                                {/* CRITERIA CHECKLIST */}
                                                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                                                    <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400 font-medium" : "text-brand-subtle"}`}>
                                                        {hasMinLength ? <Check size={12} className="text-emerald-400 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-brand-subtle shrink-0" />}
                                                        <span>8+ characters</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 ${hasLetter && hasNumber ? "text-emerald-400 font-medium" : "text-brand-subtle"}`}>
                                                        {hasLetter && hasNumber ? <Check size={12} className="text-emerald-400 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-brand-subtle shrink-0" />}
                                                        <span>Letters & numbers</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONFIRM NEW PASSWORD INPUT */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                                Confirm New Password
                                            </label>
                                            {passwordsMatch && (
                                                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                                    <Check size={12} /> Match
                                                </span>
                                            )}
                                            {passwordsDoNotMatch && (
                                                <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
                                                    <X size={12} /> Do not match
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
                                                className={`w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border rounded-xl py-3 pl-10 pr-11 text-sm focus:outline-none focus:ring-2 transition-all font-mono ${
                                                    passwordsMatch 
                                                        ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20" 
                                                        : passwordsDoNotMatch 
                                                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" 
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

                                    {/* SUBMIT BUTTON */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !hasMinLength || !hasLetter || !hasNumber || !passwordsMatch}
                                        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                <span>Updating Password...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Update Password</span>
                                                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-brand-border/60 text-center">
                                    <Link 
                                        to="/login" 
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors group"
                                    >
                                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                                        <span>Back to Sign In</span>
                                    </Link>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;

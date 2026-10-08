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
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-page flex flex-col relative overflow-hidden">
            <NavBar />

            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-brand-secondary/10 blur-[100px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center py-24 px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-hero">
                <div className="w-full max-w-[500px]">
                    <div className="bg-brand-surface border border-brand-border rounded-xl p-8 shadow-2xl relative">
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-brand-text tracking-tight">
                                Join SkillForge
                            </h2>
                            <p className="text-brand-subtle mt-1 text-sm">
                                Start your engineering journey today.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm font-medium">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            {/* ROLE SELECTION */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">I am a...</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => selectRole("student")}
                                        className={`cursor-pointer p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${formData.role === "student"
                                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                                            : "border-brand-border bg-brand-elevated text-brand-muted hover:border-brand-primary/50"
                                            }`}
                                    >
                                        <GraduationCap size={18} />
                                        <span className="text-sm font-semibold">Student</span>
                                    </div>
                                    <div
                                        onClick={() => selectRole("instructor")}
                                        className={`cursor-pointer p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${formData.role === "instructor"
                                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                                            : "border-brand-border bg-brand-elevated text-brand-muted hover:border-brand-primary/50"
                                            }`}
                                    >
                                        <Presentation size={18} />
                                        <span className="text-sm font-semibold">Instructor</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={16} />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={16} />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="you@domain.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Create Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={16} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="Min. 8 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-text text-brand-bg hover:bg-brand-text/90 font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group text-sm"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-brand-border text-center">
                            <p className="text-brand-subtle text-sm">
                                Already part of the forge?{" "}
                                <button onClick={() => navigate("/login")} className="text-brand-text font-semibold hover:text-brand-primary transition-colors">
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

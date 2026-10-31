import NavBar from "../../components/NavBar";
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function ComingSoon({ title = "Feature Coming Soon" }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col relative overflow-hidden font-sans selection:bg-brand-primary/30 selection:text-white">
            <NavBar />

            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-primary/15 blur-[140px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45 }}
                    className="glass-card-elevated rounded-3xl p-8 sm:p-12 text-center max-w-lg w-full border border-brand-border/80 shadow-2xl"
                >
                    <div className="w-16 h-16 glass-card border border-brand-border rounded-2xl mx-auto flex items-center justify-center mb-6 text-brand-cyan shadow-glow-cyan/30">
                        <Sparkles size={28} />
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight mb-3">
                        {title}
                    </h1>
                    
                    <p className="text-brand-muted text-sm sm:text-base mb-8 leading-relaxed">
                        We're forging this section of the platform right now. It will be unlocked with automated challenges and multiplayer collaboration in the upcoming release.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto glass-card border border-brand-border hover:bg-brand-elevated text-brand-text px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={15} />
                            Go Back
                        </button>
                        <button
                            onClick={() => navigate("/courses")}
                            className="w-full sm:w-auto bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-glow-primary/40 transition-all inline-flex items-center justify-center gap-2 border border-white/10"
                        >
                            <span>Explore Courses</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default ComingSoon;

import NavBar from "../components/NavBar";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ComingSoon({ title = "Feature Coming Soon" }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-page flex flex-col relative overflow-hidden">
            <NavBar />

            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center py-24 px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-hero">
                <div className="text-center max-w-lg">
                    <div className="w-16 h-16 bg-brand-elevated border border-brand-border rounded-2xl mx-auto flex items-center justify-center mb-6 text-brand-primary shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                        <Sparkles size={32} />
                    </div>
                    
                    <h1 className="text-4xl font-bold text-brand-text tracking-tight mb-4 text-glow">
                        {title}
                    </h1>
                    
                    <p className="text-brand-muted text-lg mb-8 leading-relaxed">
                        We're forging this section of the platform right now. It will be available in the upcoming 2.0 release updates.
                    </p>
                    
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-brand-surface border border-brand-border text-brand-text px-6 py-2.5 rounded-lg font-medium hover:bg-brand-elevated hover:border-brand-primary/30 transition-all inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ComingSoon;

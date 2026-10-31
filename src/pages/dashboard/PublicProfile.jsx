import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { 
    User, 
    AtSign,
    Github, 
    Twitter, 
    Linkedin, 
    Calendar, 
    ArrowLeft, 
    ShieldCheck, 
    Edit3, 
    Lock,
    ExternalLink,
    Copy,
    Check,
    Sparkles
} from "lucide-react";
import NavBar from "../../components/NavBar";
import api from "../../api";
import { getImageUrl } from "../../utils/imageHelper";

function PublicProfile() {
    const { identifier, userId } = useParams();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const targetIdentifier = identifier || userId;

    useEffect(() => {
        const fetchPublicProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/user/profile/${targetIdentifier}`);
                setProfile(res.data);
            } catch (err) {
                console.error("Public profile fetch error:", err);
                const status = err.response?.status;
                if (status === 403) {
                    setError("This developer profile is set to private.");
                } else if (status === 404) {
                    setError("Developer profile not found.");
                } else {
                    setError(err.response?.data?.message || "Failed to load public profile.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (targetIdentifier) {
            fetchPublicProfile();
        }
    }, [targetIdentifier]);

    const currentLoggedInUserId = localStorage.getItem("userId");
    const currentLoggedInHandle = localStorage.getItem("userHandle");
    
    const isOwner = Boolean(
        (currentLoggedInUserId && (
            currentLoggedInUserId === profile?.userId?._id || 
            currentLoggedInUserId === profile?.userId ||
            currentLoggedInUserId === profile?._id
        )) ||
        (currentLoggedInHandle && (
            currentLoggedInHandle === profile?.username || 
            currentLoggedInHandle === profile?.userId?.username
        ))
    );

    const memberSinceDate = profile?.userId?.createdAt || profile?.createdAt;
    const memberSince = memberSinceDate 
        ? new Date(memberSinceDate).toLocaleDateString("en-US", { month: "long", year: "numeric" }) 
        : "Recent";

    const role = (profile?.userId?.role || "STUDENT").toUpperCase();
    const displayName = profile?.name || profile?.userId?.name || profile?.username || "Developer";
    const username = profile?.username || profile?.userId?.username || "";

    const avatarSrc = profile?.avatar 
        ? getImageUrl(profile.avatar) 
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${username || targetIdentifier || displayName || 'skillforge'}`;

    const socials = profile?.socials || {};

    const handleCopyProfileLink = () => {
        const handle = username || targetIdentifier;
        const url = `${window.location.origin}/u/${handle}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Profile link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans relative selection:bg-brand-primary/30 selection:text-white">
            <NavBar />

            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-primary/10 blur-[140px] rounded-full pointer-events-none z-0" />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
                {/* Back navigation & Actions */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>

                    <div className="flex items-center gap-2.5">
                        {profile && (
                            <button
                                onClick={handleCopyProfileLink}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card hover:bg-brand-elevated border border-brand-border text-xs font-semibold text-brand-text transition-all shadow-sm"
                                title="Share profile"
                            >
                                {copied ? <Check size={13} className="text-brand-emerald" /> : <Copy size={13} className="text-brand-muted" />}
                                <span>{copied ? "Copied" : "Share"}</span>
                            </button>
                        )}

                        {isOwner && (
                            <Link 
                                to="/profile"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-primary to-indigo-600 text-white text-xs font-bold transition-all shadow-glow-primary/40 border border-white/10"
                            >
                                <Edit3 size={13} />
                                Edit Profile
                            </Link>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-2 border-brand-border border-t-brand-primary rounded-full animate-spin"></div>
                        <p className="text-xs font-semibold text-brand-muted animate-pulse">Loading developer profile...</p>
                    </div>
                )}

                {/* Error / Private Profile State */}
                {!loading && error && (
                    <div className="glass-card-elevated rounded-3xl p-10 text-center max-w-md mx-auto my-12 shadow-md border border-brand-border">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-amber/10 border border-brand-amber/20 text-brand-amber flex items-center justify-center mb-4">
                            <Lock size={26} />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-brand-text mb-2">
                            Profile Unavailable
                        </h2>
                        <p className="text-xs sm:text-sm text-brand-muted mb-6 leading-relaxed">
                            {error}
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md transition-all"
                        >
                            Return to Homepage
                        </button>
                    </div>
                )}

                {/* Main Public Profile Card */}
                {!loading && !error && profile && (
                    <div className="glass-card-elevated rounded-3xl overflow-hidden shadow-2xl border border-brand-border/80">
                        {/* Decorative Gradient Banner */}
                        <div className="h-40 sm:h-48 bg-gradient-to-r from-brand-primary/25 via-brand-secondary/20 to-brand-cyan/20 relative border-b border-brand-border/60">
                            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
                        </div>

                        {/* Profile Content Container */}
                        <div className="px-6 sm:px-10 pb-10 relative">
                            {/* Avatar */}
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl glass-card p-2 shadow-2xl border-2 border-brand-border relative z-10">
                                    <img 
                                        src={avatarSrc} 
                                        alt={displayName} 
                                        className="w-full h-full rounded-2xl object-cover bg-brand-surface"
                                    />
                                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-brand-emerald border-2 border-brand-surface flex items-center justify-center text-white" title="Verified Member">
                                        <ShieldCheck size={14} />
                                    </div>
                                </div>
                            </div>

                            {/* Name, Handle, Role & Metadata */}
                            <div className="space-y-2 mb-8">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-text">
                                        {displayName}
                                    </h1>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-mono font-bold tracking-wider uppercase border border-brand-primary/25">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                                        {role}
                                    </span>
                                </div>

                                {username && (
                                    <p className="text-xs sm:text-sm font-mono text-brand-muted">
                                        @{username}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 text-xs text-brand-subtle pt-1 font-medium">
                                    <Calendar size={13} />
                                    <span>Joined {memberSince}</span>
                                </div>
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                                <div className="mb-8 p-4 rounded-2xl glass-card border border-brand-border/60">
                                    <p className="text-xs sm:text-sm text-brand-text leading-relaxed whitespace-pre-line">
                                        {profile.bio}
                                    </p>
                                </div>
                            )}

                            {/* Social Profiles */}
                            <div className="space-y-3 pt-2 border-t border-brand-border/60">
                                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-muted">
                                    Connected Profiles
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {socials.github && (
                                        <a 
                                            href={`https://github.com/${socials.github.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card hover:bg-brand-elevated border border-brand-border text-xs font-semibold text-brand-text transition-all group"
                                        >
                                            <Github size={15} className="text-brand-muted group-hover:text-brand-text" />
                                            <span>github.com/{socials.github.replace('@', '')}</span>
                                            <ExternalLink size={12} className="text-brand-subtle" />
                                        </a>
                                    )}

                                    {socials.twitter && (
                                        <a 
                                            href={`https://twitter.com/${socials.twitter.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card hover:bg-brand-elevated border border-brand-border text-xs font-semibold text-brand-text transition-all group"
                                        >
                                            <Twitter size={15} className="text-brand-cyan group-hover:text-brand-cyan" />
                                            <span>@{socials.twitter.replace('@', '')}</span>
                                            <ExternalLink size={12} className="text-brand-subtle" />
                                        </a>
                                    )}

                                    {socials.linkedin && (
                                        <a 
                                            href={`https://linkedin.com/in/${socials.linkedin.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card hover:bg-brand-elevated border border-brand-border text-xs font-semibold text-brand-text transition-all group"
                                        >
                                            <Linkedin size={15} className="text-brand-primary group-hover:text-brand-primary" />
                                            <span>linkedin.com/in/{socials.linkedin.replace('@', '')}</span>
                                            <ExternalLink size={12} className="text-brand-subtle" />
                                        </a>
                                    )}

                                    {!socials.github && !socials.twitter && !socials.linkedin && (
                                        <p className="text-xs text-brand-subtle italic">No public social handles linked yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PublicProfile;

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
    User, 
    Github, 
    Twitter, 
    Linkedin, 
    Calendar, 
    ArrowLeft, 
    ShieldCheck, 
    Edit3, 
    Lock,
    ExternalLink,
    AlertCircle
} from "lucide-react";
import NavBar from "../../components/NavBar";
import api from "../../api";
import { getImageUrl } from "../../utils/imageHelper";

function PublicProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentLoggedInUserId = localStorage.getItem("userId");
    const isOwner = currentLoggedInUserId && currentLoggedInUserId === userId;

    useEffect(() => {
        const fetchPublicProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/user/profile/${userId}`);
                setProfile(res.data);
            } catch (err) {
                console.error("Public profile fetch error:", err);
                const status = err.response?.status;
                if (status === 403) {
                    setError("This profile is private.");
                } else if (status === 404) {
                    setError("Developer profile not found.");
                } else {
                    setError(err.response?.data?.message || "Failed to load public profile.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchPublicProfile();
        }
    }, [userId]);

    const memberSinceDate = profile?.userId?.createdAt || profile?.createdAt;
    const memberSince = memberSinceDate 
        ? new Date(memberSinceDate).toLocaleDateString("en-US", { month: "long", year: "numeric" }) 
        : "Recent";

    const role = (profile?.userId?.role || "STUDENT").toUpperCase();
    const displayName = profile?.name || profile?.userId?.name || "Developer";

    const avatarSrc = profile?.avatar 
        ? getImageUrl(profile.avatar) 
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${userId || displayName || 'skillforge'}`;

    const socials = profile?.socials || {};

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col antialiased selection:bg-brand-primary/20 selection:text-brand-primary">
            <NavBar />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Back navigation */}
                <div className="mb-6 flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back
                    </button>

                    {isOwner && (
                        <Link 
                            to="/profile"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-xs font-bold transition-all shadow-sm"
                        >
                            <Edit3 size={13} />
                            Edit Your Profile
                        </Link>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-brand-muted">Fetching public profile...</p>
                    </div>
                )}

                {/* Error / Private Profile State */}
                {!loading && error && (
                    <div className="bg-brand-surface border border-brand-border rounded-3xl p-10 text-center max-w-md mx-auto my-12 shadow-md">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
                            <Lock size={28} />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-brand-text mb-2">
                            Profile Unavailable
                        </h2>
                        <p className="text-sm text-brand-muted mb-6 leading-relaxed">
                            {error}
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold transition-all shadow-sm"
                        >
                            Return to Homepage
                        </button>
                    </div>
                )}

                {/* Main Public Profile Card */}
                {!loading && !error && profile && (
                    <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-xl">
                        {/* Decorative Gradient Banner */}
                        <div className="h-40 sm:h-48 bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-brand-primary/15 relative border-b border-brand-border/60">
                            <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none"></div>
                        </div>

                        {/* Profile Content Container */}
                        <div className="px-6 sm:px-10 pb-10 relative">
                            {/* Avatar & Top Identity Row */}
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-brand-surface p-2 shadow-2xl border-2 border-brand-border relative z-10">
                                    <img 
                                        src={avatarSrc} 
                                        alt={displayName} 
                                        className="w-full h-full rounded-2xl object-cover bg-brand-elevated"
                                    />
                                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-brand-surface flex items-center justify-center text-white" title="Verified Member">
                                        <ShieldCheck size={14} />
                                    </div>
                                </div>

                                {isOwner && (
                                    <Link 
                                        to="/profile"
                                        className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-elevated hover:bg-brand-border/70 border border-brand-border text-xs font-bold text-brand-text transition-colors shadow-sm self-start sm:self-auto"
                                    >
                                        <Edit3 size={14} className="text-brand-primary" />
                                        Edit Profile
                                    </Link>
                                )}
                            </div>

                            {/* Name, Role & Metadata */}
                            <div className="space-y-2 mb-8">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-text">
                                        {displayName}
                                    </h1>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-mono font-bold tracking-wider uppercase border border-brand-primary/25">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                                        {role}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-brand-muted">
                                    <Calendar size={13} className="text-brand-subtle" />
                                    <span>Member since {memberSince}</span>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div className="mb-8 p-5 rounded-2xl bg-brand-elevated/40 border border-brand-border/60">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-2">
                                    About Developer
                                </h2>
                                <p className="text-sm text-brand-text/90 leading-relaxed font-normal">
                                    {profile.bio && profile.bio.trim() ? (
                                        profile.bio.trim()
                                    ) : (
                                        <span className="italic text-brand-muted">
                                            This developer hasn't added a biography yet.
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Connected Developer Links */}
                            <div className="border-t border-brand-border/70 pt-6">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-4">
                                    Connected Profiles
                                </h2>
                                
                                {socials.github || socials.linkedin || socials.twitter ? (
                                    <div className="flex flex-wrap gap-3">
                                        {socials.github && (
                                            <a 
                                                href={socials.github.startsWith("http") ? socials.github : `https://${socials.github}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-brand-elevated hover:bg-brand-primary hover:text-white border border-brand-border text-xs font-semibold text-brand-text transition-all shadow-sm group"
                                            >
                                                <Github size={16} />
                                                <span>GitHub</span>
                                                <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}

                                        {socials.linkedin && (
                                            <a 
                                                href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://${socials.linkedin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0077B5]/10 hover:bg-[#0077B5] hover:text-white border border-[#0077B5]/30 text-xs font-semibold text-[#0077B5] transition-all shadow-sm group"
                                            >
                                                <Linkedin size={16} />
                                                <span>LinkedIn</span>
                                                <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}

                                        {socials.twitter && (
                                            <a 
                                                href={socials.twitter.startsWith("http") ? socials.twitter : `https://${socials.twitter}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2] hover:text-white border border-[#1DA1F2]/30 text-xs font-semibold text-[#1DA1F2] transition-all shadow-sm group"
                                            >
                                                <Twitter size={16} />
                                                <span>Twitter / X</span>
                                                <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-brand-muted italic">
                                        No external profiles linked.
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PublicProfile;

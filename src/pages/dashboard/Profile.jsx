import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { 
    User, 
    AtSign,
    Github,
    Twitter,
    Linkedin,
    Mail,
    Save,
    RotateCcw,
    Camera,
    ShieldCheck,
    Calendar,
    ArrowLeft,
    ExternalLink,
    CheckCircle2,
    Copy,
    Check
} from "lucide-react";
import NavBar from "../../components/NavBar";
import api from "../../api";
import { getImageUrl } from "../../utils/imageHelper";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [socials, setSocials] = useState({ github: "", twitter: "", linkedin: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    // Initial backup state for resetting
    const [initialState, setInitialState] = useState({
        name: "",
        username: "",
        bio: "",
        socials: { github: "", twitter: "", linkedin: "" }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get('/user/profile');
            const data = (Array.isArray(res.data) ? res.data[0] : res.data) || {};
            setUser(data);
            
            const initialName = data.name || localStorage.getItem("userName") || "";
            const initialUsername = data.username || data.userId?.username || "";
            const initialBio = data.bio || "";
            const initialSocials = {
                github: data.socials?.github || "",
                twitter: data.socials?.twitter || "",
                linkedin: data.socials?.linkedin || ""
            };

            setName(initialName);
            setUsername(initialUsername);
            setBio(initialBio);
            setSocials(initialSocials);
            setInitialState({
                name: initialName,
                username: initialUsername,
                bio: initialBio,
                socials: initialSocials
            });
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            toast.error("Could not load profile details");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Avatar image must be under 5MB");
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleClearAvatarPreview = () => {
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const handleSocialChange = (key, value) => {
        setSocials(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        setName(initialState.name);
        setUsername(initialState.username);
        setBio(initialState.bio);
        setSocials({ ...initialState.socials });
        handleClearAvatarPreview();
        toast("Changes reverted to saved profile", { icon: "↩️" });
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        
        if (!name.trim()) {
            toast.error("Full name cannot be blank");
            return;
        }

        const cleanUsername = username.trim().toLowerCase();
        if (cleanUsername) {
            const usernameRegex = /^[a-z0-9_-]{3,30}$/;
            if (!usernameRegex.test(cleanUsername)) {
                toast.error("Username must be 3-30 letters, numbers, hyphens, or underscores.");
                return;
            }
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            if (cleanUsername) {
                formData.append("username", cleanUsername);
            }
            formData.append("bio", bio);
            formData.append("socials", JSON.stringify(socials));
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await api.put('/user/profile', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const updatedData = res.data;
            setUser(updatedData);
            setInitialState({
                name: updatedData.name || name,
                username: updatedData.username || cleanUsername,
                bio: updatedData.bio || bio,
                socials: updatedData.socials || socials
            });
            
            // Sync local storage display name & username
            if (name.trim()) {
                localStorage.setItem("userName", name.trim());
            }
            if (updatedData.username) {
                localStorage.setItem("userHandle", updatedData.username);
            }

            // Cleanup preview URL
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(null);
            }
            setAvatarFile(null);

            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Profile update failed:", err);
            const msg = err.response?.data?.message || "Failed to update profile";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    // Derived fields
    const email = user?.userId?.email || localStorage.getItem("userEmail") || "account@skillforge.dev";
    const role = (user?.userId?.role || localStorage.getItem("role") || "student").toUpperCase();
    const memberSinceDate = user?.userId?.createdAt || user?.createdAt;
    const memberSince = memberSinceDate 
        ? new Date(memberSinceDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "Recent";

    // Avatar source determination
    const displayAvatarSrc = avatarPreview 
        || (user?.avatar ? getImageUrl(user.avatar) : null) 
        || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?._id || user?.userId?._id || username || name || 'skillforge'}`;

    const hasUnsavedChanges = name !== initialState.name ||
        username !== initialState.username ||
        bio !== initialState.bio ||
        socials.github !== initialState.socials.github ||
        socials.twitter !== initialState.socials.twitter ||
        socials.linkedin !== initialState.socials.linkedin ||
        avatarFile !== null;

    const targetUserId = user?.userId?._id || (typeof user?.userId === 'string' ? user?.userId : null) || localStorage.getItem("userId");
    const publicHandle = username || user?.username || targetUserId;

    const handleCopyPublicLink = () => {
        if (!publicHandle) return;
        const url = `${window.location.origin}/u/${publicHandle}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Public profile link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
                <NavBar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-brand-muted">Loading profile details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col antialiased selection:bg-brand-primary/20 selection:text-brand-primary">
            <NavBar />

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* Back Link & Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors mb-3 group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to Dashboard
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-text">
                                Profile Settings
                            </h1>
                            <p className="text-sm text-brand-muted mt-1">
                                Manage your personal information, developer bio, and linked profiles.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                            {hasUnsavedChanges && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                                    Unsaved changes
                                </span>
                            )}
                            {publicHandle && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleCopyPublicLink}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-elevated hover:bg-brand-border/70 border border-brand-border text-xs font-semibold text-brand-text transition-all shadow-sm"
                                        title="Copy public profile link"
                                    >
                                        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="text-brand-muted" />}
                                        <span>{copied ? "Copied" : "Copy Link"}</span>
                                    </button>
                                    <Link
                                        to={`/u/${publicHandle}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-xs font-bold text-brand-primary transition-all shadow-sm"
                                        title="View how others see your profile"
                                    >
                                        <ExternalLink size={13} />
                                        <span>View Public Profile</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT / MAIN FORM COLUMN (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Section 1: Avatar / Photo Management */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-4">
                                Profile Photo
                            </h2>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                <div className="relative group w-20 h-20 rounded-2xl overflow-hidden bg-brand-elevated border border-brand-border shrink-0 shadow-inner">
                                    <img 
                                        src={displayAvatarSrc} 
                                        alt={name || "User Avatar"} 
                                        className="w-full h-full object-cover"
                                    />
                                    <label 
                                        htmlFor="avatar-upload"
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white"
                                        title="Change photo"
                                    >
                                        <Camera size={18} />
                                        <span className="text-[10px] font-bold mt-1">Change</span>
                                    </label>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <label 
                                            htmlFor="avatar-upload"
                                            className="px-3.5 py-1.5 rounded-xl bg-brand-elevated hover:bg-brand-border/60 border border-brand-border text-xs font-semibold text-brand-text cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1.5"
                                        >
                                            <Camera size={14} className="text-brand-primary" />
                                            Upload New Photo
                                        </label>
                                        <input 
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/gif"
                                            className="hidden"
                                            onChange={handleAvatarSelect}
                                        />
                                        {avatarFile && (
                                            <button
                                                type="button"
                                                onClick={handleClearAvatarPreview}
                                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                                            >
                                                Discard Staged
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-brand-muted leading-relaxed">
                                        Recommended format: JPG, PNG, or WebP. Square aspect ratio, max 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Account Details (Read-only / Identity) */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-4">
                                Account Information
                            </h2>

                            {/* Email (Read-Only) */}
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                    Account Email
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-brand-muted pointer-events-none">
                                        <Mail size={16} />
                                    </div>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        readOnly 
                                        disabled
                                        className="w-full bg-brand-elevated/70 border border-brand-border text-brand-text rounded-xl pl-10 pr-24 py-2.5 text-sm font-medium cursor-not-allowed select-all opacity-90"
                                    />
                                    <div className="absolute right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-semibold">
                                        <ShieldCheck size={12} />
                                        Verified
                                    </div>
                                </div>
                                <p className="text-[11px] text-brand-muted mt-1.5">
                                    Your email address is managed through your primary SkillForge account.
                                </p>
                            </div>

                            {/* Role (Read-Only) */}
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                    Platform Role
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-mono font-bold tracking-wider uppercase">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                                        {role}
                                    </span>
                                    <span className="text-xs text-brand-muted">
                                        {role === "INSTRUCTOR" ? "Authorized course creator & curriculum mentor" : "Active platform learner and developer"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Personal Information & Username (Editable) */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-4">
                                Personal Details
                            </h2>

                            {/* Username / Handle */}
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                    Username / Public Handle <span className="text-brand-primary">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-brand-muted pointer-events-none">
                                        <AtSign size={16} />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                        placeholder="username"
                                        maxLength={30}
                                        className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium font-mono text-brand-text outline-none transition-all placeholder:text-brand-muted/60"
                                    />
                                </div>
                                <p className="text-[11px] text-brand-muted mt-1.5 flex items-center gap-1">
                                    <span>Public URL:</span>
                                    <span className="font-mono text-brand-primary font-semibold">skillforge.dev/u/{username || 'username'}</span>
                                </p>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                    Full Name <span className="text-brand-primary">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-brand-muted pointer-events-none">
                                        <User size={16} />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Jane Doe"
                                        maxLength={80}
                                        className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-brand-text outline-none transition-all placeholder:text-brand-muted/60"
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-brand-muted">
                                        Developer Bio
                                    </label>
                                    <span className={`text-[11px] font-mono ${bio.length > 450 ? 'text-amber-500' : 'text-brand-muted'}`}>
                                        {bio.length} / 500
                                    </span>
                                </div>
                                <textarea 
                                    value={bio} 
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell other developers about your background, the tech stacks you enjoy working with, and what you're currently building..."
                                    maxLength={500}
                                    rows={4}
                                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl p-3.5 text-sm font-medium text-brand-text outline-none transition-all resize-none placeholder:text-brand-muted/60 leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Section 4: Social Links (Editable) */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-4">
                                Linked Profiles & Socials
                            </h2>

                            {/* GitHub */}
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                    GitHub Profile
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-brand-muted pointer-events-none">
                                        <Github size={16} />
                                    </div>
                                    <input 
                                        type="url" 
                                        name="github"
                                        value={socials.github} 
                                        onChange={(e) => handleSocialChange("github", e.target.value)}
                                        placeholder="https://github.com/username"
                                        className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-brand-text outline-none transition-all placeholder:text-brand-muted/60"
                                    />
                                </div>
                            </div>

                            {/* LinkedIn */}
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                    LinkedIn Profile
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-brand-muted pointer-events-none">
                                        <Linkedin size={16} />
                                    </div>
                                    <input 
                                        type="url" 
                                        name="linkedin"
                                        value={socials.linkedin} 
                                        onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                                        placeholder="https://linkedin.com/in/username"
                                        className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-brand-text outline-none transition-all placeholder:text-brand-muted/60"
                                    />
                                </div>
                            </div>

                            {/* Twitter / X */}
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                    Twitter / X
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-brand-muted pointer-events-none">
                                        <Twitter size={16} />
                                    </div>
                                    <input 
                                        type="url" 
                                        name="twitter"
                                        value={socials.twitter} 
                                        onChange={(e) => handleSocialChange("twitter", e.target.value)}
                                        placeholder="https://twitter.com/username"
                                        className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-brand-text outline-none transition-all placeholder:text-brand-muted/60"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={!hasUnsavedChanges || saving}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <RotateCcw size={14} />
                                Reset Changes
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold tracking-wide transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving Profile...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={15} />
                                        <span>Save Profile</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: LIVE PROFILE PREVIEW CARD (5 cols) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                        
                        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-md">
                            {/* Card Banner */}
                            <div className="h-28 bg-gradient-to-r from-blue-600/25 via-indigo-600/20 to-blue-500/10 relative border-b border-brand-border/60">
                                <div className="absolute top-3 right-3">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-surface/90 backdrop-blur-sm border border-brand-border text-[10px] font-mono font-semibold text-brand-muted">
                                        Live Preview
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="px-6 pb-6 relative text-center">
                                {/* Centered Avatar */}
                                <div className="w-24 h-24 mx-auto rounded-2xl bg-brand-surface p-1.5 -mt-12 relative z-10 shadow-lg border border-brand-border">
                                    <img 
                                        src={displayAvatarSrc} 
                                        alt={name || "Preview"} 
                                        className="w-full h-full rounded-xl object-cover bg-brand-elevated"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-brand-surface flex items-center justify-center text-white" title="Active">
                                        <CheckCircle2 size={12} />
                                    </div>
                                </div>

                                {/* Identity */}
                                <h3 className="text-lg font-bold text-brand-text mt-3 tracking-tight">
                                    {name || "Your Name"}
                                </h3>
                                {username && (
                                    <p className="text-xs font-mono font-bold text-brand-primary mt-0.5">
                                        @{username}
                                    </p>
                                )}
                                <p className="text-xs text-brand-muted flex items-center justify-center gap-1.5 mt-1">
                                    <Mail size={12} />
                                    {email}
                                </p>

                                {/* Role Badge */}
                                <div className="mt-3 flex justify-center">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[10px] font-mono font-bold tracking-wider uppercase border border-brand-primary/20">
                                        {role}
                                    </span>
                                </div>

                                {/* Member Since */}
                                <div className="mt-3 text-[11px] text-brand-muted flex items-center justify-center gap-1.5">
                                    <Calendar size={12} className="text-brand-subtle" />
                                    <span>Member since {memberSince}</span>
                                </div>

                                {/* Bio Preview */}
                                <div className="mt-4 pt-4 border-t border-brand-border/70 text-left">
                                    <p className="text-xs text-brand-muted leading-relaxed font-normal italic">
                                        {bio.trim() ? (
                                            `“${bio.trim()}”`
                                        ) : (
                                            <span className="not-italic text-brand-subtle text-[11px]">
                                                No biography written yet. Add a short bio to introduce yourself on SkillForge.
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Social Links Preview */}
                                <div className="mt-5 pt-4 border-t border-brand-border/70">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-brand-subtle block mb-3">
                                        Connected Links
                                    </span>
                                    <div className="flex items-center justify-center gap-3">
                                        {socials.github ? (
                                            <a 
                                                href={socials.github.startsWith("http") ? socials.github : `https://${socials.github}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-xl bg-brand-elevated hover:bg-brand-primary hover:text-white border border-brand-border flex items-center justify-center text-brand-text transition-all shadow-sm"
                                                title="GitHub Profile"
                                            >
                                                <Github size={16} />
                                            </a>
                                        ) : (
                                            <div className="w-9 h-9 rounded-xl bg-brand-elevated/40 border border-brand-border/50 flex items-center justify-center text-brand-subtle/50" title="GitHub not connected">
                                                <Github size={16} />
                                            </div>
                                        )}

                                        {socials.linkedin ? (
                                            <a 
                                                href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://${socials.linkedin}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-xl bg-[#0077B5]/15 hover:bg-[#0077B5] hover:text-white border border-[#0077B5]/30 flex items-center justify-center text-[#0077B5] transition-all shadow-sm"
                                                title="LinkedIn Profile"
                                            >
                                                <Linkedin size={16} />
                                            </a>
                                        ) : (
                                            <div className="w-9 h-9 rounded-xl bg-brand-elevated/40 border border-brand-border/50 flex items-center justify-center text-brand-subtle/50" title="LinkedIn not connected">
                                                <Linkedin size={16} />
                                            </div>
                                        )}

                                        {socials.twitter ? (
                                            <a 
                                                href={socials.twitter.startsWith("http") ? socials.twitter : `https://${socials.twitter}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-xl bg-[#1DA1F2]/15 hover:bg-[#1DA1F2] hover:text-white border border-[#1DA1F2]/30 flex items-center justify-center text-[#1DA1F2] transition-all shadow-sm"
                                                title="Twitter / X Profile"
                                            >
                                                <Twitter size={16} />
                                            </a>
                                        ) : (
                                            <div className="w-9 h-9 rounded-xl bg-brand-elevated/40 border border-brand-border/50 flex items-center justify-center text-brand-subtle/50" title="Twitter / X not connected">
                                                <Twitter size={16} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subtle helper card */}
                        <div className="p-4 rounded-xl bg-brand-elevated/50 border border-brand-border text-[11px] text-brand-muted leading-relaxed">
                            <span className="font-semibold text-brand-text">Note:</span> Your profile is visible across courses, discussions, and workspaces. No private progress data or dashboard stats are published here.
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}

export default Profile;

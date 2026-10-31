import { useEffect, useState, useCallback } from "react";
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
    XCircle,
    AlertCircle,
    Loader2,
    Copy,
    Check,
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    Laptop,
    Smartphone,
    Globe,
    LogOut,
    Shield
} from "lucide-react";
import NavBar from "../../components/NavBar";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../utils/imageHelper";

function Profile() {
    const navigate = useNavigate();
    const { user: authUser, changePassword, logoutAll } = useAuth();

    // Tab state: "general" | "security"
    const [activeTab, setActiveTab] = useState("general");

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

    // Real-time username availability state
    const [usernameStatus, setUsernameStatus] = useState({ state: "idle", message: "" });

    // Initial backup state for resetting
    const [initialState, setInitialState] = useState({
        name: "",
        username: "",
        bio: "",
        socials: { github: "", twitter: "", linkedin: "" }
    });

    // Security Tab State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [changingPass, setChangingPass] = useState(false);
    const [passError, setPassError] = useState("");
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loggingOutAll, setLoggingOutAll] = useState(false);

    const fetchProfile = useCallback(async () => {
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
    }, []);

    const fetchSessions = useCallback(async () => {
        setLoadingSessions(true);
        try {
            const res = await api.get('/auth/sessions');
            if (res.data?.success) {
                setSessions(res.data.sessions || []);
            }
        } catch (err) {
            console.warn("Could not load active sessions", err);
        } finally {
            setLoadingSessions(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (activeTab === "security") {
            fetchSessions();
        }
    }, [activeTab, fetchSessions]);

    // Debounced real-time username availability check
    useEffect(() => {
        const clean = username.trim().toLowerCase();
        
        if (!clean) {
            setUsernameStatus({ state: "idle", message: "" });
            return;
        }

        if (clean === initialState.username?.toLowerCase()) {
            setUsernameStatus({ state: "idle", message: "Current active handle" });
            return;
        }

        const regex = /^[a-z0-9_-]{3,30}$/;
        if (!regex.test(clean)) {
            setUsernameStatus({ 
                state: "invalid", 
                message: "Must be 3–30 characters (lowercase letters, numbers, hyphens, or underscores)" 
            });
            return;
        }

        setUsernameStatus({ state: "checking", message: "Checking availability..." });

        const timer = setTimeout(async () => {
            try {
                const res = await api.get(`/user/check-username?username=${encodeURIComponent(clean)}`);
                if (res.data.available) {
                    setUsernameStatus({ state: "available", message: "Username is available!" });
                } else {
                    setUsernameStatus({ state: "taken", message: res.data.message || "Username is already taken" });
                }
            } catch (err) {
                console.error("Availability check failed:", err);
                setUsernameStatus({ state: "idle", message: "" });
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [username, initialState.username]);

    const handleAvatarSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Avatar image must be under 5MB");
                return;
            }
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file (PNG, JPG, WebP)");
                return;
            }
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleClearAvatarPreview = () => {
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(null);
        setAvatarFile(null);
    };

    const handleReset = () => {
        setName(initialState.name);
        setUsername(initialState.username);
        setBio(initialState.bio);
        setSocials({ ...initialState.socials });
        handleClearAvatarPreview();
        toast("Form reverted to last saved state", { icon: "↩️" });
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();

        if (username && usernameStatus.state === "taken") {
            toast.error("Please choose an available username before saving");
            return;
        }
        if (username && usernameStatus.state === "invalid") {
            toast.error("Username format is invalid");
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("username", username.trim().toLowerCase());
            formData.append("bio", bio.trim());
            formData.append("socials", JSON.stringify(socials));
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await api.put('/user/profile', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const updatedData = res.data?.data || res.data;
            setUser(updatedData);

            setInitialState({
                name: updatedData.name || name,
                username: updatedData.username || username,
                bio: updatedData.bio || bio,
                socials: updatedData.socials || socials
            });

            if (updatedData.name) {
                localStorage.setItem("userName", updatedData.name);
            }
            if (updatedData.username) {
                localStorage.setItem("userHandle", updatedData.username);
            }

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

    // Password criteria analysis (NIST / OWASP standard)
    const hasMinLength = newPassword.length >= 8;
    const hasLower = /[a-z]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(newPassword);

    const criteriaMet = [hasMinLength, hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    const getStrengthInfo = () => {
        if (!newPassword) return { label: "", color: "bg-brand-border", width: "0%" };
        if (criteriaMet <= 2) return { label: "Weak", color: "bg-red-500", width: "30%" };
        if (criteriaMet <= 4) return { label: "Good", color: "bg-blue-500", width: "70%" };
        return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    };

    const strength = getStrengthInfo();
    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        setPassError("");

        if (!currentPassword) {
            setPassError("Please enter your current password.");
            return;
        }

        if (criteriaMet < 5) {
            setPassError("New password must meet all 5 security requirements.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPassError("New password and confirmation do not match.");
            return;
        }

        setChangingPass(true);
        try {
            await changePassword({ currentPassword, newPassword, confirmPassword });
            toast.success("Password changed successfully! Active sessions refreshed.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            fetchSessions();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to update password.";
            setPassError(msg);
            toast.error(msg);
        } finally {
            setChangingPass(false);
        }
    };

    const handleTerminateAllSessions = async () => {
        if (!window.confirm("Are you sure you want to log out from all other devices?")) return;
        setLoggingOutAll(true);
        try {
            await logoutAll();
            toast.success("All other sessions terminated.");
            navigate('/login');
        } catch (err) {
            toast.error("Failed to terminate sessions.");
        } finally {
            setLoggingOutAll(false);
        }
    };

    // Derived fields
    const email = user?.userId?.email || authUser?.email || localStorage.getItem("userEmail") || "account@skillforge.dev";
    const role = (user?.userId?.role || authUser?.role || localStorage.getItem("role") || "student").toUpperCase();
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
                <div className="mb-6">
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
                                Account & Security
                            </h1>
                            <p className="text-sm text-brand-muted mt-1">
                                Manage your developer identity, security credentials, and active device sessions.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                            {hasUnsavedChanges && activeTab === "general" && (
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

                {/* TAB SWITCHER */}
                <div className="flex items-center gap-3 border-b border-brand-border mb-8">
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                            activeTab === "general"
                                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-lg"
                                : "border-transparent text-brand-muted hover:text-brand-text"
                        }`}
                    >
                        <User size={16} />
                        <span>General Profile</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                            activeTab === "security"
                                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-lg"
                                : "border-transparent text-brand-muted hover:text-brand-text"
                        }`}
                    >
                        <ShieldCheck size={16} />
                        <span>Security & Sessions</span>
                    </button>
                </div>

                {/* TAB CONTENT */}
                {activeTab === "general" ? (
                    /* 2-Column Layout for General Profile */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT FORM COLUMN */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Avatar Photo */}
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

                            {/* Account Info */}
                            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-4">
                                    Account Information
                                </h2>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                        Account Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle" size={15} />
                                        <input 
                                            type="email" 
                                            value={email} 
                                            readOnly 
                                            disabled
                                            className="w-full bg-brand-elevated/50 text-brand-muted border border-brand-border rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono cursor-not-allowed opacity-80"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                        Platform Role
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-mono font-bold uppercase">
                                            <ShieldCheck size={14} />
                                            {role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Public Info */}
                            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-5">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-2">
                                    Public Information
                                </h2>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                        Full Name
                                    </label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Prem Kumar"
                                        className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                        Username Handle
                                    </label>
                                    <div className="relative">
                                        <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle" size={15} />
                                        <input 
                                            type="text" 
                                            value={username} 
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="username"
                                            className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                        />
                                    </div>
                                    {usernameStatus.message && (
                                        <p className={`text-[11px] mt-1.5 font-medium flex items-center gap-1 ${
                                            usernameStatus.state === 'available' ? 'text-emerald-500' :
                                            usernameStatus.state === 'taken' || usernameStatus.state === 'invalid' ? 'text-red-500' :
                                            'text-brand-subtle'
                                        }`}>
                                            {usernameStatus.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                                        Developer Bio
                                    </label>
                                    <textarea 
                                        value={bio} 
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={3}
                                        placeholder="Distributed systems engineer, Rust enthusiast, building production scale backends..."
                                        className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Socials */}
                            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-2">
                                    Connected Social Profiles
                                </h2>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted mb-1.5">GitHub</label>
                                    <div className="relative">
                                        <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle" size={15} />
                                        <input 
                                            type="text" 
                                            value={socials.github} 
                                            onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                                            placeholder="https://github.com/yourhandle"
                                            className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted mb-1.5">LinkedIn</label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle" size={15} />
                                        <input 
                                            type="text" 
                                            value={socials.linkedin} 
                                            onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                                            placeholder="https://linkedin.com/in/yourhandle"
                                            className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={!hasUnsavedChanges || saving}
                                    className="px-4 py-2.5 rounded-xl border border-brand-border hover:bg-brand-elevated text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                >
                                    <RotateCcw size={14} />
                                    <span>Revert Changes</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitProfile}
                                    disabled={saving || !hasUnsavedChanges}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={14} />
                                            <span>Save Profile</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT LIVE PREVIEW COLUMN */}
                        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
                                <div className="h-28 bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-cyan-500/20 relative border-b border-brand-border/60">
                                    <div className="absolute top-3 right-3">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-surface/90 backdrop-blur-sm border border-brand-border text-[10px] font-mono font-semibold text-brand-muted">
                                            Live Preview
                                        </span>
                                    </div>
                                </div>
                                <div className="px-6 pb-6 relative text-center">
                                    <div className="w-24 h-24 mx-auto rounded-2xl bg-brand-surface p-1.5 -mt-12 relative z-10 shadow-lg border border-brand-border">
                                        <img 
                                            src={displayAvatarSrc} 
                                            alt={name || "Preview"} 
                                            className="w-full h-full rounded-xl object-cover bg-brand-elevated"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-brand-surface flex items-center justify-center text-white">
                                            <CheckCircle2 size={12} />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-brand-text mt-3 tracking-tight">
                                        {name || "Your Name"}
                                    </h3>
                                    {username && (
                                        <p className="text-xs font-mono font-bold text-indigo-400 mt-0.5">
                                            @{username}
                                        </p>
                                    )}
                                    <p className="text-xs text-brand-muted flex items-center justify-center gap-1.5 mt-1">
                                        <Mail size={12} />
                                        {email}
                                    </p>
                                    <div className="mt-3 flex justify-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold tracking-wider uppercase border border-indigo-500/20">
                                            {role}
                                        </span>
                                    </div>
                                    <div className="mt-3 text-[11px] text-brand-muted flex items-center justify-center gap-1.5">
                                        <Calendar size={12} className="text-brand-subtle" />
                                        <span>Member since {memberSince}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* SECURITY & SESSIONS TAB */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* LEFT COLUMN: Change Password Form */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* Password Change Card */}
                            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <KeyRound size={18} className="text-brand-primary" />
                                    <h2 className="text-base font-bold text-brand-text tracking-tight">
                                        Change Password
                                    </h2>
                                </div>
                                <p className="text-xs text-brand-muted mb-6">
                                    Enforce defense-in-depth by keeping a unique, cryptographically strong password.
                                </p>

                                {passError && (
                                    <div className="mb-5 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-medium">
                                        <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                                        <span>{passError}</span>
                                    </div>
                                )}

                                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4" noValidate>
                                    {/* Current Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle" />
                                            <input
                                                type={showCurrentPass ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPass(!showCurrentPass)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text p-1"
                                                tabIndex={-1}
                                            >
                                                {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle" />
                                            <input
                                                type={showNewPass ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPass(!showNewPass)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text p-1"
                                                tabIndex={-1}
                                            >
                                                {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>

                                        {/* Strength Bar */}
                                        {newPassword && (
                                            <div className="pt-2 space-y-1.5">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-brand-muted text-[11px]">Password Strength:</span>
                                                    <span className={`font-bold text-[11px] ${
                                                        strength.label === 'Strong' ? 'text-emerald-400' :
                                                        strength.label === 'Good' ? 'text-blue-400' : 'text-red-400'
                                                    }`}>
                                                        {strength.label}
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-brand-elevated rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                                                    <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-brand-subtle'}`}>
                                                        {hasMinLength ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-brand-subtle" />} 8+ characters
                                                    </span>
                                                    <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-400' : 'text-brand-subtle'}`}>
                                                        {hasUpper ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-brand-subtle" />} Uppercase letter
                                                    </span>
                                                    <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-400' : 'text-brand-subtle'}`}>
                                                        {hasLower ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-brand-subtle" />} Lowercase letter
                                                    </span>
                                                    <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : 'text-brand-subtle'}`}>
                                                        {hasNumber ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-brand-subtle" />} Number (0-9)
                                                    </span>
                                                    <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-400' : 'text-brand-subtle'}`}>
                                                        {hasSpecial ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-brand-subtle" />} Special character
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm New Password */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                                Confirm New Password
                                            </label>
                                            {passwordsMatch && (
                                                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                                    <Check size={12} /> Matches
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle" />
                                            <input
                                                type={showConfirmPass ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text p-1"
                                                tabIndex={-1}
                                            >
                                                {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={changingPass || criteriaMet < 5 || !currentPassword || !passwordsMatch}
                                        className="w-full mt-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs"
                                    >
                                        {changingPass ? (
                                            <>
                                                <Loader2 size={15} className="animate-spin" />
                                                <span>Updating Credentials...</span>
                                            </>
                                        ) : (
                                            <>
                                                <KeyRound size={15} />
                                                <span>Update Password</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Active Devices & Session Management */}
                            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-base font-bold text-brand-text tracking-tight">
                                            Active Sessions
                                        </h2>
                                        <p className="text-xs text-brand-muted">
                                            Devices and browsers with active refresh token sessions.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleTerminateAllSessions}
                                        disabled={loggingOutAll}
                                        className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                                        title="Revoke all refresh tokens"
                                    >
                                        <LogOut size={13} />
                                        <span>Sign Out Everywhere</span>
                                    </button>
                                </div>

                                {loadingSessions ? (
                                    <div className="py-6 text-center text-xs text-brand-muted flex items-center justify-center gap-2">
                                        <Loader2 size={14} className="animate-spin text-brand-primary" />
                                        <span>Loading session audit list...</span>
                                    </div>
                                ) : sessions.length === 0 ? (
                                    <div className="p-4 rounded-xl bg-brand-elevated text-xs text-brand-muted">
                                        Current session active. No other devices detected.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {sessions.map((sess) => (
                                            <div key={sess.id} className="p-3.5 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-between gap-3 text-xs">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
                                                        {sess.userAgent.includes("Mobile") ? <Smartphone size={16} /> : <Laptop size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-brand-text truncate max-w-[200px]">
                                                                {sess.userAgent.split(" ")[0] || "Browser Session"}
                                                            </span>
                                                            {sess.isCurrent && (
                                                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                                                                    This Device
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-brand-muted block mt-0.5 font-mono">
                                                            IP: {sess.ip} &bull; Started {new Date(sess.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Security Audit Status */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
                                <div className="flex items-center gap-2">
                                    <Shield size={18} className="text-emerald-400" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
                                        Security Checklist
                                    </h3>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-elevated border border-brand-border">
                                        <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-brand-text block">Email Verified</span>
                                            <span className="text-[11px] text-brand-muted">
                                                Two-way cryptographic OTP verified for {email}.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-elevated border border-brand-border">
                                        <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-brand-text block">Refresh Token Rotation (RTR)</span>
                                            <span className="text-[11px] text-brand-muted">
                                                One-time token rotation with automatic replay attack mitigation.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-elevated border border-brand-border">
                                        <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-brand-text block">Account Lockout Defense</span>
                                            <span className="text-[11px] text-brand-muted">
                                                Automatic 15-minute freeze on 5 consecutive failed login attempts.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}

export default Profile;

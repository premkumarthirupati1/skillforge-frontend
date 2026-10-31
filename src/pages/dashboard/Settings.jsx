import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import {
    Sliders,
    Code2,
    Sparkles,
    Bell,
    Eye,
    Shield,
    Trash2,
    Download,
    Check,
    RotateCcw,
    Save,
    AlertTriangle,
    Lock,
    ExternalLink,
    HelpCircle,
    Type,
    Layers,
    FileCode,
    Cpu,
    ArrowLeft,
    CheckCircle2
} from "lucide-react";
import NavBar from "../../components/NavBar";
import { useAuth } from "../../context/AuthContext";
import {
    getSettings,
    saveSettings,
    exportUserData,
    deleteAccount,
    DEFAULT_EDITOR_SETTINGS,
    DEFAULT_AI_SETTINGS,
    DEFAULT_NOTIFICATION_SETTINGS,
    DEFAULT_PRIVACY_SETTINGS
} from "../../services/settingsService";

const SAMPLE_PREVIEW_CODE = `// SkillForge Code Studio — Interactive Preview
pub struct RateLimiter {
    capacity: usize,
    refill_rate: f64,
    tokens: f64,
}

impl RateLimiter {
    pub fn new(capacity: usize, refill_rate: f64) -> Self {
        Self {
            capacity,
            refill_rate,
            tokens: capacity as f64,
        }
    }

    pub fn acquire(&mut self, cost: f64) -> bool {
        if self.tokens >= cost {
            self.tokens -= cost;
            true // Token successfully consumed
        } else {
            false // Rate limit reached
        }
    }
}
`;

function Settings() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [activeTab, setActiveTab] = useState("editor");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Settings States
    const [editorSettings, setEditorSettings] = useState(DEFAULT_EDITOR_SETTINGS);
    const [aiSettings, setAiSettings] = useState(DEFAULT_AI_SETTINGS);
    const [notificationSettings, setNotificationSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);
    const [privacySettings, setPrivacySettings] = useState(DEFAULT_PRIVACY_SETTINGS);

    // Initial snapshot for dirty state tracking
    const [initialSnapshot, setInitialSnapshot] = useState(null);

    // Danger Zone Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Load user settings on mount
    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const settings = await getSettings();
                if (mounted && settings) {
                    setEditorSettings(settings.editor || DEFAULT_EDITOR_SETTINGS);
                    setAiSettings(settings.ai || DEFAULT_AI_SETTINGS);
                    setNotificationSettings(settings.notifications || DEFAULT_NOTIFICATION_SETTINGS);
                    setPrivacySettings(settings.privacy || DEFAULT_PRIVACY_SETTINGS);
                    setInitialSnapshot(JSON.stringify(settings));
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
                toast.error("Could not load your preferences. Using defaults.");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    // Dirty state checking
    const isDirty = useMemo(() => {
        if (!initialSnapshot) return false;
        const current = JSON.stringify({
            editor: editorSettings,
            ai: aiSettings,
            notifications: notificationSettings,
            privacy: privacySettings
        });
        return current !== initialSnapshot;
    }, [editorSettings, aiSettings, notificationSettings, privacySettings, initialSnapshot]);

    // Handle Save All Settings
    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await saveSettings({
                editor: editorSettings,
                ai: aiSettings,
                notifications: notificationSettings,
                privacy: privacySettings
            });
            setInitialSnapshot(JSON.stringify(updated));
            toast.success("Preferences saved successfully!");
        } catch (err) {
            console.error("Save error:", err);
            toast.error(err.response?.data?.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    // Handle Reset to Defaults
    const handleResetDefaults = () => {
        if (activeTab === "editor") {
            setEditorSettings({ ...DEFAULT_EDITOR_SETTINGS });
            toast("Editor settings reset to default values", { icon: "⚙️" });
        } else if (activeTab === "ai") {
            setAiSettings({ ...DEFAULT_AI_SETTINGS });
            toast("Copilot settings reset to default values", { icon: "🤖" });
        } else if (activeTab === "notifications") {
            setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS });
            toast("Notification settings reset to defaults", { icon: "🔔" });
        } else if (activeTab === "privacy") {
            setPrivacySettings({ ...DEFAULT_PRIVACY_SETTINGS });
            toast("Privacy settings reset to defaults", { icon: "🛡️" });
        }
    };

    // Handle GDPR Data Export
    const handleExportData = async () => {
        setExporting(true);
        try {
            await exportUserData(user?.username || "developer");
            toast.success("GDPR Data Archive downloaded!");
        } catch (err) {
            console.error("Export error:", err);
            toast.error("Failed to generate data archive");
        } finally {
            setExporting(false);
        }
    };

    // Handle Permanent Account Deletion
    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setDeleteError("");

        if (deleteConfirmText.trim() !== "DELETE") {
            setDeleteError("Please type DELETE to confirm.");
            return;
        }

        if (!deletePassword) {
            setDeleteError("Please enter your current account password.");
            return;
        }

        setDeleting(true);
        try {
            await deleteAccount(deletePassword);
            toast.success("Your account has been deleted permanently.");
            setShowDeleteModal(false);
            await logout();
            navigate("/");
        } catch (err) {
            console.error("Deletion error:", err);
            setDeleteError(err.response?.data?.message || "Incorrect password or error deleting account");
        } finally {
            setDeleting(false);
        }
    };

    // Monaco Theme definition for preview
    const handleBeforeMount = (monaco) => {
        monaco.editor.defineTheme("skillforge-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "comment", foreground: "64748B", fontStyle: "italic" },
                { token: "keyword", foreground: "38BDF8", fontStyle: "bold" },
                { token: "keyword.control", foreground: "38BDF8", fontStyle: "bold" },
                { token: "type", foreground: "FCD34D", fontStyle: "bold" },
                { token: "type.identifier", foreground: "FCD34D" },
                { token: "function", foreground: "C084FC" },
                { token: "method", foreground: "C084FC" },
                { token: "string", foreground: "4ADE80" },
                { token: "number", foreground: "FB923C" },
                { token: "constant", foreground: "FB7185" },
                { token: "variable", foreground: "F1F5F9" },
                { token: "delimiter", foreground: "94A3B8" },
                { token: "operator", foreground: "38BDF8" }
            ],
            colors: {
                "editor.background": "#0B0F19",
                "editor.foreground": "#E6EDF3",
                "editor.lineHighlightBackground": "#16203255",
                "editor.selectionBackground": "#2563EB38",
                "editorCursor.foreground": "#38BDF8",
                "editorLineNumber.foreground": "#475569",
                "editorLineNumber.activeForeground": "#38BDF8",
                "editorIndentGuide.background": "#161F30",
                "editorIndentGuide.activeBackground": "#38BDF844",
                "minimap.background": "#080B12"
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
                <NavBar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-brand-muted">Loading your developer preferences...</p>
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
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-text flex items-center gap-2.5">
                                <Sliders size={26} className="text-brand-primary" />
                                Developer Preferences & Settings
                            </h1>
                            <p className="text-sm text-brand-muted mt-1">
                                Customize your Monaco code studio, AI copilot behaviors, notifications, and privacy.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
                            {isDirty && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                                    Unsaved changes
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleResetDefaults}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-surface hover:bg-brand-elevated border border-brand-border text-xs font-semibold text-brand-muted hover:text-brand-text transition-all"
                                title="Reset current tab to defaults"
                            >
                                <RotateCcw size={14} />
                                <span>Reset Tab</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={15} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* TAB SWITCHER */}
                <div className="flex items-center gap-2 border-b border-brand-border mb-8 overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveTab("editor")}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                            activeTab === "editor"
                                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-lg"
                                : "border-transparent text-brand-muted hover:text-brand-text"
                        }`}
                    >
                        <Code2 size={16} />
                        <span>Code Studio & Monaco</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("ai")}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                            activeTab === "ai"
                                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-lg"
                                : "border-transparent text-brand-muted hover:text-brand-text"
                        }`}
                    >
                        <Sparkles size={16} />
                        <span>Forge Copilot AI</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                            activeTab === "notifications"
                                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-lg"
                                : "border-transparent text-brand-muted hover:text-brand-text"
                        }`}
                    >
                        <Bell size={16} />
                        <span>Notifications</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("privacy")}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                            activeTab === "privacy"
                                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-lg"
                                : "border-transparent text-brand-muted hover:text-brand-text"
                        }`}
                    >
                        <Eye size={16} />
                        <span>Privacy & Portfolio</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("danger")}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                            activeTab === "danger"
                                ? "border-red-500 text-red-400 bg-red-500/5 rounded-t-lg"
                                : "border-transparent text-brand-muted hover:text-red-400"
                        }`}
                    >
                        <AlertTriangle size={16} />
                        <span>Data & Danger Zone</span>
                    </button>
                </div>

                {/* TAB 1: CODE STUDIO & MONACO PREFERENCES */}
                {activeTab === "editor" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* Controls Column */}
                            <div className="lg:col-span-6 space-y-6">
                                
                                {/* Theme Picker */}
                                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-4 flex items-center gap-2">
                                        <Layers size={16} className="text-brand-primary" />
                                        Editor Theme
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: "skillforge-dark", label: "SkillForge Matte", desc: "Obsidian & Cobalt" },
                                            { id: "vs-dark", label: "VS Dark+", desc: "Default Dark" },
                                            { id: "hc-black", label: "High Contrast", desc: "OLED Black" },
                                            { id: "vs", label: "Light Studio", desc: "Clean Day" }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setEditorSettings(prev => ({ ...prev, theme: t.id }))}
                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                    editorSettings.theme === t.id
                                                        ? "border-brand-primary bg-brand-primary/10 text-brand-text shadow-sm"
                                                        : "border-brand-border bg-brand-elevated/40 text-brand-muted hover:text-brand-text hover:border-brand-border/80"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold">{t.label}</span>
                                                    {editorSettings.theme === t.id && (
                                                        <CheckCircle2 size={14} className="text-brand-primary" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-brand-muted mt-0.5">{t.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Typography & Font Size */}
                                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-5">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
                                        <Type size={16} className="text-brand-primary" />
                                        Typography & Font
                                    </h2>

                                    {/* Font Family Selection */}
                                    <div>
                                        <label className="block text-xs font-semibold text-brand-text mb-2">
                                            Monospace Font Family
                                        </label>
                                        <select
                                            value={editorSettings.fontFamily}
                                            onChange={(e) => setEditorSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                                            className="w-full bg-brand-elevated border border-brand-border rounded-xl px-3 py-2 text-xs font-mono text-brand-text focus:outline-none focus:border-brand-primary transition-colors"
                                        >
                                            <option value="'Geist Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace">
                                                Geist Mono (SkillForge Standard)
                                            </option>
                                            <option value="'JetBrains Mono', 'Fira Code', Consolas, monospace">
                                                JetBrains Mono
                                            </option>
                                            <option value="'Fira Code', monospace">
                                                Fira Code
                                            </option>
                                            <option value="'Cascadia Code', Consolas, monospace">
                                                Cascadia Code
                                            </option>
                                            <option value="Consolas, 'Courier New', monospace">
                                                Consolas
                                            </option>
                                        </select>
                                    </div>

                                    {/* Font Size Slider */}
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-semibold mb-2">
                                            <span className="text-brand-text">Font Size</span>
                                            <span className="font-mono text-brand-primary px-2 py-0.5 bg-brand-primary/10 rounded-md">
                                                {editorSettings.fontSize}px
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min="11"
                                                max="22"
                                                step="0.5"
                                                value={editorSettings.fontSize}
                                                onChange={(e) => setEditorSettings(prev => ({ ...prev, fontSize: parseFloat(e.target.value) }))}
                                                className="flex-1 accent-blue-500 h-1.5 bg-brand-border rounded-lg cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Font Ligatures Toggle */}
                                    <div className="flex items-center justify-between pt-2 border-t border-brand-border/60">
                                        <div>
                                            <p className="text-xs font-semibold text-brand-text">Font Ligatures</p>
                                            <p className="text-[11px] text-brand-muted">
                                                Render multi-character symbols neatly (<span className="font-mono text-cyan-400">!=</span>, <span className="font-mono text-cyan-400">=&gt;</span>, <span className="font-mono text-cyan-400">===</span>)
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEditorSettings(prev => ({ ...prev, fontLigatures: !prev.fontLigatures }))}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                editorSettings.fontLigatures ? "bg-brand-primary" : "bg-neutral-700"
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    editorSettings.fontLigatures ? "translate-x-5" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Layout & Formatting */}
                                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
                                        <FileCode size={16} className="text-brand-primary" />
                                        Layout & Indentation
                                    </h2>

                                    {/* Tab Size */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-brand-text">Indentation (Tab Size)</p>
                                            <p className="text-[11px] text-brand-muted">Number of spaces per indentation level</p>
                                        </div>
                                        <div className="flex items-center bg-brand-elevated border border-brand-border rounded-xl p-1">
                                            {[2, 4].map(size => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setEditorSettings(prev => ({ ...prev, tabSize: size }))}
                                                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                                        editorSettings.tabSize === size
                                                            ? "bg-brand-primary text-white"
                                                            : "text-brand-muted hover:text-brand-text"
                                                    }`}
                                                >
                                                    {size} spaces
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Word Wrap */}
                                    <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
                                        <div>
                                            <p className="text-xs font-semibold text-brand-text">Word Wrap</p>
                                            <p className="text-[11px] text-brand-muted">Wrap long lines to fit within editor width</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEditorSettings(prev => ({ ...prev, wordWrap: prev.wordWrap === "on" ? "off" : "on" }))}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                editorSettings.wordWrap === "on" ? "bg-brand-primary" : "bg-neutral-700"
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    editorSettings.wordWrap === "on" ? "translate-x-5" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Code Minimap */}
                                    <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
                                        <div>
                                            <p className="text-xs font-semibold text-brand-text">Code Minimap</p>
                                            <p className="text-[11px] text-brand-muted">Display a bird's-eye code overview bar on the right</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEditorSettings(prev => ({ ...prev, minimap: !prev.minimap }))}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                editorSettings.minimap ? "bg-brand-primary" : "bg-neutral-700"
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    editorSettings.minimap ? "translate-x-5" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Line Numbers */}
                                    <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
                                        <div>
                                            <p className="text-xs font-semibold text-brand-text">Line Numbers</p>
                                            <p className="text-[11px] text-brand-muted">Show gutter line numbers</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEditorSettings(prev => ({ ...prev, lineNumbers: prev.lineNumbers === "on" ? "off" : "on" }))}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                editorSettings.lineNumbers === "on" ? "bg-brand-primary" : "bg-neutral-700"
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    editorSettings.lineNumbers === "on" ? "translate-x-5" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Live Interactive Monaco Preview Column */}
                            <div className="lg:col-span-6 space-y-4">
                                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
                                                <Code2 size={16} className="text-cyan-400" />
                                                Live Studio Preview
                                            </h2>
                                            <p className="text-xs text-brand-muted mt-0.5">
                                                Interactive preview updating in real-time as you tweak settings.
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md font-bold">
                                            Rust Snippet
                                        </span>
                                    </div>

                                    {/* The Monaco Editor Canvas */}
                                    <div className="rounded-xl overflow-hidden border border-[#27272a] shadow-xl h-[380px] bg-[#12141A]">
                                        <Editor
                                            height="100%"
                                            language="rust"
                                            value={SAMPLE_PREVIEW_CODE}
                                            theme={editorSettings.theme}
                                            beforeMount={handleBeforeMount}
                                            options={{
                                                fontSize: editorSettings.fontSize,
                                                fontFamily: editorSettings.fontFamily,
                                                fontLigatures: editorSettings.fontLigatures,
                                                tabSize: editorSettings.tabSize,
                                                wordWrap: editorSettings.wordWrap,
                                                minimap: { enabled: editorSettings.minimap, scale: 1 },
                                                lineNumbers: editorSettings.lineNumbers,
                                                scrollBeyondLastLine: false,
                                                smoothScrolling: true,
                                                automaticLayout: true,
                                                renderLineHighlight: "all",
                                                bracketPairColorization: { enabled: true },
                                                padding: { top: 12, bottom: 12 }
                                            }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-brand-muted mt-2 text-center">
                                        Feel free to click into the preview and type to test keyboard feel and font rendering.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: FORGE COPILOT AI */}
                {activeTab === "ai" && (
                    <div className="max-w-3xl space-y-6">
                        {/* Status Card */}
                        <div className="bg-gradient-to-r from-blue-900/30 via-brand-surface to-cyan-900/20 border border-blue-500/30 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 shrink-0">
                                    <Sparkles size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-brand-text">Forge Copilot Native Assistant</h2>
                                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                                            Active Engine
                                        </span>
                                    </div>
                                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                                        Forge Copilot is integrated into your Code Studio with specialized handlers for Navigation, Root-Cause Debugging, and Course Learning RAG.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Behavior Controls */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-6">
                            
                            {/* Proactive Auto-Suggest Hints */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">Proactive Auto-Suggest Hints</p>
                                    <p className="text-xs text-brand-muted mt-0.5">
                                        Allows Forge Copilot to suggest optimizations and syntax corrections while coding inside Project Workspace.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAiSettings(prev => ({ ...prev, copilotAutoSuggest: !prev.copilotAutoSuggest }))}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        aiSettings.copilotAutoSuggest ? "bg-brand-primary" : "bg-neutral-700"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            aiSettings.copilotAutoSuggest ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Socratic Mode */}
                            <div className="flex items-start justify-between gap-4 pt-4 border-t border-brand-border/60">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-brand-text">Socratic Learning Mode</p>
                                        <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">
                                            Recommended
                                        </span>
                                    </div>
                                    <p className="text-xs text-brand-muted mt-0.5">
                                        Copilot asks guiding questions and explains the root cause rather than immediately providing the copy-paste answer.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAiSettings(prev => ({ ...prev, socraticMode: !prev.socraticMode }))}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        aiSettings.socraticMode ? "bg-brand-primary" : "bg-neutral-700"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            aiSettings.socraticMode ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Explanation Verbosity */}
                            <div className="pt-4 border-t border-brand-border/60">
                                <label className="block text-sm font-semibold text-brand-text mb-1">
                                    Explanation Verbosity
                                </label>
                                <p className="text-xs text-brand-muted mb-3">
                                    Adjust how much detail and architectural context Copilot includes in responses.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: "concise", title: "Concise", desc: "Short, code-first answers" },
                                        { id: "balanced", title: "Balanced", desc: "Standard explanation & fix" },
                                        { id: "detailed", title: "Detailed", desc: "Deep dive with edge cases" }
                                    ].map(v => (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => setAiSettings(prev => ({ ...prev, verbosity: v.id }))}
                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                aiSettings.verbosity === v.id
                                                    ? "border-brand-primary bg-brand-primary/10 text-brand-text"
                                                    : "border-brand-border bg-brand-elevated/40 text-brand-muted hover:text-brand-text"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold">{v.title}</span>
                                                {aiSettings.verbosity === v.id && (
                                                    <Check size={14} className="text-brand-primary" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-brand-muted mt-1">{v.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: NOTIFICATIONS */}
                {activeTab === "notifications" && (
                    <div className="max-w-3xl space-y-6">
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-6">
                            
                            {/* Announcements */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">Product & Feature Announcements</p>
                                    <p className="text-xs text-brand-muted mt-0.5">
                                        Periodic email summaries of major new SkillForge features, tooling, and updates.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotificationSettings(prev => ({ ...prev, emailAnnouncements: !prev.emailAnnouncements }))}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        notificationSettings.emailAnnouncements ? "bg-brand-primary" : "bg-neutral-700"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            notificationSettings.emailAnnouncements ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Milestone Completions */}
                            <div className="flex items-start justify-between gap-4 pt-4 border-t border-brand-border/60">
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">Project Milestone Receipts</p>
                                    <p className="text-xs text-brand-muted mt-0.5">
                                        Receive email verification and milestone badges when you pass all test suites for a systems project.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotificationSettings(prev => ({ ...prev, milestoneCompletions: !prev.milestoneCompletions }))}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        notificationSettings.milestoneCompletions ? "bg-brand-primary" : "bg-neutral-700"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            notificationSettings.milestoneCompletions ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Track Releases */}
                            <div className="flex items-start justify-between gap-4 pt-4 border-t border-brand-border/60">
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">New Curriculum & Track Releases</p>
                                    <p className="text-xs text-brand-muted mt-0.5">
                                        Notifies you when new courses (Distributed Systems, Compilers, Database Internals) launch.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotificationSettings(prev => ({ ...prev, trackReleases: !prev.trackReleases }))}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        notificationSettings.trackReleases ? "bg-brand-primary" : "bg-neutral-700"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            notificationSettings.trackReleases ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Security Advisories (Mandatory) */}
                            <div className="flex items-start justify-between gap-4 pt-4 border-t border-brand-border/60">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-brand-text">Security & Authentication Advisories</p>
                                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                                            Mandatory
                                        </span>
                                    </div>
                                    <p className="text-xs text-brand-muted mt-0.5">
                                        Immediate alerts for password resets, new device logins, and account security anomalies.
                                    </p>
                                </div>
                                <div className="p-1 text-emerald-400" title="Security notifications cannot be disabled">
                                    <Shield size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: PRIVACY & PORTFOLIO */}
                {activeTab === "privacy" && (
                    <div className="max-w-3xl space-y-6">
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-6">
                            
                            {/* Public Profile Visibility */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">Public Developer Portfolio</p>
                                    <p className="text-xs text-brand-muted mt-0.5">
                                        Allow other engineers and hiring managers to view your public profile at <span className="font-mono text-cyan-400">/u/{user?.username || "your-handle"}</span>.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPrivacySettings(prev => ({ ...prev, publicProfile: !prev.publicProfile }))}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        privacySettings.publicProfile ? "bg-brand-primary" : "bg-neutral-700"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            privacySettings.publicProfile ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Show Progress */}
                            <div className="flex items-start justify-between gap-4 pt-4 border-t border-brand-border/60">
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">Show Learning Progress Publicly</p>
                                    <p className="text-xs text-brand-muted mt-0.5">
                                        Include your completed systems projects, code milestone checkpoints, and course completions on your portfolio.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPrivacySettings(prev => ({ ...prev, showProgress: !prev.showProgress }))}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        privacySettings.showProgress ? "bg-brand-primary" : "bg-neutral-700"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            privacySettings.showProgress ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Show Badges */}
                            <div className="flex items-start justify-between gap-4 pt-4 border-t border-brand-border/60">
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">Show Verified Skill Badges</p>
                                    <p className="text-xs text-brand-muted mt-0.5">
                                        Display verified cryptographic badges for passed milestones (e.g. Raft Consensus, Redis Clone, Local RAG).
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPrivacySettings(prev => ({ ...prev, showBadges: !prev.showBadges }))}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        privacySettings.showBadges ? "bg-brand-primary" : "bg-neutral-700"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            privacySettings.showBadges ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: DATA & DANGER ZONE */}
                {activeTab === "danger" && (
                    <div className="max-w-3xl space-y-6">
                        
                        {/* GDPR Data Export Card */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Download size={18} className="text-brand-primary" />
                                        <h2 className="text-base font-bold text-brand-text">Export Account & Workspace Data</h2>
                                    </div>
                                    <p className="text-xs text-brand-muted leading-relaxed">
                                        Download a portable JSON archive containing your full profile, enrollment history, project milestone proofs, course reviews, and custom settings under GDPR Article 20.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleExportData}
                                    disabled={exporting}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-elevated hover:bg-brand-border/80 border border-brand-border text-xs font-semibold text-brand-text transition-all shrink-0 shadow-sm"
                                >
                                    {exporting ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-brand-text border-t-transparent rounded-full animate-spin" />
                                            <span>Exporting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download size={14} />
                                            <span>Download Archive</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone: Account Deletion */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start gap-3.5">
                                <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl shrink-0 mt-0.5">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-base font-bold text-red-400">Danger Zone — Permanent Account Deletion</h2>
                                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                                        Once your account is deleted, all enrolled courses, active project workspaces, milestone test runs, and earned completion certificates will be permanently erased. This action cannot be reversed.
                                    </p>
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDeleteModal(true);
                                                setDeleteConfirmText("");
                                                setDeletePassword("");
                                                setDeleteError("");
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-900/30"
                                        >
                                            <Trash2 size={14} />
                                            <span>Delete My Account</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* DELETE ACCOUNT CONFIRMATION MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-brand-surface border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-red-950/50 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-red-400">
                            <div className="p-2 bg-red-500/10 rounded-xl">
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-brand-text">Confirm Permanent Deletion</h3>
                                <p className="text-xs text-brand-muted">This action is irreversible.</p>
                            </div>
                        </div>

                        {deleteError && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
                                {deleteError}
                            </div>
                        )}

                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-text mb-1">
                                    Type <span className="font-mono text-red-400 font-bold">DELETE</span> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full bg-brand-elevated border border-brand-border rounded-xl px-3 py-2 text-xs font-mono text-brand-text focus:outline-none focus:border-red-500 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-text mb-1">
                                    Current Password:
                                </label>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full bg-brand-elevated border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-red-500 transition-colors"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/60">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded-xl bg-brand-elevated hover:bg-brand-border/60 border border-brand-border text-xs font-semibold text-brand-text transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={deleting || deleteConfirmText.trim() !== "DELETE"}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-red-900/30"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={14} />
                                            <span>Delete Permanently</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;

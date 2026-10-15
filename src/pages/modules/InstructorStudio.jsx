import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
    Search, 
    Plus, 
    MoreVertical, 
    Settings, 
    Trash2, 
    Globe, 
    Lock, 
    PlayCircle, 
    Clock, 
    Users, 
    BookOpen, 
    Layers, 
    ExternalLink, 
    Sparkles,
    CheckCircle2,
    DollarSign,
    GraduationCap,
    SlidersHorizontal,
    X,
    Eye
} from "lucide-react";
import api from "../../api";
import NavBar from "../../components/NavBar";
import { getImageUrl } from "../../utils/imageHelper";

function InstructorStudio() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'published' | 'draft'
    const [actionMenu, setActionMenu] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    const fetchCourses = async () => {
        try {
            const result = await api.get('/course/instructor');
            setCourses(Array.isArray(result.data) ? result.data : (result.data?.courses || []));
        } catch (err) {
            toast.error("Failed to load your courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Close action dropdown on click outside
    useEffect(() => {
        const handleClickOutside = () => setActionMenu(null);
        if (actionMenu) {
            window.addEventListener("click", handleClickOutside);
            return () => window.removeEventListener("click", handleClickOutside);
        }
    }, [actionMenu]);

    // Analytics calculations
    const stats = useMemo(() => {
        const total = courses.length;
        const published = courses.filter(c => c.isPublished).length;
        const drafts = total - published;
        const totalStudents = courses.reduce((acc, c) => acc + (c.studentsEnrolled?.length || 0), 0);
        return { total, published, drafts, totalStudents };
    }, [courses]);

    // Filtered courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesStatus = 
                statusFilter === "all" ? true :
                statusFilter === "published" ? course.isPublished :
                statusFilter === "draft" ? !course.isPublished : true;

            const matchesSearch = 
                search.trim() === "" ||
                course.title?.toLowerCase().includes(search.toLowerCase()) ||
                course.description?.toLowerCase().includes(search.toLowerCase()) ||
                (Array.isArray(course.tags) && course.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));

            return matchesStatus && matchesSearch;
        });
    }, [courses, statusFilter, search]);

    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure? This will permanently delete the course and all its modules and lessons.")) {
            return;
        }
        setProcessingId(courseId);
        try {
            await api.delete(`/course/${courseId}/delete`);
            setCourses(prev => prev.filter(c => c._id !== courseId));
            toast.success("Course deleted successfully");
        } catch (err) {
            toast.error("Failed to delete course");
        } finally {
            setProcessingId(null);
            setActionMenu(null);
        }
    };

    const handlePublishToggle = async (courseId) => {
        setProcessingId(courseId);
        try {
            const res = await api.patch(`/course/${courseId}/publish`);
            setCourses(prev =>
                prev.map(course =>
                    course._id === courseId ? { ...course, isPublished: res.data.isPublished } : course
                )
            );
            toast.success(res.data.isPublished ? "Course published live!" : "Course moved to drafts");
        } catch (err) {
            toast.error("Failed to update status");
        } finally {
            setProcessingId(null);
            setActionMenu(null);
        }
    };

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text transition-colors duration-300 flex flex-col selection:bg-brand-primary/30">
            <NavBar />

            {/* Ambient Background Gradient Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-24 left-1/3 w-[600px] h-[400px] bg-brand-primary/5 blur-[140px] rounded-full" />
                <div className="absolute top-80 right-10 w-[450px] h-[350px] bg-brand-primary/3 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 sm:py-12 relative z-10 space-y-8">
                
                {/* 1. HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-brand-border/60">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                Instructor Workspace
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
                            Creator Studio
                        </h1>
                        <p className="text-brand-subtle text-sm mt-1 max-w-2xl">
                            Architect learning paths, manage video lessons, and track student enrollment in real time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/create-course')}
                            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-brand-primary/20 flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <Plus size={18} />
                            Create New Course
                        </motion.button>
                    </div>
                </div>

                {/* 2. INSTRUCTOR ANALYTICS METRICS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-brand-surface border border-brand-border p-5 rounded-2xl relative overflow-hidden group hover:border-brand-primary/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Total Courses</span>
                            <div className="w-8 h-8 rounded-lg bg-brand-elevated text-brand-primary flex items-center justify-center">
                                <BookOpen size={16} />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-brand-text">
                            {stats.total}
                        </div>
                        <p className="text-xs text-brand-subtle mt-1 font-medium">Curriculums authored</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="bg-brand-surface border border-brand-border p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Live & Public</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                <Globe size={16} />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                            {stats.published}
                        </div>
                        <p className="text-xs text-brand-subtle mt-1 font-medium">Published in catalog</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-brand-surface border border-brand-border p-5 rounded-2xl relative overflow-hidden group hover:border-brand-primary/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Drafts</span>
                            <div className="w-8 h-8 rounded-lg bg-brand-elevated text-brand-muted flex items-center justify-center">
                                <Lock size={16} />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-brand-text">
                            {stats.drafts}
                        </div>
                        <p className="text-xs text-brand-subtle mt-1 font-medium">Under construction</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="bg-brand-surface border border-brand-border p-5 rounded-2xl relative overflow-hidden group hover:border-brand-primary/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Students Enrolled</span>
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                <Users size={16} />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-brand-text">
                            {stats.totalStudents}
                        </div>
                        <p className="text-xs text-brand-subtle mt-1 font-medium">Across all courses</p>
                    </motion.div>
                </div>

                {/* 3. CONTROLS: SEARCH & FILTER TABS */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                    {/* Status Tabs */}
                    <div className="flex items-center bg-brand-surface border border-brand-border p-1 rounded-xl self-start">
                        {[
                            { key: "all", label: "All Courses", count: stats.total },
                            { key: "published", label: "Published", count: stats.published },
                            { key: "draft", label: "Drafts", count: stats.drafts }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                    statusFilter === tab.key
                                        ? "bg-brand-primary text-white shadow-sm"
                                        : "text-brand-muted hover:text-brand-text"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                                    statusFilter === tab.key ? "bg-white/20 text-white" : "bg-brand-elevated text-brand-muted"
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Filter by title or tag..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-xl py-2 pl-9 pr-8 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-muted"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text p-0.5 rounded cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. COURSES GRID */}
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-3 border-brand-border border-t-brand-primary rounded-full animate-spin" />
                        <p className="text-brand-muted font-mono text-xs uppercase tracking-widest">
                            Loading Studio Workspace...
                        </p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="py-16 px-6 bg-brand-surface border border-dashed border-brand-border rounded-3xl text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-brand-elevated flex items-center justify-center mb-4 text-brand-muted">
                            {courses.length === 0 ? <GraduationCap size={28} /> : <Search size={28} />}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-brand-text">
                            {courses.length === 0 ? "No courses created yet" : "No matching courses"}
                        </h3>
                        <p className="text-brand-subtle text-sm max-w-md mb-6">
                            {courses.length === 0
                                ? "Start your creator journey by creating your first course. Build lessons, upload videos, and teach engineers."
                                : "No courses match your current search or filter criteria. Try adjusting your query."}
                        </p>
                        {courses.length === 0 ? (
                            <button
                                onClick={() => navigate('/create-course')}
                                className="bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                            >
                                Create First Course &rarr;
                            </button>
                        ) : (
                            <button
                                onClick={() => { setSearch(""); setStatusFilter("all"); }}
                                className="text-brand-primary font-bold text-sm hover:underline cursor-pointer"
                            >
                                Reset search and filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredCourses.map((course, idx) => {
                                const thumbnailSrc = getImageUrl(course.thumbnail);
                                const isDraft = !course.isPublished;
                                const isProcessing = processingId === course._id;

                                return (
                                    <motion.div
                                        key={course._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                                        className="bg-brand-surface border border-brand-border hover:border-brand-primary/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col group shadow-sm hover:shadow-lg hover:shadow-black/20"
                                    >
                                        {/* Thumbnail Area */}
                                        <div 
                                            onClick={() => navigate(`/studio/course/${course._id}`)}
                                            className="aspect-video bg-brand-elevated relative overflow-hidden cursor-pointer group/thumb"
                                        >
                                            {thumbnailSrc ? (
                                                <img
                                                    src={thumbnailSrc}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : null}

                                            {/* Fallback Graphic */}
                                            <div className="absolute inset-0 flex items-center justify-center text-brand-muted -z-0 pointer-events-none opacity-40">
                                                <PlayCircle size={44} />
                                            </div>

                                            {/* Subtle gradient vignette */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-md ${
                                                    course.isPublished 
                                                        ? 'bg-emerald-500/90 text-white' 
                                                        : 'bg-black/70 text-brand-muted border border-white/10'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-white animate-pulse' : 'bg-brand-muted'}`} />
                                                    {course.isPublished ? 'Live' : 'Draft'}
                                                </span>
                                            </div>

                                            {/* Price Badge */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-black/75 text-white backdrop-blur-md border border-white/10 shadow-md">
                                                    {course.price && course.price > 0 ? `$${course.price}` : 'Free'}
                                                </span>
                                            </div>

                                            {/* Hover Quick Overlay */}
                                            <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                                                <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                                                    <Layers size={13} /> Manage Curriculum
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            {/* Category / Tags & Difficulty */}
                                            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                                                {course.difficulty && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-elevated text-brand-subtle border border-brand-border">
                                                        {course.difficulty}
                                                    </span>
                                                )}
                                                {Array.isArray(course.tags) && course.tags.slice(0, 2).map((tag, tIdx) => (
                                                    <span key={tIdx} className="text-[10px] font-medium text-brand-muted bg-brand-surface px-2 py-0.5 rounded border border-brand-border/60">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Course Title */}
                                            <h3 
                                                onClick={() => navigate(`/studio/course/${course._id}`)}
                                                className="font-bold text-base sm:text-lg text-brand-text group-hover:text-brand-primary transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
                                                title={course.title}
                                            >
                                                {course.title}
                                            </h3>

                                            {/* Description snippet */}
                                            <p className="text-xs text-brand-muted line-clamp-2 mb-4 leading-relaxed">
                                                {course.description || "No description provided yet."}
                                            </p>

                                            {/* Metadata bar */}
                                            <div className="flex items-center gap-4 text-xs font-medium text-brand-muted pt-3 border-t border-brand-border/60 mt-auto">
                                                <span className="flex items-center gap-1.5" title="Enrolled students">
                                                    <Users size={13} className="text-brand-muted" />
                                                    {course.studentsEnrolled?.length || 0} students
                                                </span>
                                                <span className="flex items-center gap-1.5" title="Creation date">
                                                    <Clock size={13} className="text-brand-muted" />
                                                    {new Date(course.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>

                                            {/* Card Action Buttons Bar */}
                                            <div className="flex items-center gap-2 pt-4 mt-3 border-t border-brand-border/40">
                                                {/* Primary CTA: Edit Curriculum */}
                                                <button
                                                    onClick={() => navigate(`/studio/course/${course._id}`)}
                                                    className="flex-1 bg-brand-elevated hover:bg-brand-primary hover:text-white text-brand-text border border-brand-border hover:border-brand-primary text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                                >
                                                    <Layers size={14} />
                                                    Curriculum
                                                </button>

                                                {/* Settings Button */}
                                                <button
                                                    onClick={() => navigate(`/course/${course._id}/edit`)}
                                                    className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                                                    title="Course Settings"
                                                >
                                                    <Settings size={15} />
                                                </button>

                                                {/* Public Preview Button */}
                                                <button
                                                    onClick={() => navigate(`/course/${course._id}`)}
                                                    className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                                                    title="Preview Public Page"
                                                >
                                                    <Eye size={15} />
                                                </button>

                                                {/* Actions Dropdown Toggle */}
                                                <div className="relative">
                                                    <button
                                                        disabled={isProcessing}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActionMenu(actionMenu === course._id ? null : course._id);
                                                        }}
                                                        className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-muted hover:text-brand-text transition-colors cursor-pointer disabled:opacity-50"
                                                        title="More options"
                                                    >
                                                        <MoreVertical size={15} />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {actionMenu === course._id && (
                                                        <div 
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="absolute right-0 bottom-full mb-2 w-52 bg-brand-elevated border border-brand-border rounded-xl shadow-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                                                        >
                                                            <button 
                                                                onClick={() => { handlePublishToggle(course._id); }}
                                                                className="w-full text-left px-3 py-2 text-xs font-medium text-brand-text hover:bg-brand-surface rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                                            >
                                                                {course.isPublished ? (
                                                                    <>
                                                                        <Lock size={14} className="text-amber-400" />
                                                                        <span>Move to Drafts</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Globe size={14} className="text-emerald-400" />
                                                                        <span>Publish Live</span>
                                                                    </>
                                                                )}
                                                            </button>

                                                            <button 
                                                                onClick={() => navigate(`/course/${course._id}/edit`)}
                                                                className="w-full text-left px-3 py-2 text-xs font-medium text-brand-text hover:bg-brand-surface rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                                            >
                                                                <Settings size={14} />
                                                                <span>Edit Details & Tags</span>
                                                            </button>

                                                            <button 
                                                                onClick={() => navigate(`/course/${course._id}`)}
                                                                className="w-full text-left px-3 py-2 text-xs font-medium text-brand-text hover:bg-brand-surface rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                                            >
                                                                <ExternalLink size={14} />
                                                                <span>Open Public Page</span>
                                                            </button>

                                                            <div className="h-px bg-brand-border/60 my-1" />

                                                            <button 
                                                                onClick={() => handleDelete(course._id)}
                                                                className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 size={14} />
                                                                <span>Delete Course</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}

export default InstructorStudio;

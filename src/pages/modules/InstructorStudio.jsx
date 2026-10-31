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
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text flex flex-col selection:bg-brand-primary/30 selection:text-white relative">
            <NavBar />

            {/* Ambient Background Grid Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="absolute top-20 left-1/3 w-[600px] h-[400px] bg-brand-primary/10 blur-[140px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 space-y-8">
                
                {/* 1. HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-brand-border/60">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-muted">
                                Instructor Workspace
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
                            Creator Studio
                        </h1>
                        <p className="text-brand-muted text-xs sm:text-sm mt-1 max-w-2xl">
                            Architect learning paths, manage video lessons, and track student enrollment in real time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/create-course')}
                            className="bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-glow-primary/40 flex items-center gap-2 transition-all cursor-pointer border border-white/10"
                        >
                            <Plus size={16} />
                            <span>Create Course</span>
                        </motion.button>
                    </div>
                </div>

                {/* 2. INSTRUCTOR ANALYTICS METRICS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card-elevated p-5 rounded-2xl relative overflow-hidden group hover:border-brand-primary/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Total Courses</span>
                            <div className="w-8 h-8 rounded-xl bg-brand-surface border border-brand-border text-brand-primary flex items-center justify-center">
                                <BookOpen size={16} />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-brand-text">
                            {stats.total}
                        </div>
                        <p className="text-[11px] text-brand-subtle mt-1 font-medium">Curriculums authored</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="glass-card-elevated p-5 rounded-2xl relative overflow-hidden group hover:border-brand-emerald/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Live & Public</span>
                            <div className="w-8 h-8 rounded-xl bg-brand-surface border border-brand-border text-brand-emerald flex items-center justify-center">
                                <Globe size={16} />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-brand-emerald">
                            {stats.published}
                        </div>
                        <p className="text-[11px] text-brand-subtle mt-1 font-medium">Published in catalog</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="glass-card-elevated p-5 rounded-2xl relative overflow-hidden group hover:border-brand-primary/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Drafts</span>
                            <div className="w-8 h-8 rounded-xl bg-brand-surface border border-brand-border text-brand-muted flex items-center justify-center">
                                <Lock size={16} />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-brand-text">
                            {stats.drafts}
                        </div>
                        <p className="text-[11px] text-brand-subtle mt-1 font-medium">Under construction</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="glass-card-elevated p-5 rounded-2xl relative overflow-hidden group hover:border-brand-primary/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Students Enrolled</span>
                            <div className="w-8 h-8 rounded-xl bg-brand-surface border border-brand-border text-brand-cyan flex items-center justify-center">
                                <Users size={16} />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-brand-text">
                            {stats.totalStudents}
                        </div>
                        <p className="text-[11px] text-brand-subtle mt-1 font-medium">Across all courses</p>
                    </motion.div>
                </div>

                {/* 3. CONTROLS: SEARCH & FILTER TABS */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                    {/* Status Tabs */}
                    <div className="flex items-center glass-card border border-brand-border p-1 rounded-xl self-start">
                        {[
                            { key: "all", label: "All Courses", count: stats.total },
                            { key: "published", label: "Published", count: stats.published },
                            { key: "draft", label: "Drafts", count: stats.drafts }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                                    statusFilter === tab.key
                                        ? "bg-brand-primary text-white shadow-sm"
                                        : "text-brand-muted hover:text-brand-text"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                                    statusFilter === tab.key ? "bg-white/20 text-white" : "bg-brand-surface text-brand-muted"
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Filter by title or tag..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-brand-surface text-brand-text text-xs sm:text-sm rounded-xl py-2 pl-9 pr-8 border border-brand-border focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-subtle"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text p-0.5 rounded cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. COURSES GRID */}
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-2 border-brand-border border-t-brand-primary rounded-full animate-spin" />
                        <p className="text-brand-muted font-mono text-xs uppercase tracking-widest">
                            Loading Studio Workspace...
                        </p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="py-16 px-6 glass-card-elevated border border-dashed border-brand-border rounded-3xl text-center flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-brand-surface flex items-center justify-center mb-4 text-brand-muted">
                            {courses.length === 0 ? <GraduationCap size={26} /> : <Search size={26} />}
                        </div>
                        <h3 className="text-lg font-bold mb-1 text-brand-text">
                            {courses.length === 0 ? "No courses created yet" : "No matching courses"}
                        </h3>
                        <p className="text-brand-muted text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
                            {courses.length === 0
                                ? "Start your creator journey by creating your first course. Build lessons, upload videos, and teach engineers."
                                : "No courses match your current search or filter criteria. Try adjusting your query."}
                        </p>
                        {courses.length === 0 ? (
                            <button
                                onClick={() => navigate('/create-course')}
                                className="bg-brand-primary text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                            >
                                Create First Course &rarr;
                            </button>
                        ) : (
                            <button
                                onClick={() => { setSearch(""); setStatusFilter("all"); }}
                                className="text-brand-primary font-bold text-xs hover:underline cursor-pointer"
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
                                        className="glass-card-elevated border border-brand-border hover:border-brand-primary/40 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col group shadow-sm hover:shadow-glow-primary/20"
                                    >
                                        {/* Thumbnail Area */}
                                        <div 
                                            onClick={() => navigate(`/studio/course/${course._id}`)}
                                            className="aspect-video bg-brand-surface relative overflow-hidden cursor-pointer group/thumb"
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

                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-sm ${
                                                    course.isPublished 
                                                        ? 'bg-brand-emerald text-white' 
                                                        : 'glass-card text-brand-muted border border-white/10'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-white animate-pulse' : 'bg-brand-muted'}`} />
                                                    {course.isPublished ? 'Live' : 'Draft'}
                                                </span>
                                            </div>

                                            {/* Price Badge */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-brand-primary text-white shadow-md">
                                                    {course.price && course.price > 0 ? `₹${course.price}` : 'Free'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            {/* Category / Tags & Difficulty */}
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                {course.difficulty && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md glass-card text-brand-muted border border-brand-border">
                                                        {course.difficulty}
                                                    </span>
                                                )}
                                                {Array.isArray(course.tags) && course.tags.slice(0, 2).map((tag, tIdx) => (
                                                    <span key={tIdx} className="text-[10px] font-medium text-brand-subtle bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border/60">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Course Title */}
                                            <h3 
                                                onClick={() => navigate(`/studio/course/${course._id}`)}
                                                className="font-bold text-base text-brand-text group-hover:text-brand-primary transition-colors cursor-pointer line-clamp-2 leading-snug mb-1.5"
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
                                            <div className="flex items-center gap-2 pt-3 mt-3 border-t border-brand-border/40">
                                                <button
                                                    onClick={() => navigate(`/studio/course/${course._id}`)}
                                                    className="flex-1 glass-card hover:bg-brand-primary hover:text-white text-brand-text border border-brand-border hover:border-brand-primary text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                                >
                                                    <Layers size={13} />
                                                    <span>Curriculum</span>
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/course/${course._id}/edit`)}
                                                    className="glass-card hover:bg-brand-elevated text-brand-muted hover:text-brand-text p-2 rounded-xl transition-colors border border-brand-border"
                                                    title="Course Settings"
                                                >
                                                    <Settings size={14} />
                                                </button>

                                                <button
                                                    onClick={() => handlePublishToggle(course._id)}
                                                    disabled={isProcessing}
                                                    className={`p-2 rounded-xl transition-colors border ${
                                                        course.isPublished
                                                            ? "glass-card text-brand-emerald hover:bg-brand-elevated border-brand-border"
                                                            : "glass-card text-brand-muted hover:text-brand-text border-brand-border"
                                                    }`}
                                                    title={course.isPublished ? "Unpublish to Draft" : "Publish Live"}
                                                >
                                                    <Globe size={14} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(course._id)}
                                                    disabled={isProcessing}
                                                    className="glass-card hover:bg-red-500/10 text-brand-muted hover:text-red-400 p-2 rounded-xl transition-colors border border-brand-border"
                                                    title="Delete Course"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
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

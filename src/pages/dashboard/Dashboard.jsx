import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";
import NavBar from "../../components/NavBar";
import { getImageUrl } from "../../utils/imageHelper";
import { 
    BookOpen, 
    Trophy, 
    Play, 
    ChevronRight, 
    Code2, 
    Award, 
    Zap, 
    Sparkles, 
    Clock, 
    Compass, 
    Search, 
    ArrowRight, 
    CheckCircle2, 
    TrendingUp, 
    Layers, 
    ExternalLink, 
    ShieldCheck,
    Terminal,
    Presentation
} from "lucide-react";

function Dashboard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filterTab, setFilterTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const role = localStorage.getItem("role") || "student";

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Profile
                const userRes = await api.get('/user/profile');
                setUser(Array.isArray(userRes.data) ? userRes.data[0] : userRes.data);

                // Fetch Enrollments (fast cached endpoint with populated courses)
                const enrollmentsRes = await api.get('/enrollments');
                const rawEnrollments = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : [];

                const coursesData = rawEnrollments
                    .filter(e => e && e.courseId && !e.isDeleted)
                    .map(e => {
                        const courseObj = typeof e.courseId === 'object' ? e.courseId : {};
                        const rawProgress = typeof e.progress === 'number' ? e.progress : 0;
                        return {
                            ...courseObj,
                            progress: Math.min(100, Math.max(0, Math.round(rawProgress))),
                            completedLessonsCount: Array.isArray(e.completedLessons) ? e.completedLessons.length : 0,
                            enrollmentId: e._id,
                            updatedAt: e.updatedAt || e.createdAt
                        };
                    });

                setCourses(coursesData);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Computed Stats
    const stats = useMemo(() => {
        const total = courses.length;
        const completed = courses.filter(c => c.progress === 100);
        const inProgress = courses.filter(c => c.progress < 100);
        const overallProgress = total > 0 
            ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / total) 
            : 0;
        
        // Spotlight course: prefer most recently updated in-progress course, or first course
        const spotlight = inProgress[0] || courses[0] || null;

        return {
            total,
            completedCount: completed.length,
            inProgressCount: inProgress.length,
            overallProgress,
            spotlight,
            completedCourses: completed
        };
    }, [courses]);

    // Filtered Courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesFilter = 
                filterTab === "all" ? true :
                filterTab === "in-progress" ? course.progress < 100 :
                filterTab === "completed" ? course.progress === 100 : true;

            const matchesSearch = searchQuery.trim() === "" || 
                course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (Array.isArray(course.tags) && course.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

            return matchesFilter && matchesSearch;
        });
    }, [courses, filterTab, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans">
                <NavBar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="w-12 h-12 rounded-full border-3 border-brand-border border-t-brand-primary animate-spin" />
                    <p className="text-sm font-semibold text-brand-muted animate-pulse">
                        Loading your workspace...
                    </p>
                </div>
            </div>
        );
    }

    const userName = user?.name ? user.name.split(' ')[0] : (localStorage.getItem("userName")?.split(' ')[0] || "Developer");

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300 flex flex-col font-sans relative selection:bg-brand-primary/30">
            <NavBar />

            {/* Ambient Background Grid & Subtle Glow */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />
            <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 sm:py-12 relative z-10 space-y-8 sm:space-y-10">
                
                {/* ================================================================= */}
                {/* 1. GREETING & HEADER ACTION BAR */}
                {/* ================================================================= */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-brand-border/60"
                >
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                {role === "instructor" ? "Instructor Workspace" : "Developer Dashboard"}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
                            Welcome back, {userName}!
                        </h1>
                        <p className="text-sm text-brand-muted font-medium">
                            {stats.total > 0 
                                ? `You have ${stats.inProgressCount} active course${stats.inProgressCount === 1 ? '' : 's'} in progress.`
                                : "Ready to master new engineering skills today?"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2 md:pt-0">
                        {role === "instructor" && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/studio")}
                                className="px-5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-text hover:border-brand-primary/50 text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
                            >
                                <Presentation size={16} className="text-brand-primary" />
                                Creator Studio
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/course-showcase")}
                            className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-brand-primary/20 transition-all"
                        >
                            <Compass size={16} />
                            Browse Catalog
                        </motion.button>
                    </div>
                </motion.div>

                {/* ================================================================= */}
                {/* 2. STATS OVERVIEW CARDS (4 METRICS) */}
                {/* ================================================================= */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { 
                            label: "Enrolled Tracks", 
                            value: stats.total, 
                            suffix: "Courses", 
                            icon: <BookOpen className="text-brand-primary" size={22} />,
                            desc: "Active curriculum"
                        },
                        { 
                            label: "In Progress", 
                            value: stats.inProgressCount, 
                            suffix: "Active", 
                            icon: <Clock className="text-brand-cyan" size={22} />,
                            desc: "Ongoing modules"
                        },
                        { 
                            label: "Certificates", 
                            value: stats.completedCount, 
                            suffix: "Earned", 
                            icon: <Award className="text-emerald-500" size={22} />,
                            desc: "Verifiable credentials"
                        },
                        { 
                            label: "Average Mastery", 
                            value: `${stats.overallProgress}%`, 
                            suffix: "Completion", 
                            icon: <TrendingUp className="text-brand-primary" size={22} />,
                            desc: "Across all tracks"
                        },
                    ].map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: idx * 0.08 }}
                            whileHover={{ y: -3 }}
                            className="bg-brand-surface border border-brand-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-brand-primary/40 transition-all flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                                    {card.label}
                                </span>
                                <div className="w-10 h-10 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-center shadow-sm">
                                    {card.icon}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                                        {card.value}
                                    </span>
                                    <span className="text-xs font-semibold text-brand-muted">
                                        {card.suffix}
                                    </span>
                                </div>
                                <p className="text-[11px] text-brand-subtle mt-1">
                                    {card.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ================================================================= */}
                {/* 3. SPOTLIGHT HERO: CONTINUE LEARNING OR DISCOVER TRACKS */}
                {/* ================================================================= */}
                {stats.spotlight ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gradient-to-br from-brand-surface via-brand-surface to-brand-elevated border border-brand-border hover:border-brand-primary/40 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all"
                    >
                        {/* Decorative Background Glow */}
                        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
                            
                            {/* Course Thumbnail or Visual Badge */}
                            <div className="md:col-span-4 lg:col-span-3 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-brand-elevated border border-brand-border relative shadow-sm">
                                {stats.spotlight.thumbnail ? (
                                    <img 
                                        src={getImageUrl(stats.spotlight.thumbnail)} 
                                        alt={stats.spotlight.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-brand-primary/10 text-brand-primary">
                                        <Code2 size={36} />
                                        <span className="text-xs font-bold mt-2">Interactive Course</span>
                                    </div>
                                )}
                                <div className="absolute top-2.5 left-2.5 bg-brand-bg/90 backdrop-blur-md border border-brand-border px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-brand-text">
                                    {stats.spotlight.difficulty || "All Levels"}
                                </div>
                            </div>

                            {/* Details and Progress */}
                            <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-xs font-bold">
                                            {stats.spotlight.progress === 100 ? "Completed Track" : "Jump Back In"}
                                        </span>
                                        {stats.spotlight.author && (
                                            <span className="text-xs text-brand-muted font-medium">
                                                By {stats.spotlight.author}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight leading-snug">
                                        {stats.spotlight.title}
                                    </h2>

                                    <p className="text-sm text-brand-muted line-clamp-2 leading-relaxed">
                                        {stats.spotlight.description || "Continue working through this structured curriculum and interactive sandbox exercises."}
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-brand-muted">Course Completion</span>
                                        <span className="text-brand-primary">{stats.spotlight.progress}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-brand-elevated rounded-full overflow-hidden border border-brand-border/60">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats.spotlight.progress}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full bg-brand-primary rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(`/course/${stats.spotlight._id}`)}
                                        className="px-6 py-3 rounded-xl bg-brand-text text-brand-bg font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-brand-text/90 transition-colors"
                                    >
                                        <Play size={16} fill="currentColor" />
                                        <span>Resume Learning</span>
                                        <ArrowRight size={16} />
                                    </motion.button>

                                    {stats.spotlight.progress === 100 && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate(`/certificate/${stats.spotlight._id}`)}
                                            className="px-5 py-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-sm flex items-center gap-2 hover:bg-emerald-500/20 transition-colors"
                                        >
                                            <ShieldCheck size={16} />
                                            <span>View Certificate</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                ) : (
                    /* Empty State Hero if not enrolled in any course */
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-brand-surface border border-brand-border rounded-2xl p-8 sm:p-10 text-center shadow-sm relative overflow-hidden"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4">
                            <Sparkles size={32} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight mb-2">
                            Ready to start your first track?
                        </h2>
                        <p className="text-sm text-brand-muted max-w-lg mx-auto mb-6 leading-relaxed">
                            Enroll in production-grade courses in React, Node.js, AI Engineering, Kubernetes, and System Design to build verifiable skills.
                        </p>
                        <button
                            onClick={() => navigate("/course-showcase")}
                            className="px-7 py-3.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-primary/25 inline-flex items-center gap-2"
                        >
                            <Compass size={18} />
                            <span>Explore Course Catalog</span>
                            <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {/* ================================================================= */}
                {/* 4. ACTIVE ENROLLED COURSES SECTION */}
                {/* ================================================================= */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-brand-text tracking-tight">
                                My Curriculum
                            </h2>
                            <p className="text-xs sm:text-sm text-brand-muted font-medium">
                                Manage and track your active engineering coursework.
                            </p>
                        </div>

                        {/* Search & Tabs Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Filter Tabs */}
                            <div className="inline-flex p-1 bg-brand-elevated border border-brand-border rounded-xl text-xs font-bold">
                                {[
                                    { id: "all", label: `All (${courses.length})` },
                                    { id: "in-progress", label: `In Progress (${stats.inProgressCount})` },
                                    { id: "completed", label: `Completed (${stats.completedCount})` },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setFilterTab(tab.id)}
                                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                                            filterTab === tab.id 
                                                ? "bg-brand-surface text-brand-text shadow-sm" 
                                                : "text-brand-muted hover:text-brand-text"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search your courses..."
                                    className="bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all w-44 sm:w-56"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Courses Grid */}
                    {filteredCourses.length === 0 ? (
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-10 text-center shadow-sm">
                            <BookOpen size={36} className="text-brand-subtle mx-auto mb-3 opacity-60" />
                            <h3 className="text-base font-bold text-brand-text mb-1">
                                {courses.length === 0 ? "No enrolled courses yet" : "No matching courses found"}
                            </h3>
                            <p className="text-xs text-brand-muted mb-4 max-w-sm mx-auto">
                                {courses.length === 0 
                                    ? "Enroll in a course from our catalog to begin building." 
                                    : "Try adjusting your search query or filter tab."}
                            </p>
                            {courses.length === 0 && (
                                <button
                                    onClick={() => navigate("/course-showcase")}
                                    className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-secondary transition-colors"
                                >
                                    Browse Catalog
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredCourses.map((course, idx) => (
                                    <motion.div
                                        key={course._id || idx}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        whileHover={{ y: -4 }}
                                        onClick={() => navigate(`/course/${course._id}`)}
                                        className="group bg-brand-surface border border-brand-border rounded-2xl overflow-hidden hover:border-brand-primary/50 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Thumbnail Cover */}
                                            <div className="h-44 bg-brand-elevated relative overflow-hidden">
                                                {course.thumbnail ? (
                                                    <img 
                                                        src={getImageUrl(course.thumbnail)} 
                                                        alt={course.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary">
                                                        <Code2 size={40} />
                                                    </div>
                                                )}

                                                <div className="absolute top-3 left-3 bg-brand-bg/90 backdrop-blur-md border border-brand-border px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-brand-text">
                                                    {course.difficulty || "All Levels"}
                                                </div>

                                                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                    course.progress === 100 
                                                        ? "bg-emerald-500 text-white" 
                                                        : "bg-brand-primary text-white"
                                                }`}>
                                                    {course.progress === 100 ? "Completed" : `${course.progress}%`}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 space-y-3">
                                                <h3 className="font-bold text-base text-brand-text leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                                                    {course.title}
                                                </h3>

                                                <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                                                    {course.description || "Hands-on engineering course with live exercises."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bottom Progress & Action */}
                                        <div className="p-5 pt-0 space-y-3">
                                            {/* Progress Bar */}
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center text-[11px] font-semibold text-brand-muted">
                                                    <span>Progress</span>
                                                    <span>{course.progress}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-brand-elevated rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all ${
                                                            course.progress === 100 ? "bg-emerald-500" : "bg-brand-primary"
                                                        }`}
                                                        style={{ width: `${course.progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Link */}
                                            <div className="pt-2 flex items-center justify-between text-xs font-bold border-t border-brand-border/60">
                                                <span className="text-brand-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    {course.progress === 100 ? "Review Material" : "Continue Track"}
                                                    <ChevronRight size={14} />
                                                </span>

                                                {course.progress === 100 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/certificate/${course._id}`);
                                                        }}
                                                        className="text-emerald-500 hover:text-emerald-600 flex items-center gap-1 text-[11px]"
                                                    >
                                                        <ShieldCheck size={13} />
                                                        Certificate
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* ================================================================= */}
                {/* 5. VERIFIABLE CERTIFICATIONS ACCELERATOR */}
                {/* ================================================================= */}
                {stats.completedCourses.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4"
                    >
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={20} className="text-emerald-500" />
                            <h3 className="text-lg font-black text-brand-text">
                                Verifiable Certifications ({stats.completedCourses.length})
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                            You have completed the following tracks with distinction. Each credential includes a tamper-proof verification hash to share directly on LinkedIn or your developer portfolio.
                        </p>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                            {stats.completedCourses.map((c) => (
                                <div
                                    key={c._id}
                                    onClick={() => navigate(`/certificate/${c._id}`)}
                                    className="p-4 rounded-xl bg-brand-elevated border border-brand-border hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
                                >
                                    <div className="space-y-1 pr-3">
                                        <p className="text-xs font-bold text-brand-text line-clamp-1 group-hover:text-emerald-500 transition-colors">
                                            {c.title}
                                        </p>
                                        <p className="text-[10px] text-brand-subtle uppercase tracking-wider font-semibold">
                                            Verified Credential
                                        </p>
                                    </div>
                                    <ExternalLink size={16} className="text-brand-muted group-hover:text-emerald-500 transition-colors shrink-0" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

            </main>
        </div>
    );
}

export default Dashboard;

import { useEffect, useState, useMemo } from "react";
import api from "../../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../../components/NavBar";
import { getImageUrl } from "../../utils/imageHelper";
import { highlightWordPrefix } from "../../components/SearchBar";
import StarRating from "../../components/StarRating";
import { CURATED_COURSES } from "../../data/coursesCatalogData";
import { 
    Search, 
    X, 
    BookOpen, 
    Sparkles, 
    Filter, 
    ArrowRight, 
    ChevronRight, 
    Code2, 
    PlayCircle,
    CheckCircle2,
    SlidersHorizontal,
    Star,
    Layers,
    Cpu,
    Server,
    Smartphone,
    Shield,
    Terminal
} from "lucide-react";

function CourseShowcase() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Filters state
    const urlQuery = searchParams.get("search") || searchParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(urlQuery);
    const [selectedTopic, setSelectedTopic] = useState("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");
    const [selectedPrice, setSelectedPrice] = useState("all");
    const [sortBy, setSortBy] = useState("rating");

    // Sync state with URL parameter
    useEffect(() => {
        if (urlQuery !== searchQuery) {
            setSearchQuery(urlQuery);
        }
    }, [urlQuery]);

    const topics = [
        { id: "all", label: "All Curriculum", icon: <Layers size={14} /> },
        { id: "fullstack", label: "Full-Stack Dev", icon: <Terminal size={14} />, match: ["react", "node", "fullstack", "web", "javascript", "typescript"] },
        { id: "ai", label: "AI & ML", icon: <Cpu size={14} />, match: ["python", "ai", "machine learning", "llm", "neural"] },
        { id: "sysdesign", label: "System Design", icon: <Code2 size={14} />, match: ["design", "architecture", "distributed", "microservice"] },
        { id: "cloud", label: "Cloud & DevOps", icon: <Server size={14} />, match: ["docker", "k8s", "kubernetes", "aws", "cloud", "devops"] },
        { id: "cyber", label: "Cybersecurity", icon: <Shield size={14} />, match: ["security", "cyber", "network", "crypto"] },
        { id: "mobile", label: "Mobile Dev", icon: <Smartphone size={14} />, match: ["mobile", "ios", "android", "flutter", "react native"] },
    ];

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/course/public");
            const data = Array.isArray(res.data) ? res.data : (res.data?.result || res.data?.courses || []);
            if (data.length > 0) {
                setCourses(data);
            } else {
                setCourses(CURATED_COURSES);
            }
        } catch (err) {
            console.warn("Backend courses endpoint offline, rendering curated catalog:", err);
            setCourses(CURATED_COURSES);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Filter and Sort Courses
    const filteredCourses = useMemo(() => {
        let result = [...courses];

        // 1. Text Search Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(c => 
                c.title?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q) ||
                c.author?.toLowerCase().includes(q) ||
                (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(q)))
            );
        }

        // 2. Topic Filter
        if (selectedTopic !== "all") {
            const topicObj = topics.find(t => t.id === selectedTopic);
            if (topicObj && topicObj.match) {
                result = result.filter(c => {
                    const haystack = `${c.title || ''} ${c.description || ''} ${(c.tags || []).join(' ')}`.toLowerCase();
                    return topicObj.match.some(keyword => haystack.includes(keyword));
                });
            }
        }

        // 3. Difficulty Filter
        if (selectedDifficulty !== "all") {
            result = result.filter(c => c.difficulty?.toLowerCase() === selectedDifficulty);
        }

        // 4. Price Filter
        if (selectedPrice === "free") {
            result = result.filter(c => Number(c.price) === 0);
        } else if (selectedPrice === "paid") {
            result = result.filter(c => Number(c.price) > 0);
        }

        // 5. Sorting
        result.sort((a, b) => {
            if (sortBy === "rating") return (b.averageRating || 0) - (a.averageRating || 0);
            if (sortBy === "popular") return (b.reviewCount || 0) - (a.reviewCount || 0);
            if (sortBy === "price-low") return (Number(a.price) || 0) - (Number(b.price) || 0);
            if (sortBy === "price-high") return (Number(b.price) || 0) - (Number(a.price) || 0);
            return 0;
        });

        return result;
    }, [courses, searchQuery, selectedTopic, selectedDifficulty, selectedPrice, sortBy]);

    // Top featured course for spotlight banner
    const spotlightCourse = useMemo(() => {
        if (searchQuery.trim() || selectedTopic !== "all" || courses.length === 0) return null;
        return courses.reduce((top, c) => ((c.averageRating || 0) > (top?.averageRating || 0) ? c : top), courses[0]);
    }, [courses, searchQuery, selectedTopic]);

    const handleSearchChange = (val) => {
        setSearchQuery(val);
        if (val.trim()) {
            setSearchParams({ search: val });
        } else {
            setSearchParams({});
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchParams({});
    };

    const getDifficultyBadge = (level) => {
        const diff = level?.toLowerCase();
        if (diff === 'beginner') return 'bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30';
        if (diff === 'intermediate') return 'bg-brand-primary/15 text-brand-primary border-brand-primary/30';
        return 'bg-brand-secondary/15 text-indigo-300 border-brand-secondary/30';
    };

    return (
        <div className="min-h-screen bg-brand-bg font-sans text-brand-text flex flex-col selection:bg-brand-primary/30 selection:text-white relative">
            <NavBar />

            {/* Ambient Background Grid Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-primary/10 blur-[140px] pointer-events-none z-0 animate-ambient-glow" />

            <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">

                {/* 1. CATALOG HEADER & SEARCH BAR */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-4 max-w-3xl"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-brand-border/80 text-xs font-semibold text-brand-muted shadow-sm">
                        <Sparkles size={14} className="text-brand-cyan" />
                        <span>Curated Engineering Tracks · 100% In-Browser Sandboxes</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-brand-text tracking-tight leading-tight">
                        Course Curriculum
                    </h1>

                    <p className="text-sm sm:text-base text-brand-muted font-normal leading-relaxed">
                        Master modern software engineering through structured project builds, automated testing environments, and industry-recognized certifications.
                    </p>

                    {/* Integrated Search Bar */}
                    <div className="pt-2 relative max-w-2xl">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors" size={17} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search courses by technology (e.g. React, Docker, Python, Kubernetes)..."
                                className="w-full bg-brand-surface/90 text-brand-text placeholder-brand-subtle border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary rounded-2xl py-3 pl-11 pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text p-1 transition-colors"
                                    title="Clear Search"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* 2. TOPIC FILTER PILLS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {topics.map(topic => (
                        <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all border ${
                                selectedTopic === topic.id
                                    ? "bg-gradient-to-r from-brand-primary to-indigo-600 text-white border-transparent shadow-glow-primary/30"
                                    : "glass-card text-brand-muted border-brand-border hover:border-brand-primary/40 hover:text-brand-text"
                            }`}
                        >
                            {topic.icon}
                            <span>{topic.label}</span>
                        </button>
                    ))}
                </div>

                {/* 3. SECONDARY CONTROLS BAR (DIFFICULTY, PRICING, SORTING) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-brand-border/60">
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
                        <span>Showing</span>
                        <span className="text-brand-text font-black px-2 py-0.5 rounded-md bg-brand-surface border border-brand-border font-mono">
                            {filteredCourses.length}
                        </span>
                        <span>track{filteredCourses.length === 1 ? '' : 's'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Difficulty Select */}
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-brand-muted font-medium">Level:</span>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="bg-brand-surface text-brand-text border border-brand-border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                            >
                                <option value="all">All Levels</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        {/* Price Select */}
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-brand-muted font-medium">Price:</span>
                            <select
                                value={selectedPrice}
                                onChange={(e) => setSelectedPrice(e.target.value)}
                                className="bg-brand-surface text-brand-text border border-brand-border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                            >
                                <option value="all">All Prices</option>
                                <option value="free">Free Only</option>
                                <option value="paid">Premium Paid</option>
                            </select>
                        </div>

                        {/* Sort Select */}
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-brand-muted font-medium">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-brand-surface text-brand-text border border-brand-border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                            >
                                <option value="rating">Highest Rated</option>
                                <option value="popular">Most Popular</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 4. FEATURED SPOTLIGHT BANNER */}
                {spotlightCourse && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1 }}
                        onClick={() => navigate(`/course/${spotlightCourse._id}`)}
                        className="group glass-card-elevated rounded-3xl p-6 sm:p-8 shadow-xl hover:border-brand-primary/50 transition-all duration-300 cursor-pointer relative overflow-hidden border border-brand-border/80"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
                            {/* Course Visual */}
                            <div className="md:col-span-5 lg:col-span-4 aspect-video rounded-2xl overflow-hidden bg-brand-surface border border-brand-border relative shadow-sm">
                                {spotlightCourse.thumbnail ? (
                                    <img 
                                        src={getImageUrl(spotlightCourse.thumbnail)} 
                                        alt={spotlightCourse.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary">
                                        <Code2 size={48} />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 glass-card border border-white/10 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-brand-text">
                                    {spotlightCourse.difficulty || "All Levels"}
                                </div>
                                <div className="absolute top-3 right-3 bg-brand-primary text-white px-2.5 py-0.5 rounded-md text-xs font-black shadow-md">
                                    {Number(spotlightCourse.price) === 0 ? "FREE" : `₹${spotlightCourse.price}`}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5">
                                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-primary text-white shadow-sm">
                                            Featured Spotlight
                                        </span>
                                        {spotlightCourse.averageRating > 0 && (
                                            <div className="flex items-center gap-1.5 glass-card px-2.5 py-1 rounded-md border border-brand-border">
                                                <StarRating rating={spotlightCourse.averageRating} readOnly size={13} />
                                                <span className="text-xs font-bold text-brand-text">{spotlightCourse.averageRating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight leading-snug group-hover:text-brand-primary transition-colors">
                                        {spotlightCourse.title}
                                    </h2>

                                    <p className="text-xs sm:text-sm text-brand-muted line-clamp-2 leading-relaxed">
                                        {spotlightCourse.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 pt-2">
                                    <button className="bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-glow-primary/40 border border-white/10 transition-all">
                                        <PlayCircle size={17} />
                                        <span>Start Learning</span>
                                        <ArrowRight size={15} />
                                    </button>

                                    <span className="text-xs font-semibold text-brand-muted flex items-center gap-1.5">
                                        <BookOpen size={14} className="text-brand-primary" />
                                        {spotlightCourse.modules?.length || 0} Modules · Certificate Included
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 5. COURSES GRID */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="glass-card rounded-3xl p-4 border border-brand-border animate-pulse space-y-4">
                                <div className="h-44 bg-brand-surface rounded-2xl" />
                                <div className="h-5 bg-brand-surface rounded-md w-3/4" />
                                <div className="h-4 bg-brand-surface rounded-md w-full" />
                                <div className="h-4 bg-brand-surface rounded-md w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    /* Empty Search State */
                    <div className="glass-card-elevated rounded-3xl p-12 sm:p-16 text-center max-w-xl mx-auto shadow-sm space-y-4 border border-brand-border">
                        <div className="w-14 h-14 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center mx-auto text-brand-muted">
                            <Search size={26} />
                        </div>
                        <h3 className="text-xl font-black text-brand-text tracking-tight">
                            No courses match your criteria
                        </h3>
                        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                            {searchQuery 
                                ? `We couldn't find any courses matching "${searchQuery}". Try a different keyword or clear your filters.`
                                : "No courses found under this topic filter."}
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    handleClearSearch();
                                    setSelectedTopic("all");
                                    setSelectedDifficulty("all");
                                    setSelectedPrice("all");
                                }}
                                className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold transition-all shadow-md"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Course Cards Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredCourses.map((course, idx) => (
                                <motion.div
                                    key={course._id || idx}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.35, delay: idx * 0.04 }}
                                    whileHover={{ y: -6 }}
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="group glass-card rounded-3xl overflow-hidden hover:border-brand-primary/50 shadow-sm hover:shadow-glow-primary/20 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Thumbnail */}
                                        <div className="aspect-video bg-brand-surface relative overflow-hidden">
                                            {course.thumbnail ? (
                                                <img 
                                                    src={getImageUrl(course.thumbnail)} 
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary">
                                                    <Code2 size={36} />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Difficulty Chip */}
                                            <div className="absolute top-3 left-3 z-10">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-sm ${getDifficultyBadge(course.difficulty)}`}>
                                                    {course.difficulty || "All Levels"}
                                                </span>
                                            </div>

                                            {/* Price Badge */}
                                            <div className="absolute top-3 right-3 z-10 bg-brand-primary text-white px-2.5 py-0.5 rounded-md text-xs font-black shadow-md">
                                                {Number(course.price) === 0 ? "FREE" : `₹${course.price}`}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 space-y-2.5">
                                            {/* Rating and Author */}
                                            <div className="flex items-center justify-between text-xs">
                                                {course.reviewCount > 0 ? (
                                                    <div className="flex items-center gap-1">
                                                        <StarRating rating={course.averageRating} readOnly size={12} />
                                                        <span className="text-[11px] font-bold text-brand-muted">
                                                            {course.averageRating.toFixed(1)} ({course.reviewCount})
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider font-mono">
                                                        Curated Track
                                                    </span>
                                                )}

                                                {course.author && (
                                                    <span className="text-[11px] text-brand-subtle truncate max-w-[120px]">
                                                        {course.author}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title with search match highlighting */}
                                            <h3 className="font-bold text-base text-brand-text leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                                                {searchQuery ? highlightWordPrefix(course.title, searchQuery) : course.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                                                {course.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-5 pt-0 space-y-3">
                                        {/* Tags */}
                                        {Array.isArray(course.tags) && course.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {course.tags.slice(0, 3).map((tag, tIdx) => (
                                                    <span 
                                                        key={tIdx}
                                                        className="text-[10px] font-semibold px-2 py-0.5 bg-brand-surface text-brand-muted rounded-md border border-brand-border/60"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs font-bold text-brand-muted">
                                            <span className="flex items-center gap-1.5">
                                                <BookOpen size={13} className="text-brand-primary" />
                                                {course.modules?.length || 0} Modules
                                            </span>

                                            <span className="text-brand-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                View Track
                                                <ChevronRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

            </div>
        </div>
    );
}

export default CourseShowcase;

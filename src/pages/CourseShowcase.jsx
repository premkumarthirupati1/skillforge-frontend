import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import { highlightWordPrefix } from "./SearchBar";
import StarRating from "../components/StarRating";
import { Search, Loader2, PlayCircle, BookOpen, Clock, Tag } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

function CourseShowcase() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const searchQuery = searchParams.get("search") || searchParams.get("q") || "";

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            if (searchQuery.trim()) {
                const res = await api.get(`/course/search?q=${encodeURIComponent(searchQuery.trim())}&limit=50`);
                const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.results || []);
                setCourses(data);
            } else {
                const res = await api.get("/course/public");
                setCourses(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            console.error("Error loading courses:", err);
            setCourses([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [searchQuery]);

    const getDifficultyBadge = (level) => {
        const diff = level?.toLowerCase();
        if (diff === 'beginner') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        if (diff === 'intermediate') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    };

    // Use only top highly-rated or newest courses for the hero (fallback to first 3)
    const featuredCourses = courses.slice(0, 3);
    const gridCourses = courses; // show all in the grid below

    return (
        <div className="min-h-screen bg-brand-bg font-sans text-brand-text flex flex-col selection:bg-brand-primary/30">
            <NavBar />

            {/* --- PREMIUM HERO CAROUSEL --- */}
            {!searchQuery && featuredCourses.length > 0 && (
                <section className="relative w-full overflow-hidden border-b border-brand-border bg-brand-surface pt-6 pb-12">
                    <div className="absolute inset-0 bg-brand-primary/5 blur-[120px] opacity-50 pointer-events-none" />
                    
                    <div className="max-w-7xl mx-auto px-6 relative z-0">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay, EffectFade]}
                            effect="fade"
                            spaceBetween={0}
                            slidesPerView={1}
                            pagination={{ 
                                clickable: true,
                                renderBullet: (index, className) => {
                                    return `<span class="${className} !bg-brand-primary !w-8 !h-1.5 !rounded-full transition-all"></span>`;
                                }
                            }}
                            fadeEffect={{ crossFade: true }}
                            autoplay={{ delay: 6000, disableOnInteraction: false }}
                            className="rounded-3xl overflow-hidden shadow-2xl border border-brand-border/50 group/swiper bg-brand-surface"
                        >
                            {featuredCourses.map((course) => (
                                <SwiperSlide key={`featured-${course._id}`}>
                                    <div className="relative h-[500px] md:h-[550px] w-full flex items-center group/slide cursor-pointer bg-brand-bg" onClick={() => navigate(`/course/${course._id}`)}>
                                        {/* Background Image */}
                                        <div className="absolute inset-0">
                                            <img
                                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${course.thumbnail?.replace(/\\/g, "/")}`}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover/slide:scale-105"
                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                            />
                                            {/* Advanced Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/90 to-transparent" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-transparent to-transparent" />
                                        </div>

                                        {/* Content */}
                                        <div className="relative z-10 p-8 md:p-16 max-w-2xl flex flex-col justify-center h-full">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-brand-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                                    Featured
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${getDifficultyBadge(course.difficulty)}`}>
                                                    {course.difficulty}
                                                </span>
                                            </div>
                                            
                                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight text-white drop-shadow-md">
                                                {course.title}
                                            </h2>
                                            
                                            <p className="text-brand-muted text-lg line-clamp-2 mb-8 leading-relaxed max-w-xl">
                                                {course.description}
                                            </p>
                                            
                                            <div className="flex items-center gap-4">
                                                <button className="bg-brand-text text-brand-bg px-8 py-3.5 rounded-full font-bold hover:bg-white hover:scale-105 transition-all flex items-center gap-2 shadow-lg">
                                                    <PlayCircle size={20} />
                                                    Start Learning
                                                </button>
                                                {course.price > 0 && (
                                                    <span className="text-xl font-black tracking-tight text-brand-text bg-brand-surface/50 backdrop-blur-md px-6 py-3 rounded-full border border-brand-border shadow-sm">
                                                        ${course.price}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section>
            )}

            {/* --- CATALOG GRID --- */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">
                            {searchQuery ? `Results for "${searchQuery}"` : "Complete Library"}
                        </h1>
                        <p className="text-brand-subtle">
                            {searchQuery 
                                ? `Found ${courses.length} course${courses.length === 1 ? "" : "s"} matching your criteria.`
                                : "Explore our premium curriculum designed for modern developers."
                            }
                        </p>
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchParams({})}
                            className="text-sm font-bold text-brand-muted hover:text-brand-text bg-brand-surface border border-brand-border px-5 py-2.5 rounded-full transition-all"
                        >
                            Clear Search
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <Loader2 size={40} className="text-brand-primary animate-spin mb-4" />
                        <p className="text-brand-muted font-mono text-sm uppercase tracking-widest">Loading Catalog...</p>
                    </div>
                ) : gridCourses.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-16 bg-brand-surface border border-dashed border-brand-border rounded-3xl">
                        <div className="w-16 h-16 bg-brand-elevated rounded-full flex items-center justify-center mb-6 text-brand-muted">
                            <Search size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Courses Found</h3>
                        <p className="text-brand-subtle max-w-md">
                            We couldn't find any courses matching "{searchQuery}". Try a different keyword or start with another prefix.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {gridCourses.map(course => (
                            <div
                                key={course._id}
                                onClick={() => navigate(`/course/${course._id}`)}
                                className="group bg-brand-surface border border-brand-border rounded-2xl overflow-hidden hover:border-brand-primary/40 transition-all duration-300 cursor-pointer flex flex-col"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-brand-elevated relative overflow-hidden">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${course.thumbnail?.replace(/\\/g, "/")}`}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent opacity-80" />
                                    
                                    {/* Difficulty Badge */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-sm flex items-center gap-1 ${getDifficultyBadge(course.difficulty)}`}>
                                            {course.difficulty}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1">
                                            {course.reviewCount > 0 ? (
                                                <>
                                                    <StarRating rating={course.averageRating} readOnly size={12} />
                                                    <span className="text-[11px] font-bold text-brand-muted ml-1">({course.reviewCount})</span>
                                                </>
                                            ) : (
                                                <span className="text-[11px] font-semibold text-brand-muted">New Course</span>
                                            )}
                                        </div>
                                        {course.price !== undefined && (
                                            <span className="text-sm font-black text-brand-text">
                                                {Number(course.price) === 0 ? "Free" : `$${course.price}`}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                                        {searchQuery ? highlightWordPrefix(course.title, searchQuery) : course.title}
                                    </h3>
                                    
                                    <p className="text-xs text-brand-subtle line-clamp-2 mb-4 flex-grow">
                                        {course.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 mt-auto pt-4 text-[11px] font-bold text-brand-muted border-t border-brand-border/50 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5">
                                            <BookOpen size={12} />
                                            {course.modules?.length || 0} Modules
                                        </span>
                                        <span className="flex items-center gap-1.5 ml-auto text-brand-primary group-hover:translate-x-1 transition-transform">
                                            View Details &rarr;
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default CourseShowcase;

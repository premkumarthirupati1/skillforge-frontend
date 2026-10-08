import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import { highlightWordPrefix, matchesWordPrefix } from "./SearchBar";
import StarRating from "../components/StarRating";

// 1. Import Swiper components and styles
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

    const getDifficultyColor = (level) => {
        const diff = level?.toLowerCase();
        if (diff === 'beginner') return 'bg-green-100 text-green-700';
        if (diff === 'intermediate') return 'bg-blue-100 text-blue-700';
        return 'bg-red-100 text-red-700';
    };

    // Separate featured courses for the carousel (e.g., first 4)
    const featuredCourses = courses.slice(0, 4);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <NavBar />

            {/* --- HERO CAROUSEL SECTION --- */}
            {featuredCourses.length > 0 && (
                <section className="bg-brand-surface border-b border-brand-border overflow-hidden">
                    <div className="max-w-6xl mx-auto px-8 py-10">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay, EffectFade]}
                            effect="fade"
                            spaceBetween={30}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            className="rounded-3xl shadow-2xl overflow-hidden relative z-0"
                        >
                            {featuredCourses.map((course) => (
                                <SwiperSlide key={`featured-${course._id}`}>
                                    <div className="relative h-[450px] group cursor-pointer" onClick={() => navigate(`/course/${course._id}`)}>
                                        <img
                                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${course.thumbnail?.replace(/\\/g, "/")}`}
                                            alt={course.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-12 text-white">
                                            <span className="bg-blue-600 w-max px-3 py-1 rounded-full text-xs font-bold uppercase mb-4">
                                                Featured Course
                                            </span>
                                            <h2 className="text-4xl font-black mb-4 max-w-lg leading-tight">
                                                {course.title}
                                            </h2>
                                            <p className="max-w-md text-gray-200 line-clamp-2 mb-6">
                                                {course.description}
                                            </p>
                                            <button className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl w-max hover:bg-blue-50 transition-colors">
                                                Enroll Now
                                            </button>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section>
            )}

            {/* --- MAIN GRID SECTION --- */}
            <main className="max-w-6xl mx-auto px-8 py-12">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
                            {searchQuery ? `Search Results for "${searchQuery}"` : "Explore Library"}
                        </h2>
                        {searchQuery && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Showing prefix matches ({courses.length} course{courses.length === 1 ? "" : "s"} found)
                            </p>
                        )}
                    </div>
                    {searchQuery ? (
                        <button
                            onClick={() => setSearchParams({})}
                            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl transition-colors"
                        >
                            Clear Filter
                        </button>
                    ) : (
                        <div className="h-1 flex-grow mx-6 bg-slate-200 dark:bg-slate-800 rounded-full hidden sm:block"></div>
                    )}
                </div>

                {isLoading ? (
                    <div className="py-20 text-center text-slate-400">Loading courses...</div>
                ) : courses.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">No courses found</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            No courses match the word prefix "{searchQuery}". Try a different keyword or start with another prefix.
                        </p>
                        <button
                            onClick={() => setSearchParams({})}
                            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            View All Courses
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map(course => (
                            <div
                                key={course._id}
                                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                <div className="h-48 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${course.thumbnail?.replace(/\\/g, "/")}`}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${getDifficultyColor(course.difficulty)}`}>
                                        {course.difficulty}
                                    </div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {searchQuery ? highlightWordPrefix(course.title, searchQuery) : course.title}
                                    </h3>
                                    {course.reviewCount > 0 && (
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <StarRating rating={course.averageRating} readOnly size={14} />
                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{course.averageRating?.toFixed(1)} ({course.reviewCount})</span>
                                        </div>
                                    )}
                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-grow">
                                        {course.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {Array.isArray(course.tags) && course.tags.map(tag => (
                                            <span key={tag} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 text-[10px] font-semibold rounded-md uppercase border border-slate-200 dark:border-slate-700">
                                                {searchQuery ? highlightWordPrefix(tag, searchQuery) : tag}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/course/${course._id}`)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group/btn"
                                    >
                                        View Course
                                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                    </button>
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

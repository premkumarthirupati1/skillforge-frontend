import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

// 1. Import Swiper components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

function CourseShowcase() {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    const fetchCourses = async () => {
        try {
            const res = await api.get("/course/public");
            setCourses(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const getDifficultyColor = (level) => {
        const diff = level?.toLowerCase();
        if (diff === 'beginner') return 'bg-green-100 text-green-700';
        if (diff === 'intermediate') return 'bg-blue-100 text-blue-700';
        return 'bg-red-100 text-red-700';
    };

    // Separate featured courses for the carousel (e.g., first 4)
    const featuredCourses = courses.slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            {/* --- HERO CAROUSEL SECTION --- */}
            {featuredCourses.length > 0 && (
                <section className="bg-white border-b overflow-hidden">
                    <div className="max-w-6xl mx-auto px-8 py-10">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay, EffectFade]}
                            effect="fade"
                            spaceBetween={30}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            className="rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {featuredCourses.map((course) => (
                                <SwiperSlide key={`featured-${course._id}`}>
                                    <div className="relative h-[450px] group cursor-pointer" onClick={() => navigate(`/course/${course._id}`)}>
                                        <img
                                            src={`http://localhost:3000/${course.thumbnail?.replace(/\\/g, "/")}`}
                                            alt={course.title}
                                            className="absolute inset-0 w-full h-full object-cover"
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
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">
                        Explore Library
                    </h2>
                    <div className="h-1 flex-grow mx-6 bg-gray-200 rounded-full hidden sm:block"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <div
                            key={course._id}
                            className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                        >
                            {/* ... Your Existing Card Content ... */}
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                <img
                                    src={`http://localhost:3000/${course.thumbnail?.replace(/\\/g, "/")}`}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${getDifficultyColor(course.difficulty)}`}>
                                    {course.difficulty}
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                                    {course.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {course.tags.map(tag => (
                                        <span key={tag} className="bg-gray-100 text-gray-600 px-2.5 py-0.5 text-[10px] font-semibold rounded-md uppercase border border-gray-200">
                                            {tag}
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
            </main>
        </div>
    );
}

export default CourseShowcase;
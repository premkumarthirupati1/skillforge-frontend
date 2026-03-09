import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

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

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <header className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-8 py-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Featured Courses
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Explore our world-class courses designed by industry experts.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-8 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <div
                            key={course._id}
                            className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                        >
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                    <span className="text-gray-400 font-medium">Course Preview</span>
                                </div>
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
                                        <span
                                            key={tag}
                                            className="bg-gray-100 text-gray-600 px-2.5 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wide border border-gray-200"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2 group/btn"
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
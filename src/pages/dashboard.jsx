import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

function Dashboard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unownedCourses, setUnownedCourses] = useState([]);
    console.log(unownedCourses.length);
    const SERVER_URL = "http://localhost:3000";

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.post("/enrollments/get-courses");
                const enrolledEnrollments = res.data;
                setCourses(enrolledEnrollments);

                const allRes = await api.get("/course/public");
                const allCourses = allRes.data || [];

                const enrolledIds = enrolledEnrollments.map(e => {
                    const id = e.courseId?._id || e.courseId;
                    return id.toString();
                });

                const filtered = allCourses.filter(c =>
                    !enrolledIds.includes(c._id.toString())
                );

                setUnownedCourses(filtered.slice(0, 3));
                setUnownedCourses(filtered.slice(0, 3))
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-400">
                <p className="animate-pulse font-medium">Loading your journey...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <NavBar />

            <div className="max-w-7xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Welcome back! 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        You're doing great. Pick up where you left off.
                    </p>
                </header>

                <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-sm">
                        My Learning Path
                    </h2>
                    <span className="text-slate-400 text-sm font-medium">
                        {courses.length} Courses Enrolled
                    </span>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-400 mb-4 font-medium">Your learning path is empty.</p>
                        <button
                            onClick={() => navigate('/course-showcase')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-lg"
                        >
                            Find a Course
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((enrollment) => (
                            <div
                                key={enrollment._id}
                                onClick={() => navigate(`/course/${enrollment.courseId._id}`)}
                                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl cursor-pointer hover:border-blue-500 transition-all duration-300 hover:shadow-2xl overflow-hidden"
                            >
                                {/* Course Thumbnail Container */}
                                <div className="h-44 w-full overflow-hidden bg-slate-200 relative">
                                    <img
                                        src={`${SERVER_URL}/${enrollment.courseId.thumbnail?.replace(/\\/g, "/")}`}
                                        alt={enrollment.courseId.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                                            {enrollment.progress === 100 ? 'Completed' : 'Active'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-7">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {enrollment.courseId.title}
                                    </h3>

                                    <div className="mt-6 mb-2 flex justify-between items-end">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Progress</span>
                                        <span className="text-sm font-black text-blue-600">{enrollment.progress}%</span>
                                    </div>

                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${enrollment.progress}%` }}
                                        />
                                    </div>

                                    <div className="mt-8 flex items-center gap-2 text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                        Continue Learning
                                        <span className="text-lg">→</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {unownedCourses.length > 0 && (
                    <section className="mt-16 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    Explore New Horizons 🌟
                                </h2>
                                <p className="text-slate-500 mt-1">Handpicked recommendations based on your profile.</p>
                            </div>
                            <button
                                onClick={() => navigate("/course-showcase")}
                                className="text-blue-600 font-bold hover:underline flex items-center gap-2"
                            >
                                View All Courses <span>→</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {unownedCourses.map(course => (
                                <div
                                    key={course._id}
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="group cursor-pointer bg-slate-50 rounded-2xl p-4 border border-transparent hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                                >
                                    <img
                                        src={`http://localhost:3000/${course.thumbnail?.replace(/\\/g, "/")}`}
                                        className="w-full h-32 object-cover rounded-xl mb-4 shadow-sm"
                                        alt={course.title}
                                    />
                                    <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                        {course.title}
                                    </h4>
                                    <span className="text-[10px] uppercase font-black text-slate-400 mt-2 block tracking-widest">
                                        {course.difficulty}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
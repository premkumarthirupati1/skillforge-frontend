import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

function Dashboard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.post("/enrollments/get-courses");
                setCourses(res.data);
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
                            onClick={() => navigate('/course-showcase   ')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-lg shadow-blue-200 dark:shadow-none"
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
                                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 rounded-3xl cursor-pointer hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                                        {enrollment.progress === 100 ? 'Completed' : 'Active'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 transition-colors">
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
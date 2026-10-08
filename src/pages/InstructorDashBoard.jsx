import { useEffect, useState } from "react";
import api from "../api";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function InstructorDashBoard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure? This will permanently delete the course and all its content.")) return;

        setActionLoading(courseId);
        try {
            await api.delete(`/course/${courseId}/delete`);
            setCourses(prev => prev.filter(c => c._id !== courseId));
            toast.success("Course deleted successfully");
        } catch (err) {
            toast.error("Failed to delete course");
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePublishToggle = async (courseId) => {
        setActionLoading(courseId);
        try {
            const res = await api.patch(`/course/${courseId}/publish`);
            setCourses(prev =>
                prev.map(course =>
                    course._id === courseId
                        ? { ...course, isPublished: res.data.isPublished }
                        : course
                )
            );
            toast.success(res.data.isPublished ? "Course Live!" : "Course Unpublished");
        } catch (err) {
            toast.error("Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const result = await api.get('/course/instructor');
                setCourses(Array.isArray(result.data) ? result.data : (result.data?.courses || []));
            } catch (err) {
                toast.error("Error loading courses");
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Loading Instructor Space...</div>;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <NavBar />
            <div className="max-w-7xl mx-auto p-6 md:p-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Instructor Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your content and track student progress.</p>
                    </div>
                    <button
                        onClick={() => navigate('/create-course')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
                    >
                        <span>+</span> Create New Course
                    </button>
                </header>

                {courses.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No courses yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Start your journey as an instructor.</p>
                        <button onClick={() => navigate('/create-course')} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Create a course now →</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {courses.map(course => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                onTogglePublish={handlePublishToggle}
                                onDelete={handleDelete}
                                isProcessing={actionLoading === course._id}
                                navigate={navigate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CourseCard({ course, onTogglePublish, onDelete, isProcessing, navigate }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors shadow-sm relative group">
            {/* DELETE ICON BUTTON */}
            <button
                disabled={isProcessing}
                onClick={() => onDelete(course._id)}
                className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Delete Course"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${course.isPublished ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm">{course.studentsEnrolled?.length || 0} Students</span>
                </div>
                <h2 className="text-xl font-bold mb-2 line-clamp-1 text-slate-900 dark:text-white">{course.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 h-10">{course.description}</p>

                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/course/${course._id}/edit`)}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            Edit Details
                        </button>
                        <button
                            onClick={() => navigate(`/course-builder/${course._id}`)}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            Manage Content
                        </button>
                    </div>
                    <button
                        disabled={isProcessing}
                        onClick={() => onTogglePublish(course._id)}
                        className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${course.isPublished
                            ? "bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                    >
                        {isProcessing ? "Processing..." : course.isPublished ? "Take Offline" : "Publish Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InstructorDashBoard;

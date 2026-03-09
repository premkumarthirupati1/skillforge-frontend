import { useEffect, useState } from "react";
import api from "../api";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; // Recommended for professional feedback

function InstructorDashBoard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // Track specific course actions

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
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const result = await api.get('/course/instructor');
                setCourses(result.data);
            } catch (err) {
                toast.error("Error loading courses");
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
            <NavBar />
            <div className="max-w-7xl mx-auto p-6 md:p-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight">Instructor Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage your content and track student progress.</p>
                    </div>
                    <button
                        onClick={() => navigate('/create-course')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 flex items-center gap-2"
                    >
                        <span>+</span> Create New Course
                    </button>
                </header>

                {/* Course Grid */}
                {courses.length === 0 ? (
                    <EmptyState onAdd={() => navigate('/create-course')} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {courses.map(course => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                onTogglePublish={handlePublishToggle}
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

// Sub-components for better maintainability [cite: 25]
function CourseCard({ course, onTogglePublish, isProcessing, navigate }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 transition-colors shadow-sm">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-slate-400 text-sm">24 Students</span>
                </div>
                <h2 className="text-xl font-bold mb-2 line-clamp-1">{course.title}</h2>
                <p className="text-slate-600 text-sm mb-6 line-clamp-2 h-10">
                    {course.description}
                </p>

                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/course/${course._id}/edit`)}
                            className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            Edit Details
                        </button>
                        <button
                            onClick={() => navigate(`/course-builder/${course._id}`)}
                            className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            Manage Content
                        </button>
                    </div>
                    <button
                        disabled={isProcessing}
                        onClick={() => onTogglePublish(course._id)}
                        className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${course.isPublished
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                    >
                        {isProcessing ? "Processing..." : course.isPublished ? "Take Course Offline" : "Publish to Marketplace"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return <div className="p-10 text-center text-slate-400 animate-pulse">Loading Instructor Space...</div>;
}

function EmptyState({ onAdd }) {
    return (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">No courses yet</h3>
            <p className="text-slate-500 mb-6">Start your journey as an instructor by creating your first course.</p>
            <button onClick={onAdd} className="text-indigo-600 font-bold hover:underline">Create a course now →</button>
        </div>
    );
}

export default InstructorDashBoard;
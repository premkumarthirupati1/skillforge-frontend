import { useEffect, useState } from "react"; // Changed useState to useEffect for fetching
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";

function LessonsView() {
    const [lessons, setLessons] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const handleComplete = async (e, lessonId) => {
        e.stopPropagation(); // Prevents navigating to the lesson page
        try {
            await api.patch(`/lessons/${lessonId}/complete`);
            // Refresh the list to show the new completion status
            fetchLessons();
        } catch (err) {
            console.log("Error marking as complete:", err);
        }
    };
    const fetchLessons = async () => {
        try {
            const res = await api.get(`/modules/${moduleId}`);
            setLessons(res.data.lessons);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    // Correct way to trigger the fetch in React
    useEffect(() => {
        fetchLessons();
    }, [moduleId]);

    return (
        <div className="bg-slate-50 min-h-screen">
            <NavBar />
            <div className="max-w-5xl mx-auto py-12 px-6">

                {/* Back to Modules Arrow */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
                >
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="font-semibold text-sm">Back to Modules</span>
                </button>

                <header className="mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900">Module Lessons</h1>
                    <p className="text-slate-500">Select a lesson to start learning.</p>
                </header>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-slate-200 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : lessons.length > 0 ? (
                    <div className="grid gap-4">
                        {lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                            <div
                                key={lesson._id}
                                onClick={() => navigate(`/lesson/${lesson._id}`)}
                                className="group bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-500 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={(e) => handleComplete(e, lesson._id)}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold z-10 transition-all duration-300
        ${lesson.completed
                                                ? 'bg-green-100 text-green-600 border-2 border-green-200 shadow-sm'
                                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                                            }`}
                                    >
                                        {lesson.completed ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            lesson.order
                                        )}
                                    </button>

                                    <div>
                                        <h3 className={`font-bold text-lg transition-colors ${lesson.complete ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                            {lesson.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase">
                                                {lesson.contentType === 'video' ? '🎥 Video' : '📄 Reading'}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {lesson.duration} mins
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    Start Lesson <span>→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 text-lg">No lessons available in this module yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LessonsView;
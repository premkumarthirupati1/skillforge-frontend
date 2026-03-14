import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useState } from "react";

function LessonsView() {
    const [lessons, setLessons] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const fetchLessons = async () => {
        try {
            const res = await api.get(`/modules/${moduleId}`);
            setLessons(res.data.lessons);
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setIsLoading(false);
        }
    }
    useState(() => {
        fetchLessons();
    }, [moduleId])
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto py-12 px-6">
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
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {lesson.order}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{lesson.title}</h3>
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
                                    Start Lesson <span>&rarr;</span>
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
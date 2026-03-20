import { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

function LessonViewer() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [loading, setIsLoading] = useState(true);

    const fetchLesson = async () => {
        try {
            const res = await api.get(`/lessons/get-lesson/${lessonId}`);
            setLesson(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLesson();
    }, [lessonId]);

    const handleComplete = async () => {
        try {
            await api.patch(`/lessons/${lessonId}/complete`);
            navigate(-1);
        } catch (err) {
            console.error("Failed to mark complete");
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading content...</div>;
    if (!lesson) return <div className="p-20 text-center">Lesson not found.</div>;

    return (
        <div className="bg-white min-h-screen">
            <NavBar />
            <div className="max-w-5xl mx-auto py-10 px-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-2"
                >
                    &larr; Back to Module
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{lesson.title}</h1>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-widest">
                        {lesson.contentType}
                    </span>
                </div>

                <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl mb-8">
                    {lesson.contentType === "video" ? (
                        <video
                            controls
                            controlsList="nodownload"
                            className="w-full aspect-video"

                            src={`http://localhost:3000/${lesson.content}`}
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="bg-white p-10 text-slate-800 leading-relaxed text-lg min-h-[400px]">
                            {lesson.content}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-8">
                    <div className="text-slate-400 text-sm">
                        Duration: {lesson.duration} mins
                    </div>
                    <button
                        onClick={handleComplete}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        Mark as Completed & Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LessonViewer;
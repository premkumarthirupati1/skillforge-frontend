import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
function CourseView() {
    const { courseId } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);
    const handleComplete = async (lessonId) => {
        try {
            await api.post(`/lessons/${lessonId}/complete`);
            const res = await api.get(`/course/${courseId}/full`);
            setCourseData(res.data.result);

        } catch (err) {
            console.error("Failed to complete lesson", err);
        }
    };
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/course/${courseId}/full`);
                console.log(res);
                setCourseData(res.data);
            }
            catch (err) {
                console.log(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);
    if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-500 flex items-center justify-center animate-pulse">Loading course content...</div>;
    if (!courseData) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-500 flex items-center justify-center">Course not found!</div>;
    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <NavBar />
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    {courseData.course.title}
                </h1>

                <div className="w-1/3 max-w-xs">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${courseData.progress}%` }}
                        />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 text-right">
                        {courseData.progress}% completed
                    </p>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

                <div className="w-1/3 max-w-sm bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4">
                    {courseData.modules.map((module) => (
                        <div key={module._id} className="mb-6">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                {module.title}
                            </h3>

                            {module.lessons.map((lesson) => (
                                <div
                                    key={lesson._id}
                                    onClick={() => setActiveLesson(lesson)}
                                    className={`p-3 rounded-xl cursor-pointer mb-1.5 flex justify-between items-center transition-colors text-sm font-medium
                  ${activeLesson?._id === lesson._id
                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                        }
                `}
                                >
                                    <span className="truncate mr-2">{lesson.title}</span>
                                    {lesson.completed && (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✔</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-950">
                    {activeLesson ? (
                        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
                                {activeLesson.title}
                            </h2>

                            {activeLesson.contentType === "video" && (
                                <div className="bg-black rounded-xl overflow-hidden mb-6 shadow-md">
                                    <video
                                        controls
                                        className="w-full max-h-[450px]"
                                    >
                                        <source src={activeLesson.content} type="video/mp4" />
                                    </video>
                                </div>
                            )}

                            {activeLesson.contentType === "text" && (
                                <p className="text-slate-700 dark:text-slate-300 mb-6 whitespace-pre-line leading-relaxed">
                                    {activeLesson.content}
                                </p>
                            )}

                            {activeLesson.contentType === "quiz" && (
                                <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-6 rounded-xl mb-6">
                                    Quiz feature coming soon.
                                </div>
                            )}

                            {!activeLesson.completed && (
                                <button
                                    onClick={() => handleComplete(activeLesson._id)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md"
                                >
                                    Mark as Complete
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-lg">
                            Select a lesson to begin.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
export default CourseView;
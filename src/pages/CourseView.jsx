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
    if (loading) return <h3>Loading...</h3>;
    if (!courseData) return <h3>Course not found!</h3>;
    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <NavBar />
            <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-semibold">
                    {courseData.course.title}
                </h1>

                <div className="w-1/3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{ width: `${courseData.progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-1 text-right">
                        {courseData.progress}% completed
                    </p>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

                <div className="w-1/3 bg-white border-r overflow-y-auto p-4">
                    {courseData.modules.map((module) => (
                        <div key={module._id} className="mb-6">
                            <h3 className="font-semibold text-gray-700 mb-2">
                                {module.title}
                            </h3>

                            {module.lessons.map((lesson) => (
                                <div
                                    key={lesson._id}
                                    onClick={() => setActiveLesson(lesson)}
                                    className={`p-2 rounded cursor-pointer mb-1 flex justify-between items-center
                  ${activeLesson?._id === lesson._id
                                            ? "bg-blue-100"
                                            : "hover:bg-gray-100"
                                        }
                `}
                                >
                                    <span>{lesson.title}</span>
                                    {lesson.completed && (
                                        <span className="text-green-600 font-bold">✔</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                    {activeLesson ? (
                        <>
                            <h2 className="text-2xl font-bold mb-4">
                                {activeLesson.title}
                            </h2>

                            {activeLesson.contentType === "video" && (
                                <video
                                    controls
                                    className="w-full max-h-[450px] rounded mb-6"
                                >
                                    <source src={activeLesson.content} type="video/mp4" />
                                </video>
                            )}

                            {activeLesson.contentType === "text" && (
                                <p className="text-gray-700 mb-6 whitespace-pre-line">
                                    {activeLesson.content}
                                </p>
                            )}

                            {activeLesson.contentType === "quiz" && (
                                <div className="bg-gray-50 p-6 rounded">
                                    Quiz feature coming soon.
                                </div>
                            )}

                            {!activeLesson.completed && (
                                <button
                                    onClick={() => handleComplete(activeLesson._id)}
                                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
                                >
                                    Mark as Complete
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-500 text-lg">
                            Select a lesson to begin.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
export default CourseView;
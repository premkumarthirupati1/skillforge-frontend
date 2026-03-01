import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function CourseView() {
    const { courseId } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
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
                setCourseData(res.data.result);
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
        <div>
            <h2>{courseData?.course?.title}</h2>
            <p>Progress: {courseData?.progress}%</p>

            {courseData?.modules?.map((module) => (
                <div key={module._id} style={{ marginTop: "20px" }}>
                    <h3>{module.title}</h3>

                    {module.lessons?.map((lesson) => (
                        <div
                            key={lesson._id}
                            style={{
                                marginLeft: "20px",
                                color: lesson.completed ? "green" : "black"
                            }}
                        >
                            {lesson.title} {lesson.completed ? "✔️" : ""}

                            {!lesson.completed && (
                                <button
                                    style={{ marginLeft: "10px" }}
                                    onClick={() => handleComplete(lesson._id)}
                                >
                                    Complete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
export default CourseView;
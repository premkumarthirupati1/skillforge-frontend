import { useEffect, useState } from "react";
import api from "../api";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
function InstructorDashBoard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const PublishCourse = async (courseId) => {
        try {

            const res = await api.patch(`/course/${courseId}/publish`);

            setCourses(prev =>
                prev.map(course =>
                    course._id === courseId
                        ? { ...course, isPublished: res.data.isPublished }
                        : course
                )
            );

        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const result = await api.get('/course/instructor');
                setCourses(result.data);
            }
            catch (err) {
                console.log(err);
            }
            finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, [])
    if (loading) {
        return <div className="p-10 text-center">Loading courses...</div>;
    }
    return (
        <div className="bg-gray-100 min-h-screen">
            <NavBar />
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">
                        Instructor DashBoard
                    </h1>
                    <button className="bg-black text-white px-5 py-2 rounded"
                        onClick={() => navigate('/create-course')}
                    >
                        + Create Course
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course._id} className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-3">{course.title}</h2>
                            <p className="text-gray-600 mb-4">
                                {course.description}
                            </p>
                            <div className="flex gap-3">

                                <button
                                    onClick={() => navigate(`/course/${course._id}/edit`)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    Edit Course
                                </button>

                                <button
                                    onClick={() => navigate(`/course-builder/${course._id}`)}
                                    className="bg-purple-500 text-white px-3 py-1 rounded"
                                >
                                    Edit Modules
                                </button>

                                <button
                                    onClick={() => PublishCourse(course._id)}
                                    className={`px-3 py-1 rounded text-white ${course.isPublished
                                        ? "bg-red-500"
                                        : "bg-green-500"
                                        }`}
                                >
                                    {course.isPublished ? "Unpublish" : "Publish"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}
export default InstructorDashBoard;
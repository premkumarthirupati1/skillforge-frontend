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
            }
            catch (err) {
                console.log(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);
    if (loading) return <h3>Loading...</h3>;
    return (
        <div>
            <NavBar />
            <div className="p-6">
                <h1 className="text-3xl   font-bold mb-2">Welcome back 👋</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Continue you learning journey.
                </p>
                <h2 className="text-2xl font-bold mb-6">My Courses</h2>

                {courses.length === 0 ? (
                    <p>No Enrolled Courses</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((enrollment) => (
                            <div
                                key={enrollment._id}
                                onClick={() =>
                                    navigate(`/course/${enrollment.courseId._id}/full`)
                                }
                                className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition"
                            >
                                <h3 className="text-lg font-semibold mb-4">
                                    {enrollment.courseId.title}
                                </h3>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full"
                                        style={{ width: `${enrollment.progress}%` }}
                                    />
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    {enrollment.progress}% completed
                                </p>

                                <div className="mt-4 text-blue-600 font-medium">
                                    Continue Learning →
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
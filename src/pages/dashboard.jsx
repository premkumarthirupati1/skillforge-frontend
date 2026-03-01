import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
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
            <h2>My Enrolled Courses</h2>
            {courses.length === 0 ? (<p>No Enrolled Courses</p>) :
                (courses.map((enrollment) => (
                    <div key={enrollment._id} style={{ marginBottom: "20px", cursor: "pointer" }}
                        onClick={() => navigate(`/course/${enrollment.courseId._id}/full`)}>
                        <h3>{enrollment.courseId.title}</h3>
                        <p>Progress:{enrollment.progress}%</p>
                    </div>
                ))
                )}
        </div>
    );
}

export default Dashboard;
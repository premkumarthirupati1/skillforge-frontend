import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";

function EditLesson() {

    const { lessonId } = useParams();;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        contentType: "video",
        content: "",
        duration: "",
        order: ""
    });

    const fetchLesson = async () => {

        try {

            const res = await api.get(`/lessons/${lessonId}/get-lesson`);

            setFormData({
                title: res.data.title,
                contentType: res.data.contentType,
                content: res.data.content,
                duration: res.data.duration,
                order: res.data.order
            });

        } catch (err) {
            console.log(err);
        }

    };

    useEffect(() => {
        fetchLesson();
    }, [lessonId]);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const updateLesson = async () => {

        try {

            await api.patch(`/lessons/${lessonId}/update-lesson`, {
                ...formData,
                duration: Number(formData.duration),
                order: Number(formData.order)
            });

            navigate(-1);

        } catch (err) {
            console.log(err);
        }

    };

    return (

        <div className="bg-gray-100 min-h-screen">

            <NavBar />

            <div className="max-w-3xl mx-auto p-8">

                <h1 className="text-3xl font-bold mb-6">
                    Edit Lesson
                </h1>

                <div className="bg-white p-6 rounded shadow space-y-4">

                    <input
                        name="title"
                        placeholder="Lesson Title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                    />

                    <select
                        name="contentType"
                        value={formData.contentType}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                    >
                        <option value="video">Video</option>
                        <option value="text">Text</option>
                        <option value="quiz">Quiz</option>
                    </select>

                    <textarea
                        name="content"
                        placeholder="Content"
                        value={formData.content}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                    />

                    <input
                        name="duration"
                        type="number"
                        placeholder="Duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                    />

                    <input
                        name="order"
                        type="number"
                        placeholder="Lesson Order"
                        value={formData.order}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                    />

                    <button
                        onClick={updateLesson}
                        className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
                    >
                        Update Lesson
                    </button>

                </div>

            </div>

        </div>

    );

}

export default EditLesson;
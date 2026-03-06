import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const res = await api.post("/auth/login", formData);

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);

            navigate("/dashboard");

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="bg-gray-100 min-h-screen">

            <NavBar />

            <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">

                <h2 className="text-2xl font-bold mb-6 text-center">
                    Login
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                    />

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
                    >
                        Login
                    </button>

                </form>

            </div>

        </div>

    );

}

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("LOGIN API CALLED");
        console.log("Calling /auth/login");
        try {
            const res = await api.post("/auth/login", {
                email,
                password,
            });
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");

        } catch {
            alert("Login failed");
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Login</button>
        </form>
    );
}

export default Login;
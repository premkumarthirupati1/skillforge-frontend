import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // If it's a 401/403 and NOT a retry yet, attempt refresh
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            
            if (isRefreshing) {
                // If another request is currently refreshing the token, pause this one
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                // Ping the backend refresh endpoint (it reads the HttpOnly cookie automatically)
                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                
                const newToken = data.token;
                localStorage.setItem("token", newToken);
                
                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                
                // If refresh fails (e.g. refresh token expired), clear out storage
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("role");
                window.location.href = "/login";
                
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
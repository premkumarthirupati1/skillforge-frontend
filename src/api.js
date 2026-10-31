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
        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isAuthEndpoint = originalRequest.url?.includes("/auth/login") || 
                               originalRequest.url?.includes("/auth/signup") || 
                               originalRequest.url?.includes("/auth/refresh") ||
                               originalRequest.url?.includes("/auth/forgot-password") ||
                               originalRequest.url?.includes("/auth/reset-password");
        
        // Only trigger token refresh on 401 Unauthorized for non-auth endpoints
        if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            
            if (isRefreshing) {
                // If another request is currently refreshing the token, queue this one
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
                const storedRefreshToken = localStorage.getItem("refreshToken");
                const { data } = await axios.post(
                    `${API_BASE_URL}/auth/refresh`, 
                    { refreshToken: storedRefreshToken }, 
                    { withCredentials: true }
                );
                
                const newToken = data.token;
                localStorage.setItem("token", newToken);
                if (data.refreshToken) {
                    localStorage.setItem("refreshToken", data.refreshToken);
                }
                
                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                
                // Clear out invalid session credentials
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userId");
                localStorage.removeItem("role");
                localStorage.removeItem("userName");
                localStorage.removeItem("userEmail");
                
                // Only redirect if user was trying to access a protected area
                if (window.location.pathname !== "/login" && window.location.pathname !== "/signup" && window.location.pathname !== "/") {
                    window.location.href = "/login";
                }
                
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;

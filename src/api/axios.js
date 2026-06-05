import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

//Add token to the every request 
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If response status is 401, try to refresh the token and retry the original request
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response =
                    await axios.post(
                        "http://localhost:5000/api/auth/refresh-token",
                        {},
                        {
                            withCredentials: true,
                        }
                    );

                const newAccessToken = response.data.data.accessToken;
                localStorage.setItem("token", newAccessToken);
                //this will attch new token to the new request and send to backend 
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");

                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

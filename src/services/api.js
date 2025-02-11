import axios from "axios";

const API_BASE_URL = 'https://api.hamahangsho.ir';

const api = axios.create({
    API_BASE_URL,
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        const expireDate = new Date(localStorage.getItem("expireTime"));
        const now = new Date();
        if (token && expireDate>now) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        else {
            localStorage.removeItem("accessToken");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


async function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
        try {
            const response = await api.post('/refresh-token', { refresh_token: refreshToken });

            // ذخیره کردن توکن‌های جدید
            localStorage.setItem("accessToken", response.data.access);
            localStorage.setItem("refreshToken", response.data.refresh);

        } catch (error) {
            console.error("Error refreshing token:", error);
        }
    } else {
        console.error("No refresh token available.");
    }
}

export { refreshToken };
export default api;



import axios from "axios";

const API_BASE_URL = 'http://192.168.100.110:8000';

const api = axios.create({
    API_BASE_URL,
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
// اضافه کردن توکن به هدر هر درخواست
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// متد برای ریفرش کردن توکن
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

export { refreshToken }; // می‌توانید این متد را از اینجا صادر کنید
export default api;



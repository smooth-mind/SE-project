import axios from "axios";
import * as LocalAuthManager from "@/lib/LocalAuthManager"
import { toast } from "sonner";

const API_BASE_URL = "http://127.0.0.1:8000/";
//const API_BASE_URL = import.meta.env.VITE_API_URL;
//const API_BASE_URL = "https://ml-ops-final-project.onrender.com/";


const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
    headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access");
    if (accessToken)
        config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        /// Refresh token if expired
        if (error.response?.status === 401) {
            try {
                const refreshToken = LocalAuthManager.getRefreshToken();
                if (!refreshToken) throw new Error("No refresh token");
                const { data } = await axios.post(API_BASE_URL + "accounts/refresh/", {
                    refresh: refreshToken,
                });
                LocalAuthManager.save({
                    access: data.access,
                    refresh: refreshToken,
                    role: LocalAuthManager.getRole() ?? ""
                });
                error.config.headers.Authorization = `Bearer ${data.access}`;
                return axiosInstance(error.config);
            } catch (refreshError) {
                toast.error("Session expired. Please log in again.");
                LocalAuthManager.clear();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;



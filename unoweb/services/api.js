import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/features/auth";

export const API_URL = process.env.NODE_ENV === "production" ? "https://deti-viola.ua.pt/rb-md-violuno-app-v1/api" : "http://localhost:3000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use({}, (error) => {
  return Promise.reject(error);
});

const { dispatch } = store;
axiosInstance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;
    if (originalConfig.url !== "/auth/signin" && err.response) {
      // No access token or invalid token
      if (
        (err.response.status === 403 &&
          err.response.data.message === "No token provided!") ||
        (err.response.status === 401 &&
          err.response.data.message === "Unauthorized!")
      ) {
        await dispatch(logout());
        location.reload();
        return { data: null };
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;

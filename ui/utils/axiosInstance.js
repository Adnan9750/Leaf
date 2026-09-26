// ui/utils/axiosInstance.js
"use client";
import axios from "axios";

// Create an Axios instance with base URL and credentials
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// Request interceptor – you can attach auth tokens here if needed
axiosInstance.interceptors.request.use(
  (config) => {
    // Example: const token = getAuthToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – global error handling (e.g., 401 redirects)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized globally, e.g., clear auth store or redirect
      console.warn("Unauthorized – redirecting to login");
      // You might want to trigger a logout in the auth store here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

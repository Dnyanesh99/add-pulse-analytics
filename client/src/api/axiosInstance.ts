import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import toast from "react-hot-toast";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8081") + "/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add auth tokens here if needed in the future
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const errorData = error.response?.data as { message?: string } | undefined;
    const message = errorData?.message || error.message || "An unexpected error occurred";
    
    // Global Error Handling
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      switch (error.response.status) {
        case 401:
          toast.error("Unauthorized. Please log in again.");
          break;
        case 403:
          toast.error("You don't have permission to perform this action.");
          break;
        case 422:
          toast.error("Validation failed: " + message);
          break;
        case 500:
          toast.error("Internal Server Error. Please try again later.");
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      // Request was made but no response was received
      toast.error("Network error. Please check your internet connection.");
    } else {
      // Something happened in setting up the request
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

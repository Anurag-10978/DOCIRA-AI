import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),

  register: (data: {
    email: string;
    full_name: string;
    password: string;
  }) =>
    api.post("/api/auth/register", data),

  me: () => api.get("/api/auth/me"),

  updateProfile: (data: {
    full_name?: string;
    avatar_url?: string;
  }) =>
    api.put("/api/auth/profile", data),
};
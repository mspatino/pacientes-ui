import axios, { type InternalAxiosRequestConfig } from "axios";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/+$/, "");

const axiosInstance = axios.create({
  baseURL,
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// interceptor de request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//interceptor de response
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    
    const originalRequest = error.config as CustomAxiosRequestConfig;

      // NO interceptar login
    if (originalRequest.url?.includes("/api/auth/login")) {
      return Promise.reject(error);
    }

    // Token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(
          `${baseURL}/api/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem("accessToken", res.data.accessToken);

        // Reintentar request original
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

        return axiosInstance(originalRequest);
      }  catch {
        // SOLO logout si NO estás en login
        if (!window.location.pathname.includes("/login")) {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

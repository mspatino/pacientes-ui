import axios from "axios";
import api from "./api";

let isRefreshing = false;
type FailedRequest = {
  resolve: (value?: string | PromiseLike<string>) => void;
  reject: (reason?: unknown) => void;
};

let failedQueue: FailedRequest[] = [];

// const processQueue = (error: any, token: string | null = null) => {
//  failedQueue.forEach((prom) => {
//    if (error) {
//      prom.reject(error);
//    } else {
//      prom.resolve(token);
//    }
//  });
//  failedQueue = [];
// };


const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};


//  REQUEST → agregar token
api.interceptors.request.use((config) => {
 const token = localStorage.getItem("accessToken");

 if (token) {
   config.headers.Authorization = `Bearer ${token}`;
 }

 return config;
});

//  RESPONSE → manejar expiración
api.interceptors.response.use(
 (response) => response,
 async (error) => {
   const originalRequest = error.config;

   //  si es 401 y no reintentó
   if (error.response?.status === 401 && !originalRequest._retry) {

     if (isRefreshing) {
       return new Promise(function (resolve, reject) {
         failedQueue.push({ resolve, reject });
       }).then((token) => {
         originalRequest.headers["Authorization"] = "Bearer " + token;
         return api(originalRequest);
       });
     }

     originalRequest._retry = true;
     isRefreshing = true;

     try {
       const refreshToken = localStorage.getItem("refreshToken");

       const res = await axios.post(
         `${import.meta.env.VITE_API_URL}/auth/refresh`,
         {
           refreshToken,
         }
       );

       const newAccessToken = res.data.accessToken;

       localStorage.setItem("accessToken", newAccessToken);

       processQueue(null, newAccessToken);

       originalRequest.headers["Authorization"] =
         "Bearer " + newAccessToken;

       return api(originalRequest);

     } catch (err) {
       processQueue(err, null);

       // LOGOUT AUTOMÁTICO
       localStorage.clear();
       window.location.href = "/login";

       return Promise.reject(err);
     } finally {
       isRefreshing = false;
     }
   }

   return Promise.reject(error);
 }
);

export default api;

import axios from "axios";

// Em dev: VITE_API_URL não está definido → baseURL fica vazio → o proxy do Vite
//         intercepta as chamadas para /api e repassa para http://localhost:8080.
//
// Em prod: VITE_API_URL é definido como env var no Render antes do build,
//          ex: https://finly-backend.onrender.com
//          O axios chama o backend diretamente pela URL completa.

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("finly_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("finly_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

import axios from 'axios';

// Ganti baseURL dengan URL server backend Anda saat produksi
const api = axios.create({
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// (Opsional) Interceptor untuk menyisipkan token login otomatis di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
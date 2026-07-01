import api from './api'; // Ini instance axios kamu

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const createPayment = async (data: any) => {
  // Sesuaikan URL '/api/user/payments' dengan endpoint yang ada di Spring Boot kamu
  return await api.post('/api/payments', data, getAuthHeaders());
};
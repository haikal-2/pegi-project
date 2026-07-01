import api from './api';

// --- User Profile ---
export const getProfile = async () => await api.get('/api/profile');
export const updateProfile = async (data: any) => await api.put('/api/profile', data);

// --- Admin: Manajemen Pengguna ---
export const getAllUsers = async () => await api.get('/api/admin/users');
export const createUser = async (data: any) => await api.post('/api/admin/users', data);
export const updateUser = async (id: string, data: any) => await api.put(`/api/admin/users/${id}`, data);
export const deleteUser = async (id: string) => await api.delete(`/api/admin/users/${id}`);
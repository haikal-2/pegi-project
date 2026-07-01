import api from './api';

export const getTransports = async () => await api.get('/api/admin/transports');
export const createTransport = async (data: any) => await api.post('/api/admin/transports', data);
export const updateTransport = async (id: string, data: any) => await api.put(`/api/admin/transports/${id}`, data);
export const deleteTransport = async (id: string) => await api.delete(`/api/admin/transports/${id}`);
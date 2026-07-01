import api from './api';

export const getMonitoringStats = async () => await api.get('/api/admin/monitoring/stats');
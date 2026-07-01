import api from './api';

export const getMonitoringStats = async (startDate?: string, endDate?: string) => {
  let url = '/api/admin/monitoring/stats';
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  return await api.get(url);
};

// --- Dashboard Utama ---
export const getDashboardStats = async () => await api.get('/api/admin/dashboard');

// --- Manajemen Hotel ---
export const getAllHotels = async () => await api.get('/api/admin/hotels');
export const createHotel = async (data: any) => await api.post('/api/admin/hotels', data);
export const updateHotel = async (id: string, data: any) => await api.put(`/api/admin/hotels/${id}`, data);
export const deleteHotel = async (id: string) => await api.delete(`/api/admin/hotels/${id}`);
export const uploadImage = async (formData: FormData) => {
  return await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// --- Manajemen Destinasi ---
interface BackendDestination {
  id: number;
  name: string;
  location: string;
  region?: string;
  category: string;
  img: string;
  rating: number;
  price: string;
  priceValue?: number;
  crowdLevel: "SEPI" | "SEDANG" | "RAMAI";
  description?: string;
  bestTime?: string;
  duration?: string;
  mapImage?: string;
  gallery?: string[];
}

const crowdLevelToLabel = (level: string): "Sepi" | "Sedang" | "Ramai" => {
  if (level === "SEPI") return "Sepi";
  if (level === "RAMAI") return "Ramai";
  return "Sedang";
};

const crowdLabelToLevel = (label: string): "SEPI" | "SEDANG" | "RAMAI" => {
  if (label === "Sepi") return "SEPI";
  if (label === "Ramai") return "RAMAI";
  return "SEDANG";
};

const mapDestinationFromBackend = (d: BackendDestination) => ({
  id: d.id.toString(),
  name: d.name,
  location: d.location,
  category: d.category,
  price: d.price,
  rating: d.rating,
  img: d.img,
  crowd: crowdLevelToLabel(d.crowdLevel),
});

const mapDestinationToBackend = (data: any) => ({
  ...data,
  crowdLevel: data.crowd ? crowdLabelToLevel(data.crowd) : undefined,
});

export const getAllDestinations = async () => {
  const response = await api.get('/api/admin/destinations');
  return { ...response, data: response.data.map(mapDestinationFromBackend) };
};

export const createDestination = async (data: any) =>
  await api.post('/api/admin/destinations', mapDestinationToBackend(data));

export const updateDestination = async (id: string, data: any) =>
  await api.put(`/api/admin/destinations/${id}`, mapDestinationToBackend(data));

export const deleteDestination = async (id: string) =>
  await api.delete(`/api/admin/destinations/${id}`);

// --- Grup Wisata ---
export const getAllGroups = async () => await api.get('/api/admin/groups');
export const createGroup = async (data: any) => await api.post('/api/admin/groups', data);
export const updateGroup = async (id: string, data: any) => await api.put(`/api/admin/groups/${id}`, data);
export const deleteGroup = async (id: string) => await api.delete(`/api/admin/groups/${id}`);

// --- Manajemen Promo ---
export const getAllPromos = async () => await api.get('/api/admin/promos');
export const createPromo = async (data: any) => await api.post('/api/admin/promos', data);
export const updatePromo = async (id: string, data: any) => await api.put(`/api/admin/promos/${id}`, data);
export const deletePromo = async (id: string) => await api.delete(`/api/admin/promos/${id}`);

// --- Manajemen Transportasi ---
const toBackendTransport = (data: any) => ({
  company: data.name,
  classType: data.detail,
  type: data.type,
  route: data.route,
  price: data.price,
  priceValue: parseInt(String(data.price).replace(/[^0-9]/g, "")) || 0,
  capacity: parseInt(String(data.capacity).replace(/[^0-9]/g, "")) || 0,
  remainingSeats: parseInt(String(data.capacity).replace(/[^0-9]/g, "")) || 0,
  image: data.img,
  region: data.status, // sementara nampung status, idealnya tambah kolom "status" di entity
});

const fromBackendTransport = (item: any) => ({
  id: String(item.id),
  name: item.company ?? "",
  detail: item.classType ?? "",
  type: item.type ?? "BUS",
  route: item.route ?? "",
  price: item.price ?? "",
  capacity: item.capacity ? `${item.capacity} Kursi` : "-",
  status: item.region || "Aktif",
  img: item.image ?? "",
});

export const getAllTransports = async () => {
  const response = await api.get('/api/admin/transports');
  return { ...response, data: response.data.map(fromBackendTransport) };
};

export const createTransport = async (data: any) => {
  const response = await api.post('/api/admin/transports', toBackendTransport(data));
  return { ...response, data: fromBackendTransport(response.data) };
};

export const updateTransport = async (id: string, data: any) => {
  const response = await api.put(`/api/admin/transports/${id}`, toBackendTransport(data));
  return { ...response, data: fromBackendTransport(response.data) };
};

export const deleteTransport = async (id: string) => await api.delete(`/api/admin/transports/${id}`);

// Pengguna
export const getAllUsers = async () => await api.get('/api/admin/users');
export const createUser = async (data: any) => await api.post('/api/admin/users', data);
export const updateUser = async (id: string, data: any) => await api.put(`/api/admin/users/${id}`, data);
export const deleteUser = async (id: string) => await api.delete(`/api/admin/users/${id}`);

// --- Verifikasi Pembayaran ---
export const getAllPayments = async () => await api.get('/api/admin/payments');
export const updatePaymentStatus = async (id: string, data: { status: string }) => await api.put(`/api/admin/payments/${id}`, data);

export const getRecentActivities = async () => await api.get('/api/admin/activities');
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/profile';

// =====================================================
// UTILS: Token handling yang defensive & informatif
// =====================================================

/**
 * Cek apakah JWT sudah expired dengan decode payload-nya langsung.
 * Tidak perlu library — cukup atob() saja.
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false; // Kalau tidak ada exp, anggap masih valid
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true; // Kalau gagal decode, anggap expired/rusak
  }
};

/**
 * Jaga-jaga kalau token disimpan dengan prefix "Bearer " yang sudah ada.
 * Contoh: backend simpan "Bearer eyJhbG..." → kita strip jadi "eyJhbG..."
 */
const stripBearer = (token: string): string =>
  token.startsWith('Bearer ') ? token.slice(7) : token;

/**
 * Cari token dari semua kemungkinan key yang biasa dipakai.
 * Ini solusi untuk kasus key-nya berbeda antara tim frontend & backend.
 */
const POSSIBLE_TOKEN_KEYS = ['token', 'authToken', 'accessToken', 'jwt', 'auth_token', 'bearerToken'];

const findToken = (): string | null => {
  for (const key of POSSIBLE_TOKEN_KEYS) {
    const val = localStorage.getItem(key);
    if (val) {
      console.log(`✅ Token ditemukan di localStorage key: "${key}"`);
      return stripBearer(val);
    }
  }

  // Fallback: scan SEMUA key di localStorage dan cari yang isinya JWT
  console.warn('⚠️ Token tidak ditemukan di key standar. Scanning semua localStorage...');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    const val = localStorage.getItem(key)!;
    // JWT selalu punya format: xxx.yyy.zzz (tiga bagian dipisah titik)
    if (val && val.split('.').length === 3) {
      console.log(`🔍 Kemungkinan JWT ditemukan di key: "${key}" — coba pakai ini.`);
      return stripBearer(val);
    }
  }

  return null;
};

/**
 * Ambil token + validasi, lempar error yang jelas jika ada masalah.
 */
const getValidToken = (): string => {
  const token = findToken();

  if (!token) {
    console.error('❌ Tidak ada token di localStorage sama sekali.');
    console.info('💡 Pastikan proses login menyimpan token dengan: localStorage.setItem("token", responseToken)');
    throw new Error('Sesi tidak ditemukan. Silakan login ulang.');
  }

  if (isTokenExpired(token)) {
    console.error('❌ Token ditemukan TAPI sudah expired!');
    console.info('💡 Redirect ke halaman login atau panggil endpoint refresh token.');
    // Bersihkan token lama agar tidak menumpuk
    POSSIBLE_TOKEN_KEYS.forEach(key => localStorage.removeItem(key));
    throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
  }

  return token;
};

// =====================================================
// Axios instance dengan interceptor untuk debugging
// =====================================================

const apiClient = axios.create({ baseURL: 'http://localhost:8080' });

// Log setiap request yang keluar — sangat membantu debug header
apiClient.interceptors.request.use((config) => {
  console.group('📤 Axios Request');
  console.log('URL   :', config.baseURL + config.url);
  console.log('Method:', config.method?.toUpperCase());
  console.log('Header:', config.headers);
  console.groupEnd();
  return config;
});

// Log setiap response/error yang masuk
apiClient.interceptors.response.use(
  (res) => {
    console.log('📥 Response OK:', res.status, res.config.url);
    return res;
  },
  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url;
    
    console.group(`❌ Response Error ${status} — ${url}`);
    if (status === 401) console.error('401 Unauthorized: Token tidak dikenali backend.');
    if (status === 403) {
      console.error('403 Forbidden: Token ada tapi tidak punya akses.');
      console.error('Kemungkinan penyebab:');
      console.error('  1. Role/authority user tidak cocok dengan endpoint ini di Spring Security');
      console.error('  2. Token expired (cek payload.exp)');
      console.error('  3. Backend minta token tapi CORS preflight gagal dulu');
      console.error('Payload header yang dikirim:', error.config?.headers);
    }
    console.groupEnd();
    return Promise.reject(error);
  }
);

// =====================================================
// Service functions
// =====================================================

/**
 * Mengambil data profil dari backend
 */
export const getProfile = async () => {
  const token = getValidToken();

  const response = await apiClient.get('/api/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

/**
 * Menyimpan atau memperbarui data profil ke database
 */
export const updateProfile = async (profileData: Record<string, unknown>) => {
  const token = getValidToken();

  const response = await apiClient.put('/api/profile', profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};
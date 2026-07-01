export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PELANGGAN' | 'TRAVEL AGENT' | 'ADMIN';
  status: 'Aktif' | 'Nonaktif';
  date: string; // Tanggal Registrasi
  avatarUrl?: string;
  initials?: string;
}
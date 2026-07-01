// src/types/BookingType.ts

export interface BookingItem {
  id: string;
  category: 'Hotel' | 'Transportasi' | 'Tiket Wisata';
  title: string;
  bookingId: string;
  date: string;
  status: 'Selesai' | 'Mendatang' | 'Dibatalkan';
  extraText: string;  // Contoh: "4.9 (2.1k ulasan)" atau "Gerbong 1, Kursi 2A"
  totalPrice: string;
  buttonText: string; // Contoh: "Lihat Detail" atau "E-Tiket"
  imageUrl: string;
}
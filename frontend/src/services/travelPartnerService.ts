import axios from 'axios';
import type { TravelPartnerType } from "../types/TravelPartnerType";

// Sesuaikan URL ini dengan Mapping di Controller Java lu nanti
const BASE_URL = 'http://localhost:8080/api/travel-partners';

/**
 * Mengambil semua daftar teman perjalanan dari database
 */
export const getTravelPartners = async (): Promise<TravelPartnerType[]> => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data Travel Partners dari server:", error);
    throw error;
  }
};
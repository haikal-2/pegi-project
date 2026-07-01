import axios from 'axios';
import type { TransportType } from '../types/TransportType';

// Sesuaikan URL ini dengan mapping di Java Controller lu
const BASE_URL = 'http://localhost:8080/api/transports';

/**
 * Mengambil semua daftar transportasi dari database
 */
export const getTransports = async (): Promise<TransportType[]> => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar transportasi dari server:", error);
    throw error;
  }
};

/**
 * Mengambil satu transportasi spesifik berdasarkan ID
 */
export const getTransportById = async (id: number): Promise<TransportType | undefined> => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil data transportasi dengan ID ${id}:`, error);
    throw error;
  }
};
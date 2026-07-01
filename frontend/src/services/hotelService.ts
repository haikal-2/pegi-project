import axios from "axios";
import type { HotelType } from "../types/HotelType";

const BASE_URL = "http://localhost:8080/api/hotels";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

interface BackendHotel {
  id: number;
  name: string;
  category: string;
  location: string;
  rating: number;
  totalRooms: number;
  restoCount?: number;
  img: string;
  facilities?: string[];
  description?: string;
  gallery?: string[];
  roomTypes?: {
    id: number;
    name: string;
    image: string;
    bed: string;
    price: number;
  }[];
}

const mapToHotelType = (h: BackendHotel): HotelType => ({
  id: h.id,
  name: h.name,
  category: h.category,
  location: h.location,
  rating: h.rating,
  totalRooms: h.totalRooms,
  restoCount: h.restoCount,
  img: h.img,
  amenities: h.facilities ?? [],
  description: h.description,
  gallery: h.gallery ?? [],
  rooms: h.roomTypes ?? [],
});

export const getHotels = async (): Promise<HotelType[]> => {
  try {
    const response = await axios.get<BackendHotel[]>(BASE_URL, getAuthHeaders());
    return response.data.map(mapToHotelType);
  } catch (error) {
    console.error("Gagal mengambil daftar hotel dari server:", error);
    throw error;
  }
};

export const getHotelById = async (id: number): Promise<HotelType | undefined> => {
  try {
    const response = await axios.get<BackendHotel>(`${BASE_URL}/${id}`, getAuthHeaders());
    return mapToHotelType(response.data);
  } catch (error) {
    console.error(`Gagal mengambil data hotel dengan ID ${id}:`, error);
    throw error;
  }
};
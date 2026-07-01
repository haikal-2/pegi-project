import axios from "axios";
import type { DestinationType } from "../types/DestinationType";

const BASE_URL = "http://localhost:8080/api/destinations";

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
  reviews?: { id: number; name: string; comment: string; rating: number }[];
}

const mapToDestinationType = (d: BackendDestination): DestinationType => ({
  id: d.id,
  name: d.name,
  location: d.location,
  category: d.category,
  region: d.region ?? d.location,
  image: d.img,
  price: d.price,
  priceValue: d.priceValue ?? parseFloat(String(d.price).replace(/[^0-9]/g, "")) ?? 0,
  rating: d.rating,
  crowd: d.crowdLevel === "SEPI" ? "Sepi" : "Ramai", // SEDANG ditampilkan sebagai Ramai di sisi user
  description: d.description,
  bestTime: d.bestTime,
  duration: d.duration,
  mapImage: d.mapImage,
  gallery: d.gallery,
  reviews: d.reviews,
});

export const getDestinations = async (): Promise<DestinationType[]> => {
  try {
    const response = await axios.get<BackendDestination[]>(BASE_URL);
    return response.data.map(mapToDestinationType);
  } catch (error) {
    console.error("Gagal mengambil daftar destinasi dari server:", error);
    throw error;
  }
};

export const getDestinationById = async (id: number): Promise<DestinationType | undefined> => {
  try {
    const response = await axios.get<BackendDestination>(`${BASE_URL}/${id}`);
    return mapToDestinationType(response.data);
  } catch (error) {
    console.error(`Gagal mengambil data destinasi dengan ID ${id}:`, error);
    throw error;
  }
};
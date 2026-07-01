import axios from "axios";

const BASE_URL = "http://localhost:8080/api/promos";

export interface PromoValidationResult {
  valid: boolean;
  message?: string;
  promo?: {
    id: number;
    title: string;
    code: string;
    discountPercent: number;
  };
  discountAmount?: number;
  finalPrice?: number;
}

export const validatePromo = async (
  code: string,
  category: "Hotel" | "Tiket Pesawat",
  originalPrice: number
): Promise<PromoValidationResult> => {
  try {
    const response = await axios.post(`${BASE_URL}/validate`, {
      code,
      category,
      originalPrice,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return { valid: false, message: "Gagal menghubungi server." };
  }
};
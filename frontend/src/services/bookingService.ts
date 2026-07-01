// Contoh di bookingService.ts lu
import api from "./api";

export const getBookings = async () => {
  const token = localStorage.getItem("token");
  return await api.get("http://localhost:8080/api/bookings", {
    headers: { Authorization: `Bearer ${token}` } // 💡 INI WAJIB ADA
  });
};
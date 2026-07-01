export interface RoomType {
  id: number;
  name: string;
  image: string;
  bed: string;
  price: number;
}

export interface HotelType {
  id: number;
  name: string;
  category: string;
  location: string;
  rating: number;
  totalRooms: number;
  restoCount?: number;
  img: string;
  amenities: string[]; // alias backend "facilities" -> dipetakan di service kalau perlu, lihat catatan di bawah
  description?: string;
  gallery?: string[];
  rooms?: RoomType[]; // alias backend "roomTypes"
}
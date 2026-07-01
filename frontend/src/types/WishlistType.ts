// src/types/WishlistType.ts

export interface WishlistType {
  id: string;
  itemId: number | string;
  itemType: string;   // "destination", "hotel", dll
  itemName: string;
  // Field tambahan untuk display (opsional, mungkin kosong tergantung backend)
  itemImage?: string;
  itemLocation?: string;
  createdAt?: string;
}
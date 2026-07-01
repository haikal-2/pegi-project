import api from './api';
import type { WishlistType } from '../types/WishlistType'; 

export const getWishlist = async () => {
  return await api.get('/api/wishlist');
};

export const addWishlist = async (data: Omit<WishlistType, 'id'>) => {
  return await api.post('/api/wishlist', data);
};

export const removeWishlist = async (id: string) => {
  return await api.delete(`/api/wishlist/${id}`);
};
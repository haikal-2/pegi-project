export interface DestinationReview {
  id: number;
  name: string;
  comment: string;
  rating: number;
}

export interface DestinationType {
  id: number;

  name: string;
  location: string;

  category: string;
  region: string;

  image: string;

  price: string;
  priceValue: number;

  rating: number;

  crowd: 'Sepi' | 'Ramai';

  description?: string;

  bestTime?: string;

  duration?: string;

  mapImage?: string;

  gallery?: string[];

  reviews?: DestinationReview[];
}
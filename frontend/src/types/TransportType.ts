export interface TransportFacility {
  id: number;
  name: string;
}

export interface TransportReview {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

export interface TransportType {
  id: number;

  company: string;

  type:
    | 'Bus'
    | 'Kereta'
    | 'Travel'
    | 'Shuttle';

  classType: string;

  route: string;

  departureCity: string;
  arrivalCity: string;

  departurePoint: string;
  arrivalPoint: string;

  departureTime: string;
  arrivalTime: string;

  duration: string;

  image: string;

  price: string;
  priceValue: number;

  rating: number;

  remainingSeats?: number;

  region: string;

  facilities?: TransportFacility[];

  description?: string;

  gallery?: string[];

  reviews?: TransportReview[];
}
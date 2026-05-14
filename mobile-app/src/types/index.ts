export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Stadium {
  id: string;
  name: string;
  locations: string[]; // Changed from location to locations array
  description?: string;
  imageUrl?: string;
  amenities?: string[]; // Stadium amenities/features
  isApproved: boolean;
  owner: { id: string; name: string };
  averageRating?: number;
  totalReviews?: number;
}

export interface Slot {
  id: string;
  stadiumId: string;
  location: string;
  startTime: string;
  endTime: string;
  price: number;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  slot: Slot;
  stadium: { id: string; name: string };
  payment?: {
    id: string;
    status: 'PENDING' | 'PAID' | 'FAILED';
    amount: number;
  };
}

export interface Review {
  id: string;
  stadiumId: string;
  playerId: string;
  rating: number;
  comment?: string;
  ownerReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
  player?: { id: string; name: string };
  stadium?: { id: string; name: string; location: string };
}

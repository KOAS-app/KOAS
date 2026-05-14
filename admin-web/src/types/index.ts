export type { User, Stadium, Slot, Booking, Review };

interface User {
  id: string;
  name: string;
  email: string;
  role: 'PLAYER' | 'OWNER' | 'ADMIN';
  createdAt: string;
}

interface Stadium {
  id: string;
  name: string;
  locations: string[]; // Changed from location to locations array
  description?: string;
  imageUrl?: string;
  amenities?: string[]; // Stadium amenities/features
  isApproved: boolean;
  createdAt: string;
  owner: { id: string; name: string; email: string };
}

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  isBooked: boolean;
}

interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  slot: Slot;
  player: { id: string; name: string; email: string };
  stadium: { id: string; name: string };
}

interface Review {
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

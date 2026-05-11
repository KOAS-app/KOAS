export interface Stadium {
  id: string;
  name: string;
  location: string;
  description?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Slot {
  id: string;
  stadiumId: string;
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
  player: {
    id: string;
    name: string;
    email: string;
  };
}

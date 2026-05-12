export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Stadium {
  id: string;
  name: string;
  location: string;
  description?: string;
  isApproved: boolean;
  owner: { id: string; name: string };
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
  stadium: { id: string; name: string };
  payment?: {
    id: string;
    status: 'PENDING' | 'PAID' | 'FAILED';
    amount: number;
  };
}

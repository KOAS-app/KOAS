export type { User, Stadium, Slot, Booking };

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
  location: string;
  description?: string;
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

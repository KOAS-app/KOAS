export type { User, Stadium, Location, Slot, Booking, Payment, Review };

interface User {
  id: string;
  name: string;
  email: string;
  role: 'PLAYER' | 'OWNER' | 'ADMIN';
  phoneNumber?: string;
  isApproved?: boolean;
  rejectionReason?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  subscriptionPlan?: string;
  createdAt: string;
}

interface Location {
  id: string;
  stadiumId: string;
  name: string;
  address?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface Stadium {
  id: string;
  name: string;
  description?: string;
  amenities?: string[];
  locations: Location[];
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  createdAt: string;
  isBlocked?: boolean;
  blockedReason?: string;
  owner: { id: string; name: string; email: string; phoneNumber?: string; subscriptionPlan?: string };
}

interface Slot {
  id: string;
  location: string;
  startTime: string;
  endTime: string;
  price: number;
  isBooked: boolean;
}

interface Payment {
  id: string;
  amount: number;
  status: 'PENDING' | 'RECEIPT_SUBMITTED' | 'PAID' | 'REJECTED';
  receiptImageUrl?: string;
  playerSubmittedAt?: string;
  ownerConfirmedAt?: string;
  ownerRejectedAt?: string;
  ownerRejectionReason?: string;
  createdAt: string;
}

interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  slot: Slot;
  player: { id: string; name: string; email: string; phoneNumber?: string };
  stadium: { id: string; name: string };
  payment?: Payment;
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

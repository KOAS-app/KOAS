export type { User, Stadium, Slot, Booking, Payment, Dispute, Review };

interface User {
  id: string;
  name: string;
  email: string;
  role: 'PLAYER' | 'OWNER' | 'ADMIN';
  phoneNumber?: string;
  createdAt: string;
}

interface Stadium {
  id: string;
  name: string;
  locations: string[];
  description?: string;
  imageUrl?: string;
  amenities?: string[];
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  isApproved: boolean;
  createdAt: string;
  owner: { id: string; name: string; email: string; phoneNumber?: string };
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
  status: 'PENDING' | 'RECEIPT_SUBMITTED' | 'PAID' | 'REJECTED' | 'DISPUTED';
  receiptImageUrl?: string;
  playerSubmittedAt?: string;
  ownerConfirmedAt?: string;
  ownerRejectedAt?: string;
  ownerRejectionReason?: string;
  isDisputed: boolean;
  disputeReason?: string;
  disputedAt?: string;
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

// A dispute is a Payment with its full booking context
interface Dispute {
  id: string; // payment id
  amount: number;
  status: 'DISPUTED';
  receiptImageUrl?: string;
  playerSubmittedAt?: string;
  ownerRejectedAt?: string;
  ownerRejectionReason?: string;
  disputeReason?: string;
  disputedAt?: string;
  booking: {
    id: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    slot: Slot;
    player: { id: string; name: string; email: string; phoneNumber?: string };
    stadium: {
      id: string;
      name: string;
      owner: { id: string; name: string; email: string };
    };
  };
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

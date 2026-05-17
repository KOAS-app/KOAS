export interface Stadium {
  id: string;
  name: string;
  locations: string[]; // Changed from location to locations array
  description?: string;
  imageUrl?: string;
  amenities?: string[]; // Stadium amenities/features
  bankName?: string; // Bank name for payments
  accountNumber?: string; // Bank account number
  accountHolderName?: string; // Account holder name
  isApproved: boolean;
  createdAt: string;
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
  player: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  payment?: {
    id: string;
    status: 'PENDING' | 'RECEIPT_SUBMITTED' | 'PAID' | 'REJECTED' | 'DISPUTED';
    amount: number;
    receiptImageUrl?: string;
    playerSubmittedAt?: string;
    ownerRejectionReason?: string;
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

export interface BookingInsight {
  date: string;
  label: string;
  count: number;
}

export interface Activity {
  id: string;
  type: 'BOOKING_CREATED' | 'PAYMENT_RECEIVED';
  playerName: string;
  location: string;
  bookingTime: string;
  timestamp: string;
  status?: string;
  amount?: number;
}

export interface OwnerStats {
  pending: number;
  confirmed: number;
  cancelled: number;
  paid: number;
  revenue: number;
}

export interface Location {
  id: string;
  stadiumId: string;
  name: string;
  address?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Stadium {
  id: string;
  name: string;
  description?: string;
  amenities?: string[];
  locations: Location[];
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  isApproved: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
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
  bookingCode?: string;
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
    status: 'PENDING' | 'RECEIPT_SUBMITTED' | 'PAID' | 'REJECTED';
    amount: number;
    method?: 'CASH' | 'SUBSCRIPTION';
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

export interface SubscriptionPlan {
  id: string;
  stadiumId: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  isActive: boolean;
  location?: string;
  openingTime: string;
  closingTime: string;
  openingDay: string;
  closingDay: string;
  weeklyAllowedDays: number;
  hoursPerDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerSubscription {
  id: string;
  playerId: string;
  subscriptionPlanId: string;
  status: 'PENDING' | 'RECEIPT_SUBMITTED' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';
  subscriptionCode: string;
  pricePaid: number;
  receiptImageUrl?: string;
  playerSubmittedAt?: string;
  selectedSlotIds: string[];
  ownerConfirmedAt?: string;
  ownerRejectedAt?: string;
  ownerRejectionReason?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  player: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  subscriptionPlan: SubscriptionPlan;
}

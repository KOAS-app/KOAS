export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
}

export interface BankAccount {
  id: string;
  stadiumId: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  bankAccounts?: BankAccount[]; // Related bank accounts
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
  stadium: {
    id: string;
    name: string;
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
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

export interface SubscriptionPlan {
  id: string;
  stadiumId: string;
  name: string;
  price: number;
  duration: number; // in days
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'RECEIPT_SUBMITTED' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';

export interface PlayerSubscription {
  id: string;
  playerId: string;
  subscriptionPlanId: string;
  subscriptionCode: string;
  pricePaid: number;
  receiptImageUrl: string;
  status: SubscriptionStatus;
  playerSubmittedAt: string;
  ownerConfirmedAt?: string;
  ownerRejectedAt?: string;
  ownerRejectionReason?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  subscriptionPlan: SubscriptionPlan & {
    stadium: Stadium;
  };
}

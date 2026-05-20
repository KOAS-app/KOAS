export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  StadiumDetail: { stadiumId: string; stadiumName: string };
  Booking: { stadiumId: string; stadiumName: string };
  Bookings: undefined;
  SubscriptionCheckout: { planId: string; planName: string; price: number; stadiumId: string; stadiumName: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Home: undefined;
  Bookings: undefined;
  MyMemberships: undefined;
  Profile: undefined;
};

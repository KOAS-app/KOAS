export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  StadiumDetail: { stadiumId: string; stadiumName: string };
  Bookings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Home: undefined;
  Bookings: undefined;
  Profile: undefined;
};

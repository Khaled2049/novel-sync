export interface Donation {
  donator: string;
  donation: string;
}

export interface Form {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
}

export interface Campaign {
  owner: string;
  title: string;
  description: string;
  target: string;
  deadline: number;
  amountCollected: string;
  image: string;
  pId: number;
}

export interface DonateParams {
  pId: number;
  amount: string;
}

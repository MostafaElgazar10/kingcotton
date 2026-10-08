export interface UserDetails {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  fax: string;
  propic: string;
  zip_code: string;
  city: string;
  country: string;
  address: string;
  balance: number;
  reword: number;
  email_verified: string;
  affilate_code: string | null;
  affilate_income: number;
  shipping_addresses: any[];
  is_social: boolean;
  ban: number;
  state: string;
}

export interface UserDetailsResponse {
  status: boolean;
  data: UserDetails;
  error: any[];
}
export interface ShippingOption {
  id: number;
  user_id: number;
  title: string;
  subtitle: string;
  price: number;
}

export interface PackagingOption {
  id: number;
  user_id: number;
  title: string;
  subtitle: string;
  price: number;
}

export interface ShippingPackagingData {
  shipping: ShippingOption[];
  packaging: PackagingOption[];
}

export interface ShippingPackagingResponse {
  status: boolean;
  data: ShippingPackagingData;
  error: any[];
}
// بيانات العنوان المستخدمة داخل خطوات الـ Checkout
export interface CheckoutOrderPayload {
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postal_code: string;
  coupon_code: string | null;
}

// بيانات كل منتج المرسلة للـ API
export interface CheckoutItemPayload {
  id: number;
  qty: number;
  size: string;
  size_qty: number;
  size_key: number;
  size_price: number;
  color: string;
  keys: string;
  values: string;
  prices: string;
}

// الـ Request الفعلي للـ API
export interface CheckoutApiPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_country: string;
  customer_zip: string;
  customer_state: string;

  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_zip: string;
  shipping_state: string;

  wallet_price: number;
  currency_code: string;
  affilate_user: number;
  tax: number;
  tax_type: string;
  shipping_id: number;
  packaging_id: number;
  method: string;
  items: string;
  coupon_code?: string | null;
}

export interface CheckoutOrderData {
  url?: string;
  order_id?: number;
  order_number?: string;
  total?: string | number;
  [key: string]: any;
}

export interface CheckoutOrderResponse {
  status: boolean;
  data: CheckoutOrderData | null;
  error: any;
}
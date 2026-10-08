export interface Order {
  id: number;
  number: string;
  total: string;
  status: string;
  payment_status: string;
  method?: string;
  payment_url?: string;
}

export interface OrdersResponse {
  status: boolean;
  data: Order[];
  error: any[];
}
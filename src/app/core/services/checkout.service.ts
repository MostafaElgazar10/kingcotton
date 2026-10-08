
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  CheckoutApiPayload,
  CheckoutOrderResponse
} from '../models/checkout.model';


// ========================================
// COUPON RESPONSE
// ========================================

export interface CouponResponse {
  status: boolean;

  data: {
    id: number;
    code: string;
    type: number;
    price: number;
    times: string;
    used: number;
    status: number;

    start_date: string;
    end_date: string;

    coupon_type: string;

    category: number | null;
    sub_category: number | null;
    child_category: number | null;
  };

  error: any[];
}


// ========================================
// ORDER DETAILS RESPONSE
// ========================================

export interface OrderProductItem {
  user_id: number;
  qty: number;

  size_key: number;
  size_qty: number;
  size_price: number;

  size: string;
  color: string;
  color_price: number;

  stock: any;

  price: number;

  item: {
    id: number;
    user_id: number;
    slug: string;
    name: string;
    photo: string;

    size: string[];
    size_qty: string[];
    size_price: string[];

    color: string;

    price: number;
    stock: any;

    type: string;

    file: any;
    link: any;

    license: string;
    license_qty: string;

    measure: any;

    whole_sell_qty: string[];
    whole_sell_discount: string[];

    attributes: any;
  };

  license: string;
  dp: string;
  keys: string;
  values: string;

  item_price: number;
  discount: number;

  affilate_user: number;
}


export interface OrderedProduct {
  item: OrderProductItem;
}


export interface OrderDetailsData {

  id: number;

  number: string;

  total: string;

  status: string;

  payment_status: string;

  method: string;

  payment_url: string;

  // ==============================
  // SHIPPING
  // ==============================

  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_zip: string;
  shipping_city: string;
  shipping_country: string;

  // ==============================
  // CUSTOMER
  // ==============================

  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_zip: string;
  customer_city: string;
  customer_country: string;

  // ==============================
  // PAYMENT / COSTS
  // ==============================

  shipping: any;

  paid_amount: string;

  payment_method: string;

  shipping_cost: number;

  packing_cost: number;

  charge_id: string | null;

  transaction_id: string | null;

  coupon_discount: number | string | null;

  // ==============================
  // PRODUCTS
  // ==============================

  ordered_products: {
    [key: string]: OrderedProduct;
  };

  // ==============================
  // DATES
  // ==============================

  created_at: string;

  updated_at: string;
}


export interface OrderDetailsResponse {
  status: boolean;

  data: OrderDetailsData;

  error: any[];
}


// ========================================
// CHECKOUT SERVICE
// ========================================

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private baseUrl =
    'https://trainstore.topbusiness.io/api';


  constructor(
    private http: HttpClient
  ) {}


  // ========================================
  // CREATE CHECKOUT ORDER
  // ========================================

  createCheckoutOrder(
    payload: CheckoutApiPayload
  ): Observable<CheckoutOrderResponse> {

    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('token') || ''
        : '';

    const headers =
      new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
        Authorization: `Bearer ${token}`
      });

    return this.http.post<CheckoutOrderResponse>(
      `${this.baseUrl}/front/checkout`,
      payload,
      {
        headers
      }
    );
  }


  // ========================================
  // GET COUPON
  // ========================================

  getCoupon(
    couponCode: string
  ): Observable<CouponResponse> {

    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('token') || ''
        : '';

    const headers =
      new HttpHeaders({
        'Accept': 'application/json',
        'Accept-Language': 'en',
        Authorization: `Bearer ${token}`
      });

    return this.http.get<CouponResponse>(
      `${this.baseUrl}/front/get/coupon-code`,
      {
        headers,

        params: {
          coupon: couponCode
        }
      }
    );
  }


  // ========================================
  // GET ORDER DETAILS
  // ========================================

  getOrderDetails(
    orderId: number
  ): Observable<OrderDetailsResponse> {

    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('token') || ''
        : '';

    const headers =
      new HttpHeaders({
        'Accept': 'application/json',
        'Accept-Language': 'en',
        Authorization: `Bearer ${token}`
      });

    return this.http.get<OrderDetailsResponse>(
      `${this.baseUrl}/user/order/${orderId}/details`,
      {
        headers
      }
    );
  }

}

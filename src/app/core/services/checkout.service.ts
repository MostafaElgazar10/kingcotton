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
}
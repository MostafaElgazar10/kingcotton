import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CheckoutApiPayload,
  CheckoutOrderResponse
} from '../models/checkout.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private baseUrl = 'https://trainstore.topbusiness.io/api';

  constructor(private http: HttpClient) {}

  createCheckoutOrder(
    payload: CheckoutApiPayload
  ): Observable<CheckoutOrderResponse> {
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('token') || ''
        : '';

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept-Language': 'en',
      Authorization: `Bearer ${token}`
    });

    return this.http.post<CheckoutOrderResponse>(
      `${this.baseUrl}/front/checkout`,
      payload,
      { headers }
    );
  }
}
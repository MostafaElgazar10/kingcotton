import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Order,
  OrdersResponse
} from '../models/orders.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private baseUrl = 'https://trainstore.topbusiness.io/api';

  constructor(
    private http: HttpClient
  ) {}

  getOrders(): Observable<OrdersResponse> {

    return this.http.get<OrdersResponse>(
      `${this.baseUrl}/user/orders`
    );

  }

}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ShippingPackagingResponse
} from '../models/shipping-packaging.model';

@Injectable({
  providedIn: 'root'
})
export class ShippingPackagingService {

  private http = inject(HttpClient);

  private baseUrl = 'https://trainstore.topbusiness.io';

  getShippingPackaging(): Observable<ShippingPackagingResponse> {

    return this.http.get<ShippingPackagingResponse>(
      `${this.baseUrl}/front/get-shipping-packaging`
    );

  }

}
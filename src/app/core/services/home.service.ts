import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HomeResponse } from '../models/home.model';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private http = inject(HttpClient);

  private apiUrl = 'https://trainstore.topbusiness.io/api';

  // Home API
  getHome(): Observable<HomeResponse> {
    return this.http.get<HomeResponse>(
      `${this.apiUrl}/user/home`
    );
  }




}
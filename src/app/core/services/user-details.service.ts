import {
  Injectable,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  UserDetailsResponse
} from '../models/user-details.model';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService {

  private baseUrl = 'https://trainstore.topbusiness.io/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getUserDetails(): Observable<UserDetailsResponse> {

    let token = '';

    // localStorage is available only in the browser
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }

    return this.http.get<UserDetailsResponse>(
      `${this.baseUrl}/user/details`,
      {
        headers
      }
    );
  }
}
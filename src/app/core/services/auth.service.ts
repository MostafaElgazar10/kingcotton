
import {
  Injectable,
  PLATFORM_ID,
  inject
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

// =========================
// USER INTERFACE
// =========================

export interface User {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  propic: string;
  email_verified: string;
}

// =========================
// AUTH RESPONSE
// =========================

export interface LoginResponse {
  status: boolean;
  data: {
    token: string;
    user: User;
  };
  error: any;
}

// =========================
// REGISTER REQUEST
// =========================

// أسماء الحقول المقترحة لطلب التسجيل.
// تأكد من مطابقتها مع Request Body في Postman.
export interface RegisterRequest {
  fullname: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

// =========================
// AUTH SERVICE
// =========================

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly tokenKey = 'token';
  private readonly userKey = 'user';

  private readonly baseUrl =
    'https://trainstore.topbusiness.io/api';

  // =========================
  // USER OBSERVABLE
  // =========================

  private userSubject = new BehaviorSubject<User | null>(
    this.getUser()
  );

  user$ = this.userSubject.asObservable();

  // =========================
  // LOGIN
  // =========================

  login(
    email: string,
    password: string
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/user/login`,
      {
        input: email,
        password: password
      }
    );
  }

  // =========================
  // REGISTER
  // =========================

  register(
    data: RegisterRequest
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/user/registration`,
      data
    );
  }

  // =========================
  // SAVE SESSION
  // =========================

  saveSession(response: LoginResponse): void {
    if (!this.isBrowser) {
      return;
    }

    if (!response?.status || !response.data?.token) {
      return;
    }

    localStorage.setItem(
      this.tokenKey,
      response.data.token
    );

    localStorage.setItem(
      this.userKey,
      JSON.stringify(response.data.user)
    );

    // تحديث بيانات المستخدم في المكونات المشتركة
    this.userSubject.next(response.data.user);
  }

  // =========================
  // GET TOKEN
  // =========================

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    return localStorage.getItem(this.tokenKey);
  }

  // =========================
  // GET USER
  // =========================

  getUser(): User | null {
    if (!this.isBrowser) {
      return null;
    }

    const storedUser = localStorage.getItem(this.userKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch (error) {
      console.error('Invalid user data:', error);
      return null;
    }
  }

  // =========================
  // CHECK LOGIN
  // =========================

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // =========================
  // LOGOUT
  // =========================

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }

    // تحديث حالة تسجيل الخروج فورًا
    this.userSubject.next(null);
  }
}
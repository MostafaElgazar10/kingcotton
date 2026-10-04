
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  // =========================
  // LOGIN
  // =========================

  onLogin(): void {
    const email = this.email.trim();

    // منع الضغط المتكرر
    if (this.loading) {
      return;
    }

    // التحقق من البيانات
    if (!email || !this.password.trim()) {
      this.errorMessage = 'Please enter your email and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(email, this.password).subscribe({
      next: (response) => {
        console.log('LOGIN API RESPONSE:', response);

        // التأكد من نجاح تسجيل الدخول ووجود التوكن
        if (response?.status === true && response?.data?.token) {
          // حفظ بيانات المستخدم والتوكن
          this.authService.saveSession(response);

          console.log('Login successful');
          console.log('USER:', this.authService.getUser());

          // الرجوع للصفحة المطلوبة إن وُجدت
          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl');

          // السماح فقط بمسارات داخلية آمنة
          const safeReturnUrl =
            returnUrl &&
            returnUrl.startsWith('/') &&
            !returnUrl.startsWith('//') &&
            !returnUrl.startsWith('/login')
              ? returnUrl
              : '/home';

          this.loading = false;
          this.router.navigateByUrl(safeReturnUrl);
          return;
        }

        // معالجة أخطاء الـ API
        console.error(
          'Login response is unsuccessful:',
          JSON.stringify(response, null, 2)
        );

        this.errorMessage = this.getApiErrorMessage(response?.error);
        this.loading = false;
      },

      error: (error) => {
        this.loading = false;

        console.error('LOGIN HTTP ERROR:', error);
        console.error(
          'ERROR BODY:',
          JSON.stringify(error?.error, null, 2)
        );

        this.errorMessage = this.getHttpErrorMessage(error);
      },

      complete: () => {
        this.loading = false;
      }
    });
  }

  // =========================
  // API ERROR MESSAGE
  // =========================

  private getApiErrorMessage(apiError: any): string {
    if (!apiError) {
      return 'Login failed. Please check your credentials.';
    }

    if (typeof apiError === 'string') {
      return apiError;
    }

    if (Array.isArray(apiError)) {
      const messages = apiError
        .map(item => {
          if (typeof item === 'string') {
            return item;
          }

          return item?.message || item?.error || '';
        })
        .filter(Boolean);

      return messages.join(' - ') ||
        'Login failed. Please check your credentials.';
    }

    if (typeof apiError === 'object') {
      if (apiError.message) {
        return apiError.message;
      }

      const messages = Object.values(apiError)
        .flatMap(value => Array.isArray(value) ? value : [value])
        .filter((value): value is string => typeof value === 'string');

      return messages.join(' - ') ||
        'Login failed. Please check your credentials.';
    }

    return 'Login failed. Please check your email and password.';
  }

  // =========================
  // HTTP ERROR MESSAGE
  // =========================

  private getHttpErrorMessage(error: any): string {
    const errorBody = error?.error;

    if (typeof errorBody === 'string') {
      return errorBody;
    }

    if (errorBody?.message) {
      return errorBody.message;
    }

    if (errorBody?.error?.message) {
      return errorBody.error.message;
    }

    if (errorBody?.errors) {
      const messages = Object.values(errorBody.errors)
        .flatMap(value => Array.isArray(value) ? value : [value])
        .filter((value): value is string => typeof value === 'string');

      if (messages.length) {
        return messages.join(' - ');
      }
    }

    switch (error?.status) {
      case 0:
        return 'Unable to connect to the server. Please try again.';

      case 401:
        return 'Invalid email or password.';

      case 403:
        return 'Access denied. You are not authorized.';

      case 404:
        return 'Login API endpoint not found.';

      case 422:
        return 'Please check your email and password.';

      case 429:
        return 'Too many login attempts. Please try again later.';

      case 500:
        return 'Server error. Please try again later.';

      default:
        return `Login request failed (${error?.status || 'unknown error'}).`;
    }
  }
}
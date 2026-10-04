
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  AuthService,
  RegisterRequest
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  email = '';
  phone = '';
  address = '';
  password = '';
  confirmPassword = '';

  captchaChecked = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  showPassword = false;
  showConfirmPassword = false;

  onRegister(): void {
    if (this.loading) return;

    this.errorMessage = '';
    this.successMessage = '';

    // التحقق من الحقول المطلوبة
    const fields = [
      { name: 'Full Name', value: this.fullName },
      { name: 'Email', value: this.email },
      { name: 'Phone Number', value: this.phone },
      { name: 'Address', value: this.address },
      { name: 'Password', value: this.password },
      { name: 'Confirm Password', value: this.confirmPassword }
    ];

    const emptyFields = fields
      .filter(field => !field.value?.trim())
      .map(field => field.name);

    if (emptyFields.length > 0) {
      this.errorMessage =
        `Please fill in: ${emptyFields.join(', ')}`;
      return;
    }

    // التحقق من صحة البريد الإلكتروني
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(this.email.trim())) {
      this.errorMessage =
        'Please enter a valid email address.';
      return;
    }

    // التحقق من تطابق كلمة المرور
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // التحقق من طول كلمة المرور
    if (this.password.length < 8) {
      this.errorMessage =
        'Password must be at least 8 characters.';
      return;
    }

    // التحقق من checkbox
    if (!this.captchaChecked) {
      this.errorMessage =
        'Please confirm that you are not a robot.';
      return;
    }

    // البيانات المطلوبة من API
    const registerData: RegisterRequest = {
      fullname: this.fullName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      address: this.address.trim(),
      password: this.password
    };

    this.loading = true;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;

        if (response?.status && response.data?.token) {
          // حفظ بيانات المستخدم وتسجيل الدخول
          this.authService.saveSession(response);

          this.successMessage =
            'Registration successful!';

          this.router.navigate(['/home']);
        } else {
          this.errorMessage =
            this.getApiErrorMessage(response);
        }
      },

      error: (error) => {
        this.loading = false;
        this.errorMessage =
          this.getHttpErrorMessage(error);
      }
    });
  }

  // استخراج رسالة الخطأ من استجابة API
  private getApiErrorMessage(response: any): string {
    if (typeof response?.message === 'string') {
      return response.message;
    }

    if (typeof response?.error === 'string') {
      return response.error;
    }

    if (Array.isArray(response?.error)) {
      const messages = response.error
        .map((item: any) => {
          if (typeof item === 'string') {
            return item;
          }

          if (typeof item?.message === 'string') {
            return item.message;
          }

          return '';
        })
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join(' | ');
      }
    }

    if (
      response?.errors &&
      typeof response.errors === 'object'
    ) {
      return this.formatValidationErrors(
        response.errors
      );
    }

    return 'Registration failed. Please check your information.';
  }

  // استخراج رسالة الخطأ من HTTP
  private getHttpErrorMessage(error: any): string {
    console.error('Registration API Error:', error);

    const apiError = error?.error;

    if (typeof apiError === 'string') {
      return apiError;
    }

    if (typeof apiError?.message === 'string') {
      return apiError.message;
    }

    if (
      apiError?.errors &&
      typeof apiError.errors === 'object'
    ) {
      return this.formatValidationErrors(
        apiError.errors
      );
    }

    if (Array.isArray(apiError?.error)) {
      const messages = apiError.error
        .map((item: any) => {
          if (typeof item === 'string') {
            return item;
          }

          return item?.message ||
            JSON.stringify(item);
        })
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join(' | ');
      }
    }

    if (error?.status === 0) {
      return 'Unable to connect to the server. Please check your connection.';
    }

    if (error?.status) {
      return `Registration failed. HTTP ${error.status}`;
    }

    return 'Registration failed. Please try again.';
  }

  // تنسيق أخطاء التحقق من API
  private formatValidationErrors(errors: any): string {
    return Object.entries(errors)
      .map(([field, messages]: [string, any]) => {
        const text = Array.isArray(messages)
          ? messages.join(', ')
          : String(messages);

        return `${field}: ${text}`;
      })
      .join(' | ');
  }
}

import { inject } from '@angular/core';
import {
  HttpInterceptorFn
} from '@angular/common/http';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // التأكد إن الطلب تابع للـ API الخاص بالمشروع
  const apiBaseUrl = 'https://trainstore.topbusiness.io/api/';
  const isApiRequest = req.url.startsWith(apiBaseUrl);

  // استثناء طلبات تسجيل الدخول والتسجيل
  const publicEndpoints = [
    '/user/login',
    '/user/register'
  ];

  const isPublicRequest = publicEndpoints.some(endpoint =>
    req.url.includes(endpoint)
  );

  // لو الطلب مش للـ API أو عام أو مفيش توكن
  // ابعت الطلب من غير تعديل
  if (!isApiRequest || isPublicRequest || !token) {
    return next(req);
  }

  // إضافة بيانات المصادقة للطلبات المحمية
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  return next(authReq);
};
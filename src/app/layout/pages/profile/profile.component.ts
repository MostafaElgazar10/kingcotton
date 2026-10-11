
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  UserDetailsService
} from '../../../core/services/user-details.service';

import {
  OrdersService
} from '../../../core/services/orders.service';

import {
  AuthService
} from '../../../core/services/auth.service';

interface UserDetails {
  propic: string;
  full_name: string;
  email: string;
  phone: string;
  fax: string;
  email_verified: string;
  balance: number;
  reword: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

interface Order {
  id: number;
  number: string;
  total: string | number;
  status: string;
  payment_status: string;
  method: string;

  // بيانات اختيارية لو الـ API بيرجعها
  coupon_discount?: string | number;
  paid_amount?: string | number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  user: UserDetails | null = null;

  orders: Order[] = [];

  loading = true;
  ordersLoading = true;

  error = '';
  ordersError = '';

  private isBrowser: boolean;

  // بيانات الطلب المحفوظة من Checkout
  private savedOrderData: any = null;


  constructor(
    private userDetailsService: UserDetailsService,
    private ordersService: OrdersService,
    private router: Router,
    private authService: AuthService,

    @Inject(PLATFORM_ID)
    private platformId: Object
  ) {
    this.isBrowser =
      isPlatformBrowser(this.platformId);
  }


  // ==============================
  // INIT
  // ==============================

  ngOnInit(): void {

    if (!this.isBrowser) {
      return;
    }

    this.loadSavedOrderData();

    this.getUserDetails();

    this.getOrders();
  }


  // ==============================
  // LOAD SAVED ORDER DATA
  // ==============================

  private loadSavedOrderData(): void {

    this.savedOrderData = null;

    if (!this.isBrowser) {
      return;
    }

    const stored =
      sessionStorage.getItem('order_success_data');

    if (!stored) {
      return;
    }

    try {

      this.savedOrderData = JSON.parse(stored);

      console.log(
        'SAVED ORDER DATA FOR PROFILE:',
        this.savedOrderData
      );

    } catch (error) {

      console.error(
        'Unable to read saved order data:',
        error
      );

    }
  }


  // ==============================
  // GET USER PROFILE
  // ==============================

  getUserDetails(): void {

    this.loading = true;
    this.error = '';

    this.userDetailsService.getUserDetails().subscribe({

      next: (response: any) => {

        if (response?.status && response?.data) {

          this.user = response.data;

        } else {

          this.error =
            'Something went wrong while loading your profile.';
        }

        this.loading = false;
      },

      error: (err) => {

        console.error('Profile Error:', err);

        this.error =
          'Something went wrong while loading your profile.';

        this.loading = false;
      }

    });
  }


  // ==============================
  // GET USER ORDERS
  // ==============================

  getOrders(): void {

    this.ordersLoading = true;
    this.ordersError = '';

    this.ordersService.getOrders().subscribe({

      next: (response: any) => {

        if (
          response?.status &&
          Array.isArray(response?.data)
        ) {

          this.orders = response.data;

        } else {

          this.orders = [];
        }

        this.ordersLoading = false;

        console.log(
          'PROFILE ORDERS:',
          this.orders
        );
      },

      error: (err) => {

        console.error('Orders Error:', err);

        this.ordersError =
          'Something went wrong while loading your orders.';

        this.ordersLoading = false;
      }

    });
  }


  // ==============================
  // DISPLAY ORDER TOTAL
  // ==============================

  getDisplayOrderTotal(order: Order): number {

    // بيانات الخصم المحفوظة تخص آخر طلب فقط.
    // نستخدمها عندما يتطابق رقم الطلب.
    const saved = this.savedOrderData;

    if (saved) {

      const currentNumbers = [
        order.number,
        order.id
      ]
        .filter(value =>
          value !== null &&
          value !== undefined &&
          value !== ''
        )
        .map(value => String(value).trim());

      const savedNumbers = [
        saved.orderNumber,
        saved.orderId
      ]
        .filter(value =>
          value !== null &&
          value !== undefined &&
          value !== ''
        )
        .map(value => String(value).trim());

      const isSameOrder =
        currentNumbers.some(number =>
          savedNumbers.includes(number)
        );

      if (
        isSameOrder &&
        saved.total !== null &&
        saved.total !== undefined &&
        saved.total !== '' &&
        Number.isFinite(Number(saved.total))
      ) {

        return Math.max(
          0,
          Number(saved.total)
        );
      }
    }

    // الطلبات القديمة تعتمد على السعر القادم من API.
    // لا نخصم قيمة coupon_discount من total مرة أخرى،
    // لأن total قد يكون بالفعل بعد الخصم.
    return this.getPrice(order.total);
  }


  // ==============================
  // FORMAT PRICE
  // ==============================

  getPrice(value: any): number {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 0;
    }

    const price = Number(
      typeof value === 'string'
        ? value.replace(/[^0-9.-]+/g, '')
        : value
    );

    return Number.isFinite(price)
      ? price
      : 0;
  }


  // ==============================
  // VIEW ORDER DETAILS
  // ==============================

  viewOrder(orderId: number): void {

    this.router.navigate([
      '/orderdetails',
      orderId
    ]);
  }


  // ==============================
  // LOGOUT
  // ==============================

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);
  }


  // ==============================
  // ORDER STATUS CLASS
  // ==============================

  getStatusClass(status: string): string {

    switch (status?.toLowerCase()) {

      case 'completed':
        return 'status-completed';

      case 'pending':
        return 'status-pending';

      case 'processing':
        return 'status-processing';

      case 'cancelled':
      case 'canceled':
        return 'status-cancelled';

      case 'delivered':
        return 'status-delivered';

      default:
        return 'status-default';
    }
  }

}

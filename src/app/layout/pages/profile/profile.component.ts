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
  total: string;
  status: string;
  payment_status: string;
  method: string;
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

  constructor(
    private userDetailsService: UserDetailsService,
    private ordersService: OrdersService,
    private router: Router,
      private authService: AuthService,


    @Inject(PLATFORM_ID)
    private platformId: Object
  ) {}

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.getUserDetails();
    this.getOrders();
  }

  // ==============================
  // Get User Profile
  // ==============================

  getUserDetails(): void {

    this.loading = true;
    this.error = '';

    this.userDetailsService.getUserDetails().subscribe({

      next: (response: any) => {

        if (response?.status && response?.data) {

          this.user = response.data;

        } else {

          this.error = 'Something went wrong while loading your profile.';
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
  // Get User Orders
  // ==============================

  getOrders(): void {

    this.ordersLoading = true;
    this.ordersError = '';

    this.ordersService.getOrders().subscribe({

      next: (response: any) => {

        if (response?.status && response?.data) {

          this.orders = response.data;

        } else {

          this.orders = [];
        }

        this.ordersLoading = false;
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
  // View Order Details
  // ==============================

  viewOrder(orderId: number): void {

    this.router.navigate([
      '/orderdetails',
      orderId
    ]);
  }





logout(): void {

  this.authService.logout();

  this.router.navigate(['/login']);

}

  // ==============================
  // Order Status Class
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
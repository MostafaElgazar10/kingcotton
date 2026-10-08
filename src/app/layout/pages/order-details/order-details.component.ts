
import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import {
  ActivatedRoute
} from '@angular/router';

import {
  CheckoutService,
  OrderDetailsData
} from '../../../core/services/checkout.service';


@Component({
  selector: 'app-order-details',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit {

  order: OrderDetailsData | null = null;

  loading = false;
  errorMessage = '';

  private isBrowser: boolean;


  constructor(
    private route: ActivatedRoute,

    private checkoutService: CheckoutService,

    @Inject(PLATFORM_ID)
    private platformId: Object
  ) {

    this.isBrowser =
      isPlatformBrowser(this.platformId);

  }


  // ========================================
  // INIT
  // ========================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const orderId =
        Number(params.get('id'));

      if (!orderId || orderId <= 0) {

        this.errorMessage =
          'Invalid order ID.';

        return;
      }

      this.getOrderDetails(orderId);

    });

  }


  // ========================================
  // GET ORDER DETAILS
  // ========================================

  getOrderDetails(orderId: number): void {

    this.loading = true;

    this.errorMessage = '';

    this.checkoutService
      .getOrderDetails(orderId)
      .subscribe({

        next: (response) => {

          this.loading = false;

          if (response.status && response.data) {

            this.order = response.data;

            console.log(
              'Order Details:',
              this.order
            );

          } else {

            this.errorMessage =
              'Unable to load order details.';

          }

        },

        error: (error) => {

          this.loading = false;

          console.error(
            'Order Details Error:',
            error
          );

          this.errorMessage =
            'Something went wrong while loading the order.';

        }

      });

  }


  // ========================================
  // ORDER PRODUCTS
  // ========================================

  getOrderProducts(): any[] {

    if (!this.order?.ordered_products) {
      return [];
    }

    return Object.values(
      this.order.ordered_products
    );

  }


  // ========================================
  // FORMAT DATE
  // ========================================

  formatDate(date: string): string {

    if (!date) {
      return '';
    }

    return new Date(date).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );

  }


  // ========================================
  // FORMAT STATUS
  // ========================================

  getStatusClass(status: string): string {

    switch (status?.toLowerCase()) {

      case 'completed':
      case 'delivered':
        return 'status-success';

      case 'pending':
        return 'status-pending';

      case 'processing':
        return 'status-processing';

      case 'cancelled':
      case 'canceled':
        return 'status-danger';

      default:
        return 'status-default';

    }

  }


  // ========================================
  // FORMAT PRICE
  // ========================================

  getPrice(value: any): number {

    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === 'number') {
      return value;
    }

    const number =
      parseFloat(
        String(value).replace(/[^0-9.-]+/g, '')
      );

    return isNaN(number) ? 0 : number;

  }

}

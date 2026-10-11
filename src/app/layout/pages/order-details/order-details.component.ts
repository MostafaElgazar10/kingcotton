
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

  // الإجمالي النهائي من صفحة Order Success
  successTotal: number | null = null;

  // خصم الكوبون من صفحة Checkout
  successDiscount: number | null = null;


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

        this.order = null;

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

    this.order = null;

    this.successTotal = null;

    this.successDiscount = null;

    this.checkoutService
      .getOrderDetails(orderId)
      .subscribe({

        next: (response) => {

          this.loading = false;

          if (response.status && response.data) {

            this.order = response.data;

            // تحميل الإجمالي والخصم لنفس الطلب
            this.loadSuccessData(
              this.order.number,
              orderId
            );

            console.log(
              'ORDER DETAILS:',
              this.order
            );

            console.log(
              'ORDER SUCCESS TOTAL:',
              this.successTotal
            );

            console.log(
              'ORDER COUPON DISCOUNT:',
              this.successDiscount
            );

            console.log(
              'API COUPON DISCOUNT:',
              this.order.coupon_discount
            );

          } else {

            this.order = null;

            this.errorMessage =
              'Unable to load order details.';

          }

        },

        error: (error) => {

          this.loading = false;

          console.error(
            'ORDER DETAILS ERROR:',
            error
          );

          this.errorMessage =
            'Something went wrong while loading the order.';

        }

      });

  }


  // ========================================
  // LOAD SUCCESS DATA
  // ========================================

  private loadSuccessData(
    orderNumber: number | string,
    routeOrderId: number
  ): void {

    this.successTotal = null;

    this.successDiscount = null;

    if (!this.isBrowser) {
      return;
    }

    const stored =
      sessionStorage.getItem(
        'order_success_data'
      );

    if (!stored) {
      return;
    }

    try {

      const data = JSON.parse(stored);

      const currentOrderNumbers = [
        orderNumber,
        routeOrderId
      ]
        .filter(value =>
          value !== null &&
          value !== undefined &&
          value !== ''
        )
        .map(value =>
          String(value).trim()
        );

      const savedOrderNumbers = [
        data.orderNumber,
        data.orderId
      ]
        .filter(value =>
          value !== null &&
          value !== undefined &&
          value !== ''
        )
        .map(value =>
          String(value).trim()
        );

      // التأكد أن البيانات تخص نفس الطلب
      const isSameOrder =
        currentOrderNumbers.some(number =>
          savedOrderNumbers.includes(number)
        );

      if (!isSameOrder) {
        return;
      }

      // ----------------------------------------
      // FINAL TOTAL
      // ----------------------------------------

      const total = Number(data.total);

      if (
        data.total !== null &&
        data.total !== undefined &&
        data.total !== '' &&
        Number.isFinite(total) &&
        total >= 0
      ) {

        this.successTotal = total;

      }

      // ----------------------------------------
      // COUPON DISCOUNT
      // ----------------------------------------

      const rawDiscount =
        data.couponDiscount ??
        data.discount;

      if (
        rawDiscount !== null &&
        rawDiscount !== undefined &&
        rawDiscount !== '' &&
        Number.isFinite(Number(rawDiscount)) &&
        Number(rawDiscount) >= 0
      ) {

        this.successDiscount =
          Number(rawDiscount);

      }

      console.log(
        'MATCHED ORDER SUCCESS DATA:',
        data
      );

    } catch (error) {

      console.error(
        'UNABLE TO READ ORDER SUCCESS DATA:',
        error
      );

    }

  }


  // ========================================
  // DISPLAY TOTAL
  // ========================================

  getDisplayTotal(): number {

    if (this.successTotal !== null) {
      return this.successTotal;
    }

    return this.getPrice(
      this.order?.total
    );

  }


  // ========================================
  // DISPLAY PAID AMOUNT
  // ========================================

  getDisplayPaidAmount(): number {

    if (this.successTotal !== null) {
      return this.successTotal;
    }

    return this.getPrice(
      this.order?.paid_amount
    );

  }


  // ========================================
  // DISPLAY COUPON DISCOUNT
  // ========================================

  getDisplayDiscount(): number {

    // الأولوية للخصم المحفوظ من Checkout
    if (this.successDiscount !== null) {
      return this.successDiscount;
    }

    // الرجوع لخصم الكوبون القادم من API
    return this.getPrice(
      this.order?.coupon_discount
    );

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

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
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

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 0;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value)
        ? value
        : 0;
    }

    const number = parseFloat(
      String(value).replace(
        /[^0-9.-]+/g,
        ''
      )
    );

    return Number.isFinite(number)
      ? number
      : 0;

  }

}

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
  Router
} from '@angular/router';

interface OrderProduct {
  id: number;
  title: string;
  thumbnail: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface OrderSuccessData {
  orderId?: number | string;
  orderNumber?: number | string;
  orderDate?: string;

  pickupLocation?: string;
  shippingMethod?: string;

  paymentMethod?: string;
  tax?: number | string;
  total?: number | string;

  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;
  customerZip?: string;
  customerState?: string;

  products?: OrderProduct[];
}

@Component({
  selector: 'app-order-success',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.scss'
})
export class OrderSuccessComponent implements OnInit {

  // =========================================================
  // ORDER
  // =========================================================

  orderId: number | string = '-';

  orderNumber: number | string = '-';

  orderDate = '-';


  // =========================================================
  // PICKUP / SHIPPING
  // =========================================================

  pickupLocation = '-';

  shippingMethod = '-';


  // =========================================================
  // PAYMENT
  // =========================================================

  paymentMethod = 'Cash On Delivery';

  tax = 0;

  total = 0;


  // =========================================================
  // CUSTOMER
  // =========================================================

  customerName = '-';

  customerEmail = '-';

  customerPhone = '-';

  customerAddress = '-';

  customerCity = '';

  customerCountry = '';

  customerZip = '';

  customerState = '';


  // =========================================================
  // PRODUCTS
  // =========================================================

  products: OrderProduct[] = [];


  constructor(
    private router: Router,

    @Inject(PLATFORM_ID)
    private platformId: Object
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadOrderData();

  }


  // =========================================================
  // LOAD ORDER DATA
  // =========================================================

  private loadOrderData(): void {

    let data: OrderSuccessData | null = null;


    // =======================================================
    // 1. GET DATA FROM ROUTER STATE
    // =======================================================

    const navigation =
      this.router.getCurrentNavigation();

    const navigationState =
      navigation?.extras?.state;

    if (navigationState) {

      data =
        navigationState as OrderSuccessData;

    }


    // =======================================================
    // 2. FALLBACK TO SESSION STORAGE
    // =======================================================

    if (!data) {

      const stored =
        sessionStorage.getItem(
          'order_success_data'
        );

      if (stored) {

        try {

          data =
            JSON.parse(
              stored
            ) as OrderSuccessData;

        } catch {

          data = null;

        }

      }

    }


    // =======================================================
    // NO DATA
    // =======================================================

    if (!data) {

      console.warn(
        'No order success data found.'
      );

      return;

    }


    console.log(
      'ORDER SUCCESS DATA:',
      data
    );


    // =======================================================
    // ORDER INFORMATION
    // =======================================================

    this.orderId =
      data.orderId ??
      '-';

    this.orderNumber =
      data.orderNumber ??
      data.orderId ??
      '-';

    this.orderDate =
      data.orderDate ??
      '-';


    // =======================================================
    // PICKUP / SHIPPING
    // =======================================================

    this.pickupLocation =
      data.pickupLocation ??
      '-';

    this.shippingMethod =
      data.shippingMethod ??
      '-';


    // =======================================================
    // PAYMENT
    // =======================================================

    this.paymentMethod =
      data.paymentMethod ??
      'Cash On Delivery';

    this.tax =
      Number(
        data.tax ?? 0
      );

    this.total =
      Number(
        data.total ?? 0
      );


    // =======================================================
    // CUSTOMER
    // =======================================================

    this.customerName =
      data.customerName ??
      '-';

    this.customerEmail =
      data.customerEmail ??
      '-';

    this.customerPhone =
      data.customerPhone ??
      '-';

    this.customerAddress =
      data.customerAddress ??
      '-';

    this.customerCity =
      data.customerCity ??
      '';

    this.customerCountry =
      data.customerCountry ??
      '';

    this.customerZip =
      data.customerZip ??
      '';

    this.customerState =
      data.customerState ??
      '';


    // =======================================================
    // PRODUCTS
    // =======================================================

    this.products =
      data.products ??
      [];

  }


  // =========================================================
  // PRODUCT TOTAL
  // =========================================================

  getProductTotal(
    product: OrderProduct
  ): number {

    return (
      Number(product.price) *
      Number(product.quantity)
    );

  }

  

  // =========================================================
  // CONTINUE SHOPPING
  // =========================================================

  continueShopping(): void {

    this.router.navigate([
      '/products'
    ]);

  }

}
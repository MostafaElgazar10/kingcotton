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
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  take
} from 'rxjs';

import {
  CartService
} from '../../../core/services/cart.service';

import {
  CheckoutService
} from '../../../core/services/checkout.service';

import {
  CheckoutStateService
} from '../../../core/services/checkout-state.service';

import {
  CheckoutApiPayload,
  CheckoutItemPayload,
  CheckoutOrderResponse
} from '../../../core/models/checkout.model';


@Component({
  selector: 'app-checkout3',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './checkout3.component.html',

  styleUrl: './checkout3.component.scss'
})
export class Checkout3Component implements OnInit {


  // ========================================
  // PAYMENT
  // ========================================

  paymentMethod: 'cash' = 'cash';


  // ========================================
  // COUPON
  // ========================================

  couponCode = '';

  couponMessage = '';

  couponError = false;

  couponLoading = false;

  couponApplied = false;

  appliedCoupon: any = null;


  // ========================================
  // STATE
  // ========================================

  loading = false;

  errorMessage = '';


  // ========================================
  // ORDER SUMMARY
  // ========================================

  total = 0;

  tax = 0;

  shippingCost = 0;

  packingCost = 0;

  discount = 0;


  // ========================================
  // SHIPPING / PACKAGING
  // ========================================

  shippingId = 1;

  packagingId = 1;


  constructor(

    private checkoutService:
      CheckoutService,

    private checkoutStateService:
      CheckoutStateService,

    private cartService:
      CartService,

    private router:
      Router,

    @Inject(PLATFORM_ID)
    private platformId: object

  ) {}


  // ========================================
  // INIT
  // ========================================

  ngOnInit(): void {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {
      return;
    }

    this.loadOrderSummary();
  }


  // ========================================
  // LOAD ORDER SUMMARY
  // ========================================

  private loadOrderSummary(): void {

    this.cartService.cartItems$
      .pipe(take(1))
      .subscribe({

        next: (cartItems) => {

          if (
            !cartItems ||
            cartItems.length === 0
          ) {

            this.total = 0;

            this.shippingCost = 0;

            this.packingCost = 0;

            this.tax = 0;

            this.discount = 0;

            return;
          }


          // ========================================
          // PRODUCTS TOTAL
          // ========================================

          this.total =
            cartItems.reduce(
              (
                sum: number,
                product: any
              ) => {

                const price =
                  Number(
                    product.current_price ??
                    product.price ??
                    0
                  );

                const quantity =
                  Number(
                    product.quantity ??
                    1
                  );

                return sum +
                  (price * quantity);

              },
              0
            );


          // ========================================
          // DEFAULT SHIPPING
          // ========================================

          this.shippingCost = 0;


          // ========================================
          // DEFAULT PACKAGING
          // ========================================

          this.packingCost = 0;


          // ========================================
          // TAX
          // ========================================

          this.tax = 0;


          // ========================================
          // DISCOUNT
          // ========================================

          this.discount = 0;


          console.log(
            'CHECKOUT SUMMARY:',
            {
              total: this.total,

              tax: this.tax,

              shippingCost:
                this.shippingCost,

              packingCost:
                this.packingCost,

              discount:
                this.discount,

              finalPrice:
                this.finalPrice
            }
          );
        },


        error: (error) => {

          console.error(
            'LOAD CHECKOUT SUMMARY ERROR:',
            error
          );

          this.total = 0;

          this.errorMessage =
            'حصل خطأ أثناء حساب ملخص الطلب.';
        }

      });
  }


  // ========================================
  // FINAL PRICE
  // ========================================

  get finalPrice(): number {

    const taxAmount =
      this.total *
      (this.tax / 100);

    return Math.max(
      0,

      this.total +

      taxAmount +

      this.shippingCost +

      this.packingCost -

      this.discount
    );
  }


  // ========================================
  // APPLY COUPON
  // ========================================

  applyCoupon(): void {

    const code =
      this.couponCode
        .trim();


    // ========================================
    // EMPTY CODE
    // ========================================

    if (!code) {

      this.couponMessage =
        'من فضلك أدخل كود الكوبون.';

      this.couponError = true;

      return;
    }


    // ========================================
    // LOADING
    // ========================================

    this.couponLoading = true;

    this.couponMessage = '';

    this.couponError = false;


    // ========================================
    // CHECK API
    // ========================================

    this.checkoutService
      .getCoupon(code)
      .subscribe({

        next: (response) => {

          this.couponLoading = false;


          console.log(
            'COUPON API RESPONSE:',
            response
          );


          // ========================================
          // INVALID RESPONSE
          // ========================================

          if (
            !response ||
            !response.status ||
            !response.data
          ) {

            this.couponApplied = false;

            this.appliedCoupon = null;

            this.discount = 0;

            this.couponError = true;

            this.couponMessage =
              this.getApiErrorMessage(
                response?.error
              ) ||
              'الكوبون غير صحيح.';

            return;
          }


          const coupon =
            response.data;


          // ========================================
          // COUPON STATUS
          // ========================================

          if (
            Number(coupon.status) !== 1
          ) {

            this.couponApplied = false;

            this.appliedCoupon = null;

            this.discount = 0;

            this.couponError = true;

            this.couponMessage =
              'هذا الكوبون غير فعال.';

            return;
          }


          // ========================================
          // START DATE
          // ========================================

          const today =
            new Date()
              .toISOString()
              .slice(0, 10);


          if (
            coupon.start_date &&
            today < coupon.start_date
          ) {

            this.couponApplied = false;

            this.appliedCoupon = null;

            this.discount = 0;

            this.couponError = true;

            this.couponMessage =
              'هذا الكوبون لم يبدأ بعد.';

            return;
          }


          // ========================================
          // END DATE
          // ========================================

          if (
            coupon.end_date &&
            today > coupon.end_date
          ) {

            this.couponApplied = false;

            this.appliedCoupon = null;

            this.discount = 0;

            this.couponError = true;

            this.couponMessage =
              'هذا الكوبون منتهي الصلاحية.';

            return;
          }


          // ========================================
          // USAGE LIMIT
          // ========================================

          const maxTimes =
            Number(
              coupon.times
            );

          const used =
            Number(
              coupon.used
            );


          if (
            maxTimes > 0 &&
            used >= maxTimes
          ) {

            this.couponApplied = false;

            this.appliedCoupon = null;

            this.discount = 0;

            this.couponError = true;

            this.couponMessage =
              'تم استخدام هذا الكوبون بالكامل.';

            return;
          }


          // ========================================
          // DISCOUNT
          // ========================================

          const couponPrice =
            Number(
              coupon.price ?? 0
            );


          if (
            couponPrice <= 0
          ) {

            this.couponApplied = false;

            this.appliedCoupon = null;

            this.discount = 0;

            this.couponError = true;

            this.couponMessage =
              'قيمة الخصم غير صحيحة.';

            return;
          }


          // ========================================
          // APPLY DISCOUNT
          // ========================================

          this.discount =
            Math.min(
              couponPrice,
              this.total
            );


          // ========================================
          // SAVE COUPON
          // ========================================

          this.appliedCoupon =
            coupon;

          this.couponApplied =
            true;


          // ========================================
          // SUCCESS MESSAGE
          // ========================================

          this.couponError = false;

          this.couponMessage =
            `تم تطبيق الكوبون بنجاح. الخصم ${this.discount} EGP`;


          console.log(
            'APPLIED COUPON:',
            coupon
          );

          console.log(
            'COUPON DISCOUNT:',
            this.discount
          );

          console.log(
            'FINAL PRICE:',
            this.finalPrice
          );
        },


        error: (error) => {

          this.couponLoading = false;

          console.error(
            'COUPON API ERROR:',
            error
          );


          this.couponApplied = false;

          this.appliedCoupon = null;

          this.discount = 0;

          this.couponError = true;


          this.couponMessage =
            this.getApiErrorMessage(
              error
            ) ||
            'حصل خطأ أثناء التحقق من الكوبون.';
        }

      });
  }


  // ========================================
  // REMOVE COUPON
  // ========================================

  removeCoupon(): void {

    this.couponCode = '';

    this.couponMessage = '';

    this.couponError = false;

    this.couponApplied = false;

    this.appliedCoupon = null;

    this.discount = 0;
  }


  // ========================================
  // CREATE ORDER
  // ========================================

  continueToPayment(): void {

    if (this.loading) {
      return;
    }


    this.errorMessage = '';


    // ========================================
    // BROWSER CHECK
    // ========================================

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      this.errorMessage =
        'إتمام الطلب متاح من المتصفح فقط.';

      return;
    }


    // ========================================
    // GET BILLING ADDRESS
    // ========================================

    const address =
      this.checkoutStateService
        .getBillingAddress();


    if (!address) {

      this.errorMessage =
        'بيانات العنوان غير موجودة. ارجع لخطوة العنوان وأدخل بياناتك.';

      return;
    }


    // ========================================
    // GET CART
    // ========================================

    this.cartService.cartItems$
      .pipe(take(1))
      .subscribe({

        next: (cartItems) => {

          if (
            !cartItems ||
            cartItems.length === 0
          ) {

            this.errorMessage =
              'السلة فارغة. أضف منتجات قبل تأكيد الطلب.';

            return;
          }


          console.log(
            'CART ITEMS BEFORE ORDER:',
            cartItems
          );


          // ========================================
          // CUSTOMER DATA
          // ========================================

          const customerName =
            address.name ?? '';

          const customerEmail =
            address.email ?? '';

          const customerPhone =
            address.phone ?? '';

          const customerAddress =
            address.address ?? '';

          const customerCity =
            address.city ?? '';

          const customerCountry =
            address.country ?? '';

          const customerZip =
            address.postal_code ?? '';

          const customerState =
            address.state ?? '';


          // ========================================
          // PREPARE API ITEMS
          // ========================================

          const items:
            CheckoutItemPayload[] =

            cartItems.map(
              (product: any) => ({

                id:
                  Number(
                    product.id
                  ),

                qty:
                  Number(
                    product.quantity ?? 1
                  ),

                size:
                  String(
                    product.size ?? ''
                  ),

                size_qty:
                  Number(
                    product.size_qty ?? 0
                  ),

                size_key:
                  Number(
                    product.size_key ?? 0
                  ),

                size_price:
                  Number(
                    product.size_price ?? 0
                  ),

                color:
                  String(
                    product.color ?? ''
                  ),

                keys:
                  String(
                    product.keys ?? ''
                  ),

                values:
                  String(
                    product.values ?? ''
                  ),

                prices:
                  String(
                    product.prices ?? ''
                  )
              })
            );


          // ========================================
          // CHECKOUT API PAYLOAD
          // ========================================

          const payload:
            CheckoutApiPayload = {

            // ----------------------------------------
            // CUSTOMER / BILLING
            // ----------------------------------------

            customer_name:
              customerName,

            customer_email:
              customerEmail,

            customer_phone:
              customerPhone,

            customer_address:
              customerAddress,

            customer_city:
              customerCity,

            customer_country:
              customerCountry,

            customer_zip:
              customerZip,

            customer_state:
              customerState,


            // ----------------------------------------
            // SHIPPING
            // ----------------------------------------

            shipping_name:
              customerName,

            shipping_email:
              customerEmail,

            shipping_phone:
              customerPhone,

            shipping_address:
              customerAddress,

            shipping_city:
              customerCity,

            shipping_country:
              customerCountry,

            shipping_zip:
              customerZip,

            shipping_state:
              customerState,


            // ----------------------------------------
            // CHECKOUT
            // ----------------------------------------

            wallet_price:
              0,

            currency_code:
              'Egp',

            affilate_user:
              0,

            tax:
              Number(
                this.tax
              ),

            tax_type:
              'state_tax',

            shipping_id:
              Number(
                this.shippingId
              ),

            packaging_id:
              Number(
                this.packagingId
              ),


            // ----------------------------------------
            // PAYMENT
            // ----------------------------------------

            method:
              'Cash On Delivery',


            // ----------------------------------------
            // ITEMS
            // ----------------------------------------

            items:
              JSON.stringify(
                items
              ),


            // ----------------------------------------
            // COUPON
            // ----------------------------------------

            coupon_code:
              this.couponApplied &&
              this.couponCode.trim()

                ? this.couponCode
                    .trim()

                : null
          };


          console.log(
            'CHECKOUT PAYLOAD:',
            payload
          );


          // ========================================
          // START LOADING
          // ========================================

          this.loading = true;


          // ========================================
          // CREATE ORDER API
          // ========================================

          this.checkoutService
            .createCheckoutOrder(
              payload
            )
            .subscribe({

              next: (
                response:
                  CheckoutOrderResponse
              ) => {

                this.loading = false;


                console.log(
                  'CHECKOUT API RESPONSE:',
                  response
                );


                // ========================================
                // API FAILED
                // ========================================

                if (
                  !response ||
                  !response.status
                ) {

                  this.errorMessage =
                    this.getApiErrorMessage(
                      response?.error
                    ) ||
                    'لم يتم إنشاء الطلب. برجاء المحاولة مرة أخرى.';

                  return;
                }


                // ========================================
                // API DATA
                // ========================================

                const apiData:
                  any =
                  response.data ?? {};


                console.log(
                  'CHECKOUT API DATA:',
                  apiData
                );


                // ========================================
                // ORDER ID
                // ========================================

                const orderId =
                  apiData.order_id ??
                  apiData.id ??
                  '-';


                // ========================================
                // ORDER NUMBER
                // ========================================

                const orderNumber =
                  apiData.order_number ??
                  apiData.order_no ??
                  apiData.order_code ??
                  apiData.code ??
                  orderId;


                // ========================================
                // ORDER DATE
                // ========================================

                const rawOrderDate =
                  apiData.created_at ??
                  apiData.order_date ??
                  apiData.date ??
                  new Date().toISOString();


                const orderDate =
                  this.formatOrderDate(
                    rawOrderDate
                  );


                // ========================================
                // PICKUP LOCATION
                // ========================================

                const pickupLocation =
                  apiData.pickup_location ??
                  apiData.pickupLocation ??
                  apiData.pickup_address ??
                  apiData.pickupAddress ??
                  'Azampur';


                // ========================================
                // SHIPPING METHOD
                // ========================================

                const shippingMethod =
                  apiData.shipping_method ??
                  apiData.shippingMethod ??
                  apiData.shipping_type ??
                  'Pick Up';


                // ========================================
                // SAVE PRODUCTS BEFORE CLEAR CART
                // ========================================

                const orderProducts =
                  cartItems.map(
                    (product: any) => ({

                      id:
                        Number(
                          product.id
                        ),

                      title:
                        String(
                          product.title ??
                          product.name ??
                          'Product'
                        ),

                      thumbnail:
                        String(
                          product.thumbnail ??
                          product.image ??
                          ''
                        ),

                      quantity:
                        Number(
                          product.quantity ??
                          1
                        ),

                      price:
                        Number(
                          product.current_price ??
                          product.price ??
                          0
                        ),

                      size:
                        String(
                          product.size ??
                          ''
                        ),

                      color:
                        String(
                          product.color ??
                          ''
                        )
                    })
                  );


                console.log(
                  'ORDER PRODUCTS:',
                  orderProducts
                );


                // ========================================
                // COMPLETE ORDER SUCCESS DATA
                // ========================================

                const orderSuccessData = {

                  // ----------------------------------------
                  // ORDER
                  // ----------------------------------------

                  orderId:
                    orderId,

                  orderNumber:
                    orderNumber,

                  orderDate:
                    orderDate,


                  // ----------------------------------------
                  // PICKUP
                  // ----------------------------------------

                  pickupLocation:
                    pickupLocation,


                  // ----------------------------------------
                  // SHIPPING
                  // ----------------------------------------

                  shippingMethod:
                    shippingMethod,


                  // ----------------------------------------
                  // PAYMENT
                  // ----------------------------------------

                  paymentMethod:
                    'Cash On Delivery',


                  // ----------------------------------------
                  // AMOUNTS
                  // ----------------------------------------

                  tax:
                    Number(
                      this.tax ?? 0
                    ),

                  discount:
                    Number(
                      this.discount ?? 0
                    ),

                  total:
                    Number(
                      this.finalPrice ?? 0
                    ),


                  // ----------------------------------------
                  // COUPON
                  // ----------------------------------------

                  couponCode:
                    this.couponApplied
                      ? this.couponCode.trim()
                      : '',


                  // ----------------------------------------
                  // CUSTOMER
                  // ----------------------------------------

                  customerName:
                    customerName,

                  customerEmail:
                    customerEmail,

                  customerPhone:
                    customerPhone,

                  customerAddress:
                    customerAddress,

                  customerCity:
                    customerCity,

                  customerCountry:
                    customerCountry,

                  customerZip:
                    customerZip,

                  customerState:
                    customerState,


                  // ----------------------------------------
                  // PRODUCTS
                  // ----------------------------------------

                  products:
                    orderProducts
                };


                console.log(
                  '================================'
                );

                console.log(
                  'COMPLETE ORDER SUCCESS DATA:',
                  orderSuccessData
                );

                console.log(
                  '================================'
                );


                // ========================================
                // SAVE ORDER ID
                // ========================================

                sessionStorage.setItem(
                  'order_id',
                  String(
                    orderId
                  )
                );


                // ========================================
                // SAVE COMPLETE ORDER DATA
                // ========================================

                sessionStorage.setItem(
                  'order_success_data',

                  JSON.stringify(
                    orderSuccessData
                  )
                );


                console.log(
                  'SAVED ORDER SUCCESS DATA:',
                  sessionStorage.getItem(
                    'order_success_data'
                  )
                );


                // ========================================
                // CLEAR CART
                // ========================================

                this.cartService.clearCart();


                // ========================================
                // NAVIGATE
                // ========================================

                this.router.navigate(
                  ['/order-success'],
                  {
                    state:
                      orderSuccessData
                  }
                );

              },


              // ========================================
              // API ERROR
              // ========================================

              error: (error) => {

                this.loading = false;


                console.error(
                  'CHECKOUT API ERROR:',
                  error
                );


                this.errorMessage =
                  this.getApiErrorMessage(
                    error
                  );
              }

            });
        },


        // ========================================
        // CART ERROR
        // ========================================

        error: (error) => {

          this.loading = false;


          console.error(
            'CART ERROR:',
            error
          );


          this.errorMessage =
            'حصل خطأ أثناء قراءة السلة.';
        }

      });
  }


  // ========================================
  // FORMAT ORDER DATE
  // ========================================

  private formatOrderDate(
    value: any
  ): string {

    if (!value) {
      return '-';
    }


    const date =
      new Date(value);


    if (
      isNaN(
        date.getTime()
      )
    ) {

      return String(
        value
      );
    }


    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );


    const monthNames = [

      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'

    ];


    const month =
      monthNames[
        date.getMonth()
      ];


    const year =
      date.getFullYear();


    return `${day}-${month}-${year}`;
  }


  // ========================================
  // BACK TO DETAILS
  // ========================================

  backToDetails(): void {

    if (this.loading) {
      return;
    }


    this.router.navigate([
      '/checkoutdetails'
    ]);
  }


  // ========================================
  // API ERROR MESSAGE
  // ========================================

  private getApiErrorMessage(
    response: any
  ): string {

    if (!response) {
      return '';
    }


    // ----------------------------------------
    // STRING
    // ----------------------------------------

    if (
      typeof response === 'string'
    ) {

      return response;
    }


    // ----------------------------------------
    // MESSAGE
    // ----------------------------------------

    if (
      typeof response.message === 'string'
    ) {

      return response.message;
    }


    // ----------------------------------------
    // ERROR
    // ----------------------------------------

    const errors =
      response.error;


    if (
      typeof errors === 'string'
    ) {

      return errors;
    }


    if (
      typeof errors?.message === 'string'
    ) {

      return errors.message;
    }


    // ----------------------------------------
    // OBJECT ERRORS
    // ----------------------------------------

    if (
      errors &&
      typeof errors === 'object'
    ) {

      const values =
        Object.values(
          errors
        );


      if (
        values.length > 0
      ) {

        const firstValue =
          values[0];


        if (
          Array.isArray(
            firstValue
          )
        ) {

          return String(
            firstValue[0] ??
            ''
          );
        }


        return String(
          firstValue
        );
      }
    }


    return '';
  }
}
import { Component, inject, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { take } from 'rxjs';

import { CheckoutStateService } from '../../../core/services/checkout-state.service';

import { CartService } from '../../../core/services/cart.service';

import { CheckoutOrderPayload } from '../../../core/models/checkout.model';


@Component({
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  selector: 'app-checkout',

  templateUrl: './checkout.component.html',

  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private router = inject(Router);

  private fb = inject(FormBuilder);

  private checkoutStateService =
    inject(CheckoutStateService);

  private cartService =
    inject(CartService);


  // =========================================================
  // FORM
  // =========================================================

  checkoutForm!: FormGroup;


  // =========================================================
  // STATE
  // =========================================================

  isSubmitting = false;

  errorMessage = '';


  // =========================================================
  // SUMMARY
  // =========================================================

  /**
   * السعر الأصلي قبل الخصم
   */
  totalMRP = 0;


  /**
   * إجمالي الخصم
   */
  discount = 0;


  /**
   * الضريبة
   */
  tax = 0;


  /**
   * تكلفة الشحن
   */
  shippingCost = 0;


  /**
   * تكلفة التغليف
   */
  packagingCost = 0;


  /**
   * السعر النهائي بعد الخصم
   */
  finalPrice = 0;


  // =========================================================
  // COUNTRIES
  // =========================================================

  countries = [

    {
      code: 'EG',
      name: 'Egypt'
    },

    {
      code: 'SA',
      name: 'Saudi Arabia'
    },

    {
      code: 'AE',
      name: 'UAE'
    }

  ];


  // =========================================================
  // STATES
  // =========================================================

  states = [

    'Cairo',

    'Giza',

    'Alexandria',

    'Gharbia'

  ];


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    // =======================================================
    // FORM
    // =======================================================

    this.checkoutForm =
      this.fb.group({

        personalName: [
          '',
          Validators.required
        ],

        personalEmail: [

          '',

          [
            Validators.required,
            Validators.email
          ]

        ],

        createAccount: [
          false
        ],

        shippingOption: [

          'ship_to_address',

          Validators.required

        ],

        billingName: [

          '',
          Validators.required

        ],

        billingEmail: [

          '',

          [
            Validators.required,
            Validators.email
          ]

        ],

        phone: [

          '',
          Validators.required

        ],

        country: [

          '',
          Validators.required

        ],

        state: [

          '',
          Validators.required

        ],

        city: [

          '',
          Validators.required

        ],

        address: [

          '',
          Validators.required

        ],

        postalCode: [

          '',
          Validators.required

        ]

      });


    // =======================================================
    // LOAD SAVED ADDRESS
    // =======================================================

    const savedAddress =
      this.checkoutStateService
        .getBillingAddress();


    if (savedAddress) {

      this.checkoutForm.patchValue({

        billingName:
          savedAddress.name,

        billingEmail:
          savedAddress.email,

        phone:
          savedAddress.phone,

        country:
          savedAddress.country,

        state:
          savedAddress.state,

        city:
          savedAddress.city,

        address:
          savedAddress.address,

        postalCode:
          savedAddress.postal_code

      });

    }


    // =======================================================
    // LOAD CART SUMMARY
    // =======================================================

    this.loadCartSummary();

  }


  // =========================================================
  // LOAD CART SUMMARY
  // =========================================================

  private loadCartSummary(): void {

    this.cartService.cartItems$
      .pipe(take(1))
      .subscribe({

        next: (cartItems) => {

          console.log(
            'CHECKOUT STEP 1 CART:',
            cartItems
          );


          // =================================================
          // EMPTY CART
          // =================================================

          if (
            !cartItems ||
            cartItems.length === 0
          ) {

            this.totalMRP = 0;

            this.discount = 0;

            this.tax = 0;

            this.shippingCost = 0;

            this.packagingCost = 0;

            this.finalPrice = 0;

            return;

          }


          // =================================================
          // RESET
          // =================================================

          let originalTotal = 0;

          let discountTotal = 0;

          let currentTotal = 0;


          // =================================================
          // CALCULATE PRODUCTS
          // =================================================

          cartItems.forEach(
            (product: any) => {

              const quantity =
                Number(
                  product.quantity ??
                  product.qty ??
                  1
                );


              /*
               * السعر قبل الخصم
               */
              const previousPrice =
                Number(
                  product.previous_price ??
                  product.previousPrice ??
                  product.old_price ??
                  product.oldPrice ??
                  product.current_price ??
                  product.price ??
                  0
                );


              /*
               * السعر الحالي بعد الخصم
               */
              const currentPrice =
                Number(
                  product.current_price ??
                  product.currentPrice ??
                  product.price ??
                  0
                );


              /*
               * إجمالي السعر الأصلي للمنتج
               */
              const productOriginalTotal =
                previousPrice * quantity;


              /*
               * إجمالي السعر الحالي
               */
              const productCurrentTotal =
                currentPrice * quantity;


              /*
               * قيمة الخصم
               */
              const productDiscount =
                Math.max(
                  0,
                  productOriginalTotal -
                  productCurrentTotal
                );


              originalTotal +=
                productOriginalTotal;


              currentTotal +=
                productCurrentTotal;


              discountTotal +=
                productDiscount;


              console.log(
                'CHECKOUT PRODUCT:',
                {
                  title: product.title,

                  quantity,

                  previousPrice,

                  currentPrice,

                  originalTotal:
                    productOriginalTotal,

                  currentTotal:
                    productCurrentTotal,

                  discount:
                    productDiscount
                }
              );

            }
          );


          // =================================================
          // SET SUMMARY
          // =================================================

          this.totalMRP =
            originalTotal;


          this.discount =
            discountTotal;


          /*
           * tax = 0 حاليًا
           */
          this.tax = 0;


          /*
           * Shipping = 0 حاليًا
           */
          this.shippingCost = 0;


          /*
           * Packaging = 0 حاليًا
           */
          this.packagingCost = 0;


          /*
           * السعر النهائي:
           *
           * السعر الحالي للمنتجات
           * + الضريبة
           * + الشحن
           * + التغليف
           */
          this.finalPrice =
            currentTotal +
            (
              currentTotal *
              (this.tax / 100)
            ) +
            this.shippingCost +
            this.packagingCost;


          // =================================================
          // DEBUG
          // =================================================

          console.log(
            '================================'
          );

          console.log(
            'CHECKOUT SUMMARY'
          );

          console.log(
            'Total MRP:',
            this.totalMRP
          );

          console.log(
            'Discount:',
            this.discount
          );

          console.log(
            'Current Products Total:',
            currentTotal
          );

          console.log(
            'Tax:',
            this.tax
          );

          console.log(
            'Shipping:',
            this.shippingCost
          );

          console.log(
            'Packaging:',
            this.packagingCost
          );

          console.log(
            'FINAL PRICE:',
            this.finalPrice
          );

          console.log(
            '================================'
          );

        },

        error: (error) => {

          console.error(
            'CHECKOUT CART ERROR:',
            error
          );

          this.errorMessage =
            'Unable to load cart summary.';

        }

      });

  }


  // =========================================================
  // SUBMIT
  // =========================================================

  onSubmit(): void {

    // =======================================================
    // VALIDATION
    // =======================================================

    if (
      this.checkoutForm.invalid
    ) {

      this.checkoutForm
        .markAllAsTouched();

      this.errorMessage =
        'Please fill in all required fields.';

      return;

    }


    this.errorMessage = '';


    // =======================================================
    // FORM VALUES
    // =======================================================

    const formValues =
      this.checkoutForm.value;


    // =======================================================
    // CHECKOUT ADDRESS PAYLOAD
    // =======================================================

    const payload:
      CheckoutOrderPayload = {

      name:
        formValues.billingName,

      email:
        formValues.billingEmail,

      phone:
        formValues.phone,

      country:
        formValues.country,

      state:
        formValues.state,

      city:
        formValues.city,

      address:
        formValues.address,

      postal_code:
        formValues.postalCode,

      coupon_code:
        null

    };


    // =======================================================
    // SAVE ADDRESS
    // =======================================================

    this.checkoutStateService
      .setBillingAddress(payload);


    console.log(
      'Checkout Address Saved:',
      payload
    );


    // =======================================================
    // GO TO STEP 2
    // =======================================================

    this.router.navigate([
      '/checkoutdetails'
    ]);

  }

}
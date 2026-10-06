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

import { AuthService } from '../../../core/services/auth.service';


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

  private authService =
    inject(AuthService);


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

  totalMRP = 0;

  discount = 0;

  tax = 0;

  shippingCost = 0;

  packagingCost = 0;

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

    this.checkoutForm = this.fb.group({

      personalName: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
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
        [
          Validators.required,
          Validators.minLength(3)
        ]
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
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10,15}$/)
        ]
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
        [
          Validators.required,
          Validators.minLength(5)
        ]
      ],

      postalCode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{4,10}$/)
        ]
      ]

    });


    // =======================================================
    // LOAD REGISTERED USER DATA
    // =======================================================

    const user: any =
      this.authService.getUser();


    if (user) {

      this.checkoutForm.patchValue({

        // Personal Information
        personalName:
          user.full_name ||
          user.fullname ||
          user.name ||
          '',

        personalEmail:
          user.email ||
          '',

        // Billing Details
        billingName:
          user.full_name ||
          user.fullname ||
          user.name ||
          '',

        billingEmail:
          user.email ||
          '',

        phone:
          user.phone ||
          '',

        country:
          user.country ||
          '',

        state:
          user.state ||
          '',

        city:
          user.city ||
          '',

        address:
          user.address ||
          '',

        postalCode:
          user.postal_code ||
          user.postalCode ||
          user.zip ||
          ''

      });

    }


    // =======================================================
    // LOAD SAVED CHECKOUT ADDRESS
    // =======================================================

    const savedAddress =
      this.checkoutStateService.getBillingAddress();


    if (savedAddress !== null) {

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
  // VALIDATION ERROR MESSAGE
  // =========================================================

  getErrorMessage(fieldName: string): string {

    const control =
      this.checkoutForm.get(fieldName);


    if (!control || !control.touched) {
      return '';
    }


    // =======================================================
    // REQUIRED
    // =======================================================

    if (control.hasError('required')) {

      return 'This field is required.';

    }


    // =======================================================
    // EMAIL
    // =======================================================

    if (control.hasError('email')) {

      return 'Please enter a valid email address.';

    }


    // =======================================================
    // MIN LENGTH
    // =======================================================

    if (control.hasError('minlength')) {

      const requiredLength =
        control.errors?.['minlength']?.requiredLength;

      return `Minimum ${requiredLength} characters required.`;

    }


    // =======================================================
    // PATTERN
    // =======================================================

    if (control.hasError('pattern')) {

      if (fieldName === 'phone') {

        return 'Please enter a valid phone number.';

      }


      if (fieldName === 'postalCode') {

        return 'Please enter a valid postal code.';

      }


      return 'Invalid format.';

    }


    return '';

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


              // =================================================
              // PREVIOUS PRICE
              // =================================================

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


              // =================================================
              // CURRENT PRICE
              // =================================================

              const currentPrice =
                Number(
                  product.current_price ??
                  product.currentPrice ??
                  product.price ??
                  0
                );


              // =================================================
              // ORIGINAL TOTAL
              // =================================================

              const productOriginalTotal =
                previousPrice * quantity;


              // =================================================
              // CURRENT TOTAL
              // =================================================

              const productCurrentTotal =
                currentPrice * quantity;


              // =================================================
              // DISCOUNT
              // =================================================

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
            currentTotal;


          this.discount =
            discountTotal;


          // =================================================
          // TAX
          // =================================================

          this.tax = 0;


          // =================================================
          // SHIPPING
          // =================================================

          this.shippingCost = 0;


          // =================================================
          // PACKAGING
          // =================================================

          this.packagingCost = 0;


          // =================================================
          // FINAL PRICE
          // =================================================

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


    // =======================================================
    // CLEAR ERROR
    // =======================================================

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
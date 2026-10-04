import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import {
  CartService,
  CartProduct
} from '../../../core/services/cart.service';


@Component({
  selector: 'app-cart',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './cart.component.html',

  styleUrl: './cart.component.css'
})
export class CartComponent
  implements OnInit {


  private cartService =
    inject(CartService);

  private router =
    inject(Router);


  // =========================
  // CART
  // =========================

  cartItems: CartProduct[] = [];


  // =========================
  // TOTALS
  // =========================

  subtotal = 0;

  discount = 0;

  total = 0;

  itemsCount = 0;


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.cartService.cartItems$
      .subscribe(items => {

        this.cartItems = items;

        this.calculateTotals();

      });

  }


  // =========================
  // CALCULATE TOTALS
  // =========================

  calculateTotals(): void {

    this.subtotal =
      this.cartService.getSubtotal();

    this.discount =
      this.cartService.getDiscount();

    this.total =
      this.cartService.getTotal();

    this.itemsCount =
      this.cartService.getItemsCount();

  }


  // =========================
  // PLUS
  // =========================

  increaseQuantity(
    product: CartProduct
  ): void {

    this.cartService
      .increaseQuantity(product);

  }


  // =========================
  // MINUS
  // =========================

  decreaseQuantity(
    product: CartProduct
  ): void {

    this.cartService
      .decreaseQuantity(product);

  }


  // =========================
  // DELETE
  // =========================

  removeProduct(
    product: CartProduct
  ): void {

    this.cartService
      .removeFromCart(product);

  }


  // =========================
  // CLEAR CART
  // =========================

  clearCart(): void {

    this.cartService.clearCart();

  }


  // =========================
  // CHECKOUT
  // =========================

  proceedToCheckout(): void {

    this.router.navigate([
      '/checkout'
    ]);

  }


  // =========================
  // ITEM SUBTOTAL
  // =========================

  getItemSubtotal(
    product: CartProduct
  ): number {

    return (
      Number(product.current_price) *
      product.quantity
    );

  }

}
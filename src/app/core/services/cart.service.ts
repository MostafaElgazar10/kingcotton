import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface CartProduct {
  id: number;
  title: string;
  thumbnail: string;
  current_price: string | number;
  previous_price: string | number;
  rating: string | number;
  quantity: number;

  // Product Options
  color?: string;
  size?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly storageKey = 'cart';

  private platformId = inject(PLATFORM_ID);

  private isBrowser =
    isPlatformBrowser(this.platformId);

  private cartItemsSubject =
    new BehaviorSubject<CartProduct[]>(
      this.getCartFromStorage()
    );

  cartItems$ =
    this.cartItemsSubject.asObservable();


  // =========================
  // GET CART
  // =========================

  getCart(): CartProduct[] {
    return this.cartItemsSubject.value;
  }


  // =========================
  // ADD TO CART
  // =========================

  addToCart(product: any): void {

    const items = [...this.getCart()];

    const productColor =
      String(product.color ?? '');

    const productSize =
      String(product.size ?? '');


    /*
     * نفس المنتج يعتبر نفس العنصر
     * فقط لو اللون والمقاس كمان نفسهم
     */

    const existingProduct =
      items.find(item =>
        Number(item.id) === Number(product.id) &&
        String(item.color ?? '') === productColor &&
        String(item.size ?? '') === productSize
      );


    if (existingProduct) {

      existingProduct.quantity += 1;

    } else {

      items.push({

        id: product.id,

        title: product.title,

        thumbnail: product.thumbnail,

        current_price:
          product.current_price,

        previous_price:
          product.previous_price,

        rating:
          product.rating,

        quantity: 1,

        color: productColor,

        size: productSize

      });

    }

    this.updateCart(items);
  }


  // =========================
  // INCREASE QUANTITY
  // =========================

  increaseQuantity(
    product: CartProduct
  ): void {

    const items = [...this.getCart()];

    const item =
      items.find(cartItem =>
        Number(cartItem.id) === Number(product.id) &&
        String(cartItem.color ?? '') ===
          String(product.color ?? '') &&
        String(cartItem.size ?? '') ===
          String(product.size ?? '')
      );


    if (item) {
      item.quantity += 1;
    }

    this.updateCart(items);
  }


  // =========================
  // DECREASE QUANTITY
  // =========================

  decreaseQuantity(
    product: CartProduct
  ): void {

    let items = [...this.getCart()];

    const item =
      items.find(cartItem =>
        Number(cartItem.id) === Number(product.id) &&
        String(cartItem.color ?? '') ===
          String(product.color ?? '') &&
        String(cartItem.size ?? '') ===
          String(product.size ?? '')
      );


    if (!item) {
      return;
    }


    if (item.quantity > 1) {

      item.quantity -= 1;

    } else {

      items = items.filter(cartItem =>
        !(
          Number(cartItem.id) === Number(product.id) &&
          String(cartItem.color ?? '') ===
            String(product.color ?? '') &&
          String(cartItem.size ?? '') ===
            String(product.size ?? '')
        )
      );

    }

    this.updateCart(items);
  }


  // =========================
  // REMOVE PRODUCT
  // =========================

  removeFromCart(
    product: CartProduct
  ): void {

    const items =
      this.getCart().filter(cartItem =>
        !(
          Number(cartItem.id) === Number(product.id) &&
          String(cartItem.color ?? '') ===
            String(product.color ?? '') &&
          String(cartItem.size ?? '') ===
            String(product.size ?? '')
        )
      );

    this.updateCart(items);
  }


  // =========================
  // CLEAR CART
  // =========================

  clearCart(): void {

    this.updateCart([]);

  }


  // =========================
  // SUBTOTAL
  // =========================

  getSubtotal(): number {

    return this.getCart().reduce(
      (total, product) =>
        total +
        Number(product.current_price) *
        product.quantity,
      0
    );

  }


  // =========================
  // DISCOUNT
  // =========================

  getDiscount(): number {

    return this.getCart().reduce(
      (total, product) => {

        const currentPrice =
          Number(product.current_price);

        const previousPrice =
          Number(product.previous_price);


        if (
          previousPrice > currentPrice &&
          previousPrice > 0
        ) {

          return total +
            (previousPrice - currentPrice) *
            product.quantity;

        }

        return total;

      },
      0
    );

  }


  // =========================
  // TOTAL
  // =========================

  getTotal(): number {

    return this.getSubtotal();

  }


  // =========================
  // ITEMS COUNT
  // =========================

  getItemsCount(): number {

    return this.getCart().reduce(
      (total, product) =>
        total + product.quantity,
      0
    );

  }


  // =========================
  // UPDATE CART
  // =========================

  private updateCart(
    items: CartProduct[]
  ): void {

    if (this.isBrowser) {

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(items)
      );

    }

    this.cartItemsSubject.next(items);
  }


  // =========================
  // LOAD CART FROM STORAGE
  // =========================

  private getCartFromStorage():
    CartProduct[] {

    if (!this.isBrowser) {
      return [];
    }


    const storedCart =
      localStorage.getItem(
        this.storageKey
      );


    if (!storedCart) {
      return [];
    }


    try {

      return JSON.parse(storedCart);

    } catch {

      return [];

    }

  }

}
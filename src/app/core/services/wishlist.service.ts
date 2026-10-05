import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface WishlistProduct {
  id: number;
  title: string;
  thumbnail: string;
  current_price: number;
  previous_price?: number;
  rating?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private storageKey = 'wishlist';

  private wishlistSubject = new BehaviorSubject<WishlistProduct[]>(
    this.getWishlistFromStorage()
  );

  wishlist$ = this.wishlistSubject.asObservable();

  constructor() {}

  private getWishlistFromStorage(): WishlistProduct[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const wishlist = localStorage.getItem(this.storageKey);

    return wishlist ? JSON.parse(wishlist) : [];
  }

  private saveWishlist(wishlist: WishlistProduct[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(wishlist));
    this.wishlistSubject.next(wishlist);
  }

  addToWishlist(product: WishlistProduct): void {
    const wishlist = this.getWishlistFromStorage();

    const exists = wishlist.some(item => item.id === product.id);

    if (!exists) {
      wishlist.push(product);
      this.saveWishlist(wishlist);
    }
  }

  removeFromWishlist(productId: number): void {
    const wishlist = this.getWishlistFromStorage();

    const updatedWishlist = wishlist.filter(
      item => item.id !== productId
    );

    this.saveWishlist(updatedWishlist);
  }

  isInWishlist(productId: number): boolean {
    const wishlist = this.getWishlistFromStorage();

    return wishlist.some(item => item.id === productId);
  }

  getWishlist(): WishlistProduct[] {
    return this.getWishlistFromStorage();
  }

  clearWishlist(): void {
    this.saveWishlist([]);
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  WishlistProduct,
  WishlistService
} from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {

  wishlist: WishlistProduct[] = [];

  constructor(
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {

    this.wishlistService.wishlist$.subscribe(
      products => {
        this.wishlist = products;
      }
    );

  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.removeFromWishlist(productId);
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist();
  }
}


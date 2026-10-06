import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { HomeService } from '../../../core/services/home.service';
import { CategoryService } from '../../../core/services/category.service';

import { ProductService } from '../../../core/services/product.service';
import { HomeData, Product } from '../../../core/models/home.model';
import { PartnerService } from '../../../core/services/partener.service';
import { Partner } from './../../../core/models/partener.model';
import { ServiceItem } from './../../../core/models/service.model';
import { CartService } from '../../../core/services/cart.service';

import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  private wishlistService = inject(WishlistService);

  // Services
  private homeService = inject(HomeService);
  private categoryService = inject(CategoryService);
  private partnerService = inject(PartnerService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
private toastService = inject(ToastService);
  // Home Data
  homeData: HomeData | null = null;

  // Products
  newArrivalProducts: Product[] = [];
  trendyProducts: Product[] = [];
  bestSellerProducts: Product[] = [];
  popularProducts: Product[] = [];

  featuredProducts: any[] = [];
  Service: ServiceItem[] = [];

  // Categories
  categories: any[] = [];

  // Partners
  partners: Partner[] = [];


  ngOnInit(): void {

    // =========================
    // HOME API
    // =========================

    this.homeService.getHome().subscribe({
      next: (response) => {

        console.log('HOME API RESPONSE:', response);

        this.homeData = response.data;

        // Featured Products
        this.featuredProducts =
          this.homeData.featured_products ?? [];

        // New Arrival
        this.newArrivalProducts =
          this.homeData.new_arrival_products ?? [];

        // Trending
        this.trendyProducts =
          this.homeData.trendy_products ?? [];

        // Best Seller
        this.bestSellerProducts =
          this.homeData.best_seller_products ?? [];

        // Popular
        this.popularProducts =
          this.homeData.popular_products ?? [];

        this.Service =
          this.homeData.services ?? [];

        console.log('NEW ARRIVAL:', this.newArrivalProducts);
        console.log('TRENDING:', this.trendyProducts);
        console.log('BEST SELLER:', this.bestSellerProducts);
        console.log('POPULAR:', this.popularProducts);
        console.log('FEATURED:', this.featuredProducts);
        console.log('services', this.Service);

      },

      error: (error) => {
        console.error('HOME API ERROR:', error);
      }
    });


    // =========================
    // CATEGORIES API
    // =========================

   this.categoryService.getCategories().subscribe({
  next: (response) => {

    console.log('CATEGORIES API RESPONSE:', response);

    this.categories = (response.data ?? []).map((category: any) => ({
      ...category,
      count: String(category.count ?? '0').match(/\d+/)?.[0] ?? '0'
    }));

    console.log('CATEGORIES:', this.categories);
  },

  error: (error) => {
    console.error('CATEGORIES API ERROR:', error);
  }
});


    // =========================
    // PARTNERS API
    // =========================

    this.partnerService.getPartners().subscribe({
      next: (response) => {

        console.log('PARTNERS API RESPONSE:', response);

        this.partners = response.data ?? [];

        console.log('PARTNERS:', this.partners);
      },

      error: (error) => {
        console.error('PARTNERS API ERROR:', error);
      }
    });

  }


addToCart(product: Product): void {
  this.cartService.addToCart({
    ...product,
    size: 'L',
    color:'white'
  } as any);
    this.toastService.showSuccess('Product added to cart successfully!');

}

  toggleWishlist(product: any): void {

    if (this.wishlistService.isInWishlist(product.id)) {

      this.wishlistService.removeFromWishlist(product.id);

    } else {

      this.wishlistService.addToWishlist({
        id: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        current_price: product.current_price,
        previous_price: product.previous_price,
        rating: product.rating
      });

    }
  }


  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

}
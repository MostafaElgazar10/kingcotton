import { Component, OnInit } from '@angular/core';
import {
  ProductService,
  Product,
  Category,
  ProductSearchParams
} from './../../../core/services/product.service';

import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

type SortOption = 'latest' | 'oldest' | 'low' | 'high';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  selector: 'app-product',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductComponent implements OnInit {

  products: Product[] = [];
  categories: Category[] = [];

  loading = false;
  errorMessage = '';

  viewMode: 'grid' | 'list' = 'grid';

  expandedCategories: number[] = [];

  selectedCategoryId: number | null = null;
  selectedSubcategoryId: number | null = null;

  // =========================
  // PRICE FILTER
  // =========================

  priceMin = 0;
  priceMax = 5000;

  appliedMin = 0;
  appliedMax = 5000;

  // =========================
  // SORT
  // =========================

  selectedSort: SortOption = 'latest';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private route: ActivatedRoute
  ) {}

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const categoryId = params['category'];
      const subcategoryId = params['subcategory'];

      this.selectedCategoryId = categoryId
        ? Number(categoryId)
        : null;

      this.selectedSubcategoryId = subcategoryId
        ? Number(subcategoryId)
        : null;

      this.loadProducts();
    });

    this.loadCategories();
  }

  // =========================
  // ADD TO CART
  // =========================

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  // =========================
  // WISHLIST
  // =========================

  toggleWishlist(product: Product): void {

    if (this.wishlistService.isInWishlist(product.id)) {

      this.wishlistService.removeFromWishlist(product.id);

    } else {

      this.wishlistService.addToWishlist({
        id: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        current_price: Number(product.current_price),
        previous_price: product.previous_price
          ? Number(product.previous_price)
          : undefined,
        rating: product.rating
          ? Number(product.rating)
          : undefined
      });

    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  // =========================
  // CATEGORY
  // =========================

  toggleCategory(categoryId: number): void {

    if (this.expandedCategories.includes(categoryId)) {

      this.expandedCategories =
        this.expandedCategories.filter(
          id => id !== categoryId
        );

    } else {

      this.expandedCategories.push(categoryId);
    }
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories.includes(categoryId);
  }

  selectCategory(categoryId: number): void {

    this.selectedCategoryId =
      this.selectedCategoryId === categoryId
        ? null
        : categoryId;

    this.selectedSubcategoryId = null;

    this.loadProducts();
  }

  selectSubcategory(subcategoryId: number): void {

    this.selectedSubcategoryId = subcategoryId;

    this.selectedCategoryId = null;

    this.loadProducts();
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryId === categoryId;
  }

  isSubcategorySelected(subcategoryId: number): boolean {
    return this.selectedSubcategoryId === subcategoryId;
  }

  // =========================
  // VIEW MODE
  // =========================

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // =========================
  // PRICE RANGE
  // =========================

  onMinPriceChange(): void {

    if (this.priceMin > this.priceMax) {
      this.priceMin = this.priceMax;
    }
  }

  onMaxPriceChange(): void {

    if (this.priceMax < this.priceMin) {
      this.priceMax = this.priceMin;
    }
  }

  applyFilter(): void {

    if (this.priceMin > this.priceMax) {
      this.priceMin = this.priceMax;
    }

    this.appliedMin = Number(this.priceMin);
    this.appliedMax = Number(this.priceMax);

    this.loadProducts();
  }

  clearFilter(): void {

    this.priceMin = 0;
    this.priceMax = 5000;

    this.appliedMin = 0;
    this.appliedMax = 5000;

    this.selectedCategoryId = null;
    this.selectedSubcategoryId = null;

    this.selectedSort = 'latest';

    this.loadProducts();
  }

  // =========================
  // SORT
  // =========================

  onSortChange(): void {
    this.products = this.sortProducts(this.products);
  }

  private sortProducts(list: Product[]): Product[] {

    const sorted = [...list];

    switch (this.selectedSort) {

      case 'low':
        return sorted.sort(
          (a, b) =>
            Number(a.current_price) -
            Number(b.current_price)
        );

      case 'high':
        return sorted.sort(
          (a, b) =>
            Number(b.current_price) -
            Number(a.current_price)
        );

      case 'oldest':
        return sorted.sort(
          (a, b) =>
            new Date(a.created_at ?? 0).getTime() -
            new Date(b.created_at ?? 0).getTime()
        );

      case 'latest':
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        );
    }
  }

  // =========================
  // LOCAL PRICE FILTER
  // =========================

  private filterByPrice(products: Product[]): Product[] {

    return products.filter(product => {

      const price = Number(product.current_price);

      return (
        price >= Number(this.appliedMin) &&
        price <= Number(this.appliedMax)
      );
    });
  }

  // =========================
  // PRODUCTS
  // =========================

  loadProducts(): void {

    this.loading = true;
    this.errorMessage = '';

    // =========================
    // SUBCATEGORY
    // =========================

    if (this.selectedSubcategoryId !== null) {

      this.productService
        .getProductsBySubcategory(this.selectedSubcategoryId)
        .subscribe({

          next: (response) => {

            if (response.status) {

              const filteredProducts =
                this.filterByPrice(response.data);

              this.products =
                this.sortProducts(filteredProducts);

            } else {

              this.products = [];
            }

            this.loading = false;
          },

          error: (error) => {

            console.error(
              'Subcategory API Error:',
              error
            );

            this.products = [];

            this.errorMessage =
              'Something went wrong while loading products.';

            this.loading = false;
          }
        });

      return;
    }

    // =========================
    // CATEGORY / ALL PRODUCTS
    // =========================

    const params: ProductSearchParams = {

      category:
        this.selectedCategoryId ?? undefined,

      min: this.appliedMin,

      max: this.appliedMax
    };

    this.productService
      .getProducts(params)
      .subscribe({

        next: (response) => {

          if (response.status) {

            const filteredProducts =
              this.filterByPrice(response.data);

            this.products =
              this.sortProducts(filteredProducts);

          } else {

            this.products = [];
          }

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Products API Error:',
            error
          );

          this.products = [];

          this.errorMessage =
            'Something went wrong while loading products.';

          this.loading = false;
        }
      });
  }

  // =========================
  // CATEGORIES
  // =========================

  loadCategories(): void {

    this.productService
      .getCategories()
      .subscribe({

        next: (response) => {

          if (response.status) {
            this.categories = response.data;
          }
        },

        error: (error) => {

          console.error(
            'Categories API Error:',
            error
          );
        }
      });
  }

  // =========================
  // PRICE
  // =========================

  hasPreviousPrice(product: Product): boolean {

    return !!product?.previous_price &&
      Number(product.previous_price) >
      Number(product.current_price);
  }

  getDiscount(product: Product): number {

    const current =
      Number(product.current_price);

    const previous =
      Number(product.previous_price);

    if (!previous || previous <= current) {
      return 0;
    }

    return Math.round(
      ((previous - current) / previous) * 100
    );
  }

  // =========================
  // RATING
  // =========================

  getStars(rating: string): number {
    return Number(rating);
  }
}
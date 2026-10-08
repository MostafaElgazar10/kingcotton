
import {
  Component,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';

import { WishlistService } from '../../../core/services/wishlist.service';

import {
  AuthService,
  User
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {

  // =========================
  // SERVICES
  // =========================

  private cartService = inject(CartService);

  private wishlistService = inject(WishlistService);

  private authService = inject(AuthService);

  private router = inject(Router);

  private destroy$ = new Subject<void>();


  // =========================
  // CART
  // =========================

  cartItemsCount = 0;


  // =========================
  // WISHLIST
  // =========================

  wishlistCount = 0;


  // =========================
  // USER
  // =========================

  currentUser: User | null = null;


  // =========================
  // MOBILE MENU
  // =========================

  mobileMenuOpen = false;


  // =========================
  // SEARCH
  // =========================

  searchTerm = '';

  selectedCategory = 'all';

  showCategories = false;


  // =========================
  // CATEGORIES
  // =========================

  categories = [
    {
      id: '28',
      name: "Men's Clothing"
    },
    {
      id: '32',
      name: 'Men'
    },
    {
      id: '33',
      name: 'Women'
    },
    {
      id: '34',
      name: 'Kids'
    }
  ];


  // =========================
  // LOGIN STATUS
  // =========================

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    // =========================
    // USER
    // =========================

    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });


    // =========================
    // CART
    // =========================

    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {

        this.cartItemsCount = items.reduce(
          (total, product) => total + product.quantity,
          0
        );

      });


    // =========================
    // WISHLIST
    // =========================

    this.wishlistService.wishlist$
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {

        this.wishlistCount = products.length;

      });

  }


  // =========================
  // MOBILE MENU
  // =========================

  openMobileMenu(): void {
    this.mobileMenuOpen = true;
  }


  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }


  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }


  // =========================
  // SEARCH
  // =========================

  searchProducts(): void {

    const search = this.searchTerm.trim();

    const queryParams: any = {};


    // Search text
    if (search) {
      queryParams.search = search;
    }


    // Category
    if (this.selectedCategory !== 'all') {
      queryParams.category = this.selectedCategory;
    }


    this.showCategories = false;

    this.closeMobileMenu();


    this.router.navigate(
      ['/products'],
      {
        queryParams
      }
    );

  }


  // =========================
  // SELECT CATEGORY
  // =========================

  selectCategory(categoryId: string): void {

    this.selectedCategory = categoryId;

    this.showCategories = false;


    this.router.navigate(
      ['/products'],
      {
        queryParams: {
          category: categoryId
        }
      }
    );


    this.closeMobileMenu();

  }


  // =========================
  // ALL CATEGORIES
  // =========================

  selectAllCategories(): void {

    this.selectedCategory = 'all';

    this.showCategories = false;


    this.router.navigate(
      ['/products']
    );


    this.closeMobileMenu();

  }


  // =========================
  // CATEGORY DROPDOWN
  // =========================

  toggleCategories(): void {
    this.showCategories = !this.showCategories;
  }


  // =========================
  // LOGOUT
  // =========================

logout(): void {
  this.router.navigate(['/profile']);
}


  // =========================
  // SELECTED CATEGORY NAME
  // =========================

  get selectedCategoryName(): string {

    if (this.selectedCategory === 'all') {
      return 'All Categories';
    }


    const category = this.categories.find(
      c => c.id === this.selectedCategory
    );


    return category?.name || 'All Categories';

  }


  // =========================
  // CLEANUP
  // =========================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }

}

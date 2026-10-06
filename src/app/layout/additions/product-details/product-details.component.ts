import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { ProductDetailsService } from '../../../core/services/product-details.service';

import {
  ProductDetails,
  RelatedProduct
} from '../../../core/models/product-details.model';

import { HomeService } from '../../../core/services/home.service';
import { CartService } from '../../../core/services/cart.service';


type ShareNetwork =
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'whatsapp';


@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {

  private route = inject(ActivatedRoute);

  private router = inject(Router);

  private platformId = inject(PLATFORM_ID);


  private productDetailsService =
    inject(ProductDetailsService);

  private homeService =
    inject(HomeService);

  private cartService =
    inject(CartService);
private toastService =
  inject(ToastService);

  product: ProductDetails | null = null;

  loading = false;

  errorMessage = '';


  selectedImage = '';

  selectedColor = '';

  selectedSize = '';


  quantity = 1;

  isWishlist = false;


  // =========================
  // Related Products
  // =========================

  homeProducts: RelatedProduct[] = [];

  relatedPage = 0;

  readonly relatedPageSize = 4;


  // =========================
  // Init
  // =========================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const productId = params.get('id');

      if (!productId) {

        this.errorMessage =
          'Product not found';

        return;
      }

      this.loadProduct(
        Number(productId)
      );

    });

  }


  // =========================
  // Product Details
  // =========================

  loadProduct(
    productId: number
  ): void {

    this.loading = true;

    this.errorMessage = '';


    this.productDetailsService
      .getProductDetails(productId)
      .subscribe({

        next: (response) => {

          this.product =
            response.data;


          if (!this.product) {

            this.errorMessage =
              'Product not found';

            this.loading = false;

            return;
          }


          // =========================
          // Main Image
          // =========================

          this.selectedImage =
            this.product.first_image ||
            this.product.thumbnail ||
            '';


          // =========================
          // First Color
          // =========================

          const colors =
            this.getColors();


          this.selectedColor =
            colors.length > 0
              ? colors[0]
              : '';


          // =========================
          // First Available Size
          // =========================

          const sizes =
            this.getSizes();


          const firstAvailable =
            sizes.findIndex(
              (_, index) =>
                Number(
                  this.product
                    ?.size_quantity?.[index]
                ) > 0
            );


          this.selectedSize =
            firstAvailable >= 0
              ? sizes[firstAvailable]
              : '';


          this.isWishlist =
            this.product.is_wishlist;


          this.quantity = 1;

          this.relatedPage = 0;


          // =========================
          // Load Related Products
          // =========================

          this.loadRelatedProducts();


          this.loading = false;


          // =========================
          // Scroll To Top
          // =========================

          if (
            isPlatformBrowser(
              this.platformId
            )
          ) {

            window.scrollTo({

              top: 0,

              behavior: 'smooth'

            });

          }

        },


        error: (error) => {

          console.error(
            'PRODUCT DETAILS API ERROR:',
            error
          );


          this.errorMessage =
            'Failed to load product details';


          this.loading = false;

        }

      });

  }


  // =========================
  // Home Products
  // =========================

  loadRelatedProducts(): void {

    this.homeService
      .getHome()
      .subscribe({

        next: (response) => {

          const products =
            response?.data?.products ?? [];


          this.homeProducts =
            products

              .filter(
                product =>
                  Number(product.id) !==
                  Number(this.product?.id)
              )

              .map(product => ({

                id:
                  product.id,

                title:
                  product.title,

                thumbnail:
                  product.thumbnail,

                rating:
                  product.rating,

                current_price:
                  product.current_price,

                previous_price:
                  product.previous_price,

                created_at:
                  product.created_at,

                updated_at:
                  product.updated_at

              }));


          this.relatedPage = 0;


          console.log(
            'RELATED PRODUCTS:',
            this.homeProducts
          );

        },


        error: (error) => {

          console.error(
            'HOME PRODUCTS API ERROR:',
            error
          );


          this.homeProducts = [];

        }

      });

  }


  // =========================
  // Gallery
  // =========================

  get galleryImages(): string[] {

    if (!this.product) {

      return [];

    }


    const images = [

      this.product.first_image,

      ...(this.product.images ?? [])
        .map(image => image.image)

    ].filter(Boolean);


    const uniqueImages =
      Array.from(
        new Set(images)
      );


    return uniqueImages.length

      ? uniqueImages

      : [
          this.product.thumbnail
        ];

  }


  selectImage(
    image: string,
    event?: Event
  ): void {

    event?.stopPropagation();

    this.selectedImage = image;

  }


  onImageError(
    event: Event
  ): void {

    const img =
      event.target as HTMLImageElement;


    if (
      this.product?.thumbnail &&
      img.src !==
        this.product.thumbnail
    ) {

      img.src =
        this.product.thumbnail;

    }

  }


  // =========================
  // Colors
  // =========================

  getColors(): string[] {

    const colors: any =
      this.product?.colors;


    if (Array.isArray(colors)) {

      return colors

        .map(
          color =>
            String(color)
        )

        .filter(Boolean);

    }


    if (typeof colors === 'string') {

      return colors

        .split(',')

        .map(
          color =>
            color.trim()
        )

        .filter(Boolean);

    }


    if (
      colors &&
      typeof colors === 'object'
    ) {

      return Object.keys(colors);

    }


    return [];

  }


  selectColor(
    color: string
  ): void {

    this.selectedColor =
      color;

  }


  // =========================
  // Sizes
  // =========================

  getSizes(): string[] {

    const sizes: any =
      this.product?.sizes;


    if (Array.isArray(sizes)) {

      return sizes

        .map(
          size =>
            String(size)
        )

        .filter(Boolean);

    }


    if (typeof sizes === 'string') {

      return sizes

        .split(',')

        .map(
          size =>
            size.trim()
        )

        .filter(Boolean);

    }


    if (
      sizes &&
      typeof sizes === 'object'
    ) {

      return Object.keys(sizes);

    }


    return [];

  }


  selectSize(
    size: string
  ): void {

    this.selectedSize =
      size;


    if (
      this.quantity >
      this.maxQuantity
    ) {

      this.quantity =
        this.maxQuantity;

    }

  }


  isSizeAvailable(
    index: number
  ): boolean {

    if (!this.product) {

      return false;

    }


    const sizes =
      this.getSizes();


    if (!sizes.length) {

      return true;

    }


    const quantity =
      Number(
        this.product
          .size_quantity?.[index]
      );


    return quantity > 0;

  }


  // =========================
  // Stock
  // =========================

  get inStock(): boolean {

    const product =
      this.product;


    if (!product) {

      return false;

    }


    const sizes =
      this.getSizes();


    if (sizes.length > 0) {

      return (
        product.size_quantity ?? []
      ).some(
        quantity =>
          Number(quantity) > 0
      );

    }


    if (
      product.stock === null ||
      product.stock === undefined
    ) {

      return true;

    }


    return Number(
      product.stock
    ) > 0;

  }


  get maxQuantity(): number {

    const product =
      this.product;


    if (!product) {

      return 1;

    }


    const sizes =
      this.getSizes();


    if (
      sizes.length > 0 &&
      this.selectedSize
    ) {

      const index =
        sizes.indexOf(
          this.selectedSize
        );


      const quantity =
        Number(
          product
            .size_quantity?.[index]
        );


      return quantity > 0
        ? quantity
        : 1;

    }


    if (
      product.stock !== null &&
      product.stock !== undefined
    ) {

      return Math.max(
        Number(product.stock),
        1
      );

    }


    return 99;

  }


  // =========================
  // Quantity
  // =========================

  increaseQuantity(): void {

    if (
      this.quantity <
      this.maxQuantity
    ) {

      this.quantity++;

    }

  }


  decreaseQuantity(): void {

    if (
      this.quantity > 1
    ) {

      this.quantity--;

    }

  }


  // =========================
  // Cart
  // =========================

  addToCart(): void {


    if (
      !this.product ||
      !this.inStock
    ) {

      return;

    }


    for (
      let i = 0;
      i < this.quantity;
      i++
    ) {

      this.cartService.addToCart({

        id:
          this.product.id,

        title:
          this.product.title,

        thumbnail:
          this.product.thumbnail,

        current_price:
          this.product.current_price,

        previous_price:
          this.product.previous_price,

        rating:
          this.product.rating,

        // =========================
        // SELECTED COLOR
        // =========================

        color:
          this.selectedColor,

        // =========================
        // SELECTED SIZE
        // =========================

        size:
          this.selectedSize

      });

    }

    this.toastService.showSuccess(
  'Product added to cart successfully!'
);

  }


  // =========================
  // Buy Now
  // =========================

  buyNow(): void {

    if (
      !this.product ||
      !this.inStock
    ) {

      return;

    }


    for (
      let i = 0;
      i < this.quantity;
      i++
    ) {

      this.cartService.addToCart({

        id:
          this.product.id,

        title:
          this.product.title,

        thumbnail:
          this.product.thumbnail,

        current_price:
          this.product.current_price,

        previous_price:
          this.product.previous_price,

        rating:
          this.product.rating,

        // =========================
        // SELECTED COLOR
        // =========================

        color:
          this.selectedColor,

        // =========================
        // SELECTED SIZE
        // =========================

        size:
          this.selectedSize

      });

    }


    this.router.navigate([
      '/cart'
    ]);

  }


  // =========================
  // Related Add To Cart
  // =========================

  addRelatedToCart(
    product: RelatedProduct
  ): void {

    this.cartService.addToCart({

      id:
        product.id,

      title:
        product.title,

      thumbnail:
        product.thumbnail,

      current_price:
        product.current_price,

      previous_price:
        product.previous_price,

      rating:
        product.rating

    });

  }


  // =========================
  // Wishlist
  // =========================

  toggleWishlist(): void {

    this.isWishlist =
      !this.isWishlist;

  }


  // =========================
  // Discount
  // =========================

  private calculateDiscount(
    currentPrice: string | number,
    previousPrice: string | number
  ): number {

    const current =
      Number(currentPrice);


    const previous =
      Number(previousPrice);


    if (
      !previous ||
      previous <= current
    ) {

      return 0;

    }


    return Math.round(

      (
        (previous - current) /
        previous
      ) * 100

    );

  }


  getDiscount(
    currentPrice?: string | number,
    previousPrice?: string | number
  ): number {

    if (
      currentPrice !== undefined &&
      previousPrice !== undefined
    ) {

      return this.calculateDiscount(
        currentPrice,
        previousPrice
      );

    }


    if (!this.product) {

      return 0;

    }


    return this.calculateDiscount(

      this.product.current_price,

      this.product.previous_price

    );

  }


  getItemDiscount(
    product: RelatedProduct
  ): number {

    return this.calculateDiscount(

      product.current_price,

      product.previous_price

    );

  }


  hasPreviousPrice(
    product: RelatedProduct
  ): boolean {

    const current =
      Number(
        product.current_price
      );


    const previous =
      Number(
        product.previous_price
      );


    return previous > current;

  }


  // =========================
  // Related Products
  // =========================

  get relatedProducts():
    RelatedProduct[] {

    return this.homeProducts;

  }


  get visibleRelated():
    RelatedProduct[] {

    const start =
      this.relatedPage *
      this.relatedPageSize;


    return this.relatedProducts.slice(

      start,

      start +
      this.relatedPageSize

    );

  }


  get relatedPages(): number[] {

    const pages =
      Math.ceil(

        this.relatedProducts.length /
        this.relatedPageSize

      );


    return Array.from(

      {
        length: pages
      },

      (_, index) =>
        index

    );

  }


  changeRelatedPage(
    page: number
  ): void {

    if (
      page >= 0 &&
      page <
      this.relatedPages.length
    ) {

      this.relatedPage =
        page;

    }

  }


  nextRelatedPage(): void {

    if (
      this.relatedPage <
      this.relatedPages.length - 1
    ) {

      this.relatedPage++;

    }

  }


  previousRelatedPage(): void {

    if (
      this.relatedPage > 0
    ) {

      this.relatedPage--;

    }

  }


  // =========================
  // Rating
  // =========================

  getRatingStars(
    rating: string | number
  ): number[] {

    const value =
      Math.round(
        Number(rating) || 0
      );


    return Array.from(

      {
        length: 5
      },

      (_, index) =>
        index < value
          ? 1
          : 0

    );

  }


  // =========================
  // Share
  // =========================

  share(
    network: ShareNetwork
  ): void {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;

    }


    const url =
      encodeURIComponent(
        window.location.href
      );


    const title =
      encodeURIComponent(

        this.product?.title ??
        'Product'

      );


    let shareUrl = '';


    switch (network) {

      case 'facebook':

        shareUrl =
          `https://www.facebook.com/sharer/sharer.php?u=${url}`;

        break;


      case 'twitter':

        shareUrl =
          `https://twitter.com/intent/tweet?url=${url}&text=${title}`;

        break;


      case 'linkedin':

        shareUrl =
          `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;

        break;


      case 'whatsapp':

        shareUrl =
          `https://wa.me/?text=${title}%20${url}`;

        break;

    }


    if (shareUrl) {

      window.open(

        shareUrl,

        '_blank',

        'width=600,height=500'

      );

    }

  }

  

  // =========================
  // Back
  // =========================

  goBack(): void {

    this.router.navigate([
      '/products'
    ]);

  }

}
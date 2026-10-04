import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartProduct } from '../../../core/services/cart.service';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { CheckoutOrderPayload } from '../../../core/models/checkout.model';


export interface CheckoutItem extends CartProduct {
  shopName: string;
  shopPhone: string;
  shopAddress: string;
}

export interface ShippingOption {
  id: string;
  label: string;
  duration: string;
  cost: number;
}

export interface PackagingOption {
  id: string;
  label: string;
  cost: number;
}

export interface ShopGroup {
  shopName: string;
  shopPhone: string;
  shopAddress: string;
  items: CheckoutItem[];
  shippingOptionId: string;
  packagingOptionId: string;
}

@Component({
  selector: 'app-checkout-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkoutdetails.component.html',
  styleUrls: ['./checkoutdetails.component.css']
})
export class CheckoutDetailsComponent implements OnInit {

  private cartService = inject(CartService);
  private router = inject(Router);
  private checkoutStateService = inject(CheckoutStateService);

  billingAddress: CheckoutOrderPayload = {
    name: '',
    address: '',
    phone: '',
    email: '',
    country: '',
    state: '',
    city: '',
    postal_code: '',
    coupon_code: null
  };

  private readonly defaultShop = {
    shopName: 'Genius Store',
    shopPhone: '01629552892',
    shopAddress: 'Egypt'
  };

  readonly shippingOptions: ShippingOption[] = [
    { id: 'free', label: 'Free Shipping', duration: '10 - 12 days', cost: 0 },
    { id: 'express', label: 'Express Shipping', duration: '5 - 6 days', cost: 10 }
  ];

  readonly packagingOptions: PackagingOption[] = [
    { id: 'default', label: 'Default Packaging', cost: 0 },
    { id: 'premium', label: 'Premium Packaging', cost: 10 }
  ];

  cartItems: CheckoutItem[] = [];
  shopGroups: ShopGroup[] = [];

  taxPercentage = 0;

  activeModal: 'shipping' | 'package' | null = null;
  activeGroupIndex: number | null = null;

  ngOnInit(): void {

    const saved = this.checkoutStateService.getBillingAddress();

    if (saved) {
      this.billingAddress = saved;
    }

    this.cartService.cartItems$.subscribe(items => {

      this.cartItems = items.map(item => ({
        ...item,
        ...this.defaultShop
      }));

      this.shopGroups = this.groupByShop(this.cartItems);

    });

  }

  private groupByShop(items: CheckoutItem[]): ShopGroup[] {

    const groupsMap = new Map<string, ShopGroup>();

    for (const item of items) {

      const key = item.shopName + '|' + item.shopPhone + '|' + item.shopAddress;

      if (!groupsMap.has(key)) {

        groupsMap.set(key, {
          shopName: item.shopName,
          shopPhone: item.shopPhone,
          shopAddress: item.shopAddress,
          items: [],
          shippingOptionId: 'free',
          packagingOptionId: 'default'
        });

      }

      groupsMap.get(key)!.items.push(item);

    }

    return Array.from(groupsMap.values());

  }

  getItemTotal(item: CartProduct): number {
    return Number(item.current_price) * item.quantity;
  }

  getItemDiscount(item: CartProduct): number {

    const current = Number(item.current_price);
    const previous = Number(item.previous_price);

    if (!previous || previous <= current) {
      return 0;
    }

    return Math.round(((previous - current) / previous) * 100);
  }

  getShippingOption(group: ShopGroup): ShippingOption {
    return this.shippingOptions.find(o => o.id === group.shippingOptionId)
      ?? this.shippingOptions[0];
  }

  getPackagingOption(group: ShopGroup): PackagingOption {
    return this.packagingOptions.find(o => o.id === group.packagingOptionId)
      ?? this.packagingOptions[0];
  }

  openShippingModal(groupIndex: number): void {
    this.activeModal = 'shipping';
    this.activeGroupIndex = groupIndex;
  }

  openPackageModal(groupIndex: number): void {
    this.activeModal = 'package';
    this.activeGroupIndex = groupIndex;
  }

  closeModal(): void {
    this.activeModal = null;
    this.activeGroupIndex = null;
  }

  selectShippingOption(optionId: string): void {

    if (this.activeGroupIndex === null) {
      return;
    }

    this.shopGroups[this.activeGroupIndex].shippingOptionId = optionId;

  }

  selectPackagingOption(optionId: string): void {

    if (this.activeGroupIndex === null) {
      return;
    }

    this.shopGroups[this.activeGroupIndex].packagingOptionId = optionId;

  }

  get totalMRP(): number {
    return this.cartService.getSubtotal();
  }

  get shippingCost(): number {
    return this.shopGroups.reduce(
      (total, group) => total + this.getShippingOption(group).cost,
      0
    );
  }

  get packagingCost(): number {
    return this.shopGroups.reduce(
      (total, group) => total + this.getPackagingOption(group).cost,
      0
    );
  }

  get finalPrice(): number {

    const taxAmount = (this.totalMRP * this.taxPercentage) / 100;

    return this.totalMRP + taxAmount + this.shippingCost + this.packagingCost;

  }

  goToAddressStep(): void {
    this.router.navigate(['/checkout']);
  }

  onContinue(): void {
    this.router.navigate(['/checkout3']);
  }

  goToPreviousStep(): void {
    this.router.navigate(['/checkout']);
  }

}
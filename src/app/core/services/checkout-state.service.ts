import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { CheckoutOrderPayload } from '../models/checkout.model';

const STORAGE_KEY = 'checkout_billing_address';

@Injectable({
  providedIn: 'root'
})
export class CheckoutStateService {

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private billingAddressSubject =
    new BehaviorSubject<CheckoutOrderPayload | null>(
      this.loadFromStorage()
    );

  billingAddress$ = this.billingAddressSubject.asObservable();

  setBillingAddress(payload: CheckoutOrderPayload): void {

    if (this.isBrowser) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }

    this.billingAddressSubject.next(payload);

  }

  getBillingAddress(): CheckoutOrderPayload | null {
    return this.billingAddressSubject.value;
  }

  private loadFromStorage(): CheckoutOrderPayload | null {

    if (!this.isBrowser) {
      return null;
    }

    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }

  }

}
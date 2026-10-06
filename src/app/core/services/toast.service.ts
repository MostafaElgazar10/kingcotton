
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject =
    new BehaviorSubject<ToastMessage | null>(null);

  toast$ =
    this.toastSubject.asObservable();

  private timeoutId?: ReturnType<typeof setTimeout>;

  showSuccess(message: string): void {

    this.show({
      message,
      type: 'success'
    });

  }

  showError(message: string): void {

    this.show({
      message,
      type: 'error'
    });

  }

  private show(toast: ToastMessage): void {

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.toastSubject.next(toast);

    this.timeoutId =
      setTimeout(() => {

        this.toastSubject.next(null);

      }, 3000);

  }

  hide(): void {

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.toastSubject.next(null);

  }

}

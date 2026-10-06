import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject =
    new BehaviorSubject<ToastMessage[]>([]);

  toast$ =
    this.toastSubject.asObservable();

  private toastId = 0;

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

  private show(toast: Omit<ToastMessage, 'id'>): void {

    const newToast: ToastMessage = {
      ...toast,
      id: ++this.toastId
    };

    const currentToasts = this.toastSubject.value;

    this.toastSubject.next([
      ...currentToasts,
      newToast
    ]);

    setTimeout(() => {

      this.remove(newToast.id);

    }, 3000);

  }

  remove(id: number): void {

    const currentToasts = this.toastSubject.value;

    this.toastSubject.next(
      currentToasts.filter(toast => toast.id !== id)
    );

  }

  hide(): void {

    this.toastSubject.next([]);

  }

}
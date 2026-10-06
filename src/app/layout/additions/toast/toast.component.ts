
import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ToastService,
  ToastMessage
} from '../../../core/services/toast.service';


@Component({
  selector: 'app-toast',

  standalone: true,

  imports: [
    CommonModule
  ],

  template: `
    <div
      *ngIf="toast$ | async as toast"
      class="toast-container"
      [class.error]="toast.type === 'error'"
    >

      <div class="toast-icon">
        <i
          class="fa-solid"
          [class.fa-check]="toast.type === 'success'"
          [class.fa-xmark]="toast.type === 'error'"
        ></i>
      </div>

      <div class="toast-message">
        {{ toast.message }}
      </div>

      <button
        type="button"
        class="toast-close"
        (click)="close()"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

    </div>
  `,

  styles: [`
    .toast-container {
      position: fixed;
      top: 25px;
      right: 25px;
      z-index: 99999;

      min-width: 320px;
      max-width: 420px;

      display: flex;
      align-items: center;
      gap: 12px;

      padding: 14px 18px;

      background: #ffffff;
      border-radius: 8px;

      box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.15);

      border-left: 4px solid #198754;

      animation:
        toastSlideIn 0.35s ease forwards;
    }

    .toast-container.error {
      border-left-color: #dc3545;
    }

    .toast-icon {
      width: 32px;
      height: 32px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 50%;

      background: #198754;
      color: #ffffff;

      flex-shrink: 0;
    }

    .toast-container.error .toast-icon {
      background: #dc3545;
    }

    .toast-message {
      flex: 1;

      font-size: 14px;
      font-weight: 500;

      color: #333333;
    }

    .toast-close {
      border: 0;
      background: transparent;

      color: #888888;

      cursor: pointer;

      font-size: 14px;

      padding: 4px;
    }

    .toast-close:hover {
      color: #333333;
    }

    @keyframes toastSlideIn {

      from {
        opacity: 0;
        transform: translateX(100%);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }

    }

    @media (max-width: 576px) {

      .toast-container {
        top: 15px;
        right: 15px;
        left: 15px;

        min-width: auto;
        max-width: none;
      }

    }
  `]
})
export class ToastComponent {

  private toastService =
    inject(ToastService);

  toast$ =
    this.toastService.toast$;


  close(): void {

    this.toastService.hide();

  }

}

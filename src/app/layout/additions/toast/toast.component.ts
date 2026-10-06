import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ToastService
} from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',

  standalone: true,

  imports: [
    CommonModule
  ],

  template: `

    <div class="app-toast-wrapper">

      <div
        *ngFor="let toast of (toast$ | async)"
        class="app-toast-item"
        [class.app-toast-error]="toast.type === 'error'"
      >

        <div class="app-toast-icon">

          <i
            class="fa-solid"
            [class.fa-check]="toast.type === 'success'"
            [class.fa-xmark]="toast.type === 'error'"
          ></i>

        </div>

        <div class="app-toast-message">
          {{ toast.message }}
        </div>

        <button
          type="button"
          class="app-toast-close"
          (click)="close(toast.id)"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

      </div>

    </div>
  `,

  styles: [`

    .app-toast-wrapper {
      position: fixed !important;

      top: 25px !important;
      right: 25px !important;

      width: 380px;

      max-width: calc(100vw - 50px);

      z-index: 999999 !important;

      display: flex;

      flex-direction: column;

      align-items: stretch;

      gap: 10px;

      pointer-events: none;
    }


    .app-toast-item {
      width: 100%;

      min-height: 60px;

      box-sizing: border-box;

      display: flex;

      align-items: center;

      gap: 12px;

      padding: 14px 16px;

      background: #ffffff;

      border-radius: 8px;

      border-left: 4px solid #198754;

      box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.15);

      pointer-events: auto;

      animation: appToastSlideIn 0.35s ease-out;

      overflow: hidden;
    }


    .app-toast-item.app-toast-error {
      border-left-color: #dc3545;
    }


    .app-toast-icon {
      width: 32px;

      height: 32px;

      min-width: 32px;

      display: flex;

      align-items: center;

      justify-content: center;

      border-radius: 50%;

      background: #198754;

      color: #ffffff;
    }


    .app-toast-error .app-toast-icon {
      background: #dc3545;
    }


    .app-toast-message {
      flex: 1;

      min-width: 0;

      font-size: 14px;

      font-weight: 500;

      color: #333333;

      word-break: break-word;
    }


    .app-toast-close {
      width: 28px;

      height: 28px;

      min-width: 28px;

      padding: 0;

      border: 0;

      background: transparent;

      color: #888888;

      cursor: pointer;

      display: flex;

      align-items: center;

      justify-content: center;
    }


    .app-toast-close:hover {
      color: #333333;
    }


    @keyframes appToastSlideIn {

      from {
        opacity: 0;
        transform: translateX(30px);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }

    }


    @media (max-width: 576px) {

      .app-toast-wrapper {
        top: 15px !important;

        right: 15px !important;

        left: 15px !important;

        width: auto;

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


  close(id: number): void {

    this.toastService.remove(id);

  }

}
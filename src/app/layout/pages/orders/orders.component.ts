import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  total: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {

  loading = false;

  orders: Order[] = [
    {
      id: 1024,
      orderNumber: '1024',
      date: 'October 4, 2026',
      paymentMethod: 'Cash On Delivery',
      status: 'Pending',
      total: 364
    },
    {
      id: 1023,
      orderNumber: '1023',
      date: 'September 28, 2026',
      paymentMethod: 'Cash On Delivery',
      status: 'Processing',
      total: 520
    },
    {
      id: 1022,
      orderNumber: '1022',
      date: 'September 20, 2026',
      paymentMethod: 'Cash On Delivery',
      status: 'Completed',
      total: 750
    }
  ];

  constructor(
    private router: Router
  ) {}

  get ordersCount(): number {
    return this.orders.length;
  }

  viewOrder(orderId: number): void {
    // Later:
    // this.router.navigate(['/orders', orderId]);

    console.log('View order:', orderId);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';

      case 'Processing':
        return 'status-processing';

      case 'Completed':
        return 'status-completed';

      case 'Cancelled':
        return 'status-cancelled';

      default:
        return '';
    }
  }
}
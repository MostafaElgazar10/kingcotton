import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/services/product.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  private categoryService = inject(CategoryService);

  categories: Category[] = [];

  newsletterEmail = '';
  newsletterMessage = '';

  currentYear = new Date().getFullYear();

  ngOnInit(): void {

    this.categoryService.getCategories().subscribe({

      next: (response: any) => {

        if (response.status) {
          this.categories = (response.data ?? []).slice(0, 4);
        }

      },

      error: (error) => {
        console.error('FOOTER CATEGORIES ERROR:', error);
      }

    });

  }

  goToCategory(categoryId: number): void {
    window.location.href = `/products?category=${categoryId}`;
  }

  onSubscribe(): void {

    if (!this.newsletterEmail) {
      this.newsletterMessage = 'من فضلك اكتب بريدك الإلكتروني.';
      return;
    }

    console.log('Newsletter signup:', this.newsletterEmail);

    this.newsletterMessage = 'تم الاشتراك بنجاح!';
    this.newsletterEmail = '';

  }

}
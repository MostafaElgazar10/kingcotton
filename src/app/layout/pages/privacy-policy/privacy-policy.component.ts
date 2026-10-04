
import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  PageService
} from '../../../core/services/page.service';

import {
  Page
} from '../../../core/models/page.model';

import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-privacy-policy',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent implements OnInit {

  private pageService = inject(PageService);

  page: Page | null = null;

  loading = true;

  error = false;


  ngOnInit(): void {

    this.loadPrivacyPage();

  }


  // ==========================================
  // LOAD PRIVACY PAGE
  // ==========================================

  loadPrivacyPage(): void {

    this.loading = true;

    this.error = false;

    this.pageService
      .getPageBySlug('privacy')
      .subscribe({

        next: page => {

          this.page = page;

          this.loading = false;

        },

        error: error => {

          console.error(
            'PRIVACY PAGE API ERROR:',
            error
          );

          this.loading = false;

          this.error = true;

        }

      });

  }


  // ==========================================
  // FORMAT CONTENT
  // ==========================================

  formatContent(content: string): string {

    if (!content) {
      return '';
    }


    let formatted = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();


    // ==========================================
    // REMOVE MAIN TITLE
    // ==========================================

    formatted = formatted.replace(
      /^Privacy Policy\s*/i,
      ''
    );


    // ==========================================
    // EFFECTIVE DATE
    // ==========================================

    formatted = formatted.replace(
      /Effective Date:\s*\[([^\]]+)\]/i,
      `<div class="privacy-date">
        <strong>Effective Date:</strong> $1
      </div>`
    );


    // ==========================================
    // MAIN HEADINGS
    // 1. Information We Collect
    // 2. How We Use Your Information
    // ==========================================

    formatted = formatted.replace(
      /(\d+\.\s+[A-Z][^\n]*?)(?=\s+(?:[A-Z][a-z]+|[a-z]\.))/g,
      '<h2>$1</h2>'
    );


    // ==========================================
    // SUB HEADINGS
    // a. Personal Information
    // b. Non-Personal Information
    // ==========================================

    formatted = formatted.replace(
      /([a-z]\.\s+[A-Z][A-Za-z\s-]+?)(?=\s+(?:[A-Z][A-Za-z\s&'-]+:))/g,
      '<h3>$1</h3>'
    );


    // ==========================================
    // BULLET ITEMS
    // Account Information:
    // Payment Information:
    // Shipping Information:
    // ==========================================

    formatted = formatted.replace(
      /(?<![A-Za-z])([A-Z][A-Za-z\s&'-]+):\s+/g,
      '<strong>$1:</strong> '
    );


    // ==========================================
    // LINE BREAKS
    // ==========================================

    formatted = formatted.replace(
      /\n+/g,
      '</p><p>'
    );


    // ==========================================
    // CLEAN EMPTY PARAGRAPHS
    // ==========================================

    formatted = formatted
      .replace(
        /<p>\s*<\/p>/g,
        ''
      );


    // ==========================================
    // WRAP CONTENT
    // ==========================================

    if (
      !formatted.startsWith('<div') &&
      !formatted.startsWith('<p>')
    ) {

      formatted =
        `<p>${formatted}</p>`;

    }


    return formatted;

  }

}

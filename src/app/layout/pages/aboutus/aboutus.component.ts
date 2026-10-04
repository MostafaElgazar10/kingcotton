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
  selector: 'app-aboutus',
  standalone: true,

  imports: [
    CommonModule,RouterLink
  ],

  templateUrl: './aboutus.component.html',
  styleUrl: './aboutus.component.css'
})
export class AboutusComponent implements OnInit {

  private pageService = inject(PageService);

  page: Page | null = null;

  loading = true;

  error = false;

  ngOnInit(): void {

    this.loadAboutPage();

  }


  // ==========================================
  // LOAD ABOUT PAGE
  // ==========================================

  loadAboutPage(): void {

    this.loading = true;

    this.error = false;

    this.pageService
      .getPageBySlug('about')
      .subscribe({

        next: page => {

          this.page = page;

          this.loading = false;

        },

        error: error => {

          console.error(
            'ABOUT PAGE API ERROR:',
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

    let formatted = content;

    const headings = [
      'About Genius Shop',
      'Our Story',
      'Our Mission',
      'What Makes Us Different?',
      'Our Values',
      'Our Vision for the Future',
      'Join Us on Our Journey'
    ];

    headings.forEach(heading => {

      formatted = formatted.replace(
        heading,
        `|||${heading}|||`
      );

    });

    const sections = formatted
      .split('|||')
      .filter(section => section.trim() !== '');

    return sections
      .map(section => {

        const cleanSection = section.trim();

        if (headings.includes(cleanSection)) {

          return `<h2>${cleanSection}</h2>`;

        }

        return `<p>${cleanSection}</p>`;

      })
      .join('');

  }

}
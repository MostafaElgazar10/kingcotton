import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Page,
  PagesResponse
} from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class PageService {

  private http = inject(HttpClient);

  private baseUrl = 'https://trainstore.topbusiness.io/api';

  getPages(): Observable<PagesResponse> {

    return this.http.get<PagesResponse>(
      `${this.baseUrl}/front/pages`
    );

  }

  getPageBySlug(slug: string): Observable<Page | null> {

    return new Observable(observer => {

      this.getPages().subscribe({

        next: response => {

          const page = response.data?.find(
            item => item.slug === slug
          );

          observer.next(page ?? null);
          observer.complete();

        },

        error: error => {
          observer.error(error);
        }

      });

    });

  }
}
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

private http = inject(HttpClient);

  private apiUrl = 'https://trainstore.topbusiness.io/api';

  getCategories(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/front/categories`
    );
  }



}

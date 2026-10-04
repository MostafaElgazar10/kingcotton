
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  title: string;
  thumbnail: string;
  rating: string;
  current_price: string;
  previous_price: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  child_category: any[];
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  image: string;
  count: string;
  sub_categories: SubCategory[];
  attributes: string;
}

export interface ApiResponse<T> {
  status: boolean;
  data: T[];
  error: any[];
}

export interface ProductSearchParams {
  search?: string;
  category?: number;
  min?: number;
  max?: number;
  sort?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl =
    'https://trainstore.topbusiness.io/api/front';

  constructor(private http: HttpClient) {}

  // =========================
  // GET PRODUCTS
  // =========================
  getProducts(
    params: ProductSearchParams = {}
  ): Observable<ApiResponse<Product>> {

    let httpParams = new HttpParams();

    if (params.search) {
      httpParams = httpParams.set(
        'search',
        params.search
      );
    }

    if (params.category !== undefined) {
      httpParams = httpParams.set(
        'category',
        params.category.toString()
      );
    }

    if (params.min !== undefined) {
      httpParams = httpParams.set(
        'min',
        params.min.toString()
      );
    }

    if (params.max !== undefined) {
      httpParams = httpParams.set(
        'max',
        params.max.toString()
      );
    }

    if (params.sort) {
      httpParams = httpParams.set(
        'sort',
        params.sort
      );
    }

    return this.http.get<ApiResponse<Product>>(
      `${this.baseUrl}/search`,
      { params: httpParams }
    );
  }

  // =========================
  // GET PRODUCTS BY SUBCATEGORY
  // =========================
  getProductsBySubcategory(
    subcategoryId: number
  ): Observable<ApiResponse<Product>> {

    const params = new HttpParams().set(
      'subcategory',
      subcategoryId.toString()
    );

    return this.http.get<ApiResponse<Product>>(
      `${this.baseUrl}/search`,
      { params }
    );
  }

  // =========================
  // GET CATEGORIES
  // =========================
  getCategories(): Observable<ApiResponse<Category>> {

    return this.http.get<ApiResponse<Category>>(
      `${this.baseUrl}/categories`
    );
  }
}
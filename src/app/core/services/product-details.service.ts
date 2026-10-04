import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
ProductDetailsResponse
} from '../models/product-details.model';

@Injectable({
providedIn: 'root'
})
export class ProductDetailsService {

private baseUrl =
'https://trainstore.topbusiness.io/api/front';

constructor(
private http: HttpClient
) {}

getProductDetails(productId: number) {
return this.http.get<ProductDetailsResponse>(
`${this.baseUrl}/product/${productId}/details`
);
}
}

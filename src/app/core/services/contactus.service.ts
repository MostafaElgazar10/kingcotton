
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  status: boolean;
  data: {
    message: string;
  };
  error: any;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private baseUrl =
    'https://trainstore.topbusiness.io/api/front';

  constructor(private http: HttpClient) {}

  sendMessage(data: ContactRequest): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(
      `${this.baseUrl}/contactmail`,
      data
    );
  }
}
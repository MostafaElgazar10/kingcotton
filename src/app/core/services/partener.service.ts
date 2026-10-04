import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partner } from './../models/partener.model';



@Injectable({
  providedIn: 'root'
})
export class PartnerService {

  private http = inject(HttpClient);

  private apiUrl = 'https://trainstore.topbusiness.io/api/front/partners';

  getPartners(): Observable<{ status: boolean; data: Partner[]; error: any[] }> {
    return this.http.get<{ status: boolean; data: Partner[]; error: any[] }>(
      this.apiUrl
    );
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Base URL de l'API, par défaut localhost si non configuré
  private API_URL = environment.base_url || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, options?: any) {
    return this.http.get<T>(`${this.API_URL}/${endpoint}`, options);
  }

  post<T>(endpoint: string, body: any, options?: any) {
    // Ne pas ajouter de headers si l'endpoint est /login (géré par l'interceptor)
    const defaultHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    return this.http.post<T>(`${this.API_URL}/${endpoint}`, body, {
      ...options,
      headers: options?.headers || defaultHeaders,
    });
  }

  put<T>(endpoint: string, body: any, options?: any) {
    return this.http.put<T>(`${this.API_URL}/${endpoint}`, body, options);
  }

  patch<T>(endpoint: string, body: any, options?: any) {
    return this.http.patch<T>(`${this.API_URL}/${endpoint}`, body, options);
  }

  delete<T>(endpoint: string, options?: any) {
    return this.http.delete<T>(`${this.API_URL}/${endpoint}`, options);
  }

  getOrganisationInfo<T>(endpoint: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'ngrok-skip-browser-warning': '69420',
      'ngrok-skip-notify': 'true',
      'ngrok-skip-welcome': 'true',
    });
    return this.http.get<T>(`${this.API_URL}/organisations/info/${endpoint}`, {
      headers,
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import {
  CreateNotificationRequest,
  CreateNotificationResponse,
  INotification,
} from '../models/notificacao.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificacaoService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  enviarNotificacao(request: CreateNotificationRequest): Observable<CreateNotificationResponse> {
    return this.http.post<CreateNotificationResponse>(`${this.apiUrl}/notificar`, request);
  }

  consultarStatus(mensagemId: string): Observable<INotification> {
    return this.http.get<INotification>(`${this.apiUrl}/notificacao/status/${mensagemId}`);
  }
}
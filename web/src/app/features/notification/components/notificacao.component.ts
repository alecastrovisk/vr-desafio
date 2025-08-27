import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, Subject, takeUntil } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateNotificationRequest,
  INotification,
  NotificationStatus,
} from '../models/notificacao.interface';
import { NotificacaoService } from '../services/notificacao.service';

@Component({
  selector: 'app-notificacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificacao.component.html',
  styleUrl: './notificacao.component.css',
})
export class NotificacaoComponent implements OnInit, OnDestroy {
  conteudoMensagem: string = '';
  notificacoes: INotification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificacaoService: NotificacaoService) {}

  ngOnInit(): void {
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.atualizarStatusNotificacoes();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  enviarNotificacao(): void {
    if (!this.conteudoMensagem.trim()) {
      alert('Por favor, insira o conteúdo da mensagem.');
      return;
    }

    const mensagemId = uuidv4();
    const request: CreateNotificationRequest = {
      mensagemId,
      conteudoMensagem: this.conteudoMensagem,
    };

    const novaNotificacao: INotification = {
      mensagemId,
      conteudoMensagem: this.conteudoMensagem,
      status: NotificationStatus.AGUARDANDO_PROCESSAMENTO,
      timestamp: new Date(),
    };

    this.notificacoes.unshift(novaNotificacao);

    this.notificacaoService
      .enviarNotificacao(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Notificação enviada com sucesso:', response);
        },
        error: (error) => {
          console.error('Erro ao enviar notificação:', error);
          const notificacao = this.notificacoes.find((n) => n.mensagemId === mensagemId);
          if (notificacao) {
            notificacao.status = NotificationStatus.FALHA_PROCESSAMENTO;
          }
        },
      });

    this.conteudoMensagem = '';
  }

  private atualizarStatusNotificacoes(): void {
    this.notificacoes.forEach((notificacao) => {
      if (notificacao.status === NotificationStatus.AGUARDANDO_PROCESSAMENTO) {
        this.notificacaoService
          .consultarStatus(notificacao.mensagemId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response && response.status) {
                notificacao.status = response.status;
                notificacao.timestamp = new Date(response.timestamp);
              }
            },
            error: (error) => {
              console.error('Erro ao consultar status:', error);
            },
          });
      }
    });
  }

  getStatusClass(status: NotificationStatus): string {
    switch (status) {
      case NotificationStatus.AGUARDANDO_PROCESSAMENTO:
        return 'status-aguardando';
      case NotificationStatus.PROCESSADO_SUCESSO:
        return 'status-sucesso';
      case NotificationStatus.FALHA_PROCESSAMENTO:
        return 'status-falha';
      default:
        return '';
    }
  }

  getStatusText(status: NotificationStatus): string {
    switch (status) {
      case NotificationStatus.AGUARDANDO_PROCESSAMENTO:
        return 'Aguardando Processamento';
      case NotificationStatus.PROCESSADO_SUCESSO:
        return 'Processado com Sucesso';
      case NotificationStatus.FALHA_PROCESSAMENTO:
        return 'Falha no Processamento';
      default:
        return status;
    }
  }

  trackByMensagemId(index: number, notificacao: INotification): string {
    return notificacao.mensagemId;
  }
}

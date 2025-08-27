export interface INotification {
  mensagemId: string;
  conteudoMensagem: string;
  status: NotificationStatus;
  timestamp: Date;
}

export enum NotificationStatus {
  AGUARDANDO_PROCESSAMENTO = 'AGUARDANDO_PROCESSAMENTO',
  PROCESSADO_SUCESSO = 'PROCESSADO_SUCESSO',
  FALHA_PROCESSAMENTO = 'FALHA_PROCESSAMENTO',
}

export interface CreateNotificationRequest {
  mensagemId: string;
  conteudoMensagem: string;
}

export interface CreateNotificationResponse {
  messageId: string;
}
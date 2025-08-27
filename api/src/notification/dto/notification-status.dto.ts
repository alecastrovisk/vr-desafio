import { MessageStatus } from 'src/shared/enums/message-status.enum';

export class NotificationStatusDto {
  mensagemId: string;
  status: MessageStatus;
  conteudoMensagem?: string;
  timestamp: Date;
}

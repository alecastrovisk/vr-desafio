import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { MessageStatus } from 'src/shared/enums/message-status.enum';

export class UpdateNotificationStatusDto {
  @IsUUID('4', { message: 'mensagemId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'mensagemId não pode ser vazio' })
  mensagemId: string;

  @IsEnum(MessageStatus, {
    message: 'status deve ser um valor válido do enum MessageStatus',
  })
  @IsNotEmpty({ message: 'status não pode ser vazio' })
  status: MessageStatus;
}

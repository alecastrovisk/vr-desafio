import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID('4', { message: 'mensagemId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'mensagemId não pode ser vazio' })
  mensagemId: string;

  @IsString({ message: 'conteudoMensagem deve ser uma string' })
  @IsNotEmpty({ message: 'conteudoMensagem não pode ser vazio' })
  conteudoMensagem: string;
}

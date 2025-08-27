import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageStatus } from '../shared/enums/message-status.enum';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let clientProxyMock: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    clientProxyMock = {
      emit: jest.fn().mockReturnValue({
        toPromise: jest.fn().mockResolvedValue(undefined),
      }),
    } as unknown as jest.Mocked<ClientProxy>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: 'NOTIFICATION_SERVICE',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should emit a message to RabbitMQ and return the message ID', () => {
      const createNotificationDto: CreateNotificationDto = {
        mensagemId: 'test-id-123',
        conteudoMensagem: 'Teste de mensagem',
      };

      const result = service.sendNotification(createNotificationDto);

      expect(result).toEqual({ mensagemId: 'test-id-123' });
      expect(clientProxyMock.emit).toHaveBeenCalledWith(expect.any(String), {
        mensagemId: 'test-id-123',
        conteudoMensagem: 'Teste de mensagem',
      });
    });

    it('should update status map with AGUARDANDO_PROCESSAMENTO status when sending a notification', () => {
      const createNotificationDto: CreateNotificationDto = {
        mensagemId: 'test-id-123',
        conteudoMensagem: 'Teste de mensagem',
      };

      service.sendNotification(createNotificationDto);
      const status = service.getStatus('test-id-123');

      expect(status).toBeDefined();
      expect(status?.status).toBe(MessageStatus.AGUARDANDO_PROCESSAMENTO);
      expect(status?.conteudoMensagem).toBe('Teste de mensagem');
    });

    it('should update status map with FALHA_PROCESSAMENTO status when an error occurs', () => {
      const createNotificationDto: CreateNotificationDto = {
        mensagemId: 'test-id-123',
        conteudoMensagem: 'Teste de mensagem',
      };

      clientProxyMock.emit.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      expect(() => service.sendNotification(createNotificationDto)).toThrow();

      const status = service.getStatus('test-id-123');
      expect(status).toBeDefined();
      expect(status?.status).toBe(MessageStatus.FALHA_PROCESSAMENTO);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of an existing notification', () => {
      const createNotificationDto: CreateNotificationDto = {
        mensagemId: 'test-id-123',
        conteudoMensagem: 'Teste de mensagem',
      };
      service.sendNotification(createNotificationDto);

      service.updateStatus({
        mensagemId: 'test-id-123',
        status: MessageStatus.PROCESSADO_SUCESSO,
      });

      const status = service.getStatus('test-id-123');
      expect(status).toBeDefined();
      expect(status?.status).toBe(MessageStatus.PROCESSADO_SUCESSO);
    });

    it('should not update status if notification does not exist', () => {
      service.updateStatus({
        mensagemId: 'non-existent-id',
        status: MessageStatus.PROCESSADO_SUCESSO,
      });

      const status = service.getStatus('non-existent-id');
      expect(status).toBeUndefined();
    });
  });

  describe('getStatus', () => {
    it('should return the status of an existing notification', () => {
      const createNotificationDto: CreateNotificationDto = {
        mensagemId: 'test-id-123',
        conteudoMensagem: 'Teste de mensagem',
      };
      service.sendNotification(createNotificationDto);

      const status = service.getStatus('test-id-123');

      expect(status).toBeDefined();
      expect(status?.mensagemId).toBe('test-id-123');
      expect(status?.conteudoMensagem).toBe('Teste de mensagem');
      expect(status?.status).toBe(MessageStatus.AGUARDANDO_PROCESSAMENTO);
    });

    it('should return undefined for a non-existent notification', () => {
      const status = service.getStatus('non-existent-id');

      expect(status).toBeUndefined();
    });
  });
});

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { INotification, NotificationStatus } from '../models/notificacao.interface';
import { NotificacaoService } from '../services/notificacao.service';
import { NotificacaoComponent } from './notificacao.component';

describe('NotificacaoComponent', () => {
  let component: NotificacaoComponent;
  let fixture: ComponentFixture<NotificacaoComponent>;
  let notificacaoService: jasmine.SpyObj<NotificacaoService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const notificacaoServiceSpy = jasmine.createSpyObj('NotificacaoService', [
      'enviarNotificacao',
      'consultarStatus',
    ]);

    notificacaoServiceSpy.enviarNotificacao.and.returnValue(
      of({ messageId: '123e4567-e89b-12d3-a456-426614174000' })
    );

    notificacaoServiceSpy.consultarStatus.and.returnValue(
      of({
        mensagemId: '123e4567-e89b-12d3-a456-426614174000',
        status: NotificationStatus.PROCESSADO_SUCESSO,
        conteudoMensagem: 'Teste de mensagem',
        timestamp: new Date(),
      })
    );

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, NotificacaoComponent],
      providers: [{ provide: NotificacaoService, useValue: notificacaoServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacaoComponent);
    component = fixture.componentInstance;
    notificacaoService = TestBed.inject(NotificacaoService) as jasmine.SpyObj<NotificacaoService>;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve enviar notificação quando o conteúdo da mensagem for válido', () => {
    component.conteudoMensagem = 'Teste de mensagem';

    component.enviarNotificacao();

    expect(notificacaoService.enviarNotificacao).toHaveBeenCalledWith(
      jasmine.objectContaining({
        conteudoMensagem: 'Teste de mensagem',
      })
    );

    expect(component.notificacoes.length).toBe(1);
    expect(component.notificacoes[0].mensagemId).toBeTruthy();
    expect(component.notificacoes[0].conteudoMensagem).toBe('Teste de mensagem');
    expect(component.notificacoes[0].status).toBe(NotificationStatus.AGUARDANDO_PROCESSAMENTO);
    expect(component.conteudoMensagem).toBe('');
  });

  it('não deve enviar notificação quando o conteúdo da mensagem estiver vazio', () => {
    spyOn(window, 'alert');
    component.conteudoMensagem = '   ';

    component.enviarNotificacao();

    expect(notificacaoService.enviarNotificacao).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Por favor, insira o conteúdo da mensagem.');
    expect(component.notificacoes.length).toBe(0);
  });

  it('deve tratar erro ao enviar notificação', fakeAsync(() => {
    spyOn(console, 'error');
    notificacaoService.enviarNotificacao.and.returnValue(
      throwError(() => new Error('Erro no servidor'))
    );

    component.conteudoMensagem = 'Teste de mensagem';
    component.enviarNotificacao();
    tick();

    expect(console.error).toHaveBeenCalled();
    expect(component.notificacoes[0].status).toBe(NotificationStatus.FALHA_PROCESSAMENTO);
  }));

  it('deve atualizar o status das notificações pendentes', fakeAsync(() => {
    component.notificacoes = [
      {
        mensagemId: '123e4567-e89b-12d3-a456-426614174000',
        conteudoMensagem: 'Teste de mensagem',
        status: NotificationStatus.AGUARDANDO_PROCESSAMENTO,
        timestamp: new Date(),
      },
    ];

    component['atualizarStatusNotificacoes']();
    tick();

    expect(notificacaoService.consultarStatus).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000'
    );

    expect(component.notificacoes[0].status).toBe(NotificationStatus.PROCESSADO_SUCESSO);
  }));

  it('deve retornar a classe CSS correta para cada status', () => {
    expect(component.getStatusClass(NotificationStatus.AGUARDANDO_PROCESSAMENTO)).toBe(
      'status-aguardando'
    );
    expect(component.getStatusClass(NotificationStatus.PROCESSADO_SUCESSO)).toBe('status-sucesso');
    expect(component.getStatusClass(NotificationStatus.FALHA_PROCESSAMENTO)).toBe('status-falha');
    expect(component.getStatusClass('OUTRO_STATUS' as NotificationStatus)).toBe('');
  });

  it('deve retornar o texto correto para cada status', () => {
    expect(component.getStatusText(NotificationStatus.AGUARDANDO_PROCESSAMENTO)).toBe(
      'Aguardando Processamento'
    );
    expect(component.getStatusText(NotificationStatus.PROCESSADO_SUCESSO)).toBe(
      'Processado com Sucesso'
    );
    expect(component.getStatusText(NotificationStatus.FALHA_PROCESSAMENTO)).toBe(
      'Falha no Processamento'
    );
    expect(component.getStatusText('OUTRO_STATUS' as NotificationStatus)).toBe('OUTRO_STATUS');
  });

  it('deve usar o mensagemId para trackBy', () => {
    const notificacao: INotification = {
      mensagemId: '123e4567-e89b-12d3-a456-426614174000',
      conteudoMensagem: 'Teste de mensagem',
      status: NotificationStatus.AGUARDANDO_PROCESSAMENTO,
      timestamp: new Date(),
    };

    expect(component.trackByMensagemId(0, notificacao)).toBe(
      '123e4567-e89b-12d3-a456-426614174000'
    );
  });

  describe('polling mechanism', () => {
    it('should update notification status on interval', fakeAsync(() => {
      component.notificacoes = [
        {
          mensagemId: 'test-id-1',
          conteudoMensagem: 'Test 1',
          status: NotificationStatus.AGUARDANDO_PROCESSAMENTO,
          timestamp: new Date(),
        },
        {
          mensagemId: 'test-id-2',
          conteudoMensagem: 'Test 2',
          status: NotificationStatus.AGUARDANDO_PROCESSAMENTO,
          timestamp: new Date(),
        },
      ];

      notificacaoService.consultarStatus.withArgs('test-id-1').and.returnValue(
        of({
          mensagemId: 'test-id-1',
          conteudoMensagem: 'Test 1',
          status: NotificationStatus.PROCESSADO_SUCESSO,
          timestamp: new Date(),
        })
      );
      notificacaoService.consultarStatus.withArgs('test-id-2').and.returnValue(
        of({
          mensagemId: 'test-id-2',
          conteudoMensagem: 'Test 2',
          status: NotificationStatus.FALHA_PROCESSAMENTO,
          timestamp: new Date(),
        })
      );

      component['atualizarStatusNotificacoes']();
      tick();
      fixture.detectChanges();

      expect(component.notificacoes[0].status).toBe(NotificationStatus.PROCESSADO_SUCESSO);
      expect(component.notificacoes[1].status).toBe(NotificationStatus.FALHA_PROCESSAMENTO);
      expect(notificacaoService.consultarStatus).toHaveBeenCalledTimes(2);

      notificacaoService.consultarStatus.calls.reset();
      
      component.notificacoes[0].status = NotificationStatus.PROCESSADO_SUCESSO;
      component.notificacoes[1].status = NotificationStatus.FALHA_PROCESSAMENTO;
      
      component['atualizarStatusNotificacoes']();
      tick();
      fixture.detectChanges();

      expect(notificacaoService.consultarStatus).not.toHaveBeenCalled();
    }));

    it('should unsubscribe from polling on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('initialization', () => {
    it('should set up polling subscription on init', () => {
      expect(component['destroy$']).toBeDefined();
    });
  });
});

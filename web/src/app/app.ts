import { Component, signal } from '@angular/core';
import { NotificacaoComponent } from './features';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NotificacaoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Sistema de Notificações VR');
}

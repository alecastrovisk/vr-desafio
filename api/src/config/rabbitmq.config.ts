import { Transport, RmqOptions } from '@nestjs/microservices';

export const rabbitMQConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
    queue: process.env.RABBITMQ_QUEUE || 'fila.notificacao.entrada.Alexandre',
    queueOptions: {
      durable: true,
    },
  },
};

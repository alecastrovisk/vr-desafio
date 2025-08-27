# VR Desafio - Desenvolvimento com Docker

Este projeto contém uma API NestJS, um frontend Angular e RabbitMQ configurados para desenvolvimento com Docker Compose.

## Estrutura do Projeto

```
vr-desafio/
├── api/                 # API NestJS
│   ├── src/            # Código fonte da API
│   ├── Dockerfile.dev  # Dockerfile para desenvolvimento
│   └── .dockerignore   # Arquivos ignorados no build
├── web/                 # Frontend Angular
│   ├── src/            # Código fonte do frontend
│   ├── Dockerfile.dev  # Dockerfile para desenvolvimento
│   └── .dockerignore   # Arquivos ignorados no build
├── docker-compose.yml   # Configuração dos serviços
└── README.md           # Este arquivo
```

## Pré-requisitos

- Docker
- Docker Compose

## Como executar

### 1. Subir todos os serviços

```bash
docker-compose up --build
```

### 2. Subir em background (detached)

```bash
docker-compose up -d --build
```

### 3. Parar os serviços

```bash
docker-compose down
```

### 4. Parar e remover volumes

```bash
docker-compose down -v
```

## Serviços Disponíveis

### API NestJS
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Hot Reload**: Habilitado
- **Variáveis de ambiente**:
  - `NODE_ENV=development`
  - `RABBITMQ_URL=amqp://rabbitmq:5672`

### Frontend Angular
- **URL**: http://localhost:4200
- **Hot Reload**: Habilitado
- **Variáveis de ambiente**:
  - `NODE_ENV=development`
  - `API_URL=http://api:3000`

### RabbitMQ
- **AMQP Port**: 5672
- **Management UI**: http://localhost:15672
- **Usuário**: admin
- **Senha**: admin123
- **Health Check**: Configurado

## Comandos Úteis

### Ver logs de um serviço específico
```bash
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f rabbitmq
```

### Executar comandos dentro dos containers
```bash
# API
docker-compose exec api npm install
docker-compose exec api npm run test
docker-compose exec api npm run lint

# Web
docker-compose exec web npm install
docker-compose exec web ng generate component exemplo
docker-compose exec web ng test
```

### Rebuild de um serviço específico
```bash
docker-compose up --build api
docker-compose up --build web
```

### Verificar status dos containers
```bash
docker-compose ps
```

### Acessar shell do container
```bash
docker-compose exec api sh
docker-compose exec web sh
docker-compose exec rabbitmq bash
```

## Desenvolvimento

### Hot Reload
- Ambos os projetos (API e Web) estão configurados com hot reload
- As alterações no código são refletidas automaticamente
- Os `node_modules` são mantidos em volumes para melhor performance

### Comunicação entre Serviços
- Todos os serviços estão na mesma rede (`vr-network`)
- A comunicação entre serviços usa os nomes dos containers
- O frontend pode acessar a API através de `http://api:3000`
- A API pode acessar o RabbitMQ através de `amqp://rabbitmq:5672`

### Volumes
- **Código fonte**: Mapeado para hot reload
- **node_modules**: Volumes nomeados para melhor performance
- **RabbitMQ**: Volume persistente para dados

## Troubleshooting

### Problemas de permissão (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
```

### Limpar cache do Docker
```bash
docker system prune -a
docker volume prune
```

### Problemas de porta em uso
```bash
# Verificar processos usando as portas
netstat -tulpn | grep :3000
netstat -tulpn | grep :4200
netstat -tulpn | grep :5672
netstat -tulpn | grep :15672
```

### Rebuild completo
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Verificar logs de erro
```bash
# Ver logs de todos os serviços
docker-compose logs

# Ver logs com timestamp
docker-compose logs -t

# Seguir logs em tempo real
docker-compose logs -f
```

## Estrutura de Rede

```
vr-network (bridge)
├── api (vr-desafio-api)
├── web (vr-desafio-web)
└── rabbitmq (vr-desafio-rabbitmq)
```

## Próximos Passos

1. Configurar variáveis de ambiente específicas
2. Adicionar banco de dados (PostgreSQL/MongoDB)
3. Configurar SSL para HTTPS
4. Adicionar nginx como proxy reverso
5. Configurar CI/CD pipeline
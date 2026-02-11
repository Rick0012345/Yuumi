# Yummi Lanchonete - React & Node.js

Projeto migrado para arquitetura moderna Full Stack.

## Tecnologias

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL (via Docker)
- **Containerização:** Docker & Docker Compose

## Como Rodar

Certifique-se de ter o Docker instalado e rodando.

1. Na raiz do projeto, execute:
   ```bash
   docker-compose up --build
   ```

2. Acesse o Frontend em: `http://localhost:5173`
3. API Backend rodando em: `http://localhost:3000`

## Funcionalidades Implementadas

- **Autenticação JWT**: Login seguro.
- **Controle de Acesso (RBAC)**:
  - **ADMIN**: Acesso total.
  - **MANAGER**: Pode gerenciar usuários (menos Admins).
  - **COOK/DRIVER**: Acesso restrito.
- **Dashboard**: Visualização de métricas (mockadas inicialmente).
- **Gestão de Usuários**: Criação e listagem de usuários com permissões.

## Primeiro Acesso

Para criar o primeiro usuário, você pode usar a rota `/api/auth/register` via Postman ou Insomnia, ou, se o banco estiver vazio, o sistema permitirá o cadastro inicial.

# Yummi Lanchonete - Sistema de Gestão e Entregas

Sistema completo para gestão de lanchonete, incluindo pedidos, gerenciamento de usuários, rastreamento de entregadores em tempo real e automação de fluxos.

## 🏗 Arquitetura do Sistema

O projeto evoluiu para uma arquitetura de microsserviços e modular, composta por:

1.  **Frontend (SPA)**: Interface do usuário para Clientes, Entregadores e Administradores.
2.  **Backend API (Monólito Modular)**: API REST para gestão de dados, autenticação e regras de negócio principais.
3.  **Location Service (Microserviço)**: Serviço de alta performance em Go para rastreamento de entregadores via WebSocket.
4.  **Database**: Banco de dados relacional PostgreSQL compartilhado.
5.  **Automação**: Instância do n8n para orquestração de fluxos de trabalho e integrações.

## 🚀 Tecnologias

### Frontend (`/frontend`)
- **Core:** React 19, Vite 7
- **Estilização:** Tailwind CSS 4, Lucide Icons
- **Mapas:** Leaflet, React-Leaflet
- **HTTP Client:** Axios
- **Estado:** Context API

### Backend API (`/backend`)
- **Runtime:** Node.js, Express
- **Database:** Prisma ORM, PostgreSQL
- **Auth:** JWT (JSON Web Tokens), bcryptjs

### Location Service (`/location-service`)
- **Linguagem:** Go (Golang)
- **Comunicação:** WebSockets (Gorilla WebSocket)
- **Funcionalidade:** Broadcast de localização em tempo real e persistência de histórico.

### Infraestrutura & DevOps
- **Containerização:** Docker, Docker Compose
- **Automação:** n8n (Workflow Automation)

## 📦 Como Rodar o Projeto

### Pré-requisitos
- Docker e Docker Compose instalados.

### Passo a Passo

1. **Clone o repositório** e acesse a pasta raiz.

2. **Suba os containers** com o Docker Compose:
   ```bash
   docker-compose up --build
   ```
   *Isso irá construir as imagens do frontend, backend e location-service, e iniciar o banco de dados e o n8n.*

3. **Acesse os Serviços**:

   | Serviço | URL | Descrição |
   | :--- | :--- | :--- |
   | **Frontend** | `http://localhost:5173` | Aplicação Web Principal |
   | **Backend API** | `http://localhost:3000` | API REST |
   | **Location Service** | `ws://localhost:8080/ws` | WebSocket Server |
   | **n8n** | `http://localhost:5678` | Automação de Workflows |
   | **Banco de Dados** | `localhost:5432` | PostgreSQL |

## 🔑 Credenciais Padrão

O sistema é inicializado com as seguintes configurações (definidas no `docker-compose.yml`):

- **Admin User**:
  - Email: `admin@lanchonete.com`
  - Senha: `admin123`
- **Banco de Dados**:
  - User: `admin`
  - Pass: `password`
  - DB: `lanchonete`
- **n8n**:
  - User: `admin`
  - Pass: `admin`

## ✨ Funcionalidades Principais

- **Autenticação & RBAC**: Sistema de login seguro com níveis de acesso (ADMIN, MANAGER, COOK, DRIVER).
- **Gestão de Pedidos**: Fluxo completo de pedidos.
- **Rastreamento em Tempo Real**:
  - Entregadores enviam localização via App (WebSocket).
  - Admins visualizam entregadores no mapa em tempo real.
- **Histórico de Rotas**: O Location Service armazena o histórico de posições.
- **Automação (n8n)**: Integrações prontas para disparar notificações e fluxos complexos.
- **Dashboard**: Visão geral métricas e status do sistema.

## 📂 Estrutura de Pastas

```
/
├── backend/            # API Node.js + Express + Prisma
├── frontend/           # React SPA + Vite + Tailwind
├── location-service/   # Microserviço em Go para WebSocket
├── docker-compose.yml  # Orquestração dos containers
└── README.md           # Documentação do projeto
```

## 🛠 Desenvolvimento

Para rodar comandos específicos dentro dos containers (ex: migrations):

```bash
# Acessar shell do backend
docker exec -it lanchonete_backend sh

# Rodar migrations do Prisma manualmente (se necessário)
docker exec lanchonete_backend npx prisma migrate deploy
```

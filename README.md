# Finly 💰

Aplicação de controle financeiro pessoal desenvolvida com **Spring Boot** e **React**, com rastreamento de receitas e despesas, gerenciamento de parcelas, controle de orçamentos e acompanhamento de metas financeiras.

---

## 📋 Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Executar](#como-executar)
  - [Pré-requisitos](#pré-requisitos)
  - [Desenvolvimento sem Docker](#desenvolvimento-sem-docker)
  - [Desenvolvimento com Docker Compose](#desenvolvimento-com-docker-compose)
- [Backend](#backend)
  - [Arquitetura](#arquitetura)
  - [Endpoints da API](#endpoints-da-api)
  - [Schema do Banco de Dados](#schema-do-banco-de-dados)
  - [Autenticação](#autenticação)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Frontend](#frontend)
  - [Arquitetura](#arquitetura-1)
  - [Páginas](#páginas)
  - [Variáveis de Ambiente](#variáveis-de-ambiente-1)
- [Deploy (Render + NeonDB)](#deploy-render--neondb)
- [Testes](#testes)

---

## ✨ Funcionalidades

- 🔐 Autenticação JWT com par de chaves RSA
- 🏦 Gerenciamento de múltiplas contas (Corrente, Poupança, Carteira, Cartão de Crédito, Investimento)
- 💸 Rastreamento de receitas, despesas e transferências com atualização automática de saldo
- 📦 Planos de parcelamento com acompanhamento individual de pagamentos
- 🎯 Controle de orçamento mensal com alertas de estouro
- 🏆 Acompanhamento de metas financeiras com histórico de depósitos
- 📊 Dashboard com gráficos e resumo financeiro
- 🗂️ Categorias de transações personalizadas e padrão

---

## 🛠 Tecnologias

### Backend
| Tecnologia | Versão |
|---|---|
| Java | 21 |
| Spring Boot | 4.0.3 |
| Spring Security + OAuth2 | 7.0.3 |
| PostgreSQL | 16 |
| Hibernate / JPA | 7.2.4 |
| Flyway | 11.14.1 |
| SpringDoc OpenAPI | 2.8.5 |
| Lombok | 1.18.42 |

### Frontend
| Tecnologia | Versão |
|---|---|
| React | 19 |
| TypeScript | 5 |
| Vite | 7 |
| Tailwind CSS | 4 |
| Redux Toolkit | Latest |
| React Router | 7 |
| Axios | Latest |
| React Hook Form + Zod | Latest |
| Recharts | Latest |
| Lucide React | Latest |

---

## 📁 Estrutura do Projeto

```
finly/
├── compose.yaml              # Docker Compose (dev e produção local)
├── backend/
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/vitorsaucedo/finly/
│           │   ├── config/           # Security, CORS, RSA, OpenAPI
│           │   ├── domain/           # Entidades e Repositórios
│           │   │   ├── user/
│           │   │   ├── account/
│           │   │   ├── category/
│           │   │   ├── transaction/
│           │   │   ├── installment/
│           │   │   ├── budget/
│           │   │   ├── goal/
│           │   │   └── dashboard/
│           │   ├── dto/
│           │   │   ├── request/
│           │   │   └── response/
│           │   └── exception/        # Tratamento global de exceções
│           └── resources/
│               ├── db/migration/     # Migrações Flyway (V1-V7)
│               ├── certs/            # Par de chaves RSA (não versionado)
│               ├── application.properties
│               ├── application-dev.properties
│               └── application-prod.properties
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── components/
        │   ├── charts/
        │   ├── layout/           # Sidebar, Header, PrivateLayout
        │   └── ui/               # Button, Input, Modal, Table, Badge...
        ├── hooks/                # useAuth, useAccounts, useTransactions...
        ├── pages/
        │   ├── auth/             # Login, Register
        │   ├── dashboard/
        │   ├── transactions/
        │   ├── installments/
        │   ├── accounts/
        │   ├── categories/
        │   ├── budgets/
        │   ├── goals/
        │   └── profile/
        ├── router/               # AppRouter, PrivateRoute, PublicRoute
        ├── services/             # Camada de serviços Axios
        ├── store/                # Redux store, authSlice, uiSlice
        ├── types/                # Interfaces TypeScript
        └── utils/                # formatCurrency, formatDate
```

---

## 🚀 Como Executar

### Pré-requisitos

- Java 21+
- Node.js 20+
- Docker e Docker Compose
- Maven 3.9+

---

### Desenvolvimento sem Docker

Neste modo o Vite faz proxy das chamadas `/api` para o backend automaticamente — não é necessário definir nenhuma variável de ambiente.

#### 1. Clone o repositório

```bash
git clone https://github.com/vitorsaucedo/finly.git
cd finly
```

#### 2. Gere as chaves RSA

```bash
cd backend/src/main/resources/certs
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

#### 3. Suba o banco de dados

```bash
# Na raiz do projeto
docker compose up postgres -d
```

#### 4. Execute o backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

A API estará disponível em `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/swagger-ui.html`

#### 5. Execute o frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

---

### Desenvolvimento com Docker Compose

Sobe toda a stack (banco, backend e frontend com nginx) com um único comando:

```bash
# Na raiz do projeto — gere as chaves RSA antes se ainda não tiver feito
docker compose up --build
```

> ⚠️ As chaves RSA em `backend/src/main/resources/certs/` precisam existir antes do build. Gere-as conforme o passo 2 acima.

| Serviço | URL |
|---|---|
| Frontend | http://localhost |
| API Backend | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

```bash
# Parar todos os serviços
docker compose down

# Rebuildar sem cache
docker compose build --no-cache && docker compose up
```

---

## 🔧 Backend

### Arquitetura

O backend segue uma arquitetura **package-by-feature** onde cada domínio é independente com sua própria entidade, repositório, serviço e controller.

Decisões de design importantes:
- **Isolamento por usuário** — todas as queries incluem `userId` para evitar acesso cruzado entre usuários
- **Atualização automática de saldo** — `TransactionService` gerencia todas as alterações de saldo das contas ao criar, atualizar e deletar transações
- **Rastreamento de orçamento** — `BudgetService` é notificado pelo `TransactionService` a cada despesa concluída
- **RSA JWT** — mais seguro que HMAC, segue as melhores práticas do OAuth2 Resource Server
- **Lazy loading** — todos os relacionamentos entre entidades usam `FetchType.LAZY` para evitar consultas N+1

### Endpoints da API

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Cadastrar novo usuário | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/users/me` | Obter usuário atual | ✅ |
| PUT | `/api/users/me` | Atualizar perfil | ✅ |
| DELETE | `/api/users/me` | Deletar conta | ✅ |
| GET | `/api/accounts` | Listar contas | ✅ |
| POST | `/api/accounts` | Criar conta | ✅ |
| PUT | `/api/accounts/{id}` | Atualizar conta | ✅ |
| DELETE | `/api/accounts/{id}` | Deletar conta | ✅ |
| GET | `/api/categories` | Listar categorias | ✅ |
| POST | `/api/categories` | Criar categoria | ✅ |
| PUT | `/api/categories/{id}` | Atualizar categoria | ✅ |
| DELETE | `/api/categories/{id}` | Deletar categoria | ✅ |
| GET | `/api/transactions` | Listar transações (paginado) | ✅ |
| POST | `/api/transactions` | Criar transação | ✅ |
| PUT | `/api/transactions/{id}` | Atualizar transação | ✅ |
| DELETE | `/api/transactions/{id}` | Deletar transação | ✅ |
| GET | `/api/installments` | Listar grupos de parcelas | ✅ |
| POST | `/api/installments` | Criar plano de parcelamento | ✅ |
| POST | `/api/installments/{id}/pay` | Pagar parcela | ✅ |
| DELETE | `/api/installments/{id}/cancel` | Cancelar plano | ✅ |
| GET | `/api/budgets` | Listar orçamentos por mês/ano | ✅ |
| POST | `/api/budgets` | Criar orçamento | ✅ |
| PUT | `/api/budgets/{id}` | Atualizar orçamento | ✅ |
| DELETE | `/api/budgets/{id}` | Deletar orçamento | ✅ |
| GET | `/api/goals` | Listar metas | ✅ |
| POST | `/api/goals` | Criar meta | ✅ |
| PUT | `/api/goals/{id}` | Atualizar meta | ✅ |
| PATCH | `/api/goals/{id}/deposit` | Depositar na meta | ✅ |
| DELETE | `/api/goals/{id}` | Deletar meta | ✅ |
| GET | `/api/dashboard` | Obter resumo do dashboard | ✅ |

### Schema do Banco de Dados

```
users
  └── accounts            (user_id FK)
  └── categories          (user_id FK, nullable para categorias padrão)
  └── transactions        (user_id, account_id, category_id FK)
  └── installment_groups  (user_id, account_id, category_id FK)
       └── installments   (group_id, transaction_id FK)
  └── budgets             (user_id, category_id FK)
  └── goals               (user_id FK)
```

Todas as migrações estão em `src/main/resources/db/migration/` e são executadas automaticamente pelo Flyway na inicialização.

### Autenticação

A API utiliza tokens **JWT assinados com RSA** via Spring Security OAuth2 Resource Server.

1. Faça cadastro ou login para receber um `accessToken`
2. Inclua o token em todas as requisições protegidas:
```
Authorization: Bearer <token>
```

Os tokens expiram após **24 horas** (configurável via `app.jwt.expiration-seconds`).

### Variáveis de Ambiente

Usadas apenas no perfil `prod` (deploy). Em desenvolvimento, os valores são lidos dos arquivos locais.

| Variável | Descrição |
|---|---|
| `SPRING_PROFILES_ACTIVE` | Perfil ativo — usar `prod` no deploy |
| `DB_URL` | URL JDBC do PostgreSQL com SSL, ex: `jdbc:postgresql://<host>.neon.tech:5432/<db>?sslmode=require` |
| `DB_USERNAME` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `RSA_PUBLIC_KEY` | Conteúdo do `public.pem` codificado em base64 |
| `RSA_PRIVATE_KEY` | Conteúdo do `private.pem` codificado em base64 |
| `CORS_ALLOWED_ORIGINS` | URL do frontend em produção, ex: `https://finly.onrender.com` |
| `JWT_EXPIRATION_SECONDS` | Tempo de expiração do token em segundos (padrão: `86400`) |

---

## 🎨 Frontend

### Arquitetura

O frontend segue uma **arquitetura em camadas**:

- **`services/`** — chamadas Axios para a API, um arquivo por domínio
- **`hooks/`** — hooks customizados que encapsulam os services com gerenciamento de estado local
- **`store/`** — Redux Toolkit para estado global (autenticação, preferências de UI)
- **`pages/`** — componentes de página que compõem hooks e componentes de UI
- **`components/ui/`** — componentes reutilizáveis do design system

A instância do Axios anexa automaticamente o token JWT em todas as requisições via interceptor e redireciona para `/login` em respostas 401.

Em desenvolvimento, o `baseURL` do Axios fica vazio e o proxy do Vite encaminha as chamadas `/api` para `http://localhost:8080`. Em produção, o `baseURL` é preenchido pela variável `VITE_API_URL` embutida no bundle no momento do build.

### Páginas

| Rota | Descrição |
|---|---|
| `/login` | Autenticação |
| `/register` | Criação de conta |
| `/dashboard` | Visão geral financeira com gráficos |
| `/transactions` | Lista de receitas, despesas e transferências |
| `/installments` | Planos de parcelamento e pagamentos |
| `/accounts` | Contas bancárias e carteiras |
| `/categories` | Categorias de transações |
| `/budgets` | Controle de orçamento mensal |
| `/goals` | Metas financeiras |
| `/profile` | Perfil e configurações do usuário |

### Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API em produção, ex: `https://finly-backend.onrender.com`. Não definir em desenvolvimento. |

---

## 🧪 Testes

Execute os testes unitários do backend:

```bash
cd backend
./mvnw test
```

A cobertura de testes inclui:
- `AuthServiceTest` — cadastro, login, credenciais inválidas
- `TransactionServiceTest` — atualização de saldo, validação de transferência, notificação de orçamento
- `BudgetServiceTest` — criação, prevenção de duplicatas, status excedido
- `GoalServiceTest` — criação, depósito, conclusão automática, restrições de meta concluída

Para testes de API, importe a coleção do Postman disponível na raiz do repositório e execute as requisições em ordem usando o Collection Runner.

---

## 📄 Licença

Este projeto foi desenvolvido para fins de portfólio.

# Escritório Virtual — Família Carvalho

Sistema financeiro pessoal full-stack com dashboard analytics, gestão de metas, análise de saúde financeira e assistente de IA.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Executar](#como-executar)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API — Referência de Endpoints](#api--referência-de-endpoints)
- [Banco de Dados](#banco-de-dados)
- [Autenticação](#autenticação)

---

## Visão Geral

O **Escritório Virtual** é uma aplicação web para gestão financeira pessoal e familiar. Ele permite registrar receitas e despesas, acompanhar metas financeiras, gerar relatórios por período e obter análises inteligentes via radar financeiro e assistente de IA.

Interface em português (pt-BR), moeda em Real (R$).

---

## Tecnologias

### Backend
| Tecnologia | Versão | Função |
|---|---|---|
| Python | 3.10+ | Linguagem |
| FastAPI | 0.115 | Framework web |
| SQLAlchemy | 2.0 | ORM |
| SQLite | — | Banco de dados (padrão) |
| Pydantic | 2.10 | Validação de dados |
| python-jose | — | Tokens JWT |
| bcrypt | 4.2 | Hash de senhas |
| Uvicorn | 0.32 | Servidor ASGI |

### Frontend
| Tecnologia | Versão | Função |
|---|---|---|
| Next.js | 14 | Framework React (App Router) |
| React | 18 | UI |
| TypeScript | — | Tipagem estática |
| Tailwind CSS | 3.4 | Estilização |
| Recharts | 2.13 | Gráficos |
| SWR | 2.2 | Data fetching com cache |
| React Hook Form | 7.54 | Formulários |
| Zod | 3.23 | Validação de schemas |
| date-fns | 4.1 | Manipulação de datas |
| Lucide React | — | Ícones |

---

## Funcionalidades

### Gestão Financeira
- Cadastro de **despesas** com categoria, método de pagamento e observações
- Cadastro de **receitas** com categoria e observações
- Filtros por mês, período customizado e categoria
- **Categorias personalizadas** com cor e ícone
- 16 categorias padrão criadas automaticamente no cadastro (6 receitas, 10 despesas)

### Dashboard
- Cards de resumo: saldo, receitas, despesas e lucro do mês
- Gráfico de barras: comparativo receita × despesa dos últimos 6 meses
- Gráfico de rosca: distribuição de despesas por categoria
- Gráfico de linha: evolução do patrimônio acumulado
- Gráfico de área: fluxo de caixa (entradas × saídas)
- Tabela com as 10 maiores despesas do mês

### Metas Financeiras
- Criação de metas com valor alvo, prazo e cor
- Acompanhamento de progresso (valor atual / valor alvo)
- Barra de progresso visual com percentual

### Relatórios
- Resumo por período: diário, semanal, mensal ou anual
- Comparativo com período anterior (variação percentual)
- Lista detalhada de transações do período

### Radar Financeiro
- **Score financeiro** de 0 a 100 com classificação:
  - 80–100: Excelente
  - 60–79: Muito Bom
  - 40–59: Bom
  - 20–39: Regular
  - 0–19: Em Risco
- Alertas automáticos (despesas × receita, categorias altas)
- Detecção de desperdício (assinaturas, alimentação)
- Detecção de anomalias (categoria com aumento > 30% vs mês anterior)
- Previsão do saldo do próximo mês e potencial de poupança

### Assistente de IA
- Chat conversacional com contexto financeiro do usuário
- Sugestões rápidas pré-definidas
- Análises sobre: maiores categorias, economias possíveis, capacidade de investimento, progresso de metas

---

## Pré-requisitos

- **Python** 3.10 ou superior
- **Node.js** 18 ou superior
- **npm** 9+ ou **yarn**
- Git

---

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd escritorio_virtual
```

### 2. Configure o Backend

```bash
cd backend

# Crie e ative o ambiente virtual
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

Copie o arquivo de variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o `.env` com as suas configurações (veja [Variáveis de Ambiente](#variáveis-de-ambiente)).

### 3. Configure o Frontend

```bash
cd ../frontend

# Instale as dependências
npm install

# Copie o arquivo de variáveis de ambiente
cp .env.local.example .env.local
```

---

## Como Executar

### Opção A — Scripts Windows (mais fácil)

Na raiz do projeto, clique duas vezes (ou execute no terminal):

```bash
start-backend.bat   # Inicia o backend na porta 8000
start-frontend.bat  # Inicia o frontend na porta 3000
```

### Opção B — Terminal manual

**Backend** (em um terminal):

```bash
cd backend
venv\Scripts\activate        # Windows
# ou: source venv/bin/activate  (Linux/macOS)

uvicorn app.main:app --reload --port 8000
```

**Frontend** (em outro terminal):

```bash
cd frontend
npm run dev
```

### Acesso

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Documentação interativa (Swagger) | http://localhost:8000/docs |
| Documentação alternativa (ReDoc) | http://localhost:8000/redoc |

### Primeiro uso

1. Acesse http://localhost:3000
2. Clique em **"Criar conta"** e registre-se
3. Ao registrar, 16 categorias padrão são criadas automaticamente
4. Faça login e comece a adicionar receitas e despesas

---

## Variáveis de Ambiente

### Backend — `backend/.env`

```env
# Chave secreta para assinar os tokens JWT (troque em produção!)
SECRET_KEY=sua-chave-secreta-muito-segura-aqui

# Algoritmo de assinatura JWT
ALGORITHM=HS256

# Expiração do token em minutos (10080 = 7 dias)
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# URL do banco de dados (SQLite por padrão)
DATABASE_URL=sqlite:///./escritorio.db
```

Para usar PostgreSQL em produção, substitua `DATABASE_URL`:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/escritorio_virtual
```

### Frontend — `frontend/.env.local`

```env
# URL base da API do backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Estrutura do Projeto

```
escritorio_virtual/
├── backend/
│   ├── app/
│   │   ├── main.py              # Ponto de entrada FastAPI, CORS, routers
│   │   ├── database.py          # Configuração SQLAlchemy, engine, sessão
│   │   ├── api/
│   │   │   ├── deps.py          # Dependências (get_db, get_current_user)
│   │   │   └── routes/
│   │   │       ├── auth.py          # Registro, login, perfil
│   │   │       ├── expenses.py      # CRUD de despesas
│   │   │       ├── revenues.py      # CRUD de receitas
│   │   │       ├── categories.py    # CRUD de categorias
│   │   │       ├── goals.py         # CRUD de metas
│   │   │       ├── dashboard.py     # Resumo e dados para gráficos
│   │   │       ├── reports.py       # Relatórios por período
│   │   │       ├── radar.py         # Análise de saúde financeira
│   │   │       └── ai_assistant.py  # Chat de IA financeiro
│   │   ├── models/              # Modelos ORM (tabelas do banco)
│   │   │   ├── user.py
│   │   │   ├── expense.py
│   │   │   ├── revenue.py
│   │   │   ├── category.py
│   │   │   └── goal.py
│   │   ├── schemas/             # Schemas Pydantic (validação / serialização)
│   │   │   ├── user.py
│   │   │   ├── expense.py
│   │   │   ├── revenue.py
│   │   │   ├── category.py
│   │   │   └── goal.py
│   │   └── core/
│   │       └── security.py      # JWT, hash de senha
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # App Router do Next.js 14
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         # Redireciona para /dashboard ou /login
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx       # Layout com sidebar
│   │   │       ├── page.tsx         # Visão geral
│   │   │       ├── expenses/
│   │   │       ├── revenues/
│   │   │       ├── goals/
│   │   │       ├── categories/
│   │   │       ├── reports/
│   │   │       ├── ai-assistant/
│   │   │       ├── radar/
│   │   │       └── settings/
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, Header
│   │   │   ├── dashboard/       # Cards, gráficos
│   │   │   ├── expenses/        # Formulário de despesas
│   │   │   └── revenues/        # Formulário de receitas
│   │   ├── lib/
│   │   │   ├── api.ts           # Cliente HTTP com injeção de token
│   │   │   ├── auth.ts          # Helpers de autenticação (localStorage)
│   │   │   └── utils.ts         # formatCurrency, formatDate, cn(), etc.
│   │   └── types/
│   │       └── index.ts         # Interfaces TypeScript do domínio
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.local.example
│
├── start-backend.bat
├── start-frontend.bat
└── README.md
```

---

## API — Referência de Endpoints

Todos os endpoints (exceto `/auth/register` e `/auth/login`) exigem o header:

```
Authorization: Bearer <token>
```

### Autenticação

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/auth/register` | Cria nova conta |
| POST | `/auth/login` | Login, retorna token JWT |
| GET | `/auth/me` | Dados do usuário autenticado |

**Registro — body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "minhasenha123"
}
```

**Login — body:**
```json
{
  "email": "joao@email.com",
  "password": "minhasenha123"
}
```

**Resposta (login/registro):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": 1, "name": "João Silva", "email": "joao@email.com" }
}
```

---

### Despesas

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/expenses` | Lista despesas (com filtros) |
| POST | `/expenses` | Cria despesa |
| GET | `/expenses/{id}` | Busca despesa por ID |
| PUT | `/expenses/{id}` | Atualiza despesa |
| DELETE | `/expenses/{id}` | Remove despesa |

**Filtros (GET `/expenses`):**

| Parâmetro | Tipo | Exemplo | Descrição |
|---|---|---|---|
| `month` | string | `2026-06` | Filtra por mês (YYYY-MM) |
| `start` | string | `2026-06-01` | Data inicial (YYYY-MM-DD) |
| `end` | string | `2026-06-30` | Data final (YYYY-MM-DD) |
| `category_id` | int | `3` | Filtra por categoria |

**Body (POST/PUT):**
```json
{
  "description": "Supermercado",
  "category_id": 2,
  "amount": 350.90,
  "date": "2026-06-15",
  "payment_method": "Débito",
  "observation": "Compra mensal"
}
```

**Métodos de pagamento aceitos:** `Dinheiro`, `Cartão de Crédito`, `Débito`, `PIX`, `Transferência`, `Boleto`

---

### Receitas

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/revenues` | Lista receitas (com filtros) |
| POST | `/revenues` | Cria receita |
| GET | `/revenues/{id}` | Busca receita por ID |
| PUT | `/revenues/{id}` | Atualiza receita |
| DELETE | `/revenues/{id}` | Remove receita |

**Filtros:** `month`, `start`, `end` (mesmos que despesas)

**Body (POST/PUT):**
```json
{
  "description": "Salário junho",
  "category_id": 1,
  "amount": 5000.00,
  "date": "2026-06-05",
  "observation": ""
}
```

---

### Categorias

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/categories` | Lista categorias |
| POST | `/categories` | Cria categoria |
| PUT | `/categories/{id}` | Atualiza categoria |
| DELETE | `/categories/{id}` | Remove categoria |

**Filtro (GET):** `?type=expense` ou `?type=revenue`

**Body (POST/PUT):**
```json
{
  "name": "Pets",
  "type": "expense",
  "color": "#f59e0b",
  "icon": "🐾"
}
```

---

### Metas

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/goals` | Lista metas |
| POST | `/goals` | Cria meta |
| PUT | `/goals/{id}` | Atualiza meta |
| PUT | `/goals/{id}/add-amount` | Adiciona valor à meta |
| DELETE | `/goals/{id}` | Remove meta |

**Body (POST/PUT):**
```json
{
  "name": "Fundo de emergência",
  "target_amount": 30000.00,
  "current_amount": 5000.00,
  "deadline": "2026-12-31",
  "color": "#10b981"
}
```

**Add amount:**
```json
{ "amount": 500.00 }
```

---

### Dashboard

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/dashboard/summary` | Resumo do mês atual |
| GET | `/dashboard/charts` | Dados para gráficos (6 meses) |

**Filtro:** `?month=2026-06`

---

### Relatórios

| Método | Endpoint | Parâmetros | Descrição |
|---|---|---|---|
| GET | `/reports/summary` | `period`, `reference_date` | Relatório por período |

**Períodos:** `daily`, `weekly`, `monthly`, `annual`

Exemplo: `GET /reports/summary?period=monthly&reference_date=2026-06-01`

---

### Radar Financeiro

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/radar/analysis` | Análise completa de saúde financeira |

**Resposta:**
```json
{
  "financial_score": 72,
  "score_label": "Muito Bom",
  "score_color": "#10b981",
  "alerts": [...],
  "predictions": {
    "next_month_balance": 1500.00,
    "savings_potential": 450.00
  },
  "waste_detection": [...],
  "anomalies": [...]
}
```

---

### Assistente de IA

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/ai/chat` | Envia mensagem ao assistente |

**Body:**
```json
{ "message": "Como estão minhas finanças esse mês?" }
```

**Resposta:**
```json
{ "response": "Olá! Este mês você teve R$ 5.000,00 em receitas..." }
```

---

## Banco de Dados

O banco padrão é **SQLite**, armazenado em `backend/escritorio.db`. As tabelas são criadas automaticamente na primeira execução.

### Schema

```
users
  id, name, email, hashed_password, created_at

categories
  id, user_id, name, type (revenue|expense), color, icon, created_at

revenues
  id, user_id, category_id, description, amount, date, observation, created_at

expenses
  id, user_id, category_id, description, amount, date,
  payment_method, observation, created_at

goals
  id, user_id, name, target_amount, current_amount, deadline, color, created_at
```

Todos os registros são isolados por `user_id` — cada usuário enxerga apenas seus próprios dados.

---

## Autenticação

O sistema usa **JWT (JSON Web Tokens)** com validade de 7 dias.

**Fluxo:**
1. Usuário se registra ou faz login → recebe `access_token`
2. Token é salvo no `localStorage` do navegador
3. Todas as requisições seguintes enviam `Authorization: Bearer <token>` no header
4. Se o token expirar ou for inválido, a API retorna `401` e o frontend redireciona para `/login`

---

## Solução de Problemas

**Backend não inicia:**
- Verifique se o ambiente virtual está ativado (`venv\Scripts\activate`)
- Confirme que as dependências foram instaladas (`pip install -r requirements.txt`)
- Verifique se a porta 8000 está disponível

**Frontend não conecta na API:**
- Confirme que `NEXT_PUBLIC_API_URL` em `frontend/.env.local` aponta para `http://localhost:8000`
- Verifique se o backend está rodando

**Erro de CORS:**
- O backend já está configurado para aceitar requisições de `localhost:3000`. Se usar outra porta, ajuste `allow_origins` em `backend/app/main.py`

**Banco de dados:**
- O arquivo `escritorio.db` é criado automaticamente na pasta `backend/`
- Para resetar todos os dados, basta deletar o arquivo e reiniciar o backend

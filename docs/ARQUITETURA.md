# Escritório Virtual Financeiro — Documentação de Arquitetura

> Sistema de gestão financeira pessoal e profissional da Família Carvalho.
> Stack: Next.js 14 + FastAPI + SQLite → PostgreSQL

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura em Camadas](#2-arquitetura-em-camadas)
3. [Modelo de Dados (ERD)](#3-modelo-de-dados-erd)
4. [Diagrama de Componentes Frontend](#4-diagrama-de-componentes-frontend)
5. [Mapa de Endpoints da API](#5-mapa-de-endpoints-da-api)
6. [Fluxo de Autenticação](#6-fluxo-de-autenticação)
7. [Fluxo de uma Transação](#7-fluxo-de-uma-transação)
8. [Arquitetura do Dashboard](#8-arquitetura-do-dashboard)
9. [Motor do Radar Financeiro](#9-motor-do-radar-financeiro)
10. [Assistente de IA](#10-assistente-de-ia)
11. [Fluxo de Estado no Frontend](#11-fluxo-de-estado-no-frontend)
12. [Stack Tecnológico](#12-stack-tecnológico)
13. [Implantação](#13-implantação)

---

## 1. Visão Geral

O Escritório Virtual Financeiro é uma aplicação web full-stack que oferece controle financeiro completo com visual de fintech moderna. O sistema é dividido em dois processos independentes que se comunicam via HTTP/REST:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ESCRITÓRIO VIRTUAL FINANCEIRO                      │
│                                                                         │
│   ┌──────────────────────┐          ┌──────────────────────────────┐   │
│   │   FRONTEND           │          │   BACKEND                    │   │
│   │   Next.js 14         │  HTTP    │   FastAPI (Python)           │   │
│   │   React 18           │◄────────►│   SQLAlchemy ORM             │   │
│   │   TypeScript         │  REST    │   JWT Auth                   │   │
│   │   Porta :3000        │          │   Porta :8000                │   │
│   └──────────────────────┘          └──────────────┬───────────────┘   │
│                                                    │ SQL                │
│                                            ┌───────▼──────────┐        │
│                                            │   DATABASE       │        │
│                                            │   SQLite (dev)   │        │
│                                            │   PostgreSQL     │        │
│                                            │   (produção)     │        │
│                                            └──────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Funcionalidades principais:**
- Dashboard com KPIs e 4 tipos de gráficos (últimos 6 meses)
- CRUD completo de Receitas, Despesas e Categorias
- Metas financeiras com progresso
- Relatórios comparativos (diário / semanal / mensal / anual)
- Radar Financeiro com Score 0–100, alertas e previsões
- Assistente de IA com análise de padrões financeiros
- Autenticação JWT com 7 dias de validade

---

## 2. Arquitetura em Camadas

```mermaid
graph TB
    subgraph FRONTEND["Frontend — Next.js 14 (porta 3000)"]
        direction TB
        subgraph PAGES["App Router (Pages)"]
            P1["/login"]
            P2["/register"]
            P3["/dashboard"]
            P4["/dashboard/expenses"]
            P5["/dashboard/revenues"]
            P6["/dashboard/categories"]
            P7["/dashboard/goals"]
            P8["/dashboard/radar"]
            P9["/dashboard/ai-assistant"]
            P10["/dashboard/reports"]
        end

        subgraph COMPONENTS["Components"]
            C1["Layout: Sidebar + Header"]
            C2["Dashboard: SummaryCards"]
            C3["Charts: Donut/Bar/Line/Area"]
            C4["Forms: ExpenseForm / RevenueForm"]
            C5["UI: shadcn/ui primitives"]
        end

        subgraph LIBS["Libs & State"]
            L1["lib/api.ts — HTTP Client"]
            L2["lib/auth.ts — Token Manager"]
            L3["lib/utils.ts — Formatadores"]
            L4["SWR — Data Cache"]
            L5["localStorage — Auth State"]
        end
    end

    subgraph BACKEND["Backend — FastAPI (porta 8000)"]
        direction TB
        subgraph ROUTES["API Routes"]
            R1["/auth — Registro/Login"]
            R2["/revenues — Receitas CRUD"]
            R3["/expenses — Despesas CRUD"]
            R4["/categories — Categorias CRUD"]
            R5["/goals — Metas CRUD"]
            R6["/dashboard — KPIs + Charts"]
            R7["/reports — Relatórios"]
            R8["/ai — Chat IA"]
            R9["/radar — Score + Alertas"]
        end

        subgraph CORE["Core"]
            K1["security.py — JWT + bcrypt"]
            K2["deps.py — Injeção get_current_user"]
            K3["database.py — Session SQLAlchemy"]
        end

        subgraph MODELS["Models (ORM)"]
            M1["User"]
            M2["Category"]
            M3["Expense"]
            M4["Revenue"]
            M5["Goal"]
        end

        subgraph SCHEMAS["Schemas (Pydantic)"]
            S1["UserCreate / UserOut / Token"]
            S2["ExpenseCreate / ExpenseOut"]
            S3["RevenueCreate / RevenueOut"]
            S4["CategoryCreate / CategoryOut"]
            S5["GoalCreate / GoalOut"]
        end
    end

    subgraph DB["Banco de Dados"]
        DB1[("SQLite\nescritoriovirtual.db")]
        DB2[("PostgreSQL\n(produção)")]
    end

    PAGES --> LIBS
    PAGES --> COMPONENTS
    LIBS --> BACKEND
    ROUTES --> CORE
    ROUTES --> SCHEMAS
    SCHEMAS --> MODELS
    MODELS --> DB1
    DB1 -.->|"migração"| DB2
```

---

## 3. Modelo de Dados (ERD)

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email UK
        string hashed_password
        datetime created_at
    }

    CATEGORIES {
        int id PK
        int user_id FK
        string name
        string type "revenue | expense"
        string color "#hexcolor"
        string icon "emoji"
        datetime created_at
    }

    REVENUES {
        int id PK
        int user_id FK
        int category_id FK
        string description
        float amount
        date date
        text observation
        datetime created_at
    }

    EXPENSES {
        int id PK
        int user_id FK
        int category_id FK
        string description
        float amount
        date date
        string payment_method "PIX|Dinheiro|Cartão..."
        text observation
        datetime created_at
    }

    GOALS {
        int id PK
        int user_id FK
        string name
        float target_amount
        float current_amount
        date deadline
        string color "#hexcolor"
        datetime created_at
    }

    USERS ||--o{ CATEGORIES : "possui"
    USERS ||--o{ REVENUES : "lança"
    USERS ||--o{ EXPENSES : "lança"
    USERS ||--o{ GOALS : "define"
    CATEGORIES ||--o{ REVENUES : "classifica"
    CATEGORIES ||--o{ EXPENSES : "classifica"
```

**Regras de integridade:**
- Toda tabela filha tem `cascade="all, delete-orphan"` — deletar um usuário remove todos os seus dados.
- `category_id` em receitas/despesas é opcional (nullable), permitindo lançamentos sem categoria.
- `email` é único globalmente (não por usuário).
- `current_amount` na meta nunca ultrapassa `target_amount` (regra no endpoint `PUT /goals/{id}/add-amount`).

---

## 4. Diagrama de Componentes Frontend

```mermaid
graph TD
    subgraph ROOT["app/layout.tsx — Root Layout (dark mode)"]
        subgraph PUBLIC["Rotas Públicas"]
            LOGIN["app/login/page.tsx\n• Form: email + senha\n• Validação Zod\n• POST /auth/login"]
            REGISTER["app/register/page.tsx\n• Form: nome, email, senha, confirmar\n• Validação Zod\n• POST /auth/register"]
        end

        subgraph PROTECTED["app/dashboard/layout.tsx — Protected Layout\n(redireciona /login se não autenticado)"]
            SIDEBAR["Sidebar.tsx\n• Menu de navegação\n• Desktop fixed / Mobile overlay\n• Logo Família Carvalho\n• Botão Logout"]
            HEADER["Header.tsx\n• Título dinâmico por rota\n• Avatar com iniciais do usuário"]

            subgraph DASH_PAGES["Páginas do Dashboard"]
                D1["dashboard/page.tsx\n• SummaryCards\n• DonutChart\n• BarChart\n• LineChart\n• AreaChart\n• TopExpenses"]
                D2["expenses/page.tsx\n• Filtro por mês\n• Tabela paginada\n• ExpenseForm (create/edit)"]
                D3["revenues/page.tsx\n• Filtro por mês\n• Tabela paginada\n• RevenueForm (create/edit)"]
                D4["categories/page.tsx\n• Tabs: Despesas | Receitas\n• Grid de cards com emoji/cor"]
                D5["goals/page.tsx\n• Grid de metas\n• Barra de progresso %\n• Modal add-amount"]
                D6["radar/page.tsx\n• Score circular SVG\n• Alertas coloridos\n• Detecção desperdícios\n• Anomalias"]
                D7["ai-assistant/page.tsx\n• Interface chat\n• 8 sugestões predefinidas\n• Mensagens user/assistant"]
                D8["reports/page.tsx\n• Seletor de período\n• Date picker\n• Cards comparativos\n• Tabelas de transações"]
            end
        end
    end

    LOGIN --> PROTECTED
    REGISTER --> PROTECTED
    PROTECTED --> SIDEBAR
    PROTECTED --> HEADER
    PROTECTED --> DASH_PAGES
```

---

## 5. Mapa de Endpoints da API

```mermaid
graph LR
    subgraph AUTH["/auth"]
        A1["POST /register\n201 → Token + User\n+ 16 categorias padrão"]
        A2["POST /login\n200 → Token + User"]
        A3["GET /me\n200 → UserOut"]
    end

    subgraph CAT["/categories"]
        C1["GET /\n?type=expense|revenue\n→ List[CategoryOut]"]
        C2["POST /\n201 → CategoryOut"]
        C3["PUT /{id}\n200 → CategoryOut"]
        C4["DELETE /{id}\n204 No Content"]
    end

    subgraph EXP["/expenses"]
        E1["GET /\n?month=2024-06\n?start=date&end=date\n?category_id=int\n→ List[ExpenseOut]"]
        E2["POST /\n201 → ExpenseOut"]
        E3["GET /{id}\n200 → ExpenseOut"]
        E4["PUT /{id}\n200 → ExpenseOut"]
        E5["DELETE /{id}\n204 No Content"]
    end

    subgraph REV["/revenues"]
        R1["GET /\n?month=2024-06\n→ List[RevenueOut]"]
        R2["POST /\n201 → RevenueOut"]
        R3["GET /{id}\n200 → RevenueOut"]
        R4["PUT /{id}\n200 → RevenueOut"]
        R5["DELETE /{id}\n204 No Content"]
    end

    subgraph GOALS["/goals"]
        G1["GET /\n→ List[GoalOut + percentage]"]
        G2["POST /\n201 → GoalOut"]
        G3["PUT /{id}\n200 → GoalOut"]
        G4["PUT /{id}/add-amount\nbody: {amount: float}\ncap = target_amount"]
        G5["DELETE /{id}\n204 No Content"]
    end

    subgraph DASH["/dashboard"]
        DH1["GET /summary\n?month=2024-06\n→ KPIs + top_expenses\n+ expense_categories"]
        DH2["GET /charts\n→ monthly_comparison\n+ expense_distribution\n+ patrimony_evolution\n+ cashflow (6 meses)"]
    end

    subgraph REP["/reports"]
        RP1["GET /summary\n?period=daily|weekly\n|monthly|annual\n?reference_date=date\n→ Comparativo + transactions"]
    end

    subgraph AI["/ai"]
        AI1["POST /chat\nbody: {message: str}\n→ {response, data}"]
    end

    subgraph RAD["/radar"]
        RD1["GET /analysis\n→ score + alerts\n+ predictions\n+ waste_detection\n+ anomalies"]
    end

    JWT(["Bearer Token\nHTTP Header\n(todos os endpoints\nexceto /auth/register\ne /auth/login)"]) --> CAT
    JWT --> EXP
    JWT --> REV
    JWT --> GOALS
    JWT --> DASH
    JWT --> REP
    JWT --> AI
    JWT --> RAD
```

---

## 6. Fluxo de Autenticação

```mermaid
sequenceDiagram
    actor User as Usuário
    participant FE as Frontend (Next.js)
    participant LS as localStorage
    participant BE as Backend (FastAPI)
    participant DB as Banco de Dados

    rect rgb(30, 50, 80)
        Note over User,DB: REGISTRO
        User->>FE: Preenche form (nome, email, senha)
        FE->>FE: Valida com Zod
        FE->>BE: POST /auth/register
        BE->>DB: SELECT users WHERE email = ?
        DB-->>BE: Nenhum registro (email livre)
        BE->>DB: INSERT INTO users (bcrypt hash)
        BE->>DB: INSERT INTO categories (16 padrão)
        BE->>BE: create_access_token(sub=user_id, exp=7d)
        BE-->>FE: 201 {access_token, token_type, user}
        FE->>LS: setToken(access_token)
        FE->>LS: setUser(user)
        FE->>FE: router.push('/dashboard')
    end

    rect rgb(30, 60, 40)
        Note over User,DB: LOGIN
        User->>FE: Preenche email + senha
        FE->>BE: POST /auth/login
        BE->>DB: SELECT users WHERE email = ?
        DB-->>BE: User record
        BE->>BE: bcrypt.checkpw(password, hash)
        BE->>BE: create_access_token(sub=user_id)
        BE-->>FE: 200 {access_token, token_type, user}
        FE->>LS: setToken() + setUser()
        FE->>FE: router.push('/dashboard')
    end

    rect rgb(60, 30, 30)
        Note over User,DB: REQUISIÇÃO AUTENTICADA
        FE->>LS: getToken()
        LS-->>FE: "eyJhbG..."
        FE->>BE: GET /expenses\nAuthorization: Bearer eyJhbG...
        BE->>BE: HTTPBearer extrai token
        BE->>BE: jwt.decode(token, SECRET_KEY)
        BE->>DB: SELECT users WHERE id = payload.sub
        DB-->>BE: User object
        BE->>DB: SELECT expenses WHERE user_id = ?
        DB-->>BE: List[Expense]
        BE-->>FE: 200 List[ExpenseOut]
    end

    rect rgb(60, 40, 10)
        Note over User,DB: TOKEN EXPIRADO / INVÁLIDO
        FE->>BE: GET /dashboard/summary\nAuthorization: Bearer expired_token
        BE->>BE: jwt.decode → JWTError
        BE-->>FE: 401 Unauthorized
        FE->>LS: removeToken() + removeUser()
        FE->>FE: window.location.href = '/login'
    end
```

---

## 7. Fluxo de uma Transação

```mermaid
sequenceDiagram
    actor User as Usuário
    participant Form as ExpenseForm
    participant SWR as SWR Cache
    participant API as lib/api.ts
    participant BE as FastAPI Route
    participant Val as Pydantic Validator
    participant ORM as SQLAlchemy ORM
    participant DB as SQLite

    User->>Form: Preenche: descrição, valor, data, categoria, pagamento
    Form->>Form: Validação Zod (client-side)

    alt Criação (POST)
        Form->>API: api.post('/expenses', data)
        API->>BE: POST /expenses + Bearer Token
        BE->>BE: get_current_user() → User object
        BE->>Val: ExpenseCreate.model_validate(body)
        Val-->>BE: ExpenseCreate validado
        BE->>ORM: Expense(**data, user_id=user.id)
        ORM->>DB: INSERT INTO expenses
        DB-->>ORM: id = 42
        ORM->>DB: SELECT expenses JOIN categories WHERE id=42
        DB-->>ORM: Expense + Category
        BE-->>API: 201 ExpenseOut{id, category{...}, ...}
        API-->>Form: ExpenseOut
        Form->>SWR: mutate('/expenses?month=...')
        SWR->>BE: GET /expenses?month=2024-06
        BE-->>SWR: List[ExpenseOut] atualizada
        SWR-->>Form: Rerender tabela
        Form->>Form: Fecha modal / reseta estado

    else Edição (PUT)
        Form->>API: api.put('/expenses/42', data)
        API->>BE: PUT /expenses/42 + Bearer Token
        BE->>DB: SELECT WHERE id=42 AND user_id=current
        DB-->>BE: Expense object
        BE->>ORM: Aplica campos de ExpenseUpdate
        ORM->>DB: UPDATE expenses SET ... WHERE id=42
        BE-->>API: 200 ExpenseOut atualizado
        API-->>Form: ExpenseOut
        Form->>SWR: mutate('/expenses?month=...')

    else Deleção (DELETE)
        Form->>API: api.delete('/expenses/42')
        API->>BE: DELETE /expenses/42 + Bearer Token
        BE->>DB: DELETE FROM expenses WHERE id=42 AND user_id=current
        BE-->>API: 204 No Content
        API-->>Form: undefined
        Form->>SWR: mutate('/expenses?month=...')
    end
```

---

## 8. Arquitetura do Dashboard

```mermaid
graph TD
    subgraph PAGE["dashboard/page.tsx"]
        STATE["Estado: month (seletor de mês)"]

        subgraph SWR_CALLS["Chamadas SWR (paralelas)"]
            SWR1["useSWR('/dashboard/summary?month={month}')"]
            SWR2["useSWR('/dashboard/charts')"]
        end

        subgraph RENDER["Renderização"]
            CARDS["SummaryCards\n• Saldo Atual (verde/vermelho)\n• Receitas do Mês\n• Despesas do Mês\n• Lucro/Prejuízo\n• Economia + Meta (progress bar)"]

            subgraph CHARTS["Grid de Gráficos (Recharts)"]
                CH1["DonutChart\n← expense_distribution\nDespesas por categoria"]
                CH2["BarChart\n← monthly_comparison\nReceitas vs Despesas (6 meses)"]
                CH3["LineChart\n← patrimony_evolution\nEvolução do patrimônio"]
                CH4["AreaChart\n← cashflow\nFluxo de caixa"]
            end

            TOP["TopExpenses\n← top_expenses\nTop 10 maiores gastos"]
        end
    end

    subgraph BACKEND_DASH["Backend /dashboard"]
        SUMMARY_EP["GET /summary\n1. Soma revenues do mês\n2. Soma expenses do mês\n3. Calcula saldo acumulado (histórico)\n4. Agrupa expenses por categoria\n5. Ordena top_expenses DESC"]

        CHARTS_EP["GET /charts\n1. Busca últimos 6 meses\n2. Agrupa por mês\n3. Calcula patrimônio acumulado\n4. Retorna 4 datasets"]
    end

    STATE --> SWR1
    STATE --> SWR2
    SWR1 --> SUMMARY_EP
    SWR2 --> CHARTS_EP
    SUMMARY_EP --> CARDS
    SUMMARY_EP --> TOP
    CHARTS_EP --> CH1
    CHARTS_EP --> CH2
    CHARTS_EP --> CH3
    CHARTS_EP --> CH4
```

**Dados retornados por `/dashboard/summary`:**
```json
{
  "current_balance": 5000.00,
  "monthly_revenue": 8000.00,
  "monthly_expenses": 3000.00,
  "monthly_profit": 5000.00,
  "accumulated_savings": 25000.00,
  "monthly_goal": 10000.00,
  "goal_percentage": 80.0,
  "expense_categories": [
    { "name": "Alimentação", "amount": 600, "percentage": 20.0, "color": "#f97316" }
  ],
  "top_expenses": [
    { "description": "Supermercado", "amount": 250.0, "category": "Alimentação" }
  ]
}
```

---

## 9. Motor do Radar Financeiro

```mermaid
flowchart TD
    START(["GET /radar/analysis"]) --> AUTH["Autenticar usuário"]

    AUTH --> FETCH["Buscar dados do mês atual e anterior\n• revenues, expenses\n• categories, goals"]

    FETCH --> SCORE["CÁLCULO DO SCORE (0–100)"]

    subgraph SCORE_CALC["Score = soma das 4 dimensões"]
        S1["Expense Ratio (0–40 pts)\n= (1 - expenses/revenues) × 40\n• Ex: gasto 37.5% → score 25"]
        S2["Goal Tracking (0–20 pts)\n= +20 se user tem metas\n• Incentiva disciplina"]
        S3["Revenue Sources (0–20 pts)\n= 5 pts por categoria diferente\n• Max 4 fontes = 20 pts"]
        S4["Expense Stability (0–20 pts)\n= baseado em variação vs mês anterior\n• Baixa variação = alta pontuação"]
    end

    SCORE --> S1
    SCORE --> S2
    SCORE --> S3
    SCORE --> S4

    S1 --> LABEL["Score Label\n0–40: Crítico (vermelho)\n41–60: Atenção (laranja)\n61–75: Regular (amarelo)\n76–90: Bom (verde claro)\n91–100: Excelente (verde)"]

    LABEL --> ALERTS["GERAÇÃO DE ALERTAS"]

    subgraph ALERT_RULES["Regras de Alerta"]
        AL1{"Categoria >\n35% das despesas?"}
        AL2{"Despesas >\nReceitas?"}
        AL3{"Aumento > 30%\nvs mês anterior?"}
        AL4{"Sem receitas\nno mês?"}
        AL5{"Tudo OK?"}

        AL1 -->|sim| AW1["⚠️ warning: Alto gasto em {cat}"]
        AL2 -->|sim| AW2["🔴 danger: Déficit financeiro"]
        AL3 -->|sim| AW3["📈 danger: Anomalia em {cat}"]
        AL4 -->|sim| AW4["⛔ danger: Sem receitas"]
        AL5 -->|sim| AW5["✅ success: Finanças sob controle"]
    end

    ALERTS --> AL1
    ALERTS --> AL2
    ALERTS --> AL3
    ALERTS --> AL4
    ALERTS --> AL5

    ALERTS --> WASTE["DETECÇÃO DE DESPERDÍCIOS"]

    subgraph WASTE_RULES["Padrões de Desperdício"]
        W1{"Assinaturas\n> R$ 200?"}
        W2{"Alimentação\n> 30% despesas?"}

        W1 -->|sim| WS1["Sugestão: Revise assinaturas"]
        W2 -->|sim| WS2["Sugestão: Reduza alimentação"]
    end

    WASTE --> W1
    WASTE --> W2

    WASTE --> PREDICT["PREVISÕES"]

    subgraph PREDICTIONS["Cálculo de Previsões"]
        PR1["next_month_balance\n= saldo atual + receitas médias\n- despesas médias"]
        PR2["savings_potential\n= soma dos desperdícios × 30%"]
    end

    PREDICT --> PR1
    PREDICT --> PR2

    PR2 --> RESPONSE["Retornar RadarAnalysis\n{score, label, color, alerts,\npredictions, waste_detection, anomalies}"]
```

---

## 10. Assistente de IA

```mermaid
flowchart LR
    INPUT["POST /ai/chat\n{message: string}"] --> LOWER["message.lower()"]

    LOWER --> MATCH{"Pattern\nMatching"}

    MATCH -->|"onde.*gastando\nmaior.*gasto"| R1["📊 Top Categorias\nLista top 5 por valor\ncom percentual e flag ⚠️ se > 30%"]
    MATCH -->|"econom.*\ncortar"| R2["💡 Como Economizar\nTop 3 categorias\nSugestão: reduzir 15% cada\nEconomia potencial em BRL"]
    MATCH -->|"investir\ndisponível"| R3["💰 Potencial de Investimento\n30% do lucro do mês\nPerfis: conservador / moderado / arrojado"]
    MATCH -->|"lucro\nresultado"| R4["📈 Resultado do Mês\nReceitas, Despesas, Lucro\nSaldo acumulado"]
    MATCH -->|"alimenta[cç][aã]o\ncomida"| R5["🍽️ Análise Alimentação\nValor gasto\nIdeal: < 25%\nStatus vs benchmark"]
    MATCH -->|"top.*gasto\nmaior.*despesa"| R6["🏆 Top 5 Maiores Despesas\nRanking com valores"]
    MATCH -->|"meta\nobjetivo"| R7["🎯 Status das Metas\nNome, progresso %, valor atual/alvo\nDias restantes"]
    MATCH -->|"receita\nganhei"| R8["💵 Análise de Receitas\nTotal, quantidade\nMédia por lançamento"]
    MATCH -->|default| R9["📋 Resumo Geral\nReceitas, despesas, lucro\nSaldo acumulado\nCategoria principal\nSugestão genérica"]

    R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 --> FORMAT["Formatar resposta\nem Markdown\ncom emojis e BRL"]

    FORMAT --> RESP["Response\n{response: str, data: dict}"]
```

**Sugestões predefinidas no chat:**
```
1. "Onde estou gastando mais?"
2. "Como posso economizar?"
3. "Quanto posso investir?"
4. "Qual foi meu lucro esse mês?"
5. "Analise meus gastos com alimentação"
6. "Quais foram meus top 5 maiores gastos?"
7. "Como estão minhas metas?"
8. "Analise minhas receitas"
```

---

## 11. Fluxo de Estado no Frontend

```mermaid
stateDiagram-v2
    [*] --> LANDING: Acessa "/"

    LANDING --> CHECK_AUTH: isAuthenticated()

    CHECK_AUTH --> LOGIN_PAGE: token ausente / expirado
    CHECK_AUTH --> DASHBOARD: token válido no localStorage

    LOGIN_PAGE --> POST_LOGIN: Submit form
    POST_LOGIN --> STORE_TOKEN: 200 OK
    POST_LOGIN --> SHOW_ERROR: 401/422 Error
    SHOW_ERROR --> LOGIN_PAGE
    STORE_TOKEN --> DASHBOARD

    state DASHBOARD {
        [*] --> FETCH_DATA: SWR.useSWR()

        FETCH_DATA --> RENDER: 200 dados carregados
        FETCH_DATA --> LOADING: aguardando resposta
        LOADING --> RENDER
        FETCH_DATA --> AUTH_ERROR: 401 Unauthorized

        AUTH_ERROR --> CLEAR_STORAGE: removeToken()
        CLEAR_STORAGE --> [*]: redirect /login

        RENDER --> MUTATE: CRUD action
        MUTATE --> FETCH_DATA: SWR revalidate
    }

    DASHBOARD --> LOGOUT: Clica "Sair"
    LOGOUT --> CLEAR_STORAGE2: removeToken() + removeUser()
    CLEAR_STORAGE2 --> LOGIN_PAGE
```

**Camadas de estado:**

| Camada | Tecnologia | Dados |
|--------|-----------|-------|
| Autenticação | `localStorage` | `evf_auth_token`, `evf_user` |
| Server data | `SWR` | Receitas, despesas, dashboard, etc. |
| UI local | `React.useState` | Formulários, modais, filtros |
| Formulários | `react-hook-form + Zod` | Validação de campos |

---

## 12. Stack Tecnológico

```mermaid
graph TD
    subgraph FRONT["Frontend"]
        F1["Next.js 14\n(App Router, SSR)"]
        F2["React 18\n(Hooks, Suspense)"]
        F3["TypeScript 5\n(tipagem estrita)"]
        F4["Tailwind CSS 3\n(utilitário, dark mode)"]
        F5["Recharts 2\n(gráficos SVG)"]
        F6["SWR 2\n(data fetching + cache)"]
        F7["react-hook-form + Zod\n(formulários validados)"]
        F8["lucide-react\n(ícones SVG)"]
        F9["date-fns 4\n(manipulação de datas)"]
        F10["shadcn/ui\n(componentes acessíveis)"]
    end

    subgraph BACK["Backend"]
        B1["FastAPI 0.115.5\n(async, OpenAPI auto)"]
        B2["SQLAlchemy 2.0\n(ORM + migrations)"]
        B3["Pydantic v2\n(validação + serialização)"]
        B4["python-jose\n(JWT encode/decode)"]
        B5["bcrypt 4\n(hash de senhas)"]
        B6["Uvicorn\n(ASGI server)"]
        B7["python-dotenv\n(variáveis de ambiente)"]
    end

    subgraph INFRA["Infraestrutura"]
        I1["SQLite\n(desenvolvimento local)"]
        I2["PostgreSQL\n(produção)"]
        I3["CORS Middleware\n(localhost:3000 autorizado)"]
    end

    F1 --> F2 --> F3
    B1 --> B2 --> B3
    B1 --> B4
    B1 --> B5
    B2 --> I1
    I1 -.->|"migração prod"| I2
```

**Versões das dependências:**

| Pacote | Versão | Papel |
|--------|--------|-------|
| `next` | 14.2.18 | Framework React (App Router) |
| `react` | ^18 | UI library |
| `recharts` | ^2.13.3 | Gráficos (Donut, Bar, Line, Area) |
| `swr` | ^2.2.5 | Data fetching com cache |
| `zod` | ^3.23.8 | Validação de schemas no frontend |
| `date-fns` | ^4.1.0 | Formatação e cálculos de datas |
| `fastapi` | 0.115.5 | Framework API Python |
| `sqlalchemy` | 2.0.36 | ORM + Core SQL |
| `pydantic[email]` | 2.10.3 | Validação + serialização de dados |
| `python-jose[cryptography]` | 3.3.0 | JWT tokens |
| `bcrypt` | 4.2.1 | Hash seguro de senhas |
| `uvicorn[standard]` | 0.32.1 | Servidor ASGI assíncrono |

---

## 13. Implantação

### Desenvolvimento (local)

```
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev   # → localhost:3000

# Alternativa: scripts .bat na raiz
start-backend.bat
start-frontend.bat
```

### Variáveis de Ambiente

**Backend (`backend/.env`):**
```env
SECRET_KEY=sua-chave-secreta-muito-segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080    # 7 dias
DATABASE_URL=sqlite:///./escritorio.db
# Produção:
# DATABASE_URL=postgresql://user:pass@host:5432/escritorio
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# Produção:
# NEXT_PUBLIC_API_URL=https://api.escritoriovirtual.com.br
```

### Arquitetura de Produção (sugerida)

```
Internet
   │
   ▼
[Reverse Proxy — Nginx / Vercel / Cloudflare]
   │                        │
   ▼                        ▼
[Frontend]              [Backend]
Next.js (Vercel)        FastAPI (Railway / EC2)
Static assets CDN       Uvicorn workers
   │                        │
   │                        ▼
   │                  [PostgreSQL]
   │                  Neon / RDS / Supabase
   │                        │
   └────────────────────────┘
         HTTP/REST + JWT
```

### Segurança em Produção

- [ ] Trocar `SECRET_KEY` por valor de 64+ caracteres aleatórios
- [ ] Migrar `DATABASE_URL` para PostgreSQL com SSL
- [ ] Configurar `allow_origins` do CORS para domínio real
- [ ] HTTPS obrigatório (TLS/SSL)
- [ ] Rate limiting nos endpoints de auth (`/auth/login`, `/auth/register`)
- [ ] Validar e sanitizar inputs no frontend antes do envio
- [ ] Logs de auditoria para operações financeiras críticas
- [ ] Backup automático do banco de dados

---

*Documentação gerada em 2026-06-21 | Arquitetura: Escritório Virtual Financeiro v1.0.0*

# SendFlow Challenge

Aplicação web full-stack para gerenciamento de conexões, contatos e envio agendado de mensagens.

## O que é o projeto

SendFlow é uma plataforma que permite ao usuário organizar **conexões** (grupos/canais), cadastrar **contatos** com número de telefone dentro de cada conexão e agendar **mensagens** para serem enviadas a um ou mais contatos em uma data e horário definidos.

Funcionalidades principais:
- Autenticação com e-mail e senha (Firebase Auth)
- CRUD de conexões
- CRUD de contatos com validação de número de telefone
- Criação e agendamento de mensagens com seleção de múltiplos destinatários
- Acompanhamento de status das mensagens (`scheduled` / `sent`)
- Interface responsiva com suporte a mobile

---

## Estrutura do projeto

```
sendflow-challenge/
├── web/                        # Aplicação principal
│   ├── src/
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ConnectionsPage.tsx
│   │   │   ├── ContactsPage.tsx
│   │   │   └── MessagesPage.tsx
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── Layout.tsx      # Navegação lateral (desktop) e drawer (mobile)
│   │   │   └── ProtectedRoute.tsx
│   │   ├── functions/          # Chamadas às Firebase Cloud Functions (cliente)
│   │   ├── hooks/              # Custom hooks (ex: useAuth)
│   │   ├── lib/                # Inicialização do Firebase
│   │   ├── schemas/            # Schemas de validação Zod
│   │   ├── types/              # Tipos TypeScript
│   │   └── test/               # Testes unitários e de integração
│   │
│   ├── functions/              # Backend — Firebase Cloud Functions
│   │   └── src/
│   │       ├── connections.ts  # Endpoints de conexões
│   │       ├── contacts.ts     # Endpoints de contatos
│   │       ├── messages.ts     # Endpoints de mensagens + agendamento
│   │       └── lib/db.ts       # Admin SDK e helpers de autenticação
│   │
│   ├── firebase.json           # Configuração do Firebase (hosting, functions, emuladores)
│   ├── firestore.rules         # Regras de segurança do Firestore
│   ├── firestore.indexes.json  # Índices do Firestore
│   ├── vite.config.ts
│   └── vitest.config.ts
```

---

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router 7 |
| UI | Material-UI (MUI), TailwindCSS |
| Formulários | react-hook-form + Zod |
| Backend | Firebase Cloud Functions (Node.js 22) |
| Banco de dados | Firestore (NoSQL) |
| Autenticação | Firebase Auth |
| Testes | Vitest, React Testing Library |

---

## Modelos de dados

**Connection**
```ts
{ id, userId, name, createdAt }
```

**Contact**
```ts
{ id, userId, connectionId, name, phone, createdAt }
```

**Message**
```ts
{ id, userId, connectionId, contactIds[], content, status, scheduledAt, createdAt }
```

---

## Como rodar localmente

### Pré-requisitos
- Node.js 22+
- Firebase CLI (`npm install -g firebase-tools`)

### Frontend

```bash
cd web
npm install
npm run dev
```

### Firebase Emulators (backend + banco local)

```bash
cd web
firebase emulators:start
```

Os emuladores sobem em:
- Firestore: `http://localhost:8080`
- Functions: `http://localhost:5001`
- Hosting: `http://localhost:5000`

### Testes

```bash
cd web
npm run test
```

---

## Deploy

```bash
cd web
npm run build
firebase deploy
```

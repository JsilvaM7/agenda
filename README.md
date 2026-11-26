# 📅 Agenda — Sistema de Agendamento para Pequenas Empresas

> Software de agendamento online com tema laranja, notificações push e faturamento automático.

---

## 🚀 Como configurar

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha `.env` com:
- `DATABASE_URL` — string de conexão PostgreSQL
- `NEXTAUTH_SECRET` — chave secreta (gere com `openssl rand -base64 32`)
- Credenciais do Firebase (para notificações push)
- `ADMIN_EMAIL` e `ADMIN_PASSWORD` — seu acesso de administrador

### 3. Configure o banco de dados

```bash
npx prisma generate
npx prisma db push
```

### 4. Rode em desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📱 Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🔗 Link público | `/b/nome-da-empresa` — sem login para o cliente |
| 📅 Calendário | Cliente seleciona data e horário disponível |
| 📸 Galeria | Até 30 fotos em carrossel automático |
| 🔔 Notificação | Push ao receber agendamento |
| ⏰ Lembrete | Push 30 minutos antes do horário |
| 💳 Faturamento | R$1,00/agendamento — fatura mensal automática |
| ⛔ Suspensão | Conta pausada automaticamente se não pagar |
| 🛡️ Admin | Painel completo para gerenciar comerciantes e faturas |

---

## 💰 Modelo de cobrança

- **R$ 1,00** por agendamento confirmado
- Fatura gerada automaticamente no **último dia do mês**
- Vencimento: **10 dias após** geração
- Se não pago: **conta suspensa automaticamente**
- Reativação: marque como pago no painel admin

---

## 🗂️ Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx              <- Landing page
│   ├── login/                <- Login do comerciante
│   ├── register/             <- Cadastro do comerciante
│   ├── dashboard/            <- Painel do comerciante
│   │   ├── page.tsx          <- Visão geral + faturamento
│   │   └── settings/         <- Fotos, horários, perfil
│   ├── b/[slug]/             <- Página pública de agendamento
│   ├── admin/                <- Painel administrador
│   │   ├── page.tsx          <- Lista de comerciantes
│   │   ├── login/            <- Login admin
│   │   ├── invoices/         <- Gestão de faturas
│   │   └── merchant/[id]/    <- Detalhe do comerciante
│   └── api/                  <- API Routes
├── components/               <- Componentes reutilizáveis
└── lib/
    ├── prisma.ts             <- Cliente do banco
    ├── auth.ts               <- Configuração NextAuth
    ├── firebase-admin.ts     <- Notificações push
    └── scheduler.ts          <- Cron: lembretes + faturas
```

---

## 🔥 Firebase (notificações push)

1. Crie um projeto em firebase.google.com
2. Ative o Cloud Messaging
3. Gere chave de serviço em Configurações > Contas de serviço
4. Preencha as variáveis FIREBASE_* no .env

---

## 🌐 Deploy na IONOS (agenda-e-dolphin.com)

1. Faça o push para o GitHub
2. Configure o subdomínio na IONOS apontando para seu servidor
3. Use pm2 ou Docker para rodar em producao:

```bash
npm run build
npm start
```

---

## 🛡️ Acesso admin

```
URL: /admin/login
Email: (configurado em ADMIN_EMAIL no .env)
Senha: (configurado em ADMIN_PASSWORD no .env)
```

---

## 📞 Suporte

suporte@agenda-e-dolphin.com

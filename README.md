# 📅 Agenda

Sistema de agendamento online para pequenas empresas — barbearias, salões, mecânicos e mais.

O comerciante cria uma conta e compartilha um link. O cliente abre o link, escolha a data e horário. Simples assim.

---

## ✅ Como rodar localmente

```bash
# 1. Instale as dependências
npm install

# 2. Configure o banco de dados (SQLite — sem instalação extra)
npx prisma db push

# 3. Inicie o servidor
npm run dev
```

Acesse em: **http://localhost:3000**

---

## ⚙️ Variáveis de ambiente

Crie um arquivo `.env` na raiz (use `.env.example` como base):

```env
DATABASE_URL="file:./agenda.db"
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="http://localhost:3000"

NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:suporte@agenda-e-dolphin.com"

ADMIN_EMAIL="admin@agenda.com"
ADMIN_PASSWORD="admin123"
```

---

## 🗂️ Stack

- **Next.js 16** + TypeScript
- **SQLite** (banco embutido, sem servidor)
- **Prisma ORM**
- **NextAuth v4** (autenticação)
- **Tailwind CSS v4**
- **Web Push VAPID** (notificações, sem Firebase)
- **node-cron** (lembretes automáticos)

---

## 💰 Cobrança

- R$ 1,00 por agendamento confirmado
- Fatura gerada automaticamente no final do mês
- Conta suspensa em caso de inadimplência

---

## 🔐 Admin

Acesse `/admin/login` com as credenciais do `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Nome do serviço", type: "text" },
        password: { label: "Senha", type: "password" },
        isAdmin: { label: "Admin", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        // Admin login (usa email e senha do .env)
        if (credentials.isAdmin === "true") {
          if (
            credentials.identifier === process.env.ADMIN_EMAIL &&
            credentials.password === process.env.ADMIN_PASSWORD
          ) {
            return {
              id: "admin",
              email: process.env.ADMIN_EMAIL,
              name: "Administrador",
              role: "admin",
            };
          }
          return null;
        }

        // Login de comerciante pelo slug (nome do serviço)
        const slug = slugify(credentials.identifier);

        const business = await prisma.business.findUnique({
          where: { slug },
          include: { user: true },
        });

        if (!business) return null;

        const passwordValid = await bcrypt.compare(
          credentials.password,
          business.user.password
        );
        if (!passwordValid) return null;

        if (!business.active) {
          throw new Error("Conta desativada. Entre em contato com o suporte.");
        }

        return {
          id: business.user.id,
          email: business.user.email ?? business.slug,
          name: business.name,
          role: "merchant",
          businessSlug: business.slug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.businessSlug = (user as any).businessSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).businessSlug = token.businessSlug;
      }
      return session;
    },
  },
};

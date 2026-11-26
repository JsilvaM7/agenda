import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

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
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        isAdmin: { label: "Admin", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Verifica se é login de admin
        if (credentials.isAdmin === "true") {
          if (
            credentials.email === process.env.ADMIN_EMAIL &&
            credentials.password === process.env.ADMIN_PASSWORD
          ) {
            return {
              id: "admin",
              email: credentials.email,
              name: "Administrador",
              role: "admin",
            };
          }
          return null;
        }

        // Login de comerciante
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { business: true },
        });

        if (!user) return null;

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!passwordValid) return null;

        if (user.business && !user.business.active) {
          throw new Error("Conta desativada. Entre em contato com o suporte.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "merchant",
          businessSlug: user.business?.slug,
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

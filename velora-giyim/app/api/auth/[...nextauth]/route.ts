import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export const authOptions = {
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim()?.toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name:
            `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
            user.email,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }: any) {
      session.user = token.user;
      return session;
    },
  },
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };

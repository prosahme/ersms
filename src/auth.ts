import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
  const email = credentials?.email as string | undefined;
  const password = credentials?.password as string | undefined;

  console.log("LOGIN ATTEMPT:", email, password);

  if (!email || !password) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  console.log("USER FOUND:", user ? user.email : "NO USER FOUND");

  if (!user) return null;
  if (!user.isActive) {
    console.log("ACCOUNT IS DISABLED");
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  console.log("PASSWORD MATCHES:", passwordMatches);

  if (!passwordMatches) return null;

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role,
    firstLogin: user.firstLogin,
  };
},
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.firstLogin = (user as any).firstLogin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).firstLogin = token.firstLogin;
      }
      return session;
    },
  },
});
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID &&
            process.env.GOOGLE_CLIENT_ID !== "your-google-client-id"
            ? [Google({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            })]
            : []
        ),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    include: { hotel: true },
                });

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password as string, user.password);

                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    hotelId: user.hotelId,
                    hotelName: user.hotel?.name,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (user) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: { hotel: true },
                });

                if (dbUser) {
                    token.role = dbUser.role;
                    token.hotelId = dbUser.hotelId;
                    token.hotelName = dbUser.hotel?.name;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role;
                (session.user as any).hotelId = token.hotelId;
                (session.user as any).hotelName = token.hotelName;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
});

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

// Validate environment variables - will throw at runtime if missing, as requested
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL missing");
}

if (!process.env.AUTH_SECRET) {
    // In Vercel build, this might be missing if not provided. 
    // However, user asked for strict validation: "if (!process.env.NEXTAUTH_SECRET) throw..."
    // Since we are using Auth.js (NextAuth v5), the var is usually AUTH_SECRET.
    // I will throw if it is missing, as requested.
    throw new Error("AUTH_SECRET missing");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    trustHost: true,
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

                try {
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
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (user) {
                try {
                    // Optimized: If we just logged in, we have the user object. 
                    // But to be safe and get latest role/hotel, we might re-fetch.
                    // However, avoiding re-fetch if not needed is better for perf.
                    // Let's keep it safe but catch errors.
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id },
                        include: { hotel: true },
                    });

                    if (dbUser) {
                        token.role = dbUser.role;
                        token.hotelId = dbUser.hotelId;
                        token.hotelName = dbUser.hotel?.name;
                    }
                } catch (error) {
                    console.error("JWT Callback Error:", error);
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

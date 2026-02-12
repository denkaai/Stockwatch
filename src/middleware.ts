import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow API routes and static assets through
    if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico")
    ) {
        return NextResponse.next();
    }

    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const isLoggedIn = !!token;

    const isAuthPage = pathname.startsWith("/auth");
    const isOnboardingPage = pathname === "/onboarding";
    const isDashboardPage = pathname.startsWith("/dashboard");

    if (isLoggedIn) {
        const hotelId = (token as any)?.hotelId;

        // If logged in but no hotel, force onboarding
        if (!hotelId && !isOnboardingPage && isDashboardPage) {
            return NextResponse.redirect(new URL("/onboarding", req.url));
        }

        // If logged in and has hotel, prevent onboarding
        if (hotelId && isOnboardingPage) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // If logged in, prevent auth pages
        if (isAuthPage) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    } else {
        // If not logged in and trying to access protected pages
        if (isDashboardPage || isOnboardingPage) {
            return NextResponse.redirect(new URL("/auth/signin", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

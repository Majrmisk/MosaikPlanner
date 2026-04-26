import NextAuth, { type NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './lib/db';

const getIsProtectedPath = (path: string) => {
    // TODO: Add more protected paths here as we add more pages
    const protectedPaths = ['/dashboard'];

    return protectedPaths.some((p) => path.startsWith(p));
};

export const authOptions = {
    providers: [GitHub],
    adapter: DrizzleAdapter(db),
    callbacks: {
        session({ session, user }) {
            session.user.id = user.id;
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isProtected = getIsProtectedPath(nextUrl.pathname);

            if (!isLoggedIn && isProtected) {
                const redirectUrl = new URL('/api/auth/signin', nextUrl.origin);
                redirectUrl.searchParams.append('callbackUrl', nextUrl.href);

                return Response.redirect(redirectUrl);
            }

            return true;
        },
    },
} satisfies NextAuthConfig;

export const { handlers, auth, signOut } = NextAuth(authOptions);

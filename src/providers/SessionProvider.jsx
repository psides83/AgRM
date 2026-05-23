'use client';

import { SessionProvider as NextAuthProvider } from 'next-auth/react';

export function SessionProvider({ children, session }) {
  return <NextAuthProvider session={session}>{children}</NextAuthProvider>;
}

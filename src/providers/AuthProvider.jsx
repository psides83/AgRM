'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from 'lib/supabase/client';

export const demoUser = {
  id: 'guest',
  email: 'guest@agrm.local',
  name: 'Guest',
  image: null,
  designation: 'AgRM',
};

const AuthContext = createContext(null);

function mapSupabaseUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.display_name || user.user_metadata?.name || user.email,
    image: user.user_metadata?.avatar_url || null,
    designation: 'AgRM',
  };
}

export function AuthProvider({ children }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(
    () => ({
      session,
      user: mapSupabaseUser(session?.user),
      isAuthenticated: Boolean(session?.user),
      isLoading,
      supabase,
    }),
    [isLoading, session, supabase]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

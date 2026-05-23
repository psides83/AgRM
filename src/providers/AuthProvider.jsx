'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from 'lib/supabase/client';

export const demoUser = {
  id: 'guest',
  email: 'guest@agrm.local',
  name: 'Guest',
  image: null,
  designation: 'AgRM',
};

const AuthContext = createContext(null);

function mapSupabaseUser(user, profile) {
  if (!user) return null;

  const firstName = profile?.first_name || user.user_metadata?.first_name;
  const lastName = profile?.last_name || user.user_metadata?.last_name;
  const name = [firstName, lastName].filter(Boolean).join(' ');

  return {
    id: user.id,
    email: profile?.email || user.email,
    name: name || user.user_metadata?.name || user.email,
    image: profile?.avatar_url || user.user_metadata?.avatar_url || null,
    designation: profile?.job_title || user.user_metadata?.job_title || 'AgRM',
  };
}

function defaultProfileFromUser(user) {
  const firstName = user.user_metadata?.first_name || '';
  const lastName = user.user_metadata?.last_name || '';

  return {
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    email: user.email,
    phone: user.phone || '',
    avatar_url: user.user_metadata?.avatar_url || null,
    job_title: user.user_metadata?.job_title || '',
    dealership_name: user.user_metadata?.dealership_name || '',
    territory: user.user_metadata?.territory || '',
    timezone: user.user_metadata?.timezone || 'America/Chicago',
    locale: user.user_metadata?.locale || 'en-US',
  };
}

export function AuthProvider({ children }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(
    async (user = session?.user) => {
      if (!user) {
        setProfile(null);
        return null;
      }

      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

      if (error) {
        console.error('Unable to load profile.', error);
        return null;
      }

      if (data) {
        setProfile(data);
        return data;
      }

      const fallbackProfile = defaultProfileFromUser(user);
      const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(fallbackProfile)
        .select('*')
        .single();

      if (insertError) {
        console.error('Unable to create profile.', insertError);
        return null;
      }

      setProfile(insertedProfile);
      return insertedProfile;
    },
    [session?.user, supabase]
  );

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      setSession(data.session);
      setIsLoading(false);
      refreshProfile(data.session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
      refreshProfile(nextSession?.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!session?.user) return undefined;

    const channel = supabase
      .channel(`profile:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setProfile(null);
          } else {
            setProfile(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user, supabase]);

  const value = useMemo(
    () => ({
      session,
      profile,
      user: mapSupabaseUser(session?.user, profile),
      isAuthenticated: Boolean(session?.user),
      isLoading,
      refreshProfile,
      supabase,
    }),
    [isLoading, profile, refreshProfile, session, supabase]
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

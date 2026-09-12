'use client';

import { useEffect, useRef } from 'react';
import { useColorScheme } from '@mui/material';
import { useAuth } from 'providers/AuthProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import {
  SET_LOCALE,
  SET_PRIMARY_COLOR,
  SET_THEME_PRESET,
} from 'reducers/SettingsReducer';

const ProfilePreferencesSync = () => {
  const { mode, setMode } = useColorScheme();
  const { profile, session, supabase } = useAuth();
  const { config, configDispatch } = useSettingsContext();
  const hydratedUserIdRef = useRef(null);
  const isHydratingRef = useRef(false);

  useEffect(() => {
    if (!session?.user || !profile || mode === undefined) return;
    if (hydratedUserIdRef.current === session.user.id) return;

    isHydratingRef.current = true;

    if (profile.locale && profile.locale !== config.locale) {
      configDispatch({ type: SET_LOCALE, payload: profile.locale });
    }

    if (profile.theme_preset && profile.theme_preset !== config.themePreset) {
      configDispatch({ type: SET_THEME_PRESET, payload: profile.theme_preset });
    }

    if (
      typeof profile.primary_color !== 'undefined' &&
      profile.primary_color !== config.primaryColor
    ) {
      configDispatch({
        type: SET_PRIMARY_COLOR,
        payload: profile.primary_color,
      });
    }

    if (profile.theme_mode && profile.theme_mode !== mode) {
      setMode(profile.theme_mode);
    }

    hydratedUserIdRef.current = session.user.id;
    window.setTimeout(() => {
      isHydratingRef.current = false;
    }, 0);
  }, [
    config.locale,
    config.primaryColor,
    config.themePreset,
    configDispatch,
    mode,
    profile,
    session?.user,
    setMode,
  ]);

  useEffect(() => {
    if (!session?.user || !profile || mode === undefined) return undefined;
    if (hydratedUserIdRef.current !== session.user.id) return undefined;
    if (isHydratingRef.current) return undefined;

    const nextPreferences = {
      locale: config.locale,
      theme_mode: mode,
      theme_preset: config.themePreset,
      primary_color: config.primaryColor,
    };

    const hasChanges =
      profile.locale !== nextPreferences.locale ||
      profile.theme_mode !== nextPreferences.theme_mode ||
      profile.theme_preset !== nextPreferences.theme_preset ||
      profile.primary_color !== nextPreferences.primary_color;

    if (!hasChanges) return undefined;

    const timeout = window.setTimeout(async () => {
      await supabase
        .from('profiles')
        .update(nextPreferences)
        .eq('id', session.user.id);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [
    config.locale,
    config.primaryColor,
    config.themePreset,
    mode,
    profile,
    session?.user,
    supabase,
  ]);

  return null;
};

export default ProfilePreferencesSync;

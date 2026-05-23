import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSettingsContext } from 'providers/SettingsProvider';
import {
  RESET,
  SET_LOCALE,
  SET_NAV_COLOR,
  SET_NAVIGATION_MENU_TYPE,
  SET_SIDENAV_SHAPE,
} from 'reducers/SettingsReducer';
import { THEME_DISPLAY_NAMES } from 'theme/palettes';
import { useThemeMode } from './useThemeMode';

const validators = {
  themeMode: ['light', 'dark', 'system'],
  themePreset: Object.keys(THEME_DISPLAY_NAMES),
  textDirection: ['ltr', 'rtl'],
  navigationMenuType: ['sidenav', 'topnav', 'combo'],
  sidenavType: ['default', 'stacked', 'slim'],
  topnavType: ['default', 'stacked', 'slim'],
  navColor: ['default', 'vibrant'],
  locale: ['en-US', 'fr-FR', 'bn-BD', 'zh-CN', 'hi-IN', 'ar-SA'],
};

export const useConfigFromQuery = () => {
  const searchParams = useSearchParams();
  const { setThemeMode, setThemePreset } = useThemeMode();
  const { setConfig, configDispatch } = useSettingsContext();
  const queryString = searchParams.toString();
  const themeSettersRef = useRef({ setThemeMode, setThemePreset });
  themeSettersRef.current = { setThemeMode, setThemePreset };

  useEffect(() => {
    const parsedSearchParams = new URLSearchParams(queryString);
    const hasAnyConfig = Object.keys(validators).some((key) => parsedSearchParams.has(key));
    const defaultConfigs = parsedSearchParams.get('defaultConfigs');

    if (!hasAnyConfig && !defaultConfigs) {
      return;
    }

    if ((parsedSearchParams.size > 0 && hasAnyConfig) || defaultConfigs) {
      configDispatch({ type: RESET });
    }

    const config = {};

    Object.keys(validators).forEach((key) => {
      const value = parsedSearchParams.get(key);
      if (value && validators[key].includes(value)) {
        config[key] = value;
      }
    });

    if (Object.keys(config).length) {
      const { setThemeMode: setMode, setThemePreset: setPreset } = themeSettersRef.current;
      const hasThemePreset = Boolean(config.themePreset);
      if (config.themePreset) {
        setPreset(config.themePreset);
        delete config.themePreset;
      }

      if (!hasThemePreset && config.themeMode) {
        setMode(config.themeMode);
      }
      delete config.themeMode;

      if (config.sidenavType) {
        configDispatch({
          type: SET_SIDENAV_SHAPE,
          payload: config.sidenavType,
        });
        delete config.sidenavType;
      }

      if (config.navigationMenuType) {
        configDispatch({
          type: SET_NAVIGATION_MENU_TYPE,
          payload: config.navigationMenuType,
        });
        delete config.navigationMenuType;
      }

      if (config.navColor) {
        configDispatch({
          type: SET_NAV_COLOR,
          payload: config.navColor,
        });
        delete config.navColor;
      }

      if (config.locale) {
        configDispatch({
          type: SET_LOCALE,
          payload: config.locale,
        });
        delete config.locale;
      }

      if (Object.keys(config).length > 0) {
        setConfig(config);
      }
    }
  }, [configDispatch, queryString, setConfig]);
};

import { initialConfig } from 'config';
import { mainDrawerWidth } from 'lib/constants';
import { setItemToStore } from 'lib/utils';

//Action types
export const SET_CONFIG = 'SET_CONFIG';
export const REFRESH = 'REFRESH';
export const RESET = 'RESET';
export const COLLAPSE_NAVBAR = 'COLLAPSE_NAVBAR';
export const EXPAND_NAVBAR = 'EXPAND_NAVBAR';
export const SET_SIDENAV_SHAPE = 'SET_SIDENAV_SHAPE';
export const SET_NAVIGATION_MENU_TYPE = 'SET_NAVIGATION_MENU_TYPE';
export const SET_NAV_COLOR = 'SET_NAV_COLOR';
export const SET_LOCALE = 'SET_LOCALE';
export const SET_THEME_PRESET = 'SET_THEME_PRESET';
export const SET_PRIMARY_COLOR = 'SET_PRIMARY_COLOR';
export const SET_FONT_FAMILY = 'SET_FONT_FAMILY';
export const SET_FONT_SIZE = 'SET_FONT_SIZE';

export const settingsReducer = (state, action) => {
  let updatedState = {};

  switch (action.type) {
    case SET_CONFIG: {
      updatedState = action.payload;
      break;
    }
    case COLLAPSE_NAVBAR: {
      updatedState = {
        sidenavCollapsed: true,
        drawerWidth:
          state.sidenavType === 'stacked'
            ? mainDrawerWidth.stackedNavCollapsed
            : mainDrawerWidth.collapsed,
      };
      break;
    }
    case EXPAND_NAVBAR: {
      updatedState = {
        sidenavCollapsed: false,
        drawerWidth: state.sidenavType === 'slim' ? mainDrawerWidth.slim : mainDrawerWidth.full,
      };
      break;
    }
    case SET_LOCALE: {
      updatedState = {
        locale: action.payload,
        textDirection: action.payload === 'ar-SA' ? 'rtl' : 'ltr',
      };
      break;
    }
    case SET_THEME_PRESET: {
      updatedState = { themePreset: action.payload };
      break;
    }
    case SET_PRIMARY_COLOR: {
      updatedState = { primaryColor: action.payload };
      break;
    }
    case SET_NAVIGATION_MENU_TYPE: {
      switch (action.payload) {
        case 'sidenav': {
          updatedState = {
            navigationMenuType: 'sidenav',
            drawerWidth: state.sidenavType === 'slim' ? mainDrawerWidth.slim : mainDrawerWidth.full,
          };
          break;
        }
        case 'topnav': {
          updatedState = {
            navigationMenuType: 'topnav',
            sidenavCollapsed: false,
            drawerWidth: mainDrawerWidth.full,
          };
          break;
        }
        case 'combo': {
          updatedState = {
            navigationMenuType: 'combo',
            sidenavCollapsed: false,
            drawerWidth: state.sidenavType === 'slim' ? mainDrawerWidth.slim : mainDrawerWidth.full,
          };
          break;
        }
      }
      break;
    }
    case SET_SIDENAV_SHAPE: {
      switch (action.payload) {
        case 'default': {
          updatedState = {
            sidenavType: 'default',
            sidenavCollapsed: false,
            drawerWidth: mainDrawerWidth.full,
          };
          break;
        }
        case 'slim': {
          updatedState = {
            sidenavType: 'slim',
            sidenavCollapsed: false,
            drawerWidth: mainDrawerWidth.slim,
          };
          break;
        }
        case 'stacked': {
          updatedState = {
            sidenavType: 'stacked',
            sidenavCollapsed: false,
            drawerWidth: mainDrawerWidth.full,
          };
          break;
        }
      }
      break;
    }
    case SET_NAV_COLOR: {
      updatedState = { navColor: action.payload };
      break;
    }
    case SET_FONT_FAMILY: {
      updatedState = { fontFamily: action.payload };
      break;
    }
    case SET_FONT_SIZE: {
      updatedState = { fontSize: action.payload };
      break;
    }
    case RESET:
      updatedState = { ...initialConfig };
      break;
    case REFRESH:
      return { ...state };
    default:
      return state;
  }
  Object.keys(updatedState).forEach((key) => {
    if (
      [
        'themeMode',
        'themePreset',
        'primaryColor',
        'sidenavCollapsed',
        'sidenavType',
        'textDirection',
        'navigationMenuType',
        'topnavType',
        'navColor',
        'locale',
        'fontFamily',
        'fontSize',
      ].includes(key)
    ) {
      setItemToStore(key, String(updatedState[key]));
    }
  });

  return { ...state, ...updatedState };
};

import reactFc from 'theme/styles/react-fc';
import reactDatepicker from 'theme/styles/reactDatepicker';
import { darkShadows } from 'theme/shadows';
import colorPicker from 'theme/styles/colorPicker';
import echart from 'theme/styles/echart';
import emojiMart from 'theme/styles/emojiMart';
import keyFrames from 'theme/styles/keyFrames';
import notistack from 'theme/styles/notistack';
import popper from 'theme/styles/popper';
import prism from 'theme/styles/prism';
import projectTimelineChart from 'theme/styles/projectTimelineChart';
import simplebar from 'theme/styles/simplebar';
import svelteGanttChart from 'theme/styles/svelteGanttChart';
import swiper from 'theme/styles/swiper';
import taskTrackChart from 'theme/styles/taskTrackChart';
import vibrantNav from 'theme/styles/vibrantNav';
import yarl from 'theme/styles/yarl';

const CssBaseline = {
  defaultProps: {},
  styleOverrides: (theme) => ({
    html: {
      scrollBehavior: 'smooth',
      fontSize: theme.typography.fontSize,
    },
    '*': {
      scrollbarWidth: 'thin',
    },
    'input:-webkit-autofill': {
      WebkitBoxShadow: `0 0 0px 40rem transparent inset !important`,
      transition: 'background-color 5000s ease-in-out 0s',
    },
    'input:-webkit-autofill:hover': {
      WebkitBoxShadow: `0 0 0px 40rem transparent inset !important`,
    },
    'input:-internal-autofill-selected': {
      appearance: 'none !important',
      backgroundImage: 'none !important',
      backgroundColor: 'transparent !important',
      color: `${theme.vars.palette.text.primary} !important`,
    },
    body: {
      scrollbarColor: `${theme.vars.palette.background.elevation4} transparent`,
      [`h1, h2, h3, h4, h5, h6, p`]: {
        margin: 0,
      },
      fontVariantLigatures: 'none',
      [`[id]`]: {
        scrollMarginTop: 82,
      },
    },
    ...simplebar(theme),
    ...swiper(theme),
    ...notistack(theme),
    ...keyFrames(),
    ...prism(),
    ...echart(),
    ...popper(theme),
    ...colorPicker(theme),
    ...reactDatepicker(theme),
    ...vibrantNav(theme),
    ...svelteGanttChart(theme),
    ...projectTimelineChart(theme),
    ...taskTrackChart(theme),
    ...reactFc(theme),
    ...emojiMart(theme),
    ...yarl(theme),
    // Vision deficiency filters
    'html[data-vision="protanopia"]:not([data-showcase])': {
      filter: 'url("#protanopia-filter")',
    },
    'html[data-vision="deuteranopia"]:not([data-showcase])': {
      filter: 'url("#deuteranopia-filter")',
    },
    'html[data-vision="tritanopia"]:not([data-showcase])': {
      filter: 'url("#tritanopia-filter")',
    },
    'html[data-vision="achromatopsia"]:not([data-showcase])': {
      filter: 'url("#achromatopsia-filter")',
    },

    '[data-agrm-color-scheme="dark"][data-agrm-preset="ember"] .MuiPaper-root[class*="MuiPaper-elevation"]':
      {
        boxShadow: `${darkShadows[1]} !important`,
      },
    '[data-agrm-color-scheme="dark"][data-agrm-preset="midnight"] .MuiPaper-root[class*="MuiPaper-elevation"]':
      {
        boxShadow: `${darkShadows[1]} !important`,
      },
  }),
};

export default CssBaseline;

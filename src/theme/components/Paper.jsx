const backgroundVariants = [
  {
    props: { background: 1 },
    style: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.elevation1,
    }),
  },
  {
    props: { background: 2 },
    style: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.elevation2,
    }),
  },
  {
    props: { background: 3 },
    style: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.elevation3,
    }),
  },
  {
    props: { background: 4 },
    style: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.elevation4,
    }),
  },
  {
    props: { background: 5 },
    style: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.elevation5,
    }),
  },
];

const Paper = {
  variants: [
    {
      props: { variant: 'default' },
      style: ({ theme }) => ({
        border: 'none',
        outline: `1px solid ${theme.vars.palette.divider}`,
        borderRadius: 0,
      }),
    },
    ...backgroundVariants,
  ],
  defaultProps: {
    variant: 'default',
    elevation: 3,
  },
  styleOverrides: {
    elevation: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.menu,
      backgroundImage: 'none',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: theme.vars.palette.menuDivider,
      ...theme.applyStyles('dark', {
        borderWidth: 1,
      }),
    }),
    rounded: {
      borderRadius: 8,
    },
  },
};

export default Paper;

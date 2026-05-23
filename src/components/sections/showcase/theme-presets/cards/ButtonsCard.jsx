import { Button, Grid, Paper } from '@mui/material';

const ButtonsCard = () => {
  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 4,
        p: 2,
        overflow: 'hidden',
        outline: 'none',
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <Grid container columns={2} spacing={1}>
        {['neutral', '', 'primary', 'secondary', 'success', 'warning', 'info', 'error'].map(
          (color) => (
            <Grid size={1} key={color}>
              {color !== '' && (
                <Button
                  variant="contained"
                  fullWidth
                  color={color}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {color}
                </Button>
              )}
            </Grid>
          ),
        )}
      </Grid>
    </Paper>
  );
};

export default ButtonsCard;

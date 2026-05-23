// RatingCard.tsx
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

const RatingCard = ({ title, value, paperProps, typographyProps, ratingProps, sx }) => {
  return (
    <Paper
      background={1}
      sx={{
        px: 2,
        py: 1,
        outline: 0,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...sx,
      }}
      {...paperProps}
    >
      <Typography variant="body2" {...typographyProps}>
        {title}
      </Typography>

      <Rating value={value ?? 0} readOnly size="small" {...ratingProps} />
    </Paper>
  );
};

export default RatingCard;

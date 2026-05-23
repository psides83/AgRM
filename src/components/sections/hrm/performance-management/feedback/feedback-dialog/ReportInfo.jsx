import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ControlledRatingCard from './ControlledRatingCard';
import RatingCard from './RatingCard';

const ReportInfo = ({ title, ratingList, fieldPrefix, comment, formField }) => {
  return (
    <Stack direction="column" gap={2}>
      <Typography sx={{ fontWeight: 700 }}>{title}</Typography>

      {ratingList && (
        <Stack direction="column" gap={1}>
          {ratingList.map((item, idx) => {
            if (fieldPrefix)
              return (
                <ControlledRatingCard
                  key={item.label}
                  title={item.label}
                  fieldName={`${fieldPrefix}.rating[${idx}]`}
                />
              );
            else return <RatingCard key={item.label} title={item.label} value={item.rating} />;
          })}
        </Stack>
      )}

      {comment && !formField && (
        <Stack direction="column" gap={0.5}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Comment
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {comment}
          </Typography>
        </Stack>
      )}
      {!comment && formField && formField}
    </Stack>
  );
};

export default ReportInfo;

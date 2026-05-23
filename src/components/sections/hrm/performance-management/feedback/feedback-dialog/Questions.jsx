import { useFormContext } from 'react-hook-form';
import { filledInputClasses } from '@mui/material/FilledInput';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText, { listItemTextClasses } from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const Questions = ({ questions, sx }) => {
  const methods = useFormContext();

  return (
    <Stack direction="column" gap={2} sx={{ ...sx }}>
      <Typography sx={{ fontWeight: 700 }}>Questions</Typography>

      <List disablePadding component="ol" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {questions.map((item, index) => (
          <ListItem
            key={index}
            disablePadding
            disableGutters
            sx={{
              display: 'list-item',
              listStyleType: 'decimal',
              ml: 2,
              '&::marker': { fontWeight: 500 },
            }}
          >
            <ListItemText
              disableTypography
              primary={item.question}
              secondary={
                item.answer && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {item.answer}
                  </Typography>
                )
              }
              sx={{
                my: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                [`& .${listItemTextClasses.primary}`]: { fontWeight: 500 },
              }}
            />
            {!item.answer && (
              <TextField
                multiline
                fullWidth
                rows={2}
                placeholder="Answer"
                sx={{
                  ml: -2,
                  mt: 1,
                  [`& .${filledInputClasses.root}`]: { py: 1 },
                }}
                {...methods?.register(`questions.${index}`)}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};

export default Questions;

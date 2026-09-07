import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

const DuplicateRecordDialog = ({ open, matches, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Possible Duplicate Found</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="warning">
            One or more similar records already exist. Confirm before creating a new record.
          </Alert>
          <Stack spacing={1.5} divider={<Divider flexItem />}>
            {(matches || []).map((match, index) => (
              <Box key={`${match.type}-${match.title}-${index}`}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                      {match.title}
                    </Typography>
                    {match.subtitle && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
                        {match.subtitle}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {match.reasons.join(', ')}
                    </Typography>
                  </Box>
                  <Chip label={formatType(match.type)} size="small" variant="soft" color="warning" />
                </Stack>
              </Box>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onCancel}>
          Review Existing
        </Button>
        <Button variant="contained" color="warning" onClick={onConfirm}>
          Create New Anyway
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function formatType(value) {
  if (!value) return 'Record';
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default DuplicateRecordDialog;

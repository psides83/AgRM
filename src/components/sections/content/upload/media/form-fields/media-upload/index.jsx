import { useFormContext, useWatch } from 'react-hook-form';
import { Paper, Stack, Typography } from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';
import FileDropZone from 'components/base/FileDropZone';
import IconifyIcon from 'components/base/IconifyIcon';

const ACCEPT_MEDIA_TYPES = {
  'audio/*': ['.mp3', '.m4a', '.wav', '.mpg'],
  'video/*': ['.mp4', '.mpg', '.mkv', '.mov'],
};

const MAX_MEDIA_SIZE_BYTES = 256 * 1024 * 1024 * 1024; // 256 GB

const MediaUpload = () => {
  const {
    config: { topnavType },
  } = useSettingsContext();

  const {
    setValue,
    trigger,
    formState: { errors, isSubmitSuccessful },
  } = useFormContext();

  const mediaValue = useWatch({ name: 'media' });
  const defaultFiles = mediaValue?.file ? [mediaValue.file] : undefined;

  const onDrop = (acceptedFiles) => {
    const newFile = acceptedFiles[0];
    if (newFile) {
      setValue('media', { id: newFile.name, file: newFile }, { shouldValidate: true });
    }
  };

  const onRemove = () => {
    setValue('media', null, { shouldValidate: true });
    trigger('media');
  };

  const errorMessage =
    errors.media?.message ||
    (errors.media && 'file' in errors.media ? errors.media.file?.message : undefined) ||
    'Audio / Video is required.';

  return (
    <Paper
      variant="elevation"
      background={1}
      elevation={0}
      sx={{
        p: 3,
        position: { md: 'sticky' },
        top: ({ mixins }) =>
          Object.keys(mixins.topbar[topnavType]).reduce((acc, key) => {
            acc[key] = Number(mixins.topbar[topnavType][key]) + 40;
            return acc;
          }, {}),
        left: { md: 0 },
      }}
    >
      <FileDropZone
        key={`media-${mediaValue?.file?.name || 'empty'}-${isSubmitSuccessful ? 'reset' : 'default'}`}
        accept={ACCEPT_MEDIA_TYPES}
        multiple={false}
        maxSize={MAX_MEDIA_SIZE_BYTES}
        inlinePreview
        defaultFiles={defaultFiles}
        onDrop={onDrop}
        onRemove={onRemove}
        error={errors.media ? errorMessage : undefined}
        icon="material-symbols:play-circle-rounded"
        sx={{
          bgcolor: errors.media ? 'error.lighter' : 'background.elevation2',
          borderColor: errors.media ? 'error.main' : 'divider',
          width: 1,
          height: 1,
          aspectRatio: '16/9',
        }}
      />
      <Stack sx={{ gap: 1, mt: 2, alignItems: 'flex-start' }}>
        <IconifyIcon
          icon="material-symbols:info-outline-rounded"
          sx={{ color: 'info.main', fontSize: 16, flexShrink: 0, mt: 0.25 }}
        />
        <Typography variant="caption" color="info">
          Video and audio should be in mp3, m4a, wav, mpg, mov, mp4, or mkv format. The maximum
          video upload size is 256 GB.
        </Typography>
      </Stack>
    </Paper>
  );
};

export default MediaUpload;

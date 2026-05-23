import { useFormContext, useWatch } from 'react-hook-form';
import { Stack, Typography } from '@mui/material';
import FileDropZone from 'components/base/FileDropZone';
import IconifyIcon from 'components/base/IconifyIcon';

const MAX_THUMBNAIL_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const ACCEPT_IMAGE_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
};

const Thumbnail = () => {
  const {
    setValue,
    formState: { errors, isSubmitSuccessful },
  } = useFormContext();

  const thumbnailValue = useWatch({ name: 'thumbnail' });
  const defaultFiles = thumbnailValue?.file ? [thumbnailValue.file] : undefined;

  const onDrop = (acceptedFiles) => {
    const newFile = acceptedFiles[0];
    if (newFile) {
      setValue('thumbnail', { id: newFile.name, file: newFile }, { shouldValidate: true });
    }
  };

  const onRemove = () => {
    setValue('thumbnail', null, { shouldValidate: true });
  };

  return (
    <div>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Thumbnail
      </Typography>

      <FileDropZone
        key={`thumbnail-${thumbnailValue?.file?.name || 'empty'}-${isSubmitSuccessful ? 'reset' : 'default'}`}
        accept={ACCEPT_IMAGE_TYPES}
        inlinePreview
        multiple={false}
        maxSize={MAX_THUMBNAIL_SIZE_BYTES}
        defaultFiles={defaultFiles}
        onDrop={onDrop}
        onRemove={onRemove}
        error={errors.thumbnail?.message}
        sx={{
          bgcolor: errors.thumbnail ? 'error.lighter' : 'background.elevation2',
          borderColor: errors.thumbnail ? 'error.main' : 'divider',
          height: { xs: 80, md: 60 },
        }}
      />

      <Stack gap={1} mt={2} alignItems="flex-start">
        <IconifyIcon
          icon="material-symbols:info-outline-rounded"
          sx={{ color: 'info.main', fontSize: 16, flexShrink: 0, transform: 'translateY(4px)' }}
        />
        <Typography variant="body2" color="info.main" fontWeight="medium">
          Images should be in JPEG or PNG format, up to 15MB in size. A 16:9 aspect ratio is
          required, with 3000×3000 pixels recommended for high resolution.
        </Typography>
      </Stack>
    </div>
  );
};

export default Thumbnail;

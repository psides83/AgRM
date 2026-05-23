import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  FormHelperText,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { convertFileToAttachment } from 'lib/utils';
import IconifyIcon from 'components/base/IconifyIcon';
import FilePreview from 'components/common/FilePreview';
import InlineMediaPreview from 'components/common/InlineMediaPreview';

const FileDropZone = ({
  onDrop,
  error,
  onRemove,
  defaultFiles,
  previewType = 'list',
  inlinePreview = false,
  icon = 'material-symbols:add-photo-alternate-outline-rounded',
  sx,
  ...rest
}) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleRemoveFile = (index) => {
    setFiles(files.filter((file, ind) => index !== ind));
    setPreviews(previews.filter((file, ind) => index !== ind));
    if (onRemove) {
      onRemove(index);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (...args) => {
      const [acceptedFiles] = args;
      setFiles(acceptedFiles);
      setPreviews(acceptedFiles.map((file) => convertFileToAttachment(file)));
      if (onDrop) {
        onDrop(...args);
      }
    },
    ...rest,
  });

  const getFileNameParts = (filename) => {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return { name: filename, ext: '' };

    return { name: filename.substring(0, lastDot), ext: filename.substring(lastDot) };
  };

  useEffect(() => {
    if (defaultFiles) {
      setFiles(defaultFiles);
      setPreviews(defaultFiles.map((file) => convertFileToAttachment(file)));
    }
  }, [defaultFiles]);

  const hasInlineContent = inlinePreview && previews.length > 0;
  const firstPreview = previews[0];

  const emptyStateContent = (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      flexWrap="wrap"
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <IconifyIcon
        icon={icon}
        sx={{
          fontSize: { xs: 40, sm: 20 },
          color: 'text.primary',
        }}
      />
      <Typography variant="caption" component="p" sx={{ alignSelf: 'center' }}>
        Drag & Drop files here{' '}
        <Box component="span" sx={{ color: 'text.disabled', mx: 1 }}>
          or
        </Box>
        <Box component="span" sx={{ color: 'primary.main' }}>
          browse from device
        </Box>
      </Typography>
    </Stack>
  );

  return (
    <Stack direction="column" sx={{ rowGap: 3 }}>
      <Box
        {...getRootProps()}
        sx={{
          p: hasInlineContent ? 0 : 2,
          bgcolor: error ? 'error.lighter' : 'background.elevation2',
          height: hasInlineContent ? undefined : 100,
          minHeight: hasInlineContent ? 100 : undefined,
          borderRadius: 2,
          borderWidth: hasInlineContent ? 0 : 1,
          borderColor: error ? 'error.main' : 'divider',
          borderStyle: hasInlineContent ? 'none' : 'dashed',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          transition: ({ transitions }) =>
            transitions.create(['background-color'], {
              duration: transitions.duration.enteringScreen,
              easing: transitions.easing.easeInOut,
            }),
          '&:hover': {
            bgcolor: 'background.elevation3',
          },
          ...sx,
        }}
      >
        <input {...getInputProps()} />
        {hasInlineContent ? (
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: 1,
              height: 1,
              minHeight: 100,
            }}
          >
            <InlineMediaPreview preview={firstPreview} />
            <Button
              color="neutral"
              shape="circle"
              variant="soft"
              sx={(theme) => ({
                position: 'absolute',
                right: 8,
                top: 8,
                zIndex: 2,
                transition: theme.transitions.create('all', {
                  duration: 300,
                  easing: 'ease-in-out',
                }),
                minWidth: 24,
                height: 24,
              })}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile(0);
              }}
              aria-label="Remove file"
            >
              <IconifyIcon icon="material-symbols:close" fontSize={12} />
            </Button>
          </Box>
        ) : (
          emptyStateContent
        )}
      </Box>
      {error && <FormHelperText error>{error}</FormHelperText>}

      {previews.length > 0 && !inlinePreview && previewType === 'list' && (
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {previews.map((preview, index) => {
            const { name, ext } = getFileNameParts(preview.name);

            return (
              <ListItem
                key={`${preview.preview}`}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <IconifyIcon
                      icon="material-symbols:close-small-rounded"
                      fontSize={20}
                      sx={{ color: 'text.primary' }}
                    />
                  </IconButton>
                }
                sx={(theme) => ({
                  pl: 1,
                  gap: 2,
                  bgcolor: theme.vars.palette.background.elevation1,
                  borderRadius: 2,
                  ...theme.applyStyles('dark', {
                    bgcolor: theme.vars.palette.background.elevation2,
                  }),
                })}
              >
                <ListItemAvatar>
                  <FilePreview preview={preview} />
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 0,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="textPrimary"
                        sx={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          minWidth: 0,
                        }}
                      >
                        {name}
                      </Typography>
                      <Typography variant="body2" color="textPrimary" sx={{ flexShrink: 0 }}>
                        {ext}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography component="p" variant="caption">
                      {preview.size}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}

      {previews.length > 0 && !inlinePreview && previewType === 'thumbnail' && (
        <Stack
          spacing={1}
          sx={{
            flexWrap: 'wrap',
          }}
        >
          {previews.map((preview, index) => (
            <Box
              key={`${preview.preview}`}
              sx={{
                position: 'relative',
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <FilePreview preview={preview} />
              <Button
                onClick={() => handleRemoveFile(index)}
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  height: 12,
                  minWidth: 12,
                }}
                variant="contained"
                color="neutral"
                shape="circle"
                size="small"
              >
                <IconifyIcon icon="material-symbols:close-small-rounded" fontSize={10} />
              </Button>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default FileDropZone;

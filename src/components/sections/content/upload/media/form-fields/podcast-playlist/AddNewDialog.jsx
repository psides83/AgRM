import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  IconButton,
  Stack,
  Typography,
  dialogClasses,
} from '@mui/material';
import Editor from 'components/base/Editor';
import FileDropZone from 'components/base/FileDropZone';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';

const ACCEPT_IMAGE_TYPES = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] };
const MAX_THUMBNAIL_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

const AddNewDialog = () => {
  const [open, setOpen] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [description, setDescription] = useState('');

  const handleDialog = (value) => setOpen(value ? value : !open);

  const handleDialogClose = () => {
    setThumbnailFile(null);
    setDescription('');
    handleDialog(false);
  };

  const onDrop = (acceptedFiles) => {
    const newFile = acceptedFiles[0];
    if (newFile) setThumbnailFile(newFile);
  };

  const onRemove = () => setThumbnailFile(null);

  return (
    <>
      <Button
        color="primary"
        startIcon={<IconifyIcon icon="material-symbols:add-2-rounded" />}
        onClick={() => handleDialog()}
      >
        Add New
      </Button>

      <Dialog
        open={open}
        onClose={handleDialogClose}
        maxWidth={false}
        component="form"
        sx={{
          [`& .${dialogClasses.paper}`]: {
            borderRadius: 6,
            overflow: 'visible',
            maxWidth: 550,
          },
        }}
      >
        <DialogTitle
          component="h6"
          sx={{
            pt: 3,
            pb: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Create a Podcast/Playlist
          <IconButton onClick={() => handleDialog(false)}>
            <IconifyIcon
              icon="material-symbols:close"
              sx={{ fontSize: 20, color: 'neutral.dark' }}
            />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 0, position: 'relative' }}>
          <DialogContentText
            variant="body2"
            sx={{ color: 'text.secondary', mb: 2, textWrap: 'pretty' }}
          >
            Enter your playlist Title, Thumbnail and Descriptions.
          </DialogContentText>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Title
            </Typography>
            <StyledTextField
              type="text"
              fullWidth
              variant="filled"
              size="large"
              placeholder="Title"
              name="title"
              sx={{ mb: 0.5 }}
              slotProps={{
                input: {
                  sx: {
                    '& .MuiInputBase-input': {
                      color: 'text.secondary',
                      padding: '3px 16px !important',
                    },
                  },
                  inputProps: { maxLength: 30 },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Thumbnail
            </Typography>

            <FileDropZone
              accept={ACCEPT_IMAGE_TYPES}
              multiple={false}
              maxSize={MAX_THUMBNAIL_SIZE_BYTES}
              previewType="thumbnail"
              defaultFiles={thumbnailFile ? [thumbnailFile] : undefined}
              onDrop={onDrop}
              onRemove={onRemove}
              sx={{
                bgcolor: 'background.elevation2',
                borderColor: 'divider',
                height: { xs: 80, md: 60 },
              }}
            />

            <Stack sx={{ gap: 1, mt: 2, alignItems: 'flex-start' }}>
              <IconifyIcon
                icon="material-symbols:info-outline-rounded"
                sx={{ color: 'info.main', fontSize: 16, flexShrink: 0, mt: 0.5 }}
              />
              <Typography
                variant="body2"
                color="info"
                sx={{
                  fontWeight: 'medium',
                }}
              >
                Images should be in JPEG or PNG format, up to 15MB in size. A 16:9 aspect ratio is
                required, with 3000x3000 pixels recommended for high resolution.
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Description
            </Typography>
            <Editor
              content={description}
              onChange={(value) => setDescription(value)}
              sx={{
                '& .MuiTiptap-RichTextContent-root': {
                  height: 1,
                  minHeight: 155,
                },
              }}
            />
            <FormHelperText
              sx={{
                textAlign: 'end',
                fontWeight: 'medium',
                color: 'text.secondary',
              }}
            >
              <Box
                component="span"
                sx={{
                  color: description.length > 2000 ? 'error.main' : 'text.secondary',
                }}
              >
                {description.length}
              </Box>
              /2000
            </FormHelperText>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'flex-start' }}>
          <Button color="error" onClick={handleDialogClose}>
            Remove
          </Button>
          <Stack sx={{ gap: 1, justifyContent: 'flex-end', width: 1 }}>
            <Button
              variant="soft"
              color="neutral"
              onClick={handleDialogClose}
              sx={{ ml: 'auto !important' }}
            >
              Discard
            </Button>
            <Button type="button" variant="contained" color="primary" onClick={handleDialogClose}>
              Confirm
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddNewDialog;

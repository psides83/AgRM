import { useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, Paper, Stack } from '@mui/material';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import Editor from 'components/base/Editor';
import EditableTypography from './EditableTypography';

const StoryEdit = ({ handleEditStory }) => {
  const { topbarHeight } = useNavContext();
  const {
    setValue,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useFormContext();

  const editorRef = useRef(null);
  const initialContent = getValues('content') ?? '';

  const handleEditorChange = useCallback(
    (html) => {
      setValue('content', html, { shouldValidate: false, shouldDirty: true });
    },
    [setValue],
  );

  const handleCancel = useCallback(() => {
    reset();
    handleEditStory(false);
  }, [reset, handleEditStory]);

  return (
    <Stack
      direction="column"
      sx={{
        gap: 2,
        height: 1,
        justifyContent: 'space-between',
        minHeight: ({ mixins }) => mixins.contentHeight(topbarHeight, mixins.footer.sm),
        py: { xs: 3, md: 5 },
      }}
    >
      <Stack direction="column" gap={3}>
        <EditableTypography
          fieldName="title"
          placeholder="Title"
          variant="h6"
          hasError={!!errors.title}
        />

        <EditableTypography
          fieldName="subText"
          placeholder="Subtitle"
          variant="subtitle1"
          fontWeight={700}
          color="textSecondary"
          hasError={!!errors.subText}
        />

        <Editor
          ref={editorRef}
          content={initialContent}
          onChange={handleEditorChange}
          placeholder="Write your story..."
          isValid={!errors.content}
          sx={{
            '& .MuiTiptap-MenuBar-root': {
              bgcolor: 'background.elevation1',
              borderBottom: 0,
            },
            '& .MuiTiptap-RichTextContent-root': {
              minHeight: '50vh',
              bgcolor: 'background.default',
              overflow: 'visible',
              '& .tiptap': {
                minHeight: '50vh',
                overflow: 'visible',
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                },
              },
            },
          }}
        />
      </Stack>

      <Paper
        variant="elevation"
        elevation={0}
        background={1}
        sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}
      >
        <Button type="button" color="neutral" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isSubmitting}
          sx={{ minWidth: 200 }}
          onClick={() => handleEditStory(false)}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </Paper>
    </Stack>
  );
};

export default StoryEdit;

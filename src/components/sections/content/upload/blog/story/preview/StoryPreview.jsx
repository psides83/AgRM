import { useFormContext } from 'react-hook-form';
import { Button, Divider, FormHelperText, Paper, Stack, Typography } from '@mui/material';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { RichTextReadOnly } from 'mui-tiptap';
import IconifyIcon from 'components/base/IconifyIcon';

const StoryPreview = ({ handleEditStory }) => {
  const {
    watch,
    formState: { errors },
  } = useFormContext();
  const title = watch('title');
  const subText = watch('subText');
  const content = watch('content');

  const extensions = [
    StarterKit,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
    Image,
  ];

  return (
    <Stack direction="column" height={1}>
      <Stack sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Preview
        </Typography>

        <Button
          onClick={() => handleEditStory(true)}
          variant="soft"
          color="neutral"
          size="small"
          sx={{ alignItems: 'center' }}
          startIcon={<IconifyIcon icon="material-symbols:edit-outline-rounded" />}
        >
          Write Story
        </Button>
      </Stack>

      <Paper
        sx={[
          { width: 1, minHeight: { xs: 400, lg: 'unset' }, flex: 1, borderRadius: 2, p: 3 },
          errors.content ? { outlineColor: 'error.main' } : {},
        ]}
      >
        <Stack direction="column" gap={2} sx={{ overflowWrap: 'anywhere', flexWrap: 'wrap' }}>
          {title && (
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          )}

          {subText && (
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {subText}
            </Typography>
          )}

          {(title || subText) && content && <Divider sx={{ my: 2 }} />}

          {content && (
            <RichTextReadOnly
              content={content}
              extensions={extensions}
              immediatelyRender={false}
              sx={{
                '& .ProseMirror': {
                  padding: 0,
                  '& p': { mb: 2 },
                  '& h1, & h2, & h3, & h4, & h5, & h6': { mb: 2, mt: 3, fontWeight: 700 },
                  '& ul, & ol': { mb: 2, pl: 4 },
                  '& li': { mb: 1 },
                  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1, my: 2 },
                  '& a': { color: 'primary.main', textDecoration: 'underline' },
                  '& strong': { fontWeight: 700 },
                  '& em': { fontStyle: 'italic' },
                  '& u': { textDecoration: 'underline' },
                },
              }}
            />
          )}

          {!title && !subText && !content && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No content yet. Click <strong>"Write Story"</strong> to start writing.
            </Typography>
          )}
        </Stack>
      </Paper>
      {errors.content && (
        <FormHelperText sx={{ ml: 1, color: 'error.light' }}>
          {errors.content.message}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default StoryPreview;

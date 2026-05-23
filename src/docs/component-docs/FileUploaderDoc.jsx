'use client';

import { Link, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { initialConfig } from 'config';
import { folderBaseLink } from 'lib/constants';
import AnchorLinkContainer from 'components/base/AnchorLinkContainer';
import AvatarDropBox from 'components/base/AvatarDropBox';
import Code from 'components/base/Code';
import FileDropBox from 'components/base/FileDropBox';
import FileDropZone from 'components/base/FileDropZone';
import DocCard from 'components/docs/DocCard';
import DocNestedSection from 'components/docs/DocNestedSection';
import DocPageLayout from 'components/docs/DocPageLayout';
import DocSection, { DocList, DocSubtitle } from 'components/docs/DocSection';

const person = `${initialConfig.assetsDir}/images/avatar/1.webp`;

const listPreviewCode = `import FileDropZone from 'components/base/FileDropZone';

const Example = () => {
  const [files, setFiles] = React.useState([]);
  
  return (
    <FileDropZone
      maxSize={10 * 1024 * 1024}
      defaultFiles={files}
      onDrop={(acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
        console.log({ acceptedFiles });
      }}
      onRemove={(index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
      }}
      accept={{
        'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp', '.avif', '.svg', '.bmp', '.ico'],
        'image/webp': ['.webp'],
        'image/avif': ['.avif'],
        'image/svg+xml': ['.svg'],
        'application/pdf': ['.pdf'],
      }}
    />
  );
};
render(<Example />);`.trim();

const listPreviewSingleCode = `import FileDropZone from 'components/base/FileDropZone';

<FileDropZone
  maxSize={10 * 1024 * 1024}
  onDrop={(acceptedFiles) => {
    console.log({ acceptedFiles });
  }}
  multiple={false}
  accept={{
    'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp', '.avif', '.svg', '.bmp', '.ico'],
    'image/webp': ['.webp'],
    'image/avif': ['.avif'],
  }}
/>`.trim();

const thumbnailPreviewCode = `import FileDropZone from 'components/base/FileDropZone';

const Example = () => {
  const [files, setFiles] = React.useState([]);
  
  return (
    <FileDropZone
      previewType="thumbnail"
      maxSize={10 * 1024 * 1024}
      defaultFiles={files}
      onDrop={(acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
        console.log({ acceptedFiles });
      }}
      onRemove={(index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
      }}
      accept={{
        'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp', '.avif', '.svg', '.bmp', '.ico'],
        'image/webp': ['.webp'],
        'image/avif': ['.avif'],
        'image/svg+xml': ['.svg'],
        'application/pdf': ['.pdf'],
      }}
    />
  );
};
render(<Example />);`.trim();

const fileDropBoxCode = `import FileDropBox from 'components/base/FileDropBox';

const Example = () => {
  const [files, setFiles] = React.useState([]);
  
  return (
    <FileDropBox
      defaultFiles={files}
      onDrop={(acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
        console.log({ acceptedFiles });
      }}
      onRemove={(index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
      }}
      accept={{
        'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp', '.avif', '.svg', '.bmp', '.ico'],
        'image/webp': ['.webp'],
        'image/avif': ['.avif'],
        'image/svg+xml': ['.svg'],
      }}
    />
  );
};
render(<Example />);`.trim();

const fileDropBoxSingleCode = `import FileDropBox from 'components/base/FileDropBox';

<FileDropBox
  onDrop={(acceptedFiles) => {
    console.log({ acceptedFiles });
  }}
  multiple={false}
  accept={{
    'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp', '.avif', '.svg', '.bmp', '.ico'],
    'image/webp': ['.webp'],
    'image/avif': ['.avif'],
  }}
/>`.trim();

const avatarDropBoxCode = `import AvatarDropBox from 'components/base/AvatarDropBox';

<Stack spacing={1}>
  <AvatarDropBox
    onDrop={(acceptedFiles) => {
      console.log({ acceptedFiles });
    }}
  />
  <AvatarDropBox
    onDrop={(acceptedFiles) => {
      console.log({ acceptedFiles });
    }}
    defaultFile="${person}"
  />
</Stack>`.trim();

const FileUploaderDoc = () => {
  return (
    <DocPageLayout
      pageHeaderProps={{
        title: 'File Uploader',
        descriptionEl: (
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            <strong>AgRM</strong> uses <strong>React Dropzone</strong> for file-uploader.{' '}
            <strong>React Dropzone</strong> provides a simple react hook to create a HTML5-compliant
            drag'n'drop zone for files.,
          </Typography>
        ),
        breadcrumbs: [
          {
            label: 'Docs',
            url: '#!',
          },
          {
            label: 'File Uploader',
          },
        ],
        docLink: `https://react-dropzone.js.org/`,
        docLinkLabel: 'React Dropzone Docs',
        folderLink: `${folderBaseLink}/FileUploaderDoc.jsx`,
      }}
    >
      <DocSection title="FileDropZone">
        <Stack
          direction="column"
          sx={{
            gap: 2,
            mb: 5,
          }}
        >
          <Typography>
            The custom <Code>FileDropZone</Code> component allows users to upload files using a
            drag-and-drop interface. This component is highly customizable and supports various
            configurations for file handling and preview display.
          </Typography>
          <DocSubtitle>
            Props of <Code>FileDropZone</Code>:
          </DocSubtitle>
          <DocList>
            <ListItem>
              <ListItemText disableTypography>
                <Code>previewType?: 'list' | 'thumbnail'</Code>: Specifies how file previews are
                displayed. Default is <Code>list</Code>.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`onRemove?: (index: number) => void`}</Code>: Callback function triggered
                when a file is removed from the preview list or grid.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`defaultFiles?: File[]`}</Code>: Array of initial files to be displayed in
                the preview before any files are dropped by the user.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>inlinePreview?: boolean</Code>: When true, the drop zone is replaced by the
                actual media (video/audio player or image) filling the area with a remove button,
                instead of showing list or thumbnail preview below. Default is <Code>false</Code>.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`error?: string`}</Code>: Error message displayed beneath the dropzone when
                there's an issue with the uploaded file(s).
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`React Dropzone Props`}</Code>: Any{' '}
                <Link href="https://react-dropzone.js.org/#src" target="_blank">
                  prop
                </Link>{' '}
                supported by <strong>react-dropzone</strong> can be passed directly to{' '}
                <Code>FileDropZone</Code>, such as: <Code>onDrop</Code>, <Code>accept</Code>,{' '}
                <Code>multiple</Code>, <Code>maxSize</Code> etc.
              </ListItemText>
            </ListItem>
          </DocList>
        </Stack>
        <DocNestedSection
          id="list"
          title="List Preview"
          titleEl={
            <AnchorLinkContainer hashHref="list" anchorSize="small" sx={{ mb: 2 }}>
              <DocSubtitle>List Preview</DocSubtitle>
            </AnchorLinkContainer>
          }
          sx={{ mb: 5 }}
        >
          <DocCard code={listPreviewCode} scope={{ FileDropZone }} noInline />
        </DocNestedSection>
        <DocNestedSection
          id="thumbnail"
          title="Thumbnail Preview"
          titleEl={
            <AnchorLinkContainer hashHref="thumbnail" anchorSize="small" sx={{ mb: 2 }}>
              <DocSubtitle>Thumbnail Preview</DocSubtitle>
            </AnchorLinkContainer>
          }
        >
          <DocCard code={thumbnailPreviewCode} scope={{ FileDropZone }} noInline />
        </DocNestedSection>
      </DocSection>
      <DocSection title="FileDropBox">
        <Stack
          direction="column"
          sx={{
            gap: 2,
            mb: 5,
          }}
        >
          <Typography>
            The <Code>FileDropBox</Code> component provides a compact file upload interface. This
            component supports file previews as thumbnails and allows for file management, including
            deletion.
          </Typography>
          <DocSubtitle>
            Props of <Code>FileDropBox</Code>:
          </DocSubtitle>
          <DocList>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`onRemove?: (index: number) => void`}</Code>: Callback function triggered
                when a file is removed from the preview list or grid.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`defaultFiles?: File[]`}</Code>: Array of initial files to be displayed in
                the preview before any files are dropped by the user.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`error?: boolean`}</Code>: Indicates whether an error has occurred. When set
                to true, changes the drop area style to show an error.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`React Dropzone Props`}</Code>: Any{' '}
                <Link href="https://react-dropzone.js.org/#src" target="_blank">
                  prop
                </Link>{' '}
                supported by <strong>react-dropzone</strong> can be passed directly to{' '}
                <Code>FileDropZone</Code>, such as: <Code>onDrop</Code>, <Code>accept</Code>,{' '}
                <Code>multiple</Code>, <Code>maxSize</Code> etc.
              </ListItemText>
            </ListItem>
          </DocList>
        </Stack>
        <DocCard code={fileDropBoxCode} scope={{ FileDropBox }} noInline />
      </DocSection>

      <DocSection title="AvatarDropBox">
        <Stack
          direction="column"
          sx={{
            gap: 2,
            mb: 5,
          }}
        >
          <Typography>
            The <Code>AvatarDropBox</Code> component provides a user-friendly avatar upload
            interface with a drag-and-drop zone. It allows for uploading and previewing a single
            image file, intended for use as an avatar or profile picture.
          </Typography>
          <DocSubtitle>
            Props of <Code>AvatarDropBox</Code>:
          </DocSubtitle>
          <DocList>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`defaultFile?: File`}</Code>: A initial file to be displayed in the preview
                before any file is dropped by the user.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`error?: boolean`}</Code>: Indicates whether an error has occurred. When set
                to true, changes the drop area style to show an error.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`sx?: sx`}</Code>: Custom styling for the drop zone, allowing full
                customization with MUI's sx prop. Mainly use for customizing the drop zone's size.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText disableTypography>
                <Code>{`React Dropzone Props`}</Code>: Any{' '}
                <Link href="https://react-dropzone.js.org/#src" target="_blank">
                  prop
                </Link>{' '}
                supported by <strong>react-dropzone</strong> can be passed directly to{' '}
                <Code>FileDropZone</Code>, such as: <Code>onDrop</Code>, <Code>accept</Code>,{' '}
                <Code>multiple</Code>, <Code>maxSize</Code> etc.
              </ListItemText>
            </ListItem>
          </DocList>
        </Stack>

        <DocCard code={avatarDropBoxCode} scope={{ AvatarDropBox, person }} />
      </DocSection>

      <DocSection
        title="Single File"
        descriptionEl={
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            Use <Code>multiple={'{' + 'false' + '}'}</Code> to allow only a single file to be
            uploaded.
          </Typography>
        }
      >
        <DocCard code={listPreviewSingleCode} scope={{ FileDropZone }} sx={{ mb: 5 }} />

        <DocCard code={fileDropBoxSingleCode} scope={{ FileDropBox }} />
      </DocSection>
    </DocPageLayout>
  );
};

export default FileUploaderDoc;

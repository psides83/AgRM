import { useFormContext } from 'react-hook-form';
import { getFileExtension, getFileIcon } from 'lib/utils';
import FileDropZone from 'components/base/FileDropZone';

const createAttachmentFromFile = (file) => {
  const isImage = file.type.startsWith('image/');
  const ext = getFileExtension(file.name).toLowerCase();
  return {
    id: `${file.name}-${Date.now()}`,
    filename: file.name,
    time: new Date().toISOString().slice(0, 19),
    addedBy: 'Sampro',
    file,
    ...(isImage && { image: URL.createObjectURL(file) }),
    ...(!isImage && { icon: getFileIcon(ext) }),
  };
};

const FileUploadArea = () => {
  const {
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const files = watch('attachments') || [];
  const uploadedOnly = files.filter((a) => Boolean(a.file));

  const onDrop = (acceptedFiles) => {
    const uploadedFiles = acceptedFiles.map(createAttachmentFromFile);
    setValue('attachments', [...uploadedFiles, ...files], { shouldValidate: true });
  };

  const removeImage = (dropZoneIndex) => {
    const removed = uploadedOnly[dropZoneIndex];
    if (!removed) return;
    if (removed.image && removed.image.startsWith('blob:')) {
      URL.revokeObjectURL(removed.image);
    }
    setValue(
      'attachments',
      files.filter((a) => a.id !== removed.id),
      { shouldValidate: true },
    );
  };

  return (
    <FileDropZone
      multiple
      defaultFiles={uploadedOnly.map((a) => a.file)}
      accept={{
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.avif', '.webp'],
        'video/*': ['.mp4', '.mov'],
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc'],
        'application/zip': ['.zip'],
      }}
      onDrop={onDrop}
      onRemove={removeImage}
      error={errors?.attachments?.message}
      previewType="thumbnail"
      sx={{ px: { xs: 0, md: 2 }, height: { xs: 'auto', md: 60 } }}
    />
  );
};

export default FileUploadArea;

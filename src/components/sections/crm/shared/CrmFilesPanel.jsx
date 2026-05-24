'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';

const bucketName = 'crm-files';
const recordIdFields = {
  contact: 'contact_id',
  company: 'company_id',
  lead: 'lead_id',
  deal: 'deal_id',
};

const CrmFilesPanel = ({ recordType, recordId }) => {
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const recordField = recordIdFields[recordType];

  const fetchFiles = async () => {
    if (!recordField || !recordId) {
      setIsLoading(false);
      return;
    }

    setError(null);

    const { data, error: queryError } = await supabase
      .from('files')
      .select('*')
      .eq(recordField, recordId)
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setFiles(data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchFiles();

    if (!recordField || !recordId) return undefined;

    const channel = supabase
      .channel(`agrm-files-${recordType}-${recordId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files', filter: `${recordField}=eq.${recordId}` }, () => fetchFiles())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recordField, recordId, recordType, supabase]);

  const handleUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length || !recordField || !recordId) return;

    setIsUploading(true);
    setError(null);

    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError || !userResult.user) {
      setError('You need to be logged in to upload files.');
      setIsUploading(false);
      return;
    }

    for (const file of selectedFiles) {
      const storagePath = `${userResult.user.id}/${recordType}/${recordId}/${Date.now()}-${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        setError(uploadError.message);
        break;
      }

      const { error: insertError } = await supabase.from('files').insert({
        owner_id: userResult.user.id,
        [recordField]: recordId,
        storage_bucket: bucketName,
        storage_path: storagePath,
        file_name: file.name,
        mime_type: file.type || null,
        size_bytes: file.size,
      });

      if (insertError) {
        setError(insertError.message);
        break;
      }
    }

    if (inputRef.current) inputRef.current.value = '';
    setIsUploading(false);
    fetchFiles();
  };

  const handleOpen = async (file) => {
    const { data, error: signedUrlError } = await supabase.storage
      .from(file.storage_bucket)
      .createSignedUrl(file.storage_path, 60 * 10);

    if (signedUrlError) {
      setError(signedUrlError.message);
      return;
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconifyIcon icon="material-symbols:attach-file-rounded" sx={{ color: 'text.secondary', fontSize: 22 }} />
          <Typography variant="h6">Files</Typography>
          <Chip label={files.length} size="small" variant="soft" color="primary" />
        </Stack>
        <Button
          component="label"
          size="small"
          variant="soft"
          color="neutral"
          loading={isUploading}
          startIcon={<IconifyIcon icon="material-symbols:upload-file-outline-rounded" />}
        >
          Upload
          <Box
            component="input"
            ref={inputRef}
            type="file"
            multiple
            onChange={handleUpload}
            sx={{ display: 'none' }}
          />
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction="column" divider={<Divider flexItem />} spacing={1.5}>
        {isLoading ? (
          <EmptyState label="Loading files..." />
        ) : files.length ? (
          files.map((file) => (
            <Box key={file.id}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    <Link component="button" underline="hover" color="text.primary" onClick={() => handleOpen(file)}>
                      {file.file_name}
                    </Link>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {[formatBytes(file.size_bytes), file.mime_type, formatDateTime(file.created_at)].filter(Boolean).join(' · ')}
                  </Typography>
                </Box>
                <Button size="small" variant="soft" color="neutral" onClick={() => handleOpen(file)} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                  Open
                </Button>
              </Stack>
            </Box>
          ))
        ) : (
          <EmptyState label="No files attached yet" />
        )}
      </Stack>
    </Paper>
  );
};

function EmptyState({ label }) {
  return <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>{label}</Typography>;
}

function safeFileName(value) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
}

function formatBytes(value) {
  if (value === null || value === undefined) return '';
  const bytes = Number(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export default CrmFilesPanel;

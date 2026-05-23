'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Container, Typography } from '@mui/material';
import * as yup from 'yup';
import FormActions from 'components/sections/content/upload/form-actions';
import UploadMediaMain from 'components/sections/content/upload/media';

const uploadMediaSchema = yup.object({
  media: yup
    .object({
      id: yup.string().required('This field is required.'),
      file: yup.mixed().required('File is required.'),
    })
    .required('Media file is required.'),
  thumbnail: yup
    .object({
      id: yup.string().required(),
      file: yup.mixed().required(),
    })
    .nullable()
    .optional(),
  title: yup.string().required('Title is required.'),
  description: yup
    .string()
    .required('Content is required.')
    .min(10, 'Content must be at least 10 characters long.'),
  podcastPlaylistIds: yup.array().of(yup.number().required()).optional(),
  topics: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one topic is required.')
    .required('Topics are required.'),
  episodeNo: yup.number().nullable().required('Episode No is required.'),
  seasonNo: yup.number().nullable().required('Season No is required.'),
  tags: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one tag is required.')
    .required('Tags are required.'),
  accessibility: yup.string().required('Accessibility is required.'),
  language: yup.string().required('Language is required.'),
  transcript: yup
    .object({
      subtitle: yup.string(),
      autoGenerate: yup.boolean().required('Auto-generate option is required.'),
    })
    .required('Transcript information is required.'),
  targetAudience: yup
    .string()
    .oneOf(['all', 'children', 'adults'], 'Please select a valid target audience.')
    .required('Target audience is required.'),
});

const UploadMedia = () => {
  const methods = useForm({
    resolver: yupResolver(uploadMediaSchema),
    defaultValues: {
      thumbnail: null,
      media: null,
      title: '',
      description: '',
      topics: [],
      tags: [],
      accessibility: '',
      language: '',
      targetAudience: 'all',
      podcastPlaylistIds: [],
      episodeNo: null,
      seasonNo: null,
    },
  });

  return (
    <FormProvider {...methods}>
      <Box px={{ xs: 3, md: 5 }}>
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 }, px: { xs: 0 } }}>
          <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
            Content Details
          </Typography>

          <UploadMediaMain />

          <FormActions />
        </Container>
      </Box>
    </FormProvider>
  );
};

export default UploadMedia;

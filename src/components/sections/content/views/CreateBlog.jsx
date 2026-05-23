'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Container, Fade, Typography } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import * as yup from 'yup';
import CreateBlogMain from 'components/sections/content/upload/blog';
import StoryEdit from 'components/sections/content/upload/blog/story/edit/StoryEdit';
import FormActions from 'components/sections/content/upload/form-actions';

const createBlogSchema = yup.object({
  thumbnail: yup
    .object({
      id: yup.string().required(),
      file: yup.mixed().required(),
    })
    .nullable()
    .optional(),
  title: yup.string().required('Title is required.'),
  subText: yup.string().required('Sub-text is required.'),
  content: yup
    .string()
    .required('Content is required.')
    .min(10, 'Content must be at least 10 characters long.'),
  topics: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one topic is required.')
    .required('Topics are required.'),
  canonicalLink: yup.string().optional(),
  tags: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one tag is required.')
    .required('Tags are required.'),
  accessibility: yup.string().required('Accessibility is required.'),
  language: yup.string().required('Language is required.'),
  targetAudience: yup
    .string()
    .oneOf(['all', 'children', 'adults'], 'Please select a valid target audience.')
    .required('Target audience is required.'),
});

const CreateBlog = () => {
  const { up } = useBreakpoints();
  const [isEditingStory, setIsEditingStory] = useState(false);

  const upLg = up('lg');

  const handleEditStory = (isEditing) => setIsEditingStory(isEditing);

  const methods = useForm({
    resolver: yupResolver(createBlogSchema),
    defaultValues: {
      thumbnail: null,
      title: '',
      subText: '',
      content: '',
      topics: [],
      canonicalLink: '',
      tags: [],
      accessibility: '',
      language: '',
      targetAudience: 'all',
    },
  });

  return (
    <FormProvider {...methods}>
      <Fade in={!isEditingStory}>
        <Container
          maxWidth={upLg ? 'lg' : false}
          sx={[
            {
              display: isEditingStory ? 'none' : 'block',
              py: { xs: 3, md: 5 },
              px: { xs: 3, md: 5 },
            },
            !upLg && { maxWidth: 800 },
          ]}
        >
          <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
            Blog Details
          </Typography>

          <CreateBlogMain handleEditStory={handleEditStory} />

          <FormActions />
        </Container>
      </Fade>

      <Fade in={isEditingStory}>
        <Box sx={{ px: { xs: 3, md: 5 }, display: !isEditingStory ? 'none' : 'block' }}>
          <Container
            maxWidth={false}
            sx={{
              maxWidth: 800,
              px: { xs: 0 },
            }}
          >
            <StoryEdit handleEditStory={handleEditStory} />
          </Container>
        </Box>
      </Fade>
    </FormProvider>
  );
};

export default CreateBlog;

'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  FormHelperText,
  Stack,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from 'providers/AuthProvider';
import AvatarDropBox from 'components/base/AvatarDropBox';
import AccountTabPanelSection from '../common/AccountTabPanelSection';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  dealershipName: '',
  territory: '',
  timezone: 'America/Chicago',
  locale: 'en-US',
  avatarUrl: '',
};

const PersonalInfoTabPanel = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { profile, session, supabase, refreshProfile } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setForm(profileToForm(profile, session?.user));
  }, [profile, session?.user]);

  const handleSave = async () => {
    if (!session?.user) {
      setError('You need to be logged in to update your profile.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const firstName = cleanText(form.firstName);
    const lastName = cleanText(form.lastName);

    const payload = {
      id: session.user.id,
      first_name: firstName,
      last_name: lastName,
      email: cleanText(form.email) || session.user.email,
      phone: cleanText(form.phone),
      avatar_url: cleanText(form.avatarUrl),
      job_title: cleanText(form.jobTitle),
      dealership_name: cleanText(form.dealershipName),
      territory: cleanText(form.territory),
      timezone: cleanText(form.timezone) || 'America/Chicago',
      locale: cleanText(form.locale) || 'en-US',
    };

    const { error: saveError } = await supabase.from('profiles').upsert(payload);

    setIsSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    await supabase.auth.updateUser({
      data: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        avatar_url: payload.avatar_url,
        job_title: payload.job_title,
        dealership_name: payload.dealership_name,
        territory: payload.territory,
        timezone: payload.timezone,
        locale: payload.locale,
      },
    });

    await refreshProfile();
    enqueueSnackbar('Profile saved.', { variant: 'success' });
  };

  const handleAvatarDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file || !session?.user) return;

    setIsUploadingAvatar(true);
    setError(null);

    const extension = getFileExtension(file.name);
    const storagePath = `${session.user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-avatars')
      .upload(storagePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setIsUploadingAvatar(false);
      setError(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-avatars').getPublicUrl(storagePath);

    const avatarUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        avatar_url: avatarUrl,
        email: form.email || session.user.email,
      });

    setIsUploadingAvatar(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    setForm((prev) => ({ ...prev, avatarUrl }));
    await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
    await refreshProfile();
    enqueueSnackbar('Avatar uploaded.', { variant: 'success' });
  };

  return (
    <Stack direction="column" divider={<Divider />} spacing={5}>
      {error && <Alert severity="error">{error}</Alert>}

      <AccountTabPanelSection
        title="Profile Photo"
        subtitle="This image is used in the app header and on your business card."
        icon="material-symbols:account-circle-outline"
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'center' }}>
          <AvatarDropBox
            defaultFile={form.avatarUrl}
            onDrop={handleAvatarDrop}
            disabled={isUploadingAvatar}
            maxSize={5 * 1024 * 1024}
          />
          <Box>
            <FormHelperText>
              {isUploadingAvatar ? 'Uploading...' : 'JPG, PNG, or GIF up to 5MB.'}
            </FormHelperText>
          </Box>
        </Stack>
      </AccountTabPanelSection>

      <AccountTabPanelSection
        title="Name"
        subtitle="Your app display name is generated from these fields."
        icon="material-symbols:badge-outline"
      >
        <Stack direction="column" spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="First Name"
              value={form.firstName}
              onChange={handleField(setForm, 'firstName')}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={form.lastName}
              onChange={handleField(setForm, 'lastName')}
              fullWidth
            />
          </Stack>
        </Stack>
      </AccountTabPanelSection>

      <AccountTabPanelSection
        title="Contact"
        subtitle="These values are stored on your AgRM profile."
        icon="material-symbols:contact-mail-outline-rounded"
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Email" value={form.email} onChange={handleField(setForm, 'email')} fullWidth />
          <TextField label="Phone" value={form.phone} onChange={handleField(setForm, 'phone')} fullWidth />
        </Stack>
      </AccountTabPanelSection>

      <AccountTabPanelSection
        title="Work"
        subtitle="This is used for your profile and business card defaults."
        icon="material-symbols:work-outline-rounded"
      >
        <Stack direction="column" spacing={2}>
          <TextField
            label="Job Title"
            value={form.jobTitle}
            onChange={handleField(setForm, 'jobTitle')}
            fullWidth
          />
          <TextField
            label="Dealership / Business"
            value={form.dealershipName}
            onChange={handleField(setForm, 'dealershipName')}
            fullWidth
          />
          <TextField
            label="Territory"
            value={form.territory}
            onChange={handleField(setForm, 'territory')}
            fullWidth
          />
        </Stack>
      </AccountTabPanelSection>

      <AccountTabPanelSection
        title="Preferences"
        subtitle="These defaults keep dates, times, and regional formatting consistent."
        icon="material-symbols:settings-outline-rounded"
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Timezone"
            value={form.timezone}
            onChange={handleField(setForm, 'timezone')}
            fullWidth
          />
          <TextField label="Locale" value={form.locale} onChange={handleField(setForm, 'locale')} fullWidth />
        </Stack>
      </AccountTabPanelSection>

      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Button variant="contained" loading={isSaving} onClick={handleSave}>
          Save Profile
        </Button>
      </Stack>
    </Stack>
  );
};

function profileToForm(profile, user) {
  const metadata = user?.user_metadata || {};
  const firstName = profile?.first_name || metadata.first_name || '';
  const lastName = profile?.last_name || metadata.last_name || '';

  return {
    firstName,
    lastName,
    email: profile?.email || user?.email || '',
    phone: profile?.phone || user?.phone || '',
    jobTitle: profile?.job_title || metadata.job_title || '',
    dealershipName: profile?.dealership_name || metadata.dealership_name || '',
    territory: profile?.territory || metadata.territory || '',
    timezone: profile?.timezone || metadata.timezone || 'America/Chicago',
    locale: profile?.locale || metadata.locale || 'en-US',
    avatarUrl: profile?.avatar_url || metadata.avatar_url || '',
  };
}

function handleField(setForm, key) {
  return (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };
}

function getFileExtension(filename) {
  const extension = filename.split('.').pop()?.toLowerCase();

  if (!extension || extension === filename) {
    return 'jpg';
  }

  return extension === 'jpeg' ? 'jpg' : extension;
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export default PersonalInfoTabPanel;

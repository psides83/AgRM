'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormHelperText,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import AvatarDropBox from 'components/base/AvatarDropBox';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import AccountTabPanelSection from 'components/sections/account/common/AccountTabPanelSection';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';

const emptyForm = {
  slug: '',
  enabled: true,
  firstName: '',
  lastName: '',
  jobTitle: '',
  dealershipName: '',
  territory: '',
  email: '',
  phone: '',
  website: '',
  avatarUrl: '',
  bio: '',
  brandColor: '#367C2B',
};

const BusinessCardManagerClient = ({ embedded = false }) => {
  const supabase = useMemo(() => createClient(), []);
  const { enqueueSnackbar } = useSnackbar();
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [cardId, setCardId] = useState(null);
  const [savedSlug, setSavedSlug] = useState('');
  const [savedEnabled, setSavedEnabled] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState(null);

  const savedCardUrl =
    typeof window === 'undefined' || !savedSlug
      ? ''
      : `${window.location.origin}${paths.publicBusinessCard(savedSlug)}`;
  const draftCardUrl =
    typeof window === 'undefined' || !form.slug
      ? ''
      : `${window.location.origin}${paths.publicBusinessCard(normalizeSlug(form.slug))}`;
  const canOpenSavedCard = Boolean(savedCardUrl && savedEnabled);

  useEffect(() => {
    loadCard();
  }, [supabase]);

  useEffect(() => {
    if (!savedCardUrl || !savedEnabled) {
      setQrCodeUrl('');
      return;
    }

    QRCode.toDataURL(savedCardUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    }).then(setQrCodeUrl);
  }, [savedCardUrl, savedEnabled]);

  const loadCard = async () => {
    setError(null);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('You need to be logged in to manage your business card.');
      setIsLoading(false);
      return;
    }

    const [profileResult, cardResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('business_cards').select('*').eq('owner_id', user.id).maybeSingle(),
    ]);

    if (profileResult.error) {
      setError(profileResult.error.message);
      setIsLoading(false);
      return;
    }

    setProfile(profileResult.data);

    if (cardResult.error) {
      setError(cardResult.error.message);
    } else if (cardResult.data) {
      setCardId(cardResult.data.id);
      setSavedSlug(cardResult.data.slug);
      setSavedEnabled(cardResult.data.enabled);
      setForm(cardToForm(cardResult.data));
    } else {
      setSavedSlug('');
      setSavedEnabled(false);
      setForm(profileToForm(profileResult.data, user.email));
    }

    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.slug.trim()) {
      setError('First name, last name, and public slug are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      owner_id: user.id,
      slug: normalizeSlug(form.slug),
      enabled: form.enabled,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      job_title: cleanText(form.jobTitle),
      dealership_name: cleanText(form.dealershipName),
      territory: cleanText(form.territory),
      email: cleanText(form.email),
      phone: cleanText(form.phone),
      website: cleanText(form.website),
      avatar_url: cleanText(form.avatarUrl),
      bio: cleanText(form.bio),
      brand_color: form.brandColor || '#367C2B',
    };

    const query = cardId
      ? supabase.from('business_cards').update(payload).eq('id', cardId).select('id').single()
      : supabase.from('business_cards').insert(payload).select('id').single();

    const { data, error: saveError } = await query;
    setIsSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    await supabase
      .from('profiles')
      .update({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        avatar_url: payload.avatar_url,
        job_title: payload.job_title,
        dealership_name: payload.dealership_name,
        territory: payload.territory,
      })
      .eq('id', user.id);

    await refreshProfile(user);
    setCardId(data.id);
    setSavedSlug(payload.slug);
    setSavedEnabled(payload.enabled);
    setForm((prev) => ({ ...prev, slug: payload.slug }));
    enqueueSnackbar('Business card saved.', { variant: 'success' });
  };

  const handleAvatarDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file) return;

    setIsUploadingAvatar(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('You need to be logged in to upload an avatar.');
      setIsUploadingAvatar(false);
      return;
    }

    const extension = getFileExtension(file.name);
    const storagePath = `${user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-avatars')
      .upload(storagePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setError(uploadError.message);
      setIsUploadingAvatar(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-avatars').getPublicUrl(storagePath);

    const publicUrlWithCacheBust = `${publicUrl}?v=${Date.now()}`;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrlWithCacheBust })
      .eq('id', user.id);

    setIsUploadingAvatar(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    setForm((prev) => ({ ...prev, avatarUrl: publicUrlWithCacheBust }));
    setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrlWithCacheBust } : prev));
    await refreshProfile(user);
    enqueueSnackbar('Avatar uploaded.', { variant: 'success' });
  };

  const handleCopyLink = async () => {
    if (!canOpenSavedCard) return;
    await navigator.clipboard.writeText(savedCardUrl);
    enqueueSnackbar('Business card link copied.', { variant: 'success' });
  };

  if (isLoading) {
    return <Typography sx={{ p: 3 }}>Loading business card...</Typography>;
  }

  if (embedded) {
    return (
      <Stack direction="column" divider={<Divider />} spacing={5}>
        {error && <Alert severity="error">{error}</Alert>}

        <AccountTabPanelSection
          title="Publishing"
          subtitle="Control whether your digital card is public and set the short URL used for the card and QR code."
          icon="material-symbols:ios-share-rounded"
          actionComponent={
            <Button
              component={Link}
              href={savedCardUrl || '#!'}
              target="_blank"
              disabled={!canOpenSavedCard}
              variant="soft"
              color="neutral"
              startIcon={<IconifyIcon icon="material-symbols:open-in-new-rounded" />}
            >
              Open Card
            </Button>
          }
        >
          <Stack spacing={2.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(event) => setForm((prev) => ({ ...prev, enabled: event.target.checked }))}
                />
              }
              label="Publish business card"
            />
            <TextField
              label="Public Slug"
              value={form.slug}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, slug: normalizeSlug(event.target.value) }))
              }
              helperText={
                savedCardUrl && savedEnabled
                  ? `Current public URL: ${savedCardUrl}`
                  : savedCardUrl
                    ? 'This card is saved but not currently published.'
                  : draftCardUrl || 'Save the card before opening the public URL.'
              }
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant="soft"
                color="neutral"
                onClick={handleCopyLink}
                disabled={!canOpenSavedCard}
                startIcon={<IconifyIcon icon="material-symbols:content-copy-outline-rounded" />}
                sx={{ alignSelf: { sm: 'flex-start' } }}
              >
                Copy Link
              </Button>
            </Stack>
          </Stack>
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Card Profile"
          subtitle="This information is shown on the public business card and also updates your profile details."
          icon="material-symbols:badge-outline-rounded"
        >
          <Stack direction="column" spacing={3}>
            <Stack direction="column" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <AvatarDropBox
                defaultFile={form.avatarUrl}
                onDrop={handleAvatarDrop}
                disabled={isUploadingAvatar}
                maxSize={5 * 1024 * 1024}
                sx={{ width: 112, height: 112 }}
              />
              <FormHelperText>
                {isUploadingAvatar ? 'Uploading...' : 'JPG, PNG, WEBP, or GIF up to 5MB.'}
              </FormHelperText>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
                '& .MuiFormControl-root': { minWidth: 0 },
              }}
            >
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
              <TextField label="Job Title" value={form.jobTitle} onChange={handleField(setForm, 'jobTitle')} fullWidth />
              <TextField label="Territory" value={form.territory} onChange={handleField(setForm, 'territory')} fullWidth />
              <TextField
                label="Dealership / Business"
                value={form.dealershipName}
                onChange={handleField(setForm, 'dealershipName')}
                fullWidth
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              <TextField label="Email" value={form.email} onChange={handleField(setForm, 'email')} fullWidth />
              <TextField label="Phone" value={form.phone} onChange={handleField(setForm, 'phone')} fullWidth />
              <TextField label="Website" value={form.website} onChange={handleField(setForm, 'website')} fullWidth />
              <TextField
                label="Brand Color"
                value={form.brandColor}
                onChange={handleField(setForm, 'brandColor')}
                fullWidth
              />
              <TextField
                label="Bio"
                value={form.bio}
                onChange={handleField(setForm, 'bio')}
                fullWidth
                multiline
                rows={4}
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
            </Box>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="contained" loading={isSaving} onClick={handleSave}>
                Save Business Card
              </Button>
            </Stack>
          </Stack>
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Preview"
          subtitle="Use this to check the public card before sharing it."
          icon="material-symbols:preview-outline-rounded"
        >
          <BusinessCardPreview form={form} />
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="QR Code"
          subtitle="Share or print this code once the card has the correct public URL."
          icon="material-symbols:qr-code-2-rounded"
        >
          {qrCodeUrl ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Image
                src={qrCodeUrl}
                alt="Business card QR code"
                width={220}
                height={220}
                sx={{ maxWidth: 1, height: 'auto' }}
              />
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Save a slug to generate a QR code.
            </Typography>
          )}
        </AccountTabPanelSection>
      </Stack>
    );
  }

  return (
    <Grid container spacing={3}>
      {!embedded && (
        <Grid size={12}>
          <PageHeader
            title="Digital Business Card"
            breadcrumb={[
              { label: 'Home', url: paths.crm },
              { label: 'Account', url: paths.account },
              { label: 'Business Card', active: true },
            ]}
            actionComponent={
              <Button
                component={Link}
                href={savedCardUrl || '#!'}
                target="_blank"
                disabled={!canOpenSavedCard}
                variant="soft"
                color="neutral"
                startIcon={<IconifyIcon icon="material-symbols:open-in-new-rounded" />}
              >
                Open Card
              </Button>
            }
          />
        </Grid>
      )}

      {embedded && (
        <Grid size={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Manage the public card and QR code you can share with prospects and customers.
            </Typography>
            <Button
              component={Link}
              href={savedCardUrl || '#!'}
              target="_blank"
              disabled={!canOpenSavedCard}
              variant="soft"
              color="neutral"
              startIcon={<IconifyIcon icon="material-symbols:open-in-new-rounded" />}
            >
              Open Card
            </Button>
          </Stack>
        </Grid>
      )}

      <Grid size={{ xs: 12, lg: 7 }}>
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}
            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(event) => setForm((prev) => ({ ...prev, enabled: event.target.checked }))}
                />
              }
              label="Publish business card"
            />
            <TextField
              label="Public Slug"
              value={form.slug}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, slug: normalizeSlug(event.target.value) }))
              }
              helperText={
                savedCardUrl && savedEnabled
                  ? `Current public URL: ${savedCardUrl}`
                  : savedCardUrl
                    ? 'This card is saved but not currently published.'
                  : draftCardUrl || 'Save the card before opening the public URL.'
              }
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="First Name" value={form.firstName} onChange={handleField(setForm, 'firstName')} fullWidth />
              <TextField label="Last Name" value={form.lastName} onChange={handleField(setForm, 'lastName')} fullWidth />
            </Stack>
            <TextField label="Job Title" value={form.jobTitle} onChange={handleField(setForm, 'jobTitle')} fullWidth />
            <TextField
              label="Dealership / Business"
              value={form.dealershipName}
              onChange={handleField(setForm, 'dealershipName')}
              fullWidth
            />
            <TextField label="Territory" value={form.territory} onChange={handleField(setForm, 'territory')} fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Email" value={form.email} onChange={handleField(setForm, 'email')} fullWidth />
              <TextField label="Phone" value={form.phone} onChange={handleField(setForm, 'phone')} fullWidth />
            </Stack>
            <TextField label="Website" value={form.website} onChange={handleField(setForm, 'website')} fullWidth />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Profile Photo
              </Typography>
              <AvatarDropBox
                defaultFile={form.avatarUrl}
                onDrop={handleAvatarDrop}
                disabled={isUploadingAvatar}
                maxSize={5 * 1024 * 1024}
              />
              <FormHelperText>
                {isUploadingAvatar ? 'Uploading avatar...' : 'JPG, PNG, WEBP, or GIF up to 5MB.'}
              </FormHelperText>
            </Box>
            <TextField
              label="Brand Color"
              value={form.brandColor}
              onChange={handleField(setForm, 'brandColor')}
              fullWidth
            />
            <TextField label="Bio" value={form.bio} onChange={handleField(setForm, 'bio')} fullWidth multiline rows={4} />
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="soft" color="neutral" onClick={handleCopyLink} disabled={!canOpenSavedCard}>
                Copy Link
              </Button>
              <Button variant="contained" loading={isSaving} onClick={handleSave}>
                Save Business Card
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 5 }}>
        <Stack spacing={3}>
          <BusinessCardPreview form={form} />
          <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              QR Code
            </Typography>
            {qrCodeUrl ? (
              <Image src={qrCodeUrl} alt="Business card QR code" width={280} height={280} sx={{ mx: 'auto' }} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Save a slug to generate a QR code.
              </Typography>
            )}
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
};

function BusinessCardPreview({ form }) {
  const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ') || 'Your Name';
  const brandColor = form.brandColor || '#367C2B';

  return (
    <Paper
      sx={{
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.elevation1',
      }}
    >
      <Box sx={{ height: 10, bgcolor: brandColor }} />
      <Stack direction="column" spacing={3} sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: 2,
              borderColor: 'background.paper',
              bgcolor: 'background.elevation2',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: 1,
            }}
          >
            {form.avatarUrl ? (
              <Image
                src={form.avatarUrl}
                alt={fullName}
                width={72}
                height={72}
                sx={{ objectFit: 'cover' }}
              />
            ) : (
              <Stack sx={{ width: 1, height: 1, alignItems: 'center', justifyContent: 'center' }}>
                <IconifyIcon icon="material-symbols:person-rounded" sx={{ fontSize: 34, color: 'text.disabled' }} />
              </Stack>
            )}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
              {fullName}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {form.jobTitle || 'Ag Equipment Sales'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
              {form.dealershipName || 'Dealership / Business'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {form.territory && <Chip label={form.territory} size="small" variant="soft" color="primary" />}
          {form.website && <Chip label={form.website} size="small" variant="soft" color="neutral" />}
        </Stack>

        <Stack direction="column" spacing={1.25}>
          <ContactLine icon="material-symbols:call-outline-rounded" value={form.phone || 'Phone number'} />
          <ContactLine icon="material-symbols:mail-outline-rounded" value={form.email || 'Email address'} />
          <ContactLine icon="material-symbols:location-on-outline-rounded" value={form.territory || 'Sales territory'} />
        </Stack>

        {form.bio && (
          <>
            <Divider />
            <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
              {form.bio}
            </Typography>
          </>
        )}
      </Stack>
    </Paper>
  );
}

function ContactLine({ icon, value }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
      <IconifyIcon icon={icon} sx={{ color: 'text.secondary', flexShrink: 0 }} />
      <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function profileToForm(profile, authEmail) {
  const firstName = profile?.first_name || '';
  const lastName = profile?.last_name || '';

  return {
    ...emptyForm,
    firstName,
    lastName,
    slug: normalizeSlug([firstName, lastName].filter(Boolean).join('-')) || '',
    jobTitle: profile?.job_title || 'Ag Equipment Sales',
    dealershipName: profile?.dealership_name || '',
    territory: profile?.territory || '',
    email: profile?.email || authEmail || '',
    phone: profile?.phone || '',
    avatarUrl: profile?.avatar_url || '',
  };
}

function cardToForm(card) {
  return {
    slug: card.slug || '',
    enabled: card.enabled,
    firstName: card.first_name || '',
    lastName: card.last_name || '',
    jobTitle: card.job_title || '',
    dealershipName: card.dealership_name || '',
    territory: card.territory || '',
    email: card.email || '',
    phone: card.phone || '',
    website: card.website || '',
    avatarUrl: card.avatar_url || '',
    bio: card.bio || '',
    brandColor: card.brand_color || '#367C2B',
  };
}

function handleField(setForm, key) {
  return (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };
}

function normalizeSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

export default BusinessCardManagerClient;

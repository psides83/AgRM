import { notFound } from 'next/navigation';
import { Box, Button, Chip, Container, Divider, Link, Paper, Stack, Typography } from '@mui/material';
import { createClient } from 'lib/supabase/server';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const card = await getBusinessCard(slug);

  if (!card) {
    return {
      title: 'Business Card | AgRM',
    };
  }

  return {
    title: `${card.first_name} ${card.last_name} | ${card.dealership_name || 'AgRM'}`,
    description: card.bio || `${card.first_name} ${card.last_name}'s digital business card`,
  };
}

const Page = async ({ params }) => {
  const { slug } = await params;
  const card = await getBusinessCard(slug);

  if (!card) {
    notFound();
  }

  const fullName = `${card.first_name} ${card.last_name}`;
  const initials = `${card.first_name?.[0] || ''}${card.last_name?.[0] || ''}`;
  const brandColor = card.brand_color || '#367C2B';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ overflow: 'hidden', border: 1, borderColor: 'divider' }}>
          <Box sx={{ height: 10, bgcolor: brandColor }} />
          <Stack direction="column" spacing={3.5} sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2.5}
              sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
            >
              <AvatarBlock card={card} fullName={fullName} initials={initials} brandColor={brandColor} />

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h3" sx={{ mb: 0.5, overflowWrap: 'anywhere' }}>
                  {fullName}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {card.job_title || 'Ag Equipment Sales'}
                </Typography>
                {card.dealership_name && (
                  <Typography variant="body1" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
                    {card.dealership_name}
                  </Typography>
                )}
              </Box>
            </Stack>

            {(card.territory || card.website) && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {card.territory && <Chip label={card.territory} variant="soft" color="primary" />}
                {card.website && <Chip label={card.website} variant="soft" color="neutral" />}
              </Stack>
            )}

            {card.bio && (
              <>
                <Divider />
                <Typography variant="body1" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
                  {card.bio}
                </Typography>
              </>
            )}

            <Divider />

            <Stack direction="column" spacing={1.25}>
              {card.phone && (
                <ContactLink
                  href={`tel:${card.phone}`}
                  icon="material-symbols:call-outline-rounded"
                  label={card.phone}
                />
              )}
              {card.email && (
                <ContactLink
                  href={`mailto:${card.email}`}
                  icon="material-symbols:mail-outline-rounded"
                  label={card.email}
                />
              )}
              {card.website && (
                <ContactLink
                  href={normalizeWebsiteHref(card.website)}
                  icon="material-symbols:language-rounded"
                  label={card.website}
                />
              )}
            </Stack>

            <Button
              href={buildVCardUrl(card)}
              component={Link}
              underline="none"
              variant="contained"
              size="large"
              startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
              sx={{ alignSelf: 'stretch' }}
            >
              Save Contact
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

function ContactLink({ href, icon, label }) {
  return (
    <Button
      component={Link}
      href={href}
      underline="none"
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      color="neutral"
      variant="soft"
      size="large"
      startIcon={<IconifyIcon icon={icon} />}
      sx={{ justifyContent: 'flex-start', overflowWrap: 'anywhere', textAlign: 'left' }}
    >
      {label}
    </Button>
  );
}

function AvatarBlock({ card, fullName, initials, brandColor }) {
  return (
    <Box
      sx={{
        width: 112,
        height: 112,
        borderRadius: '50%',
        bgcolor: 'background.elevation2',
        border: 3,
        borderColor: 'background.paper',
        boxShadow: 2,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {card.avatar_url ? (
        <Image src={card.avatar_url} alt={fullName} width={112} height={112} sx={{ objectFit: 'cover' }} />
      ) : (
        <Box
          sx={{
            width: 1,
            height: 1,
            bgcolor: brandColor,
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Typography variant="h3">{initials || 'A'}</Typography>
        </Box>
      )}
    </Box>
  );
}

async function getBusinessCard(slug) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('business_cards')
    .select('*')
    .eq('slug', slug)
    .eq('enabled', true)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

function buildVCardUrl(card) {
  const name = encodeURIComponent(`${card.first_name} ${card.last_name}`);
  const org = encodeURIComponent(card.dealership_name || '');
  const title = encodeURIComponent(card.job_title || '');
  const phone = encodeURIComponent(card.phone || '');
  const email = encodeURIComponent(card.email || '');

  return `data:text/vcard;charset=utf-8,BEGIN:VCARD%0AVERSION:3.0%0AFN:${name}%0AORG:${org}%0ATITLE:${title}%0ATEL:${phone}%0AEMAIL:${email}%0AEND:VCARD`;
}

function normalizeWebsiteHref(website) {
  if (!website) return '#!';
  return website.startsWith('http://') || website.startsWith('https://') ? website : `https://${website}`;
}

export default Page;

import { Box, Button, Chip, Link, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusAvatar from 'components/base/StatusAvatar';

const ProfileSummary = ({ data, sx, ...rest }) => {
  return (
    <Paper
      background={1}
      {...rest}
      sx={{ outline: 0, p: { xs: 2, sm: 3 }, borderRadius: 4, ...sx }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        gap={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', lg: 'center' },
        }}
      >
        <Stack
          gap={2}
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'center' },
            minWidth: 0,
          }}
        >
          <StatusAvatar
            status={data.isActive ? 'online' : 'offline'}
            src={data.avatar}
            sx={{ width: 80, height: 80, flexShrink: 0 }}
          />
          <Stack
            direction="column"
            gap={0.5}
            sx={{
              minWidth: 0,
              flex: { sm: 1 },
              width: { xs: '100%', sm: 'auto' },
              alignItems: { xs: 'center', sm: 'flex-start' },
            }}
          >
            <Stack
              gap={2}
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}
            >
              <Typography variant="h5">{data.name}</Typography>
              <Chip
                variant="filled"
                label={data.isActive ? 'Active' : 'Inactive'}
                color={data.isActive ? 'success' : 'error'}
              />
            </Stack>
            <Stack
              gap={2}
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 400, color: 'text.secondary', textWrap: 'nowrap' }}
              >
                {data.designation}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 400, color: 'text.secondary', textWrap: 'nowrap' }}
              >
                <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  ID:{' '}
                </Box>{' '}
                {data.id}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 400, color: 'text.secondary', textWrap: 'nowrap' }}
              >
                {data.employementType}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={{ xs: 1.5, sm: 1, md: 2, lg: 3 }}
          sx={{
            justifyContent: { xs: 'flex-start', sm: 'space-between', md: 'flex-start' },
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            width: { xs: '100%', lg: 'auto' },
            alignSelf: { xs: 'flex-start', sm: 'auto' },
            minWidth: { xs: 0, lg: 'min-content' },
            flexShrink: { lg: 0 },
          }}
        >
          <ContactInfo icon="material-symbols:mail-outline-rounded" value={data.email} isLink />
          <ContactInfo icon="material-symbols:call-outline-rounded" value={data.phone} />
          <ContactInfo icon="material-symbols:location-on-outline-rounded" value={data.location} />
        </Stack>
      </Stack>
    </Paper>
  );
};
const ContactInfo = ({ icon, isLink = false, value }) => {
  const valueStyles = {
    fontWeight: 400,
    whiteSpace: { xs: 'normal', md: 'nowrap' },
    wordBreak: { xs: 'break-word', md: 'normal' },
  };
  return (
    <Stack
      direction={{ xs: 'row', sm: 'column' }}
      gap={1}
      sx={{
        flex: { xs: 'none', sm: '0 0 auto', md: 1, lg: '0 0 auto' },
        minWidth: { xs: 0, lg: 'auto' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        width: { xs: '100%', sm: 'auto' },
      }}
    >
      <Button shape="circle" variant="soft" color="neutral" size="small" sx={{ flexShrink: 0 }}>
        <IconifyIcon icon={icon} sx={{ fontSize: 18 }} />
      </Button>
      {isLink ? (
        <Link href="#!" variant="subtitle2" sx={valueStyles}>
          {value}
        </Link>
      ) : (
        <Typography variant="subtitle2" sx={{ ...valueStyles, color: 'text.secondary' }}>
          {value}
        </Typography>
      )}
    </Stack>
  );
};
export default ProfileSummary;

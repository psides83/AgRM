import { useState } from 'react';
import { Box, Chip, Collapse, Link, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const VideoDescription = ({ description }) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Paper
      variant="elevation"
      background={1}
      elevation={0}
      sx={{
        alignSelf: { md: 'flex-start' },
        flex: 1,
        borderRadius: 4,
        p: { xs: 2, md: 3 },
        mb: { xs: 3, md: 5 },
      }}
    >
      <Stack
        onClick={handleClick}
        sx={{
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
      >
        <IconifyIcon
          icon="material-symbols:keyboard-arrow-down-rounded"
          fontSize={24}
          sx={{
            rotate: open ? '180deg' : '0deg',
          }}
        />
        <Typography variant="h6">Details</Typography>
      </Stack>

      <Collapse in={open} unmountOnExit>
        <Typography sx={{ color: 'text.secondary', my: 3 }}>{description.description}</Typography>
        <Typography fontWeight={700} sx={{ color: 'text.secondary', mb: 1 }}>
          Team
        </Typography>
        <Stack direction="column" sx={{ mb: 3 }}>
          {description.team.map((member) => (
            <Typography variant="body2" sx={{ color: 'text.secondary' }} key={member.name}>
              {member.role} - {member.name}
            </Typography>
          ))}
        </Stack>
        <Typography fontWeight={500} sx={{ color: 'text.secondary', mb: 0.5 }}>
          Follow us
        </Typography>
        <Stack direction="column" sx={{ gap: 1, mb: { xs: 3, md: 5 } }}>
          {description.socials.map((social) => (
            <Stack sx={{ gap: 0.5, alignItems: 'center' }} key={social.link}>
              <IconifyIcon
                icon={
                  social.platform.toLowerCase() === 'email'
                    ? 'material-symbols:mail-outline-rounded'
                    : 'material-symbols:link-rounded'
                }
                sx={{ fontSize: 20 }}
              />
              <Typography component={Link} href="#!">
                <Box component="span" sx={{ color: 'primary.main' }}>
                  {social.link}
                </Box>
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Typography variant="h6" fontWeight={600} sx={{ color: 'text.secondary', mb: 2 }}>
          Tags
        </Typography>
        <Stack sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {description.tags.map((tag) => (
            <Chip key={tag} label={tag} sx={{ textTransform: 'capitalize' }} />
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default VideoDescription;

import { Box, Chip, Link, Stack, Typography } from '@mui/material';
import { podcastPlaylist } from 'data/content/podcast';
import IconifyIcon from 'components/base/IconifyIcon';

const item = podcastPlaylist[0].episodeLists[0];

const PodcastDetails = () => {
  return (
    <div>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        {item.description
          ? item.description
          : 'Soluta ligula fugit sodales, quisque lacinia incididunt suspendisse, excepturi consectetuer consequat excepturi dolore purus justo distinctio, curae aliqua'}
      </Typography>
      {item.team.length > 0 && (
        <>
          <Typography sx={{ color: 'text.secondary', mb: 1, fontWeight: 'bold' }}>Team</Typography>
          <Stack direction="column" sx={{ mb: 3 }}>
            {item.team.map((member) => (
              <Typography variant="body2" sx={{ color: 'text.secondary' }} key={member.name}>
                {member.role} - {member.name}
              </Typography>
            ))}
          </Stack>
        </>
      )}
      {item.socials.length > 0 && (
        <>
          <Typography sx={{ color: 'text.secondary', fontWeight: 'medium', mb: 0.5 }}>
            Follow us
          </Typography>
          <Stack direction="column" sx={{ gap: 1, mb: { xs: 3, md: 5 } }}>
            {item.socials.map((social) => (
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
        </>
      )}

      {item.tags.length > 0 && (
        <>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600, mb: 2 }}>
            Tags
          </Typography>
          <Stack sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {item.tags.map((tag) => (
              <Chip key={tag} label={tag} sx={{ textTransform: 'capitalize' }} />
            ))}
          </Stack>
        </>
      )}
    </div>
  );
};

export default PodcastDetails;

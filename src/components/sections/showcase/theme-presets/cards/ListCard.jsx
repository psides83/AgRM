import { useMemo } from 'react';
import { Box, Chip, Divider, Paper, Stack, Typography, useTheme } from '@mui/material';
import { initialConfig } from 'config';
import Image from 'components/base/Image';

const shares = [
  {
    id: 'alligator',
    icon: `${initialConfig.assetsDir}/images/logo/3.svg`,
    brand: 'Alligator',
    revenue: 29.7,
    growth: 6.01,
  },
  {
    id: 'check_mark',
    icon: `${initialConfig.assetsDir}/images/logo/4.svg`,
    brand: 'CheckMark',
    revenue: 31.9,
    growth: 4.12,
  },
  {
    id: 'stripes',
    icon: `${initialConfig.assetsDir}/images/logo/5.svg`,
    brand: 'Stripes',
    revenue: 23.0,
    growth: -3.91,
  },
  {
    id: 'head_mead',
    icon: `${initialConfig.assetsDir}/images/logo/6.svg`,
    brand: 'Head & Mead',
    revenue: 14.4,
    growth: 0.01,
  },
];

const getGrowthColor = (growth) => {
  if (growth > 1) return 'success';
  if (growth < 0) return 'error';
  return 'warning';
};

const ShareItem = ({ share, brandColor }) => (
  <Stack spacing={{ xs: 2, sm: 3 }} alignItems="stretch">
    <Box
      sx={{
        height: 24,
        width: 8,
        borderRadius: 2,
        bgcolor: brandColor,
      }}
    />
    <Stack direction="row" justifyContent="space-between" flex={1}>
      <Stack direction="row" alignItems="center" gap={1} flex={1}>
        <Image src={share.icon} alt={share.brand} width={16} height={16} />
        <Typography variant="body2" color="text.secondary">
          {share.brand}
        </Typography>
      </Stack>
      <Chip label={`${share.growth}%`} color={getGrowthColor(share.growth)} variant="soft" />
    </Stack>
  </Stack>
);

const ListCard = () => {
  const { vars } = useTheme();

  const brandColorMap = useMemo(
    () => ({
      alligator: vars.palette.chBlue[300],
      check_mark: vars.palette.chGrey[300],
      stripes: vars.palette.chGrey[500],
      head_mead: vars.palette.chBlue[500],
    }),
    [vars.palette],
  );

  return (
    <Paper
      background={1}
      sx={{
        p: 2,
        borderRadius: 4,
        outline: 'none',
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <Stack direction="column" divider={<Divider />} spacing={2}>
        {shares.map((share) => (
          <ShareItem key={share.id} share={share} brandColor={brandColorMap[share.id]} />
        ))}
      </Stack>
    </Paper>
  );
};

export default ListCard;

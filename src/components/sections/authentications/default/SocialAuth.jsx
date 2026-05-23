'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSettingsContext } from 'providers/SettingsProvider';
import { rootPaths } from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import Image from 'components/base/Image';

const SocialAuth = () => {
  const {
    config: { assetsDir },
  } = useSettingsContext();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${callbackUrl || rootPaths.root}`,
      },
    });
  };

  const handleAzureLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}${callbackUrl || rootPaths.root}`,
      },
    });
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        alignItems: 'center',
      }}
    >
      <Grid
        size={{
          xs: 12,
          lg: 6,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="neutral"
          size="large"
          sx={{ flex: 1, whiteSpace: 'nowrap' }}
          startIcon={
            <Image src={`${assetsDir}/images/logo/1.svg`} height={21} width={21} alt="icon" />
          }
          onClick={handleGoogleLogin}
        >
          Sign in with google
        </Button>
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 6,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="neutral"
          size="large"
          sx={{ flex: 1, whiteSpace: 'nowrap' }}
          startIcon={
            <Image src={`${assetsDir}/images/logo/2.svg`} height={21} width={21} alt="icon" />
          }
          onClick={handleAzureLogin}
        >
          Sign in with Microsoft
        </Button>
      </Grid>
    </Grid>
  );
};

export default SocialAuth;

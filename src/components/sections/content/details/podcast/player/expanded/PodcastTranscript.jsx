import { useEffect, useRef } from 'react';
import { Chip, List, ListItem, ListItemButton, Typography } from '@mui/material';
import { audioTranscript } from 'data/content/podcast';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import SimpleBar from 'components/base/SimpleBar';
import { useAudio } from '../../AudioProvider';

dayjs.extend(duration);

const PodcastTranscript = () => {
  const activeRef = useRef(null);
  const { seek, currentTime } = useAudio();

  const getActiveTranscriptIndex = () => {
    for (let i = audioTranscript.length - 1; i >= 0; i--) {
      if (currentTime >= audioTranscript[i].time) {
        return i;
      }
    }
    return 0;
  };

  const activeIndex = getActiveTranscriptIndex();

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  const seekTo = (time) => {
    seek(time);
  };

  return (
    <SimpleBar sx={{ maxHeight: 710 }}>
      <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {audioTranscript.map((transcript, i) => {
          const isActive = i === activeIndex;

          return (
            <ListItem key={transcript.id} disablePadding>
              <ListItemButton
                ref={isActive ? activeRef : null}
                selected={isActive}
                onClick={() => seekTo(transcript.time)}
                sx={{
                  cursor: 'pointer',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  bgcolor: 'transparent !important',
                  p: 0,
                }}
              >
                <Chip
                  variant="soft"
                  color="primary"
                  label={dayjs.duration(transcript.time, 'second').format('mm:ss')}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: isActive ? 'text.primary' : 'text.secondary',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {transcript.text}
                </Typography>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </SimpleBar>
  );
};

export default PodcastTranscript;

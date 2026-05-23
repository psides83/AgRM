'use client';

import { Box, Paper } from '@mui/material';
import useImageDimensions from 'hooks/useImageDimensions';
import useLightbox from 'hooks/useLightbox';
import Image from 'components/base/Image';
import Lightbox from 'components/base/Lightbox';

const MediaMessage = ({ media = [], currentMessageType, sx }) => {
  const { openLightbox, ...lightboxProps } = useLightbox();
  const { handleImageLoad, maxWidth, aspectRatio } = useImageDimensions(360);

  const mediaPerRow = Math.min(media.length, media.length === 4 ? 2 : 3);

  const lightboxSlides = media.map(({ type, src }) => {
    const srcString = typeof src === 'string' ? src : src.src;
    if (type === 'video') {
      return {
        type: 'video',
        sources: [{ src: srcString, type: 'video/mp4' }],
      };
    } else {
      return {
        type: 'image',
        src: srcString,
      };
    }
  });

  if (media.length < 2) {
    return (
      <Paper
        background={2}
        sx={{
          outline: 'none',
          overflow: 'hidden',
          bgcolor: 'background.elevation2',
          width: 1,
          maxWidth,
          aspectRatio,
          cursor: 'pointer',
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
          ...sx,
        }}
      >
        {media[0] && (
          <>
            {media[0].type === 'video' ? (
              <Box
                onClick={() => openLightbox(0)}
                component="video"
                src={typeof media[0].src === 'string' ? media[0].src : media[0].src.src}
                controls
                sx={{ height: 1, width: 1, objectFit: 'cover' }}
              />
            ) : (
              <Image
                src={media[0].src}
                alt=""
                width={200}
                height={200}
                onClick={() => openLightbox(0)}
                onLoad={handleImageLoad}
                sx={{ height: 1, width: 1, objectFit: 'cover' }}
              />
            )}
            <Lightbox slides={lightboxSlides} extension={['video']} {...lightboxProps} />
          </>
        )}
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: `calc(${mediaPerRow} * 120px + ${mediaPerRow - 1} * 8px)`,
      }}
    >
      <Box
        sx={{
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'grid',
          gridTemplateColumns: `repeat(${mediaPerRow}, 1fr)`,
          width: 1,
          gap: 1,
          ...sx,
        }}
      >
        {media.map(({ type, src }, index) => (
          <Box
            key={index}
            onClick={() => openLightbox(index)}
            sx={{
              position: 'relative',
              width: 1,
              borderRadius: 2,
              borderTopLeftRadius: index === 0 && currentMessageType === 'received' ? 0 : 8,
              borderTopRightRadius:
                index === mediaPerRow - 1 && currentMessageType === 'sent' ? 0 : 8,
              aspectRatio: 1,
              objectFit: 'cover',
              bgcolor: 'background.elevation2',
              overflow: 'hidden',
            }}
          >
            {type === 'video' ? (
              <Box
                component="video"
                src={typeof src === 'string' ? src : src.src}
                controls
                sx={{ width: 1, height: 1, objectFit: 'cover' }}
              />
            ) : (
              <Image
                src={src}
                width={200}
                height={200}
                onLoad={handleImageLoad}
                sx={{
                  display: 'block',
                  width: 1,
                  height: 1,
                  objectFit: 'cover',
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      <Lightbox
        slides={lightboxSlides}
        extension={['caption', 'fullscreen', 'slideshow', 'thumbnails', 'video', 'zoom']}
        {...lightboxProps}
      />
    </Box>
  );
};

export default MediaMessage;

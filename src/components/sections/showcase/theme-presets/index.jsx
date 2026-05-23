'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GradientText } from '../common';
import ThemePresetCard from './ThemePresetCard';

const themePresets = [
  'default-light',
  'default-dark',
  'luxury',
  'ember',
  'retro',
  'dracula',
  'arctic',
  'midnight',
  'nature',
];

gsap.registerPlugin(ScrollTrigger);

const PRELOAD_AHEAD = 3;

const ThemePresetsShowcase = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  const cardRefs = useRef([]);
  const [maxLoadedIndex, setMaxLoadedIndex] = useState(PRELOAD_AHEAD);

  useGSAP(
    () => {
      gsap.fromTo(
        titleRef.current,
        { scale: 2, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 120 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 50%',
            end: 'top 20%',
            scrub: true,
          },
        },
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90',
          end: `+=${(themePresets.length - 2) * 40}%`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self) => {
            const activeIndex = Math.min(
              Math.floor(self.progress * themePresets.length),
              themePresets.length - 1,
            );
            const nextMax = Math.min(themePresets.length - 1, activeIndex + PRELOAD_AHEAD);

            setMaxLoadedIndex((prev) => Math.max(prev, nextMax));
          },
        },
      });

      cardRefs.current.forEach((card, i) => {
        if (i === 0 || !card) return;

        const startTime = (i - 1) * 0.5;

        tl.fromTo(
          card,
          {
            clipPath: 'polygon(0% 110%, 100% 120%, 100% 120%, 0% 110%)',
          },
          {
            clipPath: 'polygon(0% -10%, 100% 5%, 100% 100%, 0% 100%)',
            duration: 1,
            ease: 'none',
          },
          startTime,
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <Container
      ref={containerRef}
      maxWidth={false}
      sx={{ width: 1, maxWidth: 1292, height: { xs: 710, xl: 790 }, px: { xs: 0 }, mb: 14 }}
    >
      <Stack
        direction="column"
        sx={{
          height: 1,
          gap: 4,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Box ref={titleRef} sx={{ textAlign: 'center' }}>
          <GradientText variant="h3" sx={{ mb: 0.5 }}>
            Explore various themes
          </GradientText>
          <Typography variant="body2" color="textSecondary">
            That best suites your design needs
          </Typography>
        </Box>

        <Box ref={cardsRef} sx={{ position: 'relative', width: 1, flex: 1 }}>
          {themePresets.map((preset, i) => (
            <Box
              key={preset}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              sx={{
                width: 1,
                height: 1,
                position: 'absolute',
                bottom: 0,
                left: 0,
                zoom: { xs: 0.6, md: 0.7, xl: 0.75 },
                willChange: 'clip-path',
              }}
            >
              {i <= maxLoadedIndex && <ThemePresetCard themePreset={preset} />}
            </Box>
          ))}
        </Box>
      </Stack>
    </Container>
  );
};

export default ThemePresetsShowcase;

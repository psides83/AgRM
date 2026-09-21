'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';

const maps = [
  {
    title: 'Texas AOR Map',
    src: '/aor-maps/texas-aor-map.png',
    naturalWidth: 1200,
    naturalHeight: 675,
  },
  {
    title: 'Company AOR Map',
    src: '/aor-maps/aor-map.png',
    naturalWidth: 650,
    naturalHeight: 622,
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const distance = (first, second) =>
  Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);

const midpoint = (first, second) => ({
  clientX: (first.clientX + second.clientX) / 2,
  clientY: (first.clientY + second.clientY) / 2,
});

const AorMaps = () => (
  <Stack gap={3}>
    <PageHeader
      title="AOR Maps"
      breadcrumb={[
        { label: 'AgRM', url: '/' },
        { label: 'AOR Maps', active: true },
      ]}
      paperProps={{ sx: { borderRadius: 0 } }}
    />

    <Box sx={{ px: { xs: 2, md: 5 }, pb: 4 }}>
      <Grid container spacing={3}>
        {maps.map((map) => (
          <Grid key={map.src} size={{ xs: 12, xl: 6 }}>
            <MapViewer map={map} />
          </Grid>
        ))}
      </Grid>
    </Box>
  </Stack>
);

const MapViewer = ({ map }) => {
  const frameRef = useRef(null);
  const pointersRef = useRef(new Map());
  const dragRef = useRef(null);
  const pinchRef = useRef(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });

  const fit = useMemo(() => {
    if (!viewport.width || !viewport.height) return { scale: 1, x: 0, y: 0 };

    const padding = viewport.width < 600 ? 24 : 48;
    const scale = Math.min(
      (viewport.width - padding) / map.naturalWidth,
      (viewport.height - padding) / map.naturalHeight,
    );
    const safeScale = Math.max(scale, 0.1);

    return {
      scale: safeScale,
      x: (viewport.width - map.naturalWidth * safeScale) / 2,
      y: (viewport.height - map.naturalHeight * safeScale) / 2,
    };
  }, [map.naturalHeight, map.naturalWidth, viewport.height, viewport.width]);

  const limits = useMemo(
    () => ({
      min: fit.scale,
      max: fit.scale * 6,
    }),
    [fit.scale],
  );

  const resetView = useCallback(() => {
    setView(fit);
  }, [fit]);

  useEffect(() => {
    resetView();
  }, [resetView]);

  useEffect(() => {
    if (!frameRef.current) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewport({ width, height });
    });

    observer.observe(frameRef.current);

    return () => observer.disconnect();
  }, []);

  const zoomAt = useCallback(
    (clientX, clientY, nextScale) => {
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;

      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      setView((current) => {
        const scale = clamp(nextScale, limits.min, limits.max);
        const ratio = scale / current.scale;

        return {
          scale,
          x: localX - (localX - current.x) * ratio,
          y: localY - (localY - current.y) * ratio,
        };
      });
    },
    [limits.max, limits.min],
  );

  const zoomFromCenter = (step) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;

    zoomAt(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      view.scale * step,
    );
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.88 : 1.12;
    zoomAt(event.clientX, event.clientY, view.scale * factor);
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, event);

    if (pointersRef.current.size === 1) {
      dragRef.current = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        x: view.x,
        y: view.y,
      };
      pinchRef.current = null;
      return;
    }

    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      pinchRef.current = {
        distance: distance(first, second),
        midpoint: midpoint(first, second),
        view,
      };
      dragRef.current = null;
    }
  };

  const handlePointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return;

    pointersRef.current.set(event.pointerId, event);

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const [first, second] = [...pointersRef.current.values()];
      const nextMidpoint = midpoint(first, second);
      const nextDistance = distance(first, second);
      const nextScale = clamp(
        pinchRef.current.view.scale * (nextDistance / pinchRef.current.distance),
        limits.min,
        limits.max,
      );
      const rect = frameRef.current?.getBoundingClientRect();

      if (!rect) return;

      const localX = pinchRef.current.midpoint.clientX - rect.left;
      const localY = pinchRef.current.midpoint.clientY - rect.top;
      const nextLocalX = nextMidpoint.clientX - rect.left;
      const nextLocalY = nextMidpoint.clientY - rect.top;
      const ratio = nextScale / pinchRef.current.view.scale;

      setView({
        scale: nextScale,
        x: nextLocalX - (localX - pinchRef.current.view.x) * ratio,
        y: nextLocalY - (localY - pinchRef.current.view.y) * ratio,
      });
      return;
    }

    if (pointersRef.current.size === 1 && dragRef.current) {
      setView((current) => ({
        ...current,
        x: dragRef.current.x + event.clientX - dragRef.current.clientX,
        y: dragRef.current.y + event.clientY - dragRef.current.clientY,
      }));
    }
  };

  const handlePointerUp = (event) => {
    pointersRef.current.delete(event.pointerId);
    dragRef.current = null;
    pinchRef.current = null;

    if (pointersRef.current.size === 1) {
      const [remaining] = [...pointersRef.current.values()];
      dragRef.current = {
        pointerId: remaining.pointerId,
        clientX: remaining.clientX,
        clientY: remaining.clientY,
        x: view.x,
        y: view.y,
      };
    }
  };

  return (
    <Paper
      sx={{
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        gap={1.5}
        sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          {map.title}
        </Typography>

        <ButtonGroup size="small" variant="outlined" aria-label={`${map.title} zoom controls`}>
          <Button onClick={() => zoomFromCenter(0.82)} aria-label="Zoom out">
            <IconifyIcon icon="material-symbols:remove-rounded" fontSize={20} />
          </Button>
          <Button onClick={resetView}>Reset</Button>
          <Button onClick={() => zoomFromCenter(1.22)} aria-label="Zoom in">
            <IconifyIcon icon="material-symbols:add-rounded" fontSize={20} />
          </Button>
        </ButtonGroup>
      </Stack>

      <Box
        ref={frameRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        sx={{
          position: 'relative',
          height: { xs: 420, md: 560 },
          overflow: 'hidden',
          bgcolor: 'background.default',
          cursor: pointersRef.current.size ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <Box
          component="img"
          src={map.src}
          alt={map.title}
          draggable={false}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: map.naturalWidth,
            height: map.naturalHeight,
            maxWidth: 'none',
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        />
      </Box>
    </Paper>
  );
};

export default AorMaps;

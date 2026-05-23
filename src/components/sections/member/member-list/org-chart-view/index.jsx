'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, Paper, Stack, styled } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { OrganizationalChart } from 'components/base/OrganizationalChart';
import OrgCard from './OrgCard';

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

const MembersOrgChartView = ({ data }) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);
  const lastPinchDistanceRef = useRef(null);

  const zoomIn = () => setZoom((prev) => clampZoom(prev + ZOOM_STEP));
  const zoomOut = () => setZoom((prev) => clampZoom(prev - ZOOM_STEP));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event) => {
      if (!event.ctrlKey) return;
      event.preventDefault();

      const sensitivity = 0.004;
      const delta = -event.deltaY * sensitivity;

      setZoom((prev) => clampZoom(prev * (1 + delta)));
    };

    const handleTouchStart = (event) => {
      if (event.touches.length !== 2) return;
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      lastPinchDistanceRef.current = Math.hypot(dx, dy);
    };

    const handleTouchMove = (event) => {
      if (event.touches.length !== 2 || lastPinchDistanceRef.current === null) return;
      event.preventDefault();
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const scale = distance / lastPinchDistanceRef.current;
      setZoom((prev) => clampZoom(prev * scale));
      lastPinchDistanceRef.current = distance;
    };

    const handleTouchEnd = () => {
      lastPinchDistanceRef.current = null;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <TreeWrapper ref={containerRef} background={1} className="org-chart-rtl">
      <ZoomButtons zoom={zoom} zoomIn={zoomIn} zoomOut={zoomOut} />
      <OrganizationalChart
        data={data}
        lineHeight="30px"
        renderNode={(node) => <OrgCard data={node.data} />}
        sx={{
          position: 'relative',
          mt: 4,
          pt: 3,
          pb: 0,
          '&>ul:first-of-type': {
            zoom,
          },
        }}
      />
    </TreeWrapper>
  );
};

const ZoomButtons = ({ zoom, zoomIn, zoomOut, sx, ...rest }) => {
  return (
    <Box
      sx={{
        position: 'sticky',
        alignSelf: 'flex-start',
        top: 8,
        left: 0,
        width: 1,
        zIndex: 2,
        ...sx,
      }}
      {...rest}
    >
      <Stack
        gap={1}
        sx={{
          position: 'absolute',
          left: 0,
        }}
      >
        <Button shape="square" size="small" variant="soft" color="neutral" onClick={zoomIn}>
          <IconifyIcon icon="material-symbols:zoom-in-rounded" sx={{ fontSize: 18 }} />
        </Button>
        <Button
          shape="square"
          size="small"
          variant="soft"
          color="neutral"
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
        >
          <IconifyIcon icon="material-symbols:zoom-out-rounded" sx={{ fontSize: 18 }} />
        </Button>
      </Stack>
    </Box>
  );
};

const TreeWrapper = styled(Paper)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  height: '100%',
  position: 'relative',
  outline: 0,
  borderRadius: Number(theme.shape.borderRadius) * 4,
  padding: theme.spacing(5),
  overflow: 'auto',
  scrollbarColor: 'transparent transparent',
}));

export default MembersOrgChartView;

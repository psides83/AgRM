'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { customDateAdapter } from 'helpers/gantt-utils';
import { SvelteGantt, SvelteGanttDependencies, SvelteGanttTable } from 'svelte-gantt';

const DEFAULT_PROPS = {
  dateAdapter: customDateAdapter,
  fitWidth: true,
  tableWidth: 166,
  rowHeight: 56,
  rowPadding: 8,
  classes: 'gantt-chart',
  columnStrokeColor: 'transparent',
  columnStrokeWidth: 0,
  headers: [
    { unit: 'month', format: 'MMMM', sticky: true },
    { unit: 'day', format: 'DD d' },
  ],
  minWidth: 1700,
  magnetUnit: 'hour',
  ganttTableModules: [SvelteGanttTable],
  ganttBodyModules: [SvelteGanttDependencies],
  useCanvasColumns: true,
  layout: 'overlap',
};

const SvelteGanttChart = ({ chartOptions, onReady, sx }) => {
  const containerRef = useRef(null);
  const ganttRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry?.contentRect.height) return;

      observer.disconnect();

      const initChart = () => {
        if (cancelled) return;
        ganttRef.current = new SvelteGantt({
          target: container,
          props: { ...DEFAULT_PROPS, ...chartOptions },
        });
        if (!cancelled && onReady) requestAnimationFrame(() => onReady());
      };

      const afterPaint = () => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(initChart, { timeout: 400 });
        } else {
          requestAnimationFrame(initChart);
        }
      };
      const afterTwoFrames = () => requestAnimationFrame(() => requestAnimationFrame(afterPaint));
      setTimeout(() => afterTwoFrames(), 0);
    });

    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
      ganttRef.current?.$destroy();
      ganttRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (ganttRef.current) ganttRef.current.$set(chartOptions);
  }, [chartOptions]);

  return <Box ref={containerRef} sx={{ height: 1, ...sx }} />;
};

export default SvelteGanttChart;

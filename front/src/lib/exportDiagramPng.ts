'use client';

import { useCallback } from 'react';
import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import { toPng } from 'html-to-image';

export type ExportPngFn = (filename?: string) => Promise<void>;

/**
 * Хук для экспорта текущего ReactFlow-канваса в PNG.
 * Должен вызываться внутри <ReactFlowProvider>.
 */
export function useExportPng(): ExportPngFn {
  const { getNodes } = useReactFlow();
  return useCallback(
    async (filename = 'er-diagram') => {
      const nodes = getNodes();
      if (nodes.length === 0) return;

      const bounds = getNodesBounds(nodes);
      const padding = 48;
      const imageWidth = Math.max(1, Math.ceil(bounds.width + padding * 2));
      const imageHeight = Math.max(1, Math.ceil(bounds.height + padding * 2));
      const viewport = getViewportForBounds(bounds, imageWidth, imageHeight, 0.5, 2, 0.1);

      const viewportEl = document.querySelector<HTMLElement>('.react-flow__viewport');
      if (!viewportEl) return;

      const bg =
        getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() ||
        '#0a0a14';

      // Принудительно делаем рёбра сплошными в растрированном PNG —
      // html-to-image рисует живой DOM, временно подменяем inline-стили
      // и восстанавливаем после.
      const paths = Array.from(
        document.querySelectorAll<SVGPathElement>('.react-flow__edge-path'),
      );
      const prev = paths.map((p) => p.getAttribute('style'));
      paths.forEach((p) => {
        p.style.stroke = '#06b6d4';
        p.style.strokeWidth = '2';
        p.style.strokeDasharray = 'none';
        p.style.animation = 'none';
        p.style.strokeOpacity = '0.95';
      });

      try {
        const dataUrl = await toPng(viewportEl, {
          backgroundColor: bg,
          width: imageWidth,
          height: imageHeight,
          pixelRatio: 2,
          cacheBust: true,
          skipFonts: true,
          style: {
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          },
        });

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
      } finally {
        paths.forEach((p, i) => {
          const s = prev[i];
          if (s === null) p.removeAttribute('style');
          else p.setAttribute('style', s);
        });
      }
    },
    [getNodes],
  );
}

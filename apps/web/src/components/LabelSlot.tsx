import { useEffect, useRef } from 'react';

const SAMPLE_INCI = ['Aqua', 'Glycerin', 'Isopropyl Myristate', 'Cetearyl Alcohol', 'Niacinamide', 'Dimethicone', 'Parfum', 'Phenoxyethanol'];
const MARKED = new Set(['Isopropyl Myristate', 'Parfum']);

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** A sample ingredient list scrolling inside the hero sentence; drawn on canvas so it reads as a picture, not words. */
export function LabelSlot() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    const draw = (now: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
      if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.clearRect(0, 0, w, h);
      const size = Math.max(13, h * 0.3);
      ctx.font = `400 ${size}px Commissioner, system-ui, sans-serif`;
      ctx.textBaseline = 'middle';
      const gap = size * 0.6;
      const items = SAMPLE_INCI.map((t) => ({ t: MARKED.has(t) ? t : `${t},`, marked: MARKED.has(t) }));
      const widths = items.map((i) => ctx.measureText(i.t).width);
      const cycle = widths.reduce((a, b) => a + b + gap, 0);
      const offset = still ? 0 : ((now / 1000) * size * 1.6) % cycle;
      const ink = cssVar('--sk-sand-925') || '#1E1C18';
      const mark = cssVar('--sk-ochre-200') || '#EDD6A6';
      let x = size * 0.5 - offset;
      for (let pass = 0; x < w; pass++) {
        items.forEach((item, i) => {
          const iw = widths[i]!;
          if (x + iw > -20 && x < w + 20) {
            if (item.marked) {
              ctx.fillStyle = mark;
              ctx.fillRect(x - size * 0.25, h / 2 - size * 0.75, iw + size * 0.5, size * 1.5);
            }
            ctx.fillStyle = ink;
            ctx.font = `${item.marked ? 600 : 400} ${size}px Commissioner, system-ui, sans-serif`;
            ctx.fillText(item.t, x, h / 2);
          }
          x += iw + gap;
        });
        if (pass > 4) break;
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    document.fonts?.ready.then(start);
    start();
    window.addEventListener('resize', start);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', start);
    };
  }, []);

  return <canvas ref={ref} className="slot" aria-hidden="true" />;
}

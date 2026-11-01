import { useEffect, useState, type RefObject } from 'react';

/** Adds `is-in` to every [data-reveal] block once it enters the viewport and numbers its children for the stagger. */
export function useReveal(root: RefObject<HTMLElement | null>, deps: readonly unknown[] = []) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const blocks = [...el.querySelectorAll<HTMLElement>('[data-reveal]')];
    blocks.forEach((b) => [...b.children].forEach((c, i) => (c as HTMLElement).style.setProperty('--i', String(i))));
    if (typeof IntersectionObserver === 'undefined') {
      blocks.forEach((b) => b.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** The tone of the [data-tone] chapter currently under the header line. */
export function useChapterTone(headerHeight = 72, key?: string) {
  const [tone, setTone] = useState('paper');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = 'paper';
      for (const el of document.querySelectorAll<HTMLElement>('[data-tone]')) {
        const r = el.getBoundingClientRect();
        if (r.top <= headerHeight - 1 && r.bottom > headerHeight - 1) current = el.dataset.tone ?? 'paper';
      }
      setTone(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [headerHeight, key]);
  return tone;
}

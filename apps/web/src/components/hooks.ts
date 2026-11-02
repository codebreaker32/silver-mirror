import { useEffect, type RefObject } from 'react';

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


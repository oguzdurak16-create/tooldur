import { useEffect } from 'react';

// The visual viewport shrinks for an on-screen keyboard even when 100vh does not.
export function useViewportMetrics() {
  useEffect(() => {
    const viewport = window.visualViewport;
    const root = document.documentElement;
    let frame = 0;
    const measure = () => {
      root.style.setProperty('--visual-viewport-height', `${Math.round(viewport?.height || window.innerHeight)}px`);
      root.style.setProperty('--visual-viewport-top', `${Math.round(viewport?.offsetTop || 0)}px`);
    };
    const schedule = () => { window.cancelAnimationFrame(frame); frame = window.requestAnimationFrame(measure); };
    measure();
    viewport?.addEventListener('resize', schedule);
    viewport?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', schedule);
      viewport?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
}

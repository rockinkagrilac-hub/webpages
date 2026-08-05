'use client';

import { useEffect } from 'react';

/**
 * Anima elementos con [data-scrollfx] segun su posicion en el viewport,
 * al estilo de las paginas de producto de Apple.
 *
 * Setea la variable CSS --p (0 -> 1) en cada elemento; el CSS decide que hacer
 * con ella (escala, opacidad, recorte, parallax...).
 *
 * Dos modos:
 *   data-scrollfx        -> "entrada": 0 cuando el elemento asoma por abajo,
 *                           1 cuando ya recorrio el tramo visible.
 *   data-scrollfx="pin"  -> "recorrido": 0 cuando el bloque alto empieza a fijarse,
 *                           1 cuando termina de pasar. Para secciones sticky.
 *
 * Donde el navegador soporta scroll timelines nativos (animation-timeline), el CSS
 * sobrescribe estos valores con animaciones que corren fuera del hilo principal.
 * Este hook queda como respaldo universal (Safari y Firefox aun no lo soportan).
 */
export function useScrollFx() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-scrollfx]'));
    if (elements.length === 0) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      elements.forEach((el) => el.style.setProperty('--p', '1'));
      return;
    }

    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        let p: number;

        if (el.dataset.scrollfx === 'pin') {
          // Progreso a lo largo de todo el recorrido del bloque alto.
          const total = rect.height - vh;
          p = total > 0 ? -rect.top / total : 0;
        } else {
          // Progreso de entrada: termina antes del centro para que el efecto
          // se complete mientras el elemento sigue subiendo.
          const travelled = vh - rect.top;
          const total = Math.min(vh * 0.55 + rect.height * 0.25, vh);
          p = travelled / total;
        }

        el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
      });
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);
}

/** Observa [data-reveal] y anade .is-visible una sola vez (sin parpadeo). */
export function useRevealOnScroll() {
  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

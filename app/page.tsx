'use client';

import Link from "next/link"
import { useState, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Brand, DEFAULT_BRANDS, HeroSlide, DEFAULT_HERO_SLIDES } from '@/lib/data';
import { normalizeBrandName } from '@/lib/product-brand';
import { CartProvider } from '@/lib/cart-context';
import { ArrowRight, Truck, ShieldCheck, Sparkles, MessagesSquare } from 'lucide-react';

type IntroStage = 'logo' | 'cow' | 'reveal';

type Point = { x: number; y: number };

const TOTAL_INTRO_DURATION = 6000;
const LOGO_STAGE_END = 2000;
const COW_STAGE_END = 4200;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => t * t * (3 - 2 * t);

const sampleLine = (from: Point, to: Point, count: number): Point[] => {
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(1, count - 1);
    points.push({
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, t),
    });
  }
  return points;
};

const sampleCircle = (center: Point, radius: number, count: number): Point[] => {
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }
  return points;
};

const createRingPoints = (count: number, radius = 0.22): Point[] => {
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const a = (Math.PI * 2 * i) / count;
    points.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius });
  }
  return points;
};

const createEyePoints = (): Point[] => {
  const points: Point[] = [];
  // Contorno del ojo
  points.push(...sampleLine({ x: -0.32, y: 0 }, { x: -0.16, y: -0.12 }, 30));
  points.push(...sampleLine({ x: -0.16, y: -0.12 }, { x: 0.16, y: -0.12 }, 34));
  points.push(...sampleLine({ x: 0.16, y: -0.12 }, { x: 0.32, y: 0 }, 30));
  points.push(...sampleLine({ x: 0.32, y: 0 }, { x: 0.16, y: 0.12 }, 30));
  points.push(...sampleLine({ x: 0.16, y: 0.12 }, { x: -0.16, y: 0.12 }, 34));
  points.push(...sampleLine({ x: -0.16, y: 0.12 }, { x: -0.32, y: 0 }, 30));
  // Pupila
  points.push(...sampleCircle({ x: 0, y: 0 }, 0.08, 32));
  points.push(...sampleCircle({ x: 0, y: 0 }, 0.045, 18));
  return points;
};

const INTRO_POINT_COUNT = 220;
const LOGO_POINTS: Point[] = createEyePoints();
const BULL_NODES = [
  { x: 0.18, y: 0.45 },
  { x: 0.26, y: 0.34 },
  { x: 0.34, y: 0.3 },
  { x: 0.45, y: 0.28 },
  { x: 0.56, y: 0.3 },
  { x: 0.68, y: 0.32 },
  { x: 0.78, y: 0.34 },
  { x: 0.85, y: 0.42 },
  { x: 0.75, y: 0.52 },
  { x: 0.64, y: 0.57 },
  { x: 0.52, y: 0.58 },
  { x: 0.4, y: 0.58 },
  { x: 0.3, y: 0.56 },
  { x: 0.2, y: 0.53 },
];

function HomeContent() {
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [stats, setStats] = useState({ products: 0, clients: 0, service: 0 });
  const [isClientReady, setIsClientReady] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [introExiting, setIntroExiting] = useState(false);
  const [introStage, setIntroStage] = useState<IntroStage>('logo');
  const [activeControl, setActiveControl] = useState<'productos' | 'clientes' | 'soporte' | null>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [kineticBoost, setKineticBoost] = useState(0);
  const heroParallaxRef = useRef<HTMLElement | null>(null);
  const particlesRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const homeRootRef = useRef<HTMLDivElement | null>(null);
  const brandsSectionRef = useRef<HTMLElement | null>(null);
  const introOverlayRef = useRef<HTMLDivElement | null>(null);
  const introCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const introBullImageRef = useRef<HTMLImageElement | null>(null);
  const introBullPreparedRef = useRef<HTMLCanvasElement | null>(null);
  const introBullLoadedRef = useRef(false);
  const introExitScheduledRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scrollTrackerRef = useRef({ y: 0, t: 0 });
  const scrollRafRef = useRef<number>(0);
  const pendingScrollYRef = useRef(0);
  const [brandsCascadeActive, setBrandsCascadeActive] = useState(false);

  const loadHomepageData = async () => {
    try {
      const configRes = await fetch('/api/site-config', { cache: 'no-store' });

      if (configRes.ok) {
        const config = (await configRes.json()) as {
          brands?: Brand[];
          heroSlides?: HeroSlide[];
        };
        setBrands(Array.isArray(config.brands) && config.brands.length > 0 ? config.brands : DEFAULT_BRANDS);
        setHeroSlides(
          Array.isArray(config.heroSlides) && config.heroSlides.length > 0
            ? config.heroSlides
            : DEFAULT_HERO_SLIDES
        );
      } else {
        setBrands(DEFAULT_BRANDS);
        setHeroSlides(DEFAULT_HERO_SLIDES);
      }
    } catch (e) {
      setBrands(DEFAULT_BRANDS);
      setHeroSlides(DEFAULT_HERO_SLIDES);
    }
  };

  useEffect(() => {
    void loadHomepageData();

    // Sincronizar cambios hechos en otras pestaÃ±as/ventanas y al volver a foco
    const handleStorage = () => void loadHomepageData();
    const handleFocus = () => void loadHomepageData();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (currentHeroIndex >= heroSlides.length) {
      setCurrentHeroIndex(0);
    }
  }, [currentHeroIndex, heroSlides.length]);

  useEffect(() => {
    const applyScrollState = () => {
      scrollRafRef.current = 0;
      const now = performance.now();
      const y = pendingScrollYRef.current;
      const dy = y - scrollTrackerRef.current.y;
      const dt = Math.max(16, now - scrollTrackerRef.current.t);
      const velocity = Math.min(1, Math.abs(dy / dt) * 2.2);
      setKineticBoost((prev) => (Math.abs(prev - velocity) > 0.02 ? velocity : prev));
      scrollTrackerRef.current = { y, t: now };

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, max > 0 ? y / max : 0));
      setScrollProgress((prev) => (Math.abs(prev - progress) > 0.0015 ? progress : prev));
    };

    const onScroll = () => {
      pendingScrollYRef.current = window.scrollY;
      if (scrollRafRef.current) return;
      scrollRafRef.current = window.requestAnimationFrame(applyScrollState);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const overlay = introOverlayRef.current;
    const canvas = introCanvasRef.current;
    if (!overlay || !canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setIntroVisible(false);
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      setIntroVisible(false);
      return;
    }

    const bullImage = new Image();
    bullImage.src = '/toro-intro.png';
    bullImage.onload = () => {
      introBullImageRef.current = bullImage;
      introBullLoadedRef.current = true;
      // Prepara una version sin fondo oscuro para la escena cinematica.
      const prepCanvas = document.createElement('canvas');
      prepCanvas.width = bullImage.naturalWidth;
      prepCanvas.height = bullImage.naturalHeight;
      const prepCtx = prepCanvas.getContext('2d');
      if (prepCtx) {
        prepCtx.drawImage(bullImage, 0, 0);
        const imageData = prepCtx.getImageData(0, 0, prepCanvas.width, prepCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          if (luma < 36) {
            data[i + 3] = 0;
            continue;
          }
          const boost = Math.min(255, Math.round(210 + luma * 0.22));
          data[i] = boost;
          data[i + 1] = boost;
          data[i + 2] = boost;
          data[i + 3] = a;
        }
        prepCtx.putImageData(imageData, 0, 0);
        introBullPreparedRef.current = prepCanvas;
      } else {
        introBullPreparedRef.current = null;
      }
    };
    bullImage.onerror = () => {
      introBullImageRef.current = null;
      introBullPreparedRef.current = null;
      introBullLoadedRef.current = false;
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = overlay.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${Math.floor(rect.width)}px`;
      canvas.style.height = `${Math.floor(rect.height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const start = performance.now();
    let raf = 0;
    let lastStage: IntroStage = 'logo';

    const draw = (now: number) => {
      const elapsed = now - start;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.8;

      let stage: IntroStage = 'logo';
      if (elapsed >= LOGO_STAGE_END && elapsed < COW_STAGE_END) stage = 'cow';
      if (elapsed >= COW_STAGE_END) stage = 'reveal';

      if (stage !== lastStage) {
        setIntroStage(stage);
        lastStage = stage;
      }

      const stageProgress =
        stage === 'logo'
          ? Math.max(0, Math.min(1, elapsed / LOGO_STAGE_END))
          : stage === 'cow'
          ? Math.max(0, Math.min(1, (elapsed - LOGO_STAGE_END) / (COW_STAGE_END - LOGO_STAGE_END)))
          : Math.max(0, Math.min(1, (elapsed - COW_STAGE_END) / (TOTAL_INTRO_DURATION - COW_STAGE_END)));

      overlay.style.setProperty('--intro-t', (elapsed / TOTAL_INTRO_DURATION).toFixed(4));
      overlay.style.setProperty('--intro-reveal', stage === 'reveal' ? stageProgress.toFixed(4) : '0');

      ctx.clearRect(0, 0, width, height);

      const fog = ctx.createRadialGradient(cx, cy, scale * 0.08, cx, cy, scale * 0.6);
      fog.addColorStop(0, 'rgba(16,185,129,0.18)');
      fog.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, width, height);

      const drift = stage === 'logo' ? 0 : stage === 'cow' ? easeInOut(stageProgress) : 1;
      const burst = stage === 'reveal' ? easeInOut(stageProgress) : 0;
       // Parpadeo suave del ojo en la fase inicial.
      const blinkPhase = stage === 'logo' ? Math.sin((elapsed / LOGO_STAGE_END) * Math.PI) : 0;
      const blinkScale = stage === 'logo' ? 0.55 + 0.45 * Math.abs(Math.cos(blinkPhase * 0.7)) : 1;
      const bullVisibility =
        stage === 'logo'
          ? 0
          : stage === 'cow'
          ? 0.2 + easeInOut(stageProgress) * 0.8
          : Math.max(0, 1 - burst * 0.92);
      const scanProgress =
        stage === 'cow'
          ? stageProgress
          : stage === 'reveal'
          ? 1
          : 0;

      if (introBullLoadedRef.current && introBullImageRef.current && bullVisibility > 0.02) {
        const image = introBullPreparedRef.current ?? introBullImageRef.current;
        const imageW = image instanceof HTMLCanvasElement ? image.width : image.naturalWidth;
        const imageH = image instanceof HTMLCanvasElement ? image.height : image.naturalHeight;
        const baseW = Math.min(width * 0.64, 620);
        const ratio = imageH > 0 ? imageW / imageH : 1.6;
        const drawW = baseW;
        const drawH = drawW / Math.max(0.5, ratio);
        const drawX = cx - drawW / 2;
        const verticalLift = stage === 'cow' ? (1 - stageProgress) * 24 : 0;
        const drawY = cy - drawH / 2 - verticalLift;

        ctx.save();
        ctx.globalAlpha = Math.min(1, bullVisibility);
        ctx.filter = `drop-shadow(0 0 14px rgba(134,239,172,0.78)) drop-shadow(0 0 30px rgba(34,197,94,0.58))`;
        ctx.drawImage(image, drawX, drawY, drawW, drawH);

        if (scanProgress > 0.02) {
          const scanY = drawY + drawH * ((scanProgress * 1.2) % 1);
          const scanGrad = ctx.createLinearGradient(drawX, scanY - 14, drawX, scanY + 14);
          scanGrad.addColorStop(0, 'rgba(52,211,153,0)');
          scanGrad.addColorStop(0.5, `rgba(74,222,128,${(0.38 * bullVisibility).toFixed(3)})`);
          scanGrad.addColorStop(1, 'rgba(52,211,153,0)');
          ctx.fillStyle = scanGrad;
          ctx.fillRect(drawX, scanY - 16, drawW, 32);
        }

        const nodeCount = BULL_NODES.length;
        const pulse = 0.5 + Math.sin(elapsed * 0.012) * 0.5;
        ctx.strokeStyle = `rgba(74,222,128,${(0.26 + pulse * 0.18).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        for (let n = 0; n < nodeCount; n += 1) {
          const p = BULL_NODES[n];
          const nx = drawX + drawW * p.x;
          const ny = drawY + drawH * p.y;
          const tx = nx + (n % 2 === 0 ? 26 : -26);
          const ty = ny + (n % 3 === 0 ? -18 : 14);
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.fillStyle = `rgba(167,243,208,${(0.42 + pulse * 0.45).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(nx, ny, 2.1 + (n % 3) * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      for (let i = 0; i < INTRO_POINT_COUNT; i += 1) {
        const lp = LOGO_POINTS[i % LOGO_POINTS.length];
        let px = lp.x;
        let py = lp.y * blinkScale;

        if (drift > 0) {
          const a = (Math.PI * 2 * i) / INTRO_POINT_COUNT + drift * 5;
          px += Math.cos(a) * drift * 0.14;
          py += Math.sin(a * 1.1) * drift * 0.1;
        }

        if (burst > 0) {
          const a = (Math.PI * 2 * i) / INTRO_POINT_COUNT;
          px += Math.cos(a) * burst * 0.2;
          py += Math.sin(a) * burst * 0.16;
        }

        const size = 1.6 + (i % 4) * 0.45 + burst * 1.2;
        const baseAlpha = Math.max(0, 0.82 - burst * 0.74);
        const alpha = introBullLoadedRef.current && stage !== 'logo' ? baseAlpha * 0.68 : baseAlpha;
        ctx.fillStyle = `rgba(74, 222, 128, ${alpha.toFixed(3)})`;
        ctx.shadowBlur = 8 + (i % 3) * 4;
        ctx.shadowColor = 'rgba(34,197,94,0.65)';
        ctx.beginPath();
        ctx.arc(cx + px * scale, cy + py * scale * 0.82, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mini HUD de progreso para reforzar la narrativa tecnica.
      const hudW = Math.min(260, width * 0.42);
      const hudX = cx - hudW / 2;
      const hudY = Math.max(24, height * 0.82);
      const totalProgress = Math.max(0, Math.min(1, elapsed / TOTAL_INTRO_DURATION));
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = 'rgba(2,6,23,0.62)';
      ctx.fillRect(hudX, hudY, hudW, 6);
      ctx.fillStyle = 'rgba(74,222,128,0.92)';
      ctx.fillRect(hudX, hudY, hudW * totalProgress, 6);
      ctx.restore();

      if (elapsed < TOTAL_INTRO_DURATION) {
        raf = window.requestAnimationFrame(draw);
      } else {
        if (!introExitScheduledRef.current) {
          introExitScheduledRef.current = true;
          setIntroExiting(true);
          window.setTimeout(() => {
            setIntroVisible(false);
          }, 2000);
        }
      }
    };

    setIntroExiting(false);
    introExitScheduledRef.current = false;
    setIntroStage('logo');
    raf = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (kineticBoost <= 0.03) return;
    const timeout = window.setTimeout(() => {
      setKineticBoost((prev) => {
        const next = Math.max(0, prev * 0.78);
        return Math.abs(next - prev) < 0.015 ? 0 : next;
      });
    }, 160);
    return () => window.clearTimeout(timeout);
  }, [kineticBoost]);

  useEffect(() => {
    const root = homeRootRef.current;
    if (!root) return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;

    const onMove = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      root.style.setProperty('--spot-x', `${x.toFixed(2)}%`);
      root.style.setProperty('--spot-y', `${y.toFixed(2)}%`);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const playTechSound = (type: 'click' | 'section') => {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(240, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    }
  };

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            playTechSound('section');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = brandsSectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setBrandsCascadeActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-section-id]'));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId) setActiveSection(sectionId);
          }
        });
      },
      { threshold: 0.45, rootMargin: '-15% 0px -20% 0px' }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = statsRef.current;
    if (!section) return;

    let hasRun = false;
    const animateValue = (key: 'products' | 'clients' | 'service', target: number, duration: number) => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setStats((prev) => ({ ...prev, [key]: Math.floor(target * eased) }));
        if (t < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (hasRun) return;
        if (entries.some((entry) => entry.isIntersecting)) {
          hasRun = true;
          animateValue('products', 1000, 1500);
          animateValue('clients', 5000, 1500);
          animateValue('service', 24, 1500);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = heroParallaxRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduceMotion || !finePointer) return;

    const layers = Array.from(section.querySelectorAll<HTMLElement>('[data-parallax-depth]')).map((el) => ({
      el,
      depth: Number(el.dataset.parallaxDepth ?? 0),
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
    }));

    if (layers.length === 0) return;

    let raf = 0;
    let active = false;

    const startAnimation = () => {
      if (active) return;
      active = true;
      raf = window.requestAnimationFrame(animate);
    };

    const animate = () => {
      let keepRunning = false;

      layers.forEach((layer) => {
        layer.x += (layer.tx - layer.x) * 0.1;
        layer.y += (layer.ty - layer.y) * 0.1;

        if (Math.abs(layer.tx - layer.x) > 0.04 || Math.abs(layer.ty - layer.y) > 0.04) {
          keepRunning = true;
        }

        layer.el.style.transform = `translate3d(${layer.x.toFixed(2)}px, ${layer.y.toFixed(2)}px, 0)`;
      });

      if (keepRunning) {
        raf = window.requestAnimationFrame(animate);
      } else {
        active = false;
      }
    };

    const updateTarget = (clientX: number, clientY: number) => {
      const rect = section.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width - 0.5;
      const ny = (clientY - rect.top) / rect.height - 0.5;

      layers.forEach((layer) => {
        layer.tx = nx * layer.depth;
        layer.ty = ny * layer.depth;
      });

      startAnimation();
    };

    const onMove = (event: MouseEvent) => updateTarget(event.clientX, event.clientY);
    const onLeave = () => {
      layers.forEach((layer) => {
        layer.tx = 0;
        layer.ty = 0;
      });
      startAnimation();
    };

    section.addEventListener('mousemove', onMove, { passive: true });
    section.addEventListener('mouseleave', onLeave);

    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      window.cancelAnimationFrame(raf);
      layers.forEach((layer) => {
        layer.el.style.transform = 'translate3d(0, 0, 0)';
      });
    };
  }, []);

  useEffect(() => {
    const section = heroParallaxRef.current;
    const particlesLayer = particlesRef.current;
    if (!section || !particlesLayer) return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;

    const animate = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      particlesLayer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = window.requestAnimationFrame(animate);
    };

    const onMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      tx = nx * 16;
      ty = ny * 16;
    };

    raf = window.requestAnimationFrame(animate);
    section.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      section.removeEventListener('mousemove', onMove);
      window.cancelAnimationFrame(raf);
      particlesLayer.style.transform = 'translate3d(0, 0, 0)';
    };
  }, []);

  const currentHeroSlide = heroSlides[currentHeroIndex] || DEFAULT_HERO_SLIDES[0];
  const homeBenefits = [
    {
      title: 'Asesoria personalizada',
      description: 'Te ayudamos a elegir productos correctos para tu necesidad real.',
      icon: MessagesSquare,
    },
    {
      title: 'Calidad validada',
      description: 'Trabajamos con marcas y lineas probadas en operaciones ganaderas.',
      icon: ShieldCheck,
    },
    {
      title: 'Atencion agil',
      description: 'Canal rapido por WhatsApp para consultas y seguimiento.',
      icon: Truck,
    },
  ];
  const steps = [
    { title: 'Explora el catalogo', description: 'Filtra por categoria, marca o texto en segundos.' },
    { title: 'Compara y revisa', description: 'Mira fotos, video y especificaciones del producto.' },
    { title: 'Contacta y cierra', description: 'Coordina por WhatsApp con atencion directa.' },
  ];
  const socialCards = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/rockinkperu',
      logo: 'https://cdn.simpleicons.org/facebook/1877F2',
      glow: 'rgba(24, 119, 242, 0.45)',
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/rockink_imm/',
      logo: 'https://cdn.simpleicons.org/instagram/E4405F',
      glow: 'rgba(228, 64, 95, 0.45)',
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@rockinkimm',
      logo: 'https://cdn.simpleicons.org/tiktok/111111',
      glow: 'rgba(17, 17, 17, 0.45)',
    },
  ];
  const pollenParticles = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => {
        const rx = (Math.sin(i * 12.73) + 1) / 2;
        const ry = (Math.cos(i * 8.93) + 1) / 2;
        const rs = (Math.sin(i * 3.11) + 1) / 2;
        const rd = (Math.cos(i * 5.37) + 1) / 2;
        return {
          id: `p-${i}`,
          left: `${8 + rx * 84}%`,
          top: `${6 + ry * 86}%`,
          size: 5 + rs * 11,
          delay: `${(i % 6) * 0.45}s`,
          duration: `${6 + rd * 6}s`,
        };
      }),
    []
  );

  const handleBrandCardMove = (event: React.MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const nx = x / rect.width - 0.5;
    const ny = y / rect.height - 0.5;

    const rotateX = ny * -24;
    const rotateY = nx * 24;
    const shiftX = nx * 22;
    const shiftY = ny * 22;
    const angle = Math.atan2(ny, nx) * (180 / Math.PI);

    el.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
    el.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
    el.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
    el.style.setProperty('--inner-shift-x', `${shiftX.toFixed(2)}px`);
    el.style.setProperty('--inner-shift-y', `${shiftY.toFixed(2)}px`);
    el.style.setProperty('--border-rotate', `${(angle + 180).toFixed(2)}deg`);

  };

  const handleBrandCardLeave = (event: React.MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
    el.style.setProperty('--glow-x', '50%');
    el.style.setProperty('--glow-y', '50%');
    el.style.setProperty('--inner-shift-x', '0px');
    el.style.setProperty('--inner-shift-y', '0px');
    el.style.setProperty('--border-rotate', '0deg');
  };

  const dashOffset = 760 - 760 * scrollProgress;
  const sectionNavItems = [
    { id: 'hero', label: 'Inicio' },
    { id: 'brands', label: 'Marcas' },
    { id: 'benefits', label: 'Beneficios' },
    { id: 'flow', label: 'Proceso' },
    { id: 'social', label: 'Redes' },
    { id: 'cta', label: 'Contacto' },
  ];
  const interactionStyle = {
    '--kinetic-boost': kineticBoost,
  } as CSSProperties;

  return (
    <div ref={homeRootRef} className="min-h-screen bg-background kinetic-stage" style={interactionStyle}>
      {introVisible && (
        <div
          ref={introOverlayRef}
          className={`cinematic-intro fixed inset-0 z-[90] ${introStage === 'reveal' ? 'is-reveal' : ''} ${introExiting ? 'is-exiting' : ''}`}
          aria-hidden="true"
        >
          <div className="cinematic-grid" />
          <div className="cinematic-flare cinematic-flare-left" />
          <div className="cinematic-flare cinematic-flare-right" />
          <canvas ref={introCanvasRef} className="cinematic-particles" />
          <div className={`cinematic-logo ${introStage !== 'logo' ? 'is-hidden' : ''}`}>
            <svg viewBox="0 0 760 180" role="presentation" className="cinematic-logo-svg">
              <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" className="cinematic-logo-stroke">
                ROCKINK-IMM
              </text>
            </svg>
            <div className="cinematic-logo-glow" />
          </div>
          <div className="cinematic-caption">
            {introStage === 'logo' && <p>Origen Tecnologico</p>}
            {introStage === 'cow' && <p>Transformacion Organica</p>}
            {introStage === 'reveal' && <p>Revelacion Fluida</p>}
          </div>
          <div className="cinematic-liquid" />
        </div>
      )}

      <div className="organic-scroll-line pointer-events-none fixed left-2 sm:left-4 top-24 bottom-8 z-30 hidden md:block">
        <svg viewBox="0 0 56 820" preserveAspectRatio="none" className="h-full w-12">
          <path d="M28 4 C 20 80, 36 140, 28 210 C 18 300, 38 360, 28 440 C 18 530, 40 620, 28 720 C 22 770, 30 795, 28 816" stroke="rgba(22, 163, 74, 0.25)" strokeWidth="3" fill="none" />
          <path
            d="M28 4 C 20 80, 36 140, 28 210 C 18 300, 38 360, 28 440 C 18 530, 40 620, 28 720 C 22 770, 30 795, 28 816"
            stroke="rgba(22, 163, 74, 1)"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="760"
            strokeDashoffset={dashOffset}
            className="transition-all duration-300"
          />
        </svg>
      </div>

      <div className="section-command-center fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex">
        <div className="section-command-shell">
          <p className="section-command-label">Control de Flujo</p>
          {sectionNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const target = document.querySelector<HTMLElement>(`[data-section-id="${item.id}"]`);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  playTechSound('click');
                }
              }}
              className={`section-command-item ${activeSection === item.id ? 'is-active' : ''}`}
            >
              <span className="section-command-dot" />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="section-command-meter">
            <div className="section-command-meter-bar" style={{ transform: `scaleX(${scrollProgress.toFixed(3)})` }} />
          </div>
        </div>
      </div>

      <Header />

      {/* Hero Section */}
      <section
        data-section-id="hero"
        ref={heroParallaxRef}
        className="parallax-root relative isolate min-h-screen flex items-center justify-center overflow-hidden pt-20 px-4 sm:px-6 md:px-8"
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div ref={particlesRef} className="absolute inset-0">
            {isClientReady &&
              pollenParticles.map((particle) => (
                <span
                  key={particle.id}
                  className="pollen-particle"
                  style={{
                    left: particle.left,
                    top: particle.top,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    animationDelay: particle.delay,
                    animationDuration: particle.duration,
                  }}
                />
              ))}
          </div>
          <div data-parallax-depth="-12" className="parallax-layer absolute -top-24 -left-16 w-80 h-80 rounded-full bg-primary/30 blur-3xl" />
          <div data-parallax-depth="18" className="parallax-layer absolute -bottom-28 -right-16 w-96 h-96 rounded-full bg-secondary/30 blur-3xl" />
          <div data-parallax-depth="10" className="parallax-layer absolute top-1/4 -right-10 w-60 h-60 rounded-full bg-accent/20 blur-3xl" />
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              data-parallax-depth="-8"
              className={`parallax-layer absolute inset-0 transition-opacity duration-1000 ${
                idx === currentHeroIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                data-parallax-depth="-22"
                className="parallax-layer hero-depth-layer hero-depth-bg absolute inset-0 bg-cover bg-no-repeat bg-center"
                style={{ backgroundImage: `url(${slide.url})` }}
              />
              <div
                data-parallax-depth="-10"
                className="parallax-layer hero-depth-layer hero-depth-mid absolute inset-0 bg-cover bg-no-repeat bg-center"
                style={{ backgroundImage: `url(${slide.url})` }}
              />
              <div
                data-parallax-depth="8"
                className="parallax-layer hero-depth-layer hero-depth-front absolute inset-0 bg-cover bg-no-repeat bg-center"
                style={{ backgroundImage: `url(${slide.url})` }}
              />
            </div>
          ))}
          <div data-parallax-depth="-6" className="parallax-layer absolute inset-0 bg-gradient-to-r from-black/28 via-black/12 to-black/28" />
        </div>

        <div
          data-parallax-depth="12"
          className="parallax-layer max-w-6xl mx-auto relative z-10 text-center px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-14 hero-stagger"
        >
          <div className="mb-6 sm:mb-8 inline-block hero-stagger-item" style={{ animationDelay: '120ms' }}>
            <div className="px-4 py-2 sm:px-6 sm:py-3 bg-white/10 border border-white/20 rounded-full">
              <span className="text-white font-semibold text-sm">{currentHeroSlide.badge}</span>
            </div>
          </div>

          <h1 className="hero-text hero-stagger-item slide-from-left text-white mb-6 sm:mb-8 max-w-5xl mx-auto [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]" style={{ animationDelay: '220ms' }} role="heading" aria-level={1}>
            {currentHeroSlide.title}
          </h1>

          <p className="hero-subtext hero-stagger-item scroll-anim slide-from-right text-white/90 max-w-4xl mx-auto mb-8 sm:mb-12 font-light [text-shadow:0_2px_16px_rgba(0,0,0,0.35)]" style={{ animationDelay: '320ms' }}>
            {currentHeroSlide.description}
          </p>

          <div className="hero-stagger-item flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-16" style={{ animationDelay: '420ms' }}>
            <Link href="/store" className="w-full sm:w-auto">
              <Button className="premium-button w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg">
                Ver Tienda
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/store" className="w-full sm:w-auto">
              <Button variant="outline" className="premium-button w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white/10 text-base sm:text-lg bg-transparent">
                Ver Tienda Completa
              </Button>
            </Link>
          </div>

          <div ref={statsRef} className="hero-stagger-item mt-10 sm:mt-20 pt-10 sm:pt-20 border-t border-white/20" style={{ animationDelay: '520ms' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  setActiveControl((prev) => (prev === 'productos' ? null : 'productos'));
                  playTechSound('click');
                }}
                className={`bento-control-card text-left ${activeControl === 'productos' ? 'is-active' : ''}`}
              >
                <div className="bento-glitch text-3xl sm:text-4xl font-bold text-primary mb-2">{stats.products}+</div>
                <p className="text-white/90 font-medium">Productos Tecnicos</p>
                {activeControl === 'productos' && <p className="mt-2 text-xs text-white/80">Catalogo modular de equipos, repuestos y consumibles especializados.</p>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveControl((prev) => (prev === 'clientes' ? null : 'clientes'));
                  playTechSound('click');
                }}
                className={`bento-control-card text-left ${activeControl === 'clientes' ? 'is-active' : ''}`}
              >
                <div className="bento-glitch text-3xl sm:text-4xl font-bold text-primary mb-2">{stats.clients}+</div>
                <p className="text-white/90 font-medium">Clientes Activos</p>
                {activeControl === 'clientes' && <p className="mt-2 text-xs text-white/80">Productores y empresas que operan con flujo de compra asistido.</p>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveControl((prev) => (prev === 'soporte' ? null : 'soporte'));
                  playTechSound('click');
                }}
                className={`bento-control-card text-left ${activeControl === 'soporte' ? 'is-active' : ''}`}
              >
                <div className="bento-glitch text-3xl sm:text-4xl font-bold text-primary mb-2">{stats.service}/7</div>
                <p className="text-white/90 font-medium">Soporte Operativo</p>
                {activeControl === 'soporte' && <p className="mt-2 text-xs text-white/80">Canal de respuesta rapida para cotizacion y continuidad operativa.</p>}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentHeroIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentHeroIndex ? 'bg-primary w-8' : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
              aria-label={`Ir al slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Brands Section */}
      <section data-section-id="brands" ref={brandsSectionRef} data-reveal className="reveal-block py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 sm:mb-6">Marcas que Trabajan con Nosotros</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Alianzas estrategicas con las mejores marcas del sector ganadero</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {brands.map((brand, idx) => (
              <Link
                key={brand.id}
                href={`/store?brand=${encodeURIComponent(normalizeBrandName(brand.name))}`}
                className={`interactive-tilt tilt-card brand-cascade-card brand-macro-card bg-white rounded-lg p-8 flex items-center justify-center hover:shadow-xl transition-all duration-300 border border-border/20 hover:border-primary/50 ${
                  brandsCascadeActive ? 'brand-cascade-active' : ''
                } ${
                  normalizeBrandName(brand.name).toLowerCase().includes('lister')
                    ? 'brand-variant-lister'
                    : normalizeBrandName(brand.name).toLowerCase().includes('crv')
                    ? 'brand-variant-crv'
                    : normalizeBrandName(brand.name).toLowerCase().includes('melasty')
                    ? 'brand-variant-melasty'
                    : normalizeBrandName(brand.name).toLowerCase().includes('sunway')
                    ? 'brand-variant-sunway'
                    : 'brand-variant-default'
                }`}
                style={
                  {
                    '--brand-index': idx,
                  } as CSSProperties
                }
                onMouseMove={handleBrandCardMove}
                onMouseLeave={handleBrandCardLeave}
              >
                <div className="brand-liquid-bg" />
                <div className="brand-neon-border" />
                <div className="brand-energy-ring" />
                <div className="brand-logo-wrap relative w-full h-24 flex flex-col items-center justify-center gap-2">
                  <img src={brand.logo || "/placeholder.svg"} alt={brand.name} className="brand-logo brand-logo-inner max-w-full max-h-full object-contain" />
                  <span className="text-xs font-semibold text-muted-foreground">{normalizeBrandName(brand.name)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-section-id="benefits" data-reveal className="reveal-block py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Una experiencia mas simple y rapida</h2>
            <p className="text-muted-foreground text-base sm:text-lg">Todo el flujo pensado para que encuentres lo que necesitas sin perder tiempo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {homeBenefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 120}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section data-section-id="flow" data-reveal className="reveal-block py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8 sm:mb-10 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Como comprar en Rockink IMM</h2>
            <Sparkles className="w-7 h-7 text-primary animate-float" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step, idx) => (
              <div key={step.title} className="rounded-2xl bg-background border border-border p-6 relative overflow-hidden">
                <div className="text-4xl font-black text-primary/20 absolute -top-2 -right-2">{`0${idx + 1}`}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section-id="social" data-reveal className="reveal-block social-macro-section py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-background relative overflow-hidden">
        <div className="social-macro-bg" />
        <div className="social-macro-grid" />
        <div className="max-w-7xl mx-auto">
          <div className="social-logo-wrap">
            {socialCards.map((social, idx) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                className="social-logo-orb group"
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                <span className="social-logo-halo" style={{ boxShadow: `0 0 60px ${social.glow}` }} />
                <span className="social-logo-ring" />
                <img src={social.logo} alt={social.name} className="social-logo-icon" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section data-section-id="cta" data-reveal className="reveal-block py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-primary via-secondary to-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary-foreground mb-6 sm:mb-8 leading-tight">Estamos Listos para Ayudarte</h2>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12">Unete a empresas y productores que confian en Rockink IMM para sus soluciones ganaderas.</p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/store">
              <Button className="premium-button w-full sm:w-auto bg-primary-foreground text-primary hover:bg-white text-lg font-bold">
                Ir a Tienda
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="premium-button w-full sm:w-auto border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/20 text-lg font-bold bg-transparent">
                Conocer Mas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <a
        href="https://wa.me/51962838329"
        target="_blank"
        rel="noreferrer"
        className="interactive-tilt whatsapp-float fixed bottom-6 right-5 z-40"
        aria-label="Escribir por WhatsApp"
      >
        <span className="whatsapp-ripple" />
        <span className="whatsapp-ripple whatsapp-ripple-delay" />
        <span className="whatsapp-float-inner">
          <img
            src="https://cdn.simpleicons.org/whatsapp/FFFFFF"
            alt="WhatsApp"
            className="w-6 h-6"
          />
        </span>
      </a>

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground py-12 sm:py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 mb-12 sm:mb-16">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logoempresa.png" alt="Rockink IMM" className="w-8 h-8" />
                <span className="font-bold text-xl text-white">Rockink IMM</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Soluciones de ingenieria ganadera enfocadas en productividad, bienestar animal e innovacion continua.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Productos</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/store" className="hover:text-primary transition">Catalogo Completo</a></li>
                <li><a href="/store#categories" className="hover:text-primary transition">Categorias</a></li>
                <li><a href="/about" className="hover:text-primary transition">Sobre Nosotros</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Soporte</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/contacto" className="hover:text-primary transition">Centro de Ayuda</a></li>
                <li><a href="/contacto#faq" className="hover:text-primary transition">Preguntas Frecuentes</a></li>
                <li><a href="/contacto" className="hover:text-primary transition">Contactanos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/contacto#privacidad" className="hover:text-primary transition">Privacidad</a></li>
                <li><a href="/contacto#terminos" className="hover:text-primary transition">Terminos</a></li>
                <li><a href="/contacto#cookies" className="hover:text-primary transition">Cookies</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Contacto</h4>
              <p className="text-gray-400 text-sm mb-2">contacto@rockinkimm.com</p>
              <p className="text-gray-400 text-sm mb-4">+51 962838329</p>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/rockinkperu"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition"
                >
                  <span className="text-xs">FB</span>
                </a>
                <a
                  href="https://www.instagram.com/rockink_imm/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition"
                >
                  <span className="text-xs">IG</span>
                </a>
                <a
                  href="https://www.tiktok.com/@rockinkimm"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition"
                >
                  <span className="text-xs">TT</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm">© 2026 Rockink IMM. Todos los derechos reservados.</p>
            <p className="text-gray-500 text-xs mt-2">Transformando la ingenieria ganadera con innovacion y calidad</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  );
}






'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { FaqAccordion } from '@/components/faq-accordion';
import { SocialIcon, SOCIAL_LINKS } from '@/components/social-icon';
import { Brand, DEFAULT_BRANDS } from '@/lib/data';
import { normalizeBrandName } from '@/lib/product-brand';
import { CartProvider } from '@/lib/cart-context';
import { useScrollFx, useRevealOnScroll } from '@/lib/use-scroll-fx';
import {
  IMAGES,
  HERO,
  SHOWCASE,
  STATS,
  SERVICES,
  PROCESS,
  PROJECTS,
  PARTNERSHIP_NOTE,
  CERTIFICATIONS,
  POSTS,
  FAQS,
  CONTACT,
} from '@/lib/home-content';
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Dna,
  Droplets,
  LifeBuoy,
  Mail,
  MapPin,
  Scissors,
  ShieldCheck,
  Thermometer,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

/** Los nombres de icono viven en lib/home-content.ts; aqui se resuelven al componente. */
const ICONS: Record<string, LucideIcon> = {
  Droplets,
  Dna,
  Scissors,
  Wrench,
  ClipboardCheck,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Thermometer,
  LifeBuoy,
};

function animateCount(target: number, duration: number, onTick: (value: number) => void) {
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    onTick(Math.floor(target * (1 - Math.pow(1 - t, 3))));
    if (t < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

function HomeContent() {
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [counters, setCounters] = useState<number[]>(() => STATS.map(() => 0));
  const [statsVisible, setStatsVisible] = useState(false);
  const [headerDark, setHeaderDark] = useState(true);

  const heroRef = useRef<HTMLElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);

  useScrollFx();
  useRevealOnScroll();

  /* ---------- Marcas reales desde la configuracion del sitio ---------- */
  useEffect(() => {
    const controller = new AbortController();

    const loadBrands = async () => {
      try {
        const res = await fetch('/api/site-config', { cache: 'no-store', signal: controller.signal });
        if (!res.ok) return;
        const config = (await res.json()) as { brands?: Brand[] };
        if (Array.isArray(config.brands) && config.brands.length > 0) {
          setBrands(config.brands);
        }
      } catch {
        /* se mantienen las marcas por defecto */
      }
    };

    void loadBrands();
    return () => controller.abort();
  }, []);

  /* ---------- Header: oscuro sobre el hero, claro al salir de el ---------- */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const onScroll = () => {
      setHeaderDark(window.scrollY < hero.offsetHeight - 80);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /* ---------- Contadores: se disparan una sola vez al entrar en viewport ---------- */
  useEffect(() => {
    const section = statsRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    STATS.forEach((stat, index) => {
      animateCount(stat.value, 1500, (value) =>
        setCounters((prev) => {
          if (prev[index] === value) return prev;
          const next = [...prev];
          next[index] = value;
          return next;
        })
      );
    });
  }, [statsVisible]);

  const marqueeItems = useMemo(() => {
    const names = brands.map((brand) => normalizeBrandName(brand.name));
    const base = names.length > 0 ? names : ['Lister', 'CRV', 'Melasty'];
    return [...base, 'Rockink IMM', ...base, 'Ingenieria Ganadera'];
  }, [brands]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !message) return;

    const text = encodeURIComponent(
      [
        'Hola Rockink IMM, quiero contactarme.',
        `Nombre: ${name}`,
        phone ? `Telefono: ${phone}` : '',
        `Mensaje: ${message}`,
      ]
        .filter(Boolean)
        .join('\n')
    );

    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${text}`, '_blank');
    form.reset();
  };

  return (
    <div className="bg-background">
      {/* Progreso de lectura: CSS puro con scroll timeline nativo, cero JavaScript */}
      <div className="scroll-progress" aria-hidden="true">
        <div className="scroll-progress-bar" />
      </div>

      <Header variant={headerDark ? 'dark' : 'light'} />

      {/* ══ 1. HERO ══ Impacto: el video de operación real detiene el rebote */}
      <section ref={heroRef} className="ap-hero ap-dark">
        <video
          className="ap-hero-media"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={IMAGES.heroPoster}
          aria-hidden="true"
        >
          <source src="/hero-mobile.mp4" type="video/mp4" media="(max-width: 991px)" />
          <source src="/hero-desktop.mp4" type="video/mp4" />
        </video>
        <div className="ap-hero-veil" />

        <div className="ap-shell relative w-full pt-32 pb-28">
          <div className="max-w-3xl">
            <p className="ap-overline ap-rise" style={{ animationDelay: '80ms' }}>
              {HERO.overline}
            </p>
            <h1 className="ap-display ap-rise mt-6 text-white" style={{ animationDelay: '180ms' }}>
              {HERO.title}
            </h1>
            <p
              className="ap-rise mt-6 max-w-xl text-lg sm:text-xl leading-relaxed text-white/70"
              style={{ animationDelay: '280ms' }}
            >
              {HERO.description}
            </p>

            <div
              className="ap-rise mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7"
              style={{ animationDelay: '380ms' }}
            >
              <Link href={HERO.primaryCta.href}>
                <Button className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold transition-all hover:scale-[1.03] active:scale-95">
                  {HERO.primaryCta.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link
                href={HERO.secondaryCta.href}
                className="ap-link text-base text-white hover:text-white justify-center sm:justify-start"
              >
                {HERO.secondaryCta.label}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="ap-hero-scroll">
          <span>Desliza</span>
          <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
        </div>
      </section>

      {/* ══ 2. MARCAS ══ Credibilidad prestada, justo donde el rebote es mayor */}
      <div className="ap-marquee" aria-hidden="true">
        <div className="ap-marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-[3.4rem]">
              {marqueeItems.map((name, index) => (
                <span key={`${copy}-${index}`} className="ap-marquee-item">
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ 3. CIFRAS ══ Cuantifica la escala sin pedir esfuerzo de lectura */}
      <section data-reveal className="reveal-block py-20 sm:py-28">
        <div className="ap-shell">
          <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 text-center">
            {STATS.map((stat, index) => (
              <div
                key={stat.label}
                className="reveal-stagger"
                style={{ '--stagger': `${index * 90}ms` } as CSSProperties}
              >
                <p className="ap-stat-value">
                  {counters[index]}
                  <span className="text-primary">{stat.suffix}</span>
                </p>
                <p className="ap-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. SERVICIOS ══ Responde "¿qué hacen?" en menos de 5 s */}
      <section data-reveal className="reveal-block ap-section bg-muted">
        <div className="ap-shell">
          <div className="max-w-2xl mb-14 sm:mb-20">
            <p className="ap-overline">Capacidades</p>
            <h2 className="ap-title2 mt-5">Todo lo que la operacion necesita, en un solo socio tecnico.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((service, index) => {
              const Icon = ICONS[service.icon] ?? ClipboardCheck;
              return (
                <article
                  key={service.title}
                  className="ap-service-card reveal-stagger"
                  style={{ '--stagger': `${index * 90}ms` } as CSSProperties}
                >
                  <span className="ap-service-icon">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mb-2.5">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 5. SCROLL FIJO ══ La imagen se abre a pantalla completa mientras bajas.
             Es el momento de mayor impacto: la pausa que separa "qué hacemos"
             de "cómo lo hacemos". */}
      <section data-scrollfx="pin" className="ap-pin ap-dark">
        <div className="ap-pin-stage">
          <div className="ap-pin-frame">
            <img
              src={IMAGES.showcase}
              alt=""
              className="ap-pin-media"
              loading="lazy"
              aria-hidden="true"
            />
            <div className="ap-pin-veil" />
          </div>

          <div className="ap-pin-copy">
            <p className="ap-overline">{SHOWCASE.overline}</p>
            <h2 className="ap-pin-title mt-4">{SHOWCASE.title}</h2>
            <p className="ap-pin-desc">{SHOWCASE.description}</p>

            <div className="ap-pin-markers">
              {SHOWCASE.markers.map((marker, index) => (
                <span
                  key={marker}
                  className="ap-pin-marker"
                  style={{ '--i': index } as CSSProperties}
                >
                  {marker}
                </span>
              ))}
            </div>
          </div>

          <div className="ap-pin-rail" aria-hidden="true" />
        </div>
      </section>

      {/* ══ 6. PROCESO ══ Saber que hay un método baja el riesgo percibido */}
      <section data-reveal className="reveal-block ap-section">
        <div className="ap-shell">
          <div className="max-w-2xl mb-14 sm:mb-20">
            <p className="ap-overline">Como trabajamos</p>
            <h2 className="ap-title2 mt-5">Cuatro pasos, sin sorpresas.</h2>
          </div>

          <div className="ap-timeline">
            {PROCESS.map((item, index) => (
              <div
                key={item.step}
                className="ap-timeline-item reveal-stagger"
                style={{ '--stagger': `${index * 110}ms` } as CSSProperties}
              >
                <p className="ap-timeline-step">{`0${index + 1} — ${item.step}`}</p>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed pr-4">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. PROYECTOS ══ Un caso concreto vale más que diez adjetivos */}
      <section data-reveal className="reveal-block ap-section bg-muted">
        <div className="ap-shell">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <p className="ap-overline">Proyectos</p>
              <h2 className="ap-title2 mt-5">Trabajo entregado en campo.</h2>
            </div>
            <Link href="/contacto" className="ap-link shrink-0">
              Consultar un caso
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PROJECTS.map((project, index) => (
              <article
                key={project.title}
                className="ap-project-card reveal-stagger"
                style={{ '--stagger': `${index * 110}ms` } as CSSProperties}
              >
                <Image
                  src={IMAGES.projects[index] ?? IMAGES.projects[0]}
                  alt={project.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="ap-project-img"
                />
                <div className="ap-project-veil" />
                <div className="ap-project-body">
                  <span className="ap-project-tag">{project.category}</span>
                  <h3 className="text-xl font-semibold leading-snug">{project.title}</h3>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">{project.description}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/60">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {project.location}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 8. GALERÍA ══ En el agro la foto de campo convence más que el texto.
             Con 6 o más fotos el diseño pasa solo a mosaico. */}
      <section data-reveal className="reveal-block ap-section">
        <div className="ap-shell">
          <div className="max-w-2xl mb-14">
            <p className="ap-overline">Galeria</p>
            <h2 className="ap-title2 mt-5">Trabajo, equipo y campo.</h2>
          </div>

          <div className={`ap-gallery ${IMAGES.gallery.length >= 6 ? 'ap-gallery--mosaic' : ''}`}>
            {IMAGES.gallery.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="ap-gallery-tile reveal-stagger"
                style={{ '--stagger': `${index * 60}ms` } as CSSProperties}
              >
                <img src={src} alt="" loading="lazy" className="ap-parallax" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 9. ALIANZAS ══ Validación externa que cierra el ciclo de confianza */}
      <section data-reveal className="reveal-block ap-section bg-muted">
        <div className="ap-shell grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className="ap-overline">{PARTNERSHIP_NOTE.overline}</p>
            <h2 className="ap-title2 mt-5">{PARTNERSHIP_NOTE.title}</h2>
            <p className="ap-sub mt-5 text-base sm:text-lg">{PARTNERSHIP_NOTE.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {brands.map((brand, index) => (
              <div
                key={brand.id}
                className="ap-card reveal-stagger flex items-center justify-center p-6 min-h-[7rem]"
                style={{ '--stagger': `${index * 90}ms` } as CSSProperties}
              >
                <img
                  src={brand.logo || '/placeholder-logo.svg'}
                  alt={brand.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = '/placeholder-logo.svg';
                  }}
                  className="max-h-14 w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 10. RESPALDO ══ Elimina la última objeción racional del comprador */}
      <section data-reveal className="reveal-block ap-section">
        <div className="ap-shell">
          <div className="max-w-2xl mb-14">
            <p className="ap-overline">Respaldo</p>
            <h2 className="ap-title2 mt-5">Lo que garantizamos por escrito.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CERTIFICATIONS.map((item, index) => {
              const Icon = ICONS[item.icon] ?? ShieldCheck;
              return (
                <article
                  key={item.title}
                  className="ap-cert-card reveal-stagger"
                  style={{ '--stagger': `${index * 90}ms` } as CSSProperties}
                >
                  <span className="ap-cert-icon">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 11. BLOG ══ Demuestra expertise; contenido opcional que no estorba */}
      <section data-reveal className="reveal-block ap-section bg-muted">
        <div className="ap-shell">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <p className="ap-overline">Conocimiento</p>
              <h2 className="ap-title2 mt-5">Notas tecnicas del campo.</h2>
            </div>
            <Link href="/blog" className="ap-link shrink-0">
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {POSTS.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog#${post.slug}`}
                className="ap-post-card reveal-stagger"
                style={{ '--stagger': `${index * 110}ms` } as CSSProperties}
              >
                <div className="ap-post-meta">
                  <span>{post.category}</span>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground leading-snug mb-3">{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-grow">{post.excerpt}</p>
                <span className="ap-link mt-5 text-sm">
                  Leer
                  <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 12. FAQ ══ Última barrera antes del formulario */}
      <section data-reveal className="reveal-block ap-section">
        <div className="ap-shell grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="ap-overline">Dudas frecuentes</p>
            <h2 className="ap-title2 mt-5">Antes de escribirnos.</h2>
            <p className="ap-sub mt-5 text-base">
              Si tu duda no esta aqui, escribenos por WhatsApp y te respondemos directo.
            </p>
          </div>

          <FaqAccordion items={FAQS} />
        </div>
      </section>

      {/* ══ 13. CONTACTO ══ Cierre: todas las objeciones ya fueron resueltas */}
      <section data-reveal className="reveal-block ap-dark ap-section">
        <div className="ap-shell grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <p className="ap-overline">Contacto</p>
            <h2 className="ap-title2 mt-5 text-white">Cuentanos que necesita tu operacion.</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/60">
              Respondemos con una propuesta real, no con un precio referencial.
            </p>

            <div className="mt-10 space-y-5">
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 text-white/80 hover:text-primary transition-colors"
              >
                <span className="ap-cert-icon">
                  <SocialIcon name="whatsapp" className="w-5 h-5" />
                </span>
                <span className="font-medium">{CONTACT.whatsappDisplay}</span>
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-4 text-white/80 hover:text-primary transition-colors"
              >
                <span className="ap-cert-icon">
                  <Mail className="w-5 h-5" strokeWidth={1.5} />
                </span>
                <span className="font-medium">{CONTACT.email}</span>
              </a>
              <p className="flex items-start gap-4 text-white/50">
                <span className="ap-cert-icon">
                  <MapPin className="w-5 h-5" strokeWidth={1.5} />
                </span>
                <span className="text-sm leading-relaxed pt-2">{CONTACT.address}</span>
              </p>
            </div>

            <div className="flex gap-3 mt-10">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="footer-social-btn"
                >
                  <SocialIcon name={social.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input name="name" type="text" placeholder="Tu nombre y apellido" className="ap-input" required />
            <input name="phone" type="tel" placeholder="Tu telefono" className="ap-input" />
            <textarea
              name="message"
              rows={6}
              placeholder="Cuentanos que necesitas"
              className="ap-input resize-y"
              required
            />
            <Button
              type="submit"
              className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-semibold transition-all hover:scale-[1.02] active:scale-95"
            >
              Enviar por WhatsApp
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-white/40 text-center pt-1">
              Se abrira WhatsApp con tu mensaje listo para enviar.
            </p>
          </form>
        </div>
      </section>

      {/* WhatsApp persistente: para el productor en campo es el atajo, no un adorno */}
      <a
        href={`https://wa.me/${CONTACT.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-float fixed bottom-6 right-5 z-40"
        aria-label="Escribir por WhatsApp"
      >
        <span className="whatsapp-ripple" />
        <span className="whatsapp-ripple whatsapp-ripple-delay" />
        <span className="whatsapp-float-inner">
          <SocialIcon name="whatsapp" className="w-6 h-6" />
        </span>
      </a>

      <Footer />
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

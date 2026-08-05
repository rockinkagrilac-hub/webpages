'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { CartProvider } from '@/lib/cart-context';
import { useScrollFx, useRevealOnScroll } from '@/lib/use-scroll-fx';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Leaf,
  MapPin,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';

type StatKey = 'departamentos' | 'garantia' | 'optimizacion';

const FLOW_STEPS = [
  {
    id: 'seleccion',
    title: 'Seleccion tecnica',
    desc: 'Evaluamos equipos, repuestos e insumos para el tipo real de operacion.',
  },
  {
    id: 'soporte',
    title: 'Soporte experto',
    desc: 'Acompanamiento comercial y tecnico para implementacion con menor friccion.',
  },
  {
    id: 'resultado',
    title: 'Resultado medible',
    desc: 'Operacion mas estable, eficiente y lista para escalar.',
  },
];

const VALUE_CARDS = [
  { icon: Award, title: 'Excelencia', desc: 'Calidad consistente y criterio tecnico en cada seleccion.' },
  { icon: Users, title: 'Confianza', desc: 'Relacion de largo plazo basada en respuesta, cumplimiento y seguimiento.' },
  { icon: Leaf, title: 'Sostenibilidad', desc: 'Procesos mas eficientes con enfoque operativo responsable.' },
  { icon: CheckCircle2, title: 'Innovacion', desc: 'Soluciones tecnicas aplicadas con mentalidad de mejora continua.' },
];

const PILLARS = [
  { title: 'Precision', desc: 'Seleccion tecnica de productos para resultados consistentes.' },
  { title: 'Sostenibilidad', desc: 'Operacion responsable, eficiente y orientada a continuidad.' },
  { title: 'Velocidad', desc: 'Respuesta comercial agil para operaciones que no pueden esperar.' },
];

function AboutContent() {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [activeFlow, setActiveFlow] = useState('seleccion');
  const [stats, setStats] = useState<Record<StatKey, number>>({
    departamentos: 0,
    garantia: 0,
    optimizacion: 0,
  });

  useScrollFx();
  useRevealOnScroll();

  useEffect(() => {
    const section = statsRef.current;
    if (!section) return;

    let hasRun = false;
    const animateValue = (key: StatKey, target: number, duration: number) => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setStats((prev) => ({ ...prev, [key]: Math.floor(target * eased) }));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (hasRun) return;
        if (entries.some((entry) => entry.isIntersecting)) {
          hasRun = true;
          animateValue('departamentos', 5, 1200);
          animateValue('garantia', 100, 1200);
          animateValue('optimizacion', 18, 1200);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const activeStep = FLOW_STEPS.find((step) => step.id === activeFlow) ?? FLOW_STEPS[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-8 px-5 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="ap-eyebrow ap-rise" style={{ animationDelay: '60ms' }}>Sobre nosotros</p>
          <h1 className="ap-headline ap-rise mt-3" style={{ animationDelay: '140ms' }}>
            Ingenieria ganadera aplicada.
          </h1>
          <p className="ap-sub ap-rise mt-5 max-w-2xl mx-auto" style={{ animationDelay: '240ms' }}>
            Tecnologia, soporte experto y criterio comercial para operaciones ganaderas
            que necesitan moverse con precision.
          </p>
          <div className="ap-rise mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-7" style={{ animationDelay: '340ms' }}>
            <Link href="/store">
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95">
                Explorar catalogo
              </Button>
            </Link>
            <Link href="/contacto" className="ap-link text-base">
              Agendar asesoria
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Video en marco con scroll-zoom */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24">
        <div
          data-scrollfx
          className="ap-media-zoom relative max-w-6xl mx-auto aspect-[16/10] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl shadow-black/15 bg-muted"
        >
          <video
            className="ap-media-inner absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            poster="/1.png"
          >
            <source src="/hero-mobile.mp4" type="video/mp4" media="(max-width: 991px)" />
            <source src="/videodefondosobrenosotros.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-7 sm:p-12">
            <p className="text-white/75 text-sm font-semibold mb-2">Nuestra razon de ser</p>
            <h2 className="text-white text-2xl sm:text-4xl font-bold tracking-tight max-w-xl text-balance">
              Ayudamos a operar mejor, con criterio real de campo.
            </h2>
          </div>
        </div>
      </section>

      {/* Mision */}
      <section data-reveal className="reveal-block py-16 sm:py-24 px-4 sm:px-6 bg-muted">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <p className="ap-eyebrow">Nuestra mision</p>
            <h2 className="ap-title2 mt-3">Ingenieria ganadera de precision.</h2>
            <p className="ap-sub mt-5 text-base sm:text-lg">
              En Rockink IMM ayudamos a productores y empresas a operar mejor, con tecnologia,
              equipamiento e insumos tecnicos de alto rendimiento.
            </p>
            <p className="ap-sub mt-4 text-base sm:text-lg">
              Nuestro enfoque combina seleccion tecnica, soporte comercial y acompanamiento para
              mejorar productividad, bienestar animal y eficiencia operativa.
            </p>
          </div>

          <div className="grid gap-4">
            {PILLARS.map((item, idx) => (
              <article
                key={item.title}
                className="ap-card reveal-stagger p-6 sm:p-7"
                style={{ '--stagger': `${idx * 110}ms` } as CSSProperties}
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Flujo de trabajo */}
      <section data-reveal className="reveal-block py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="ap-eyebrow">Ruta de valor</p>
          <h2 className="ap-title2 mt-3 mb-8">Como trabajamos contigo.</h2>

          <div className="ap-segment mb-8">
            {FLOW_STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                className={activeFlow === step.id ? 'is-active' : ''}
                onClick={() => setActiveFlow(step.id)}
              >
                {step.title}
              </button>
            ))}
          </div>

          <div className="ap-card p-8 sm:p-12 text-left">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">{activeStep.title}</h3>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">{activeStep.desc}</p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section data-reveal className="reveal-block py-16 sm:py-24 px-4 sm:px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="ap-eyebrow">Valores</p>
            <h2 className="ap-title2 mt-3">Nuestros valores clave.</h2>
            <p className="ap-sub mt-4 max-w-2xl mx-auto text-base sm:text-lg">
              Base tecnica y humana para crecer con nuestros clientes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUE_CARDS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="ap-card reveal-stagger p-7"
                  style={{ '--stagger': `${idx * 100}ms` } as CSSProperties}
                >
                  <div className="ap-icon mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cifras */}
      <section data-reveal className="reveal-block py-16 sm:py-24 px-4 sm:px-6">
        <div ref={statsRef} className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          <div>
            <MapPin className="w-5 h-5 text-primary mx-auto mb-3" />
            <p className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">{stats.departamentos}+</p>
            <p className="mt-2 text-sm text-muted-foreground font-medium">Departamentos atendidos</p>
          </div>
          <div>
            <ShieldCheck className="w-5 h-5 text-primary mx-auto mb-3" />
            <p className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">{stats.garantia}%</p>
            <p className="mt-2 text-sm text-muted-foreground font-medium">Garantia tecnica</p>
          </div>
          <div>
            <Zap className="w-5 h-5 text-primary mx-auto mb-3" />
            <p className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">{stats.optimizacion}%</p>
            <p className="mt-2 text-sm text-muted-foreground font-medium">Optimizacion de procesos</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-reveal className="reveal-block py-20 sm:py-28 px-4 sm:px-6 text-center bg-muted">
        <div className="max-w-3xl mx-auto">
          <h2 className="ap-title2">Transforma tu operacion ganadera.</h2>
          <p className="ap-sub mt-4 mb-9 max-w-xl mx-auto text-base sm:text-lg">
            Activa un flujo comercial y tecnico mas claro para tu negocio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-7">
            <Link href="/store">
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95">
                Explorar productos
              </Button>
            </Link>
            <Link href="/contacto" className="ap-link text-base">
              Hablar con un asesor
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function AboutPage() {
  return (
    <CartProvider>
      <AboutContent />
    </CartProvider>
  );
}

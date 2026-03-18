'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { CartProvider } from '@/lib/cart-context';
import {
  Award,
  CheckCircle2,
  Leaf,
  MapPin,
  PlayCircle,
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
  {
    icon: Award,
    title: 'Excelencia',
    desc: 'Calidad consistente y criterio tecnico en cada seleccion.',
  },
  {
    icon: Users,
    title: 'Confianza',
    desc: 'Relacion de largo plazo basada en respuesta, cumplimiento y seguimiento.',
  },
  {
    icon: Leaf,
    title: 'Sostenibilidad',
    desc: 'Procesos mas eficientes con enfoque operativo responsable.',
  },
  {
    icon: CheckCircle2,
    title: 'Innovacion',
    desc: 'Soluciones tecnicas aplicadas con mentalidad de mejora continua.',
  },
];

function AboutContent() {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [activeFlow, setActiveFlow] = useState('seleccion');
  const [stats, setStats] = useState<Record<StatKey, number>>({
    departamentos: 0,
    garantia: 0,
    optimizacion: 0,
  });

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-about-reveal]'));
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

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

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-motion-card]'));
    if (cards.length === 0) return;

    const handleMove = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      const mouseEvent = event as MouseEvent;
      const rect = target.getBoundingClientRect();
      const x = mouseEvent.clientX - rect.left;
      const y = mouseEvent.clientY - rect.top;
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;

      target.style.setProperty('--card-rotate-x', `${(ny * -10).toFixed(2)}deg`);
      target.style.setProperty('--card-rotate-y', `${(nx * 12).toFixed(2)}deg`);
      target.style.setProperty('--card-shift-x', `${(nx * 10).toFixed(2)}px`);
      target.style.setProperty('--card-shift-y', `${(ny * 10).toFixed(2)}px`);
      target.style.setProperty('--card-glow-x', `${(x / rect.width) * 100}%`);
      target.style.setProperty('--card-glow-y', `${(y / rect.height) * 100}%`);
    };

    const handleLeave = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      target.style.setProperty('--card-rotate-x', '0deg');
      target.style.setProperty('--card-rotate-y', '0deg');
      target.style.setProperty('--card-shift-x', '0px');
      target.style.setProperty('--card-shift-y', '0px');
      target.style.setProperty('--card-glow-x', '50%');
      target.style.setProperty('--card-glow-y', '50%');
    };

    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="about-hero-v2 reveal-block is-visible">
        <div className="about-hero-v2-media">
          <video
            className="about-hero-v2-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            poster="/hero-agro.jpg"
          >
            <source src="/hero-mobile.mp4" type="video/mp4" media="(max-width: 991px)" />
            <source src="/videodefondosobrenosotros.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="about-hero-v2-overlay" />
        <div className="about-hero-v2-grid">
          <div className="about-hero-v2-copy">
            <div className="about-kicker-pill">
              <PlayCircle className="h-4 w-4" />
              <span>Ingenieria ganadera aplicada</span>
            </div>
            <h1>Sobre nuestra empresa</h1>
            <p>
              Tecnologia, soporte experto y criterio comercial para operaciones
              ganaderas que necesitan moverse con precision.
            </p>
            <div className="about-hero-v2-actions">
              <Link href="/store">
                <Button className="premium-button about-primary-cta">Explorar catalogo</Button>
              </Link>
              <Link href="/contacto">
                <Button variant="outline" className="premium-button about-secondary-cta">
                  Agendar asesoria
                </Button>
              </Link>
            </div>
          </div>

          <div className="about-hero-v2-panel" data-motion-card>
            <p className="about-panel-kicker">Panel operativo</p>
            <div className="about-panel-matrix">
              <div>
                <strong>24/7</strong>
                <span>acompanamiento</span>
              </div>
              <div>
                <strong>+5</strong>
                <span>zonas activas</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>enfoque consultivo</span>
              </div>
              <div>
                <strong>360</strong>
                <span>vision operativa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-mission-v2 reveal-block is-visible" data-about-reveal>
        <div className="about-section-grid">
          <div className="about-mission-copy">
            <span className="about-section-label">Nuestra razon de ser</span>
            <h2>Ingenieria ganadera de precision</h2>
            <p>
              En Rockink IMM ayudamos a productores y empresas a operar mejor,
              con tecnologia, equipamiento e insumos tecnicos de alto
              rendimiento.
            </p>
            <p>
              Nuestro enfoque combina seleccion tecnica, soporte comercial y
              acompanamiento para mejorar productividad, bienestar animal y
              eficiencia operativa.
            </p>
          </div>

          <div className="about-mission-stack">
            <article className="about-wire-card" data-about-reveal data-motion-card>
              <span className="about-wire-line" />
              <h3>Precision</h3>
              <p>Seleccion tecnica de productos para resultados consistentes.</p>
            </article>
            <article className="about-wire-card" data-about-reveal data-motion-card>
              <span className="about-wire-line" />
              <h3>Sostenibilidad</h3>
              <p>Operacion responsable, eficiente y orientada a continuidad.</p>
            </article>
            <article className="about-wire-card" data-about-reveal data-motion-card>
              <span className="about-wire-line" />
              <h3>Velocidad</h3>
              <p>Respuesta comercial agil para operaciones que no pueden esperar.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-flow-v2 reveal-block is-visible" data-about-reveal>
        <div className="about-section-head">
          <span className="about-section-label">Ruta de valor</span>
          <h2>Como trabajamos contigo</h2>
        </div>
        <div className="about-flow-tabs">
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
        <div className="about-flow-panel">
          {FLOW_STEPS.map((step) =>
            step.id === activeFlow ? (
              <div key={step.id}>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ) : null
          )}
        </div>
      </section>

      <section className="about-values-v2 reveal-block is-visible" data-about-reveal>
        <div className="about-section-head dark">
          <span className="about-section-label">Valores</span>
          <h2>Nuestros valores clave</h2>
          <p>Base tecnica y humana para crecer con nuestros clientes.</p>
        </div>
        <div className="about-values-grid">
          {VALUE_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="about-value-card-v2" data-about-reveal data-motion-card>
                <div className="about-value-icon">
                  <Icon className="h-6 w-6" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="about-stats-v2 reveal-block is-visible" ref={statsRef} data-about-reveal>
        <article data-motion-card>
          <MapPin className="h-5 w-5" />
          <strong>{stats.departamentos}+</strong>
          <span>Departamentos atendidos</span>
        </article>
        <article data-motion-card>
          <ShieldCheck className="h-5 w-5" />
          <strong>{stats.garantia}%</strong>
          <span>Garantia tecnica</span>
        </article>
        <article data-motion-card>
          <Zap className="h-5 w-5" />
          <strong>{stats.optimizacion}%</strong>
          <span>Optimizacion de procesos</span>
        </article>
      </section>

      <section className="about-cta-v2 reveal-block is-visible" data-about-reveal>
        <div className="about-cta-v2-inner">
          <h2>Transforma tu operacion ganadera</h2>
          <p>Activa un flujo comercial y tecnico mas claro para tu negocio.</p>
          <Link href="/store">
            <Button className="premium-button about-primary-cta">Explorar productos ahora</Button>
          </Link>
        </div>
      </section>

      <footer className="bg-foreground text-primary-foreground py-12 sm:py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 mb-12 sm:mb-16">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logoempresa.png" alt="Rockink IMM" className="w-8 h-8" />
                <span className="font-bold text-xl text-white">Rockink IMM</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Soluciones de ingenieria ganadera enfocadas en productividad,
                bienestar animal e innovacion continua.
              </p>
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
                <li><a href="/privacidad" className="hover:text-primary transition">Privacidad</a></li>
                <li><a href="/terminos" className="hover:text-primary transition">Terminos</a></li>
                <li><a href="/cookies" className="hover:text-primary transition">Cookies</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Contacto</h4>
              <p className="text-gray-400 text-sm mb-2">contacto@rockinkimm.com</p>
              <p className="text-gray-400 text-sm mb-4">+51 962838329</p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/rockinkperu" target="_blank" rel="noreferrer" className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition"><span className="text-xs">FB</span></a>
                <a href="https://www.instagram.com/rockink_imm/" target="_blank" rel="noreferrer" className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition"><span className="text-xs">IG</span></a>
                <a href="https://www.tiktok.com/@rockinkimm" target="_blank" rel="noreferrer" className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition"><span className="text-xs">TT</span></a>
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

export default function AboutPage() {
  return (
    <CartProvider>
      <AboutContent />
    </CartProvider>
  );
}

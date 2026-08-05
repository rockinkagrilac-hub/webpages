'use client';

import { FormEvent, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SocialIcon, SOCIAL_LINKS } from '@/components/social-icon';
import { useRevealOnScroll } from '@/lib/use-scroll-fx';
import { Mail, MapPin, MessageCircle, ChevronRight } from 'lucide-react';

const faqs = [
  'Te atendemos por WhatsApp para cotizacion, soporte tecnico comercial y seguimiento.',
  'Los productos publicados se actualizan segun disponibilidad real de inventario.',
  'Para compras por volumen o proyectos especiales asignamos atencion directa.',
];

const channels = [
  {
    title: 'WhatsApp directo',
    value: '+51 962 838 329',
    href: 'https://wa.me/51962838329',
    icon: MessageCircle,
  },
  {
    title: 'Correo comercial',
    value: 'contacto@rockinkimm.com',
    href: 'mailto:contacto@rockinkimm.com',
    icon: Mail,
  },
  {
    title: 'Cobertura',
    value: 'Arequipa · Enviamos a todo el Peru',
    href: 'https://maps.google.com/?q=Av.%20Lambramani%20E-17,%20Urb.%20Mariano%20Bustamante,%20Mariano%20Melgar%2004000',
    icon: MapPin,
  },
];

export function ContactSectionV2() {
  const [mapFocus, setMapFocus] = useState<'peru' | 'arequipa'>('arequipa');
  useRevealOnScroll();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const message = String(data.get('message') || '').trim();
    const accepted = Boolean(data.get('privacy'));

    if (!name || !message || !accepted) return;

    const text = encodeURIComponent(
      [
        'Hola Rockink IMM, quiero contactarme.',
        `Nombre: ${name}`,
        email ? `Correo: ${email}` : '',
        phone ? `Telefono: ${phone}` : '',
        `Mensaje: ${message}`,
      ]
        .filter(Boolean)
        .join('\n')
    );

    window.open(`https://wa.me/51962838329?text=${text}`, '_blank');
    form.reset();
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 px-5 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="ap-eyebrow ap-rise" style={{ animationDelay: '60ms' }}>Contacto</p>
          <h1 className="ap-headline ap-rise mt-3" style={{ animationDelay: '140ms' }}>
            Hablemos de tu operacion.
          </h1>
          <p className="ap-sub ap-rise mt-5 max-w-2xl mx-auto" style={{ animationDelay: '240ms' }}>
            Productos, soporte tecnico comercial, compras por volumen y soluciones para
            operaciones ganaderas con criterio real de campo.
          </p>
          <div className="ap-rise mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-7" style={{ animationDelay: '340ms' }}>
            <a href="https://wa.me/51962838329" target="_blank" rel="noreferrer">
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95">
                WhatsApp inmediato
              </Button>
            </a>
            <a href="#formulario-contacto" className="ap-link text-base">
              Ir al formulario
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Canales */}
      <section data-reveal className="reveal-block pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {channels.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                className="ap-card reveal-stagger p-7"
                style={{ '--stagger': `${idx * 110}ms` } as CSSProperties}
              >
                <div className="ap-icon mb-5">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                  {item.title}
                </p>
                <p className="text-base font-semibold text-foreground break-words">{item.value}</p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Formulario + FAQ */}
      <section data-reveal className="reveal-block py-16 sm:py-24 px-4 sm:px-6 bg-muted">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-start">
          <div>
            <p className="ap-eyebrow">Operacion y soporte</p>
            <h2 className="ap-title2 mt-3">Respuesta clara, tecnica y comercial.</h2>
            <p className="ap-sub mt-5 text-base sm:text-lg">
              Atendemos consultas de producto, soporte tecnico comercial y proyectos de compra
              con una conversacion directa y sin friccion.
            </p>

            <div id="faq" className="scroll-mt-28 mt-10">
              <h3 className="text-lg font-semibold text-foreground mb-4">Preguntas frecuentes</h3>
              <div className="space-y-3">
                {faqs.map((item, index) => (
                  <div key={item} className="ap-card p-5">
                    <p className="text-xs font-semibold text-primary mb-1.5">{`0${index + 1}`}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            id="formulario-contacto"
            className="scroll-mt-28 rounded-[1.4rem] bg-card border border-border shadow-xl shadow-black/5 p-7 sm:p-9"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Escribenos tu necesidad</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-7">
              Te respondemos con una conversacion mas directa por WhatsApp.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="name" type="text" placeholder="Tu nombre y apellido" className="ap-input" required />
                <input name="email" type="email" placeholder="Tu correo electronico" className="ap-input" />
              </div>

              <input name="phone" type="tel" placeholder="Tu telefono" className="ap-input" />

              <textarea
                name="message"
                placeholder="Cuentanos que necesitas"
                rows={6}
                className="ap-input resize-y"
                required
              />

              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input name="privacy" type="checkbox" className="w-4 h-4 mt-0.5 accent-primary" required />
                <span>
                  Acepto que Rockink IMM me contacte por los medios indicados.
                </span>
              </label>

              <Button
                type="submit"
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-semibold transition-all hover:scale-[1.02] active:scale-95"
              >
                Enviar mensaje
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Mapa */}
      <section data-reveal className="reveal-block py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
            <div>
              <p className="ap-eyebrow">Cobertura</p>
              <h2 className="ap-title2 mt-3">Arequipa, para todo el Peru.</h2>
              <p className="text-sm text-muted-foreground mt-3">
                Av. Lambramani E-17, Urb. Mariano Bustamante, Mariano Melgar 04000
              </p>
            </div>
            <div className="ap-segment self-start">
              <button
                type="button"
                onClick={() => setMapFocus('arequipa')}
                className={mapFocus === 'arequipa' ? 'is-active' : ''}
              >
                Arequipa
              </button>
              <button
                type="button"
                onClick={() => setMapFocus('peru')}
                className={mapFocus === 'peru' ? 'is-active' : ''}
              >
                Todo el Peru
              </button>
            </div>
          </div>

          <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden rounded-3xl border border-border shadow-xl shadow-black/5">
            <iframe
              title="Mapa Rockink IMM"
              src={
                mapFocus === 'peru'
                  ? 'https://maps.google.com/?q=Peru&z=5&output=embed'
                  : 'https://maps.google.com/?q=Av.%20Lambramani%20E-17,%20Urb.%20Mariano%20Bustamante,%20Mariano%20Melgar%2004000&z=16&output=embed'
              }
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Redes */}
      <section data-reveal className="reveal-block py-16 sm:py-24 px-4 sm:px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="ap-eyebrow">Redes</p>
            <h2 className="ap-title2 mt-3">Canales oficiales.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SOCIAL_LINKS.map((social, idx) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="ap-card reveal-stagger p-6 flex items-center gap-4"
                style={{ '--stagger': `${idx * 100}ms` } as CSSProperties}
              >
                <div className="ap-icon shrink-0">
                  <SocialIcon name={social.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{social.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{social.handle}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/store" className="ap-link text-base">
              Ver el catalogo completo
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

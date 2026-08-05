---
name: rockink-design
description: Sistema de diseño de Rockink IMM (Next.js + Tailwind v4). Úsala SIEMPRE antes de crear o modificar cualquier UI de este proyecto — páginas, secciones, tarjetas, formularios, animaciones o colores. Se activa con "rediseña", "nueva sección", "mejora el diseño", "agrega una página", "cambia los colores", "animación", "hero", "landing", "estilos", "CSS", "Tailwind".
---

# Sistema de diseño — Rockink IMM

Tienda B2B de equipos de ganadería (Lister, CRV, Melasty) para productores en Perú.
El cliente real es un productor ganadero buscando comprar insumos técnicos rápido, muchas
veces desde el campo con conexión limitada. **No es una startup de tecnología.**

Estética objetivo: **monótona clara estilo Apple** — mucho blanco, gris `#f5f5f7`,
texto casi negro, verde SOLO como acento puntual. Elegante y rápida, no llamativa.

## Reglas duras

1. **Nunca hardcodees colores.** Nada de `bg-white`, `text-gray-400`, `bg-black/55`,
   `#22c55e`. Usa siempre tokens: `bg-background`, `bg-card`, `bg-muted`,
   `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`.
   Motivo: cambiar la paleta debe afectar todo el sitio de una vez.
2. **El verde es acento, no fondo.** Aparece en botones primarios, links, y el punto
   activo de navegación. Si una sección entera es verde, está mal.
3. **Un solo peso tipográfico fuerte.** Títulos `font-bold` con `tracking-tight`;
   cuerpo en `text-muted-foreground`. Sin degradados de texto, sin neón, sin glow.
4. **Nada de animaciones infinitas** salvo el marquee y el ripple de WhatsApp.
   Todo lo demás se dispara por scroll o por hover. Una animación que corre siempre
   consume GPU en móviles de gama baja — es el error que ya tuvo este proyecto.
5. **Toda animación nueva** debe estar cubierta por el bloque
   `@media (pointer: coarse), (prefers-reduced-motion: reduce)` al final de
   `app/globals.css`.
6. **Imágenes:** `next/image` cuando sea posible. Nunca sirvas un PNG de 1 MB para
   mostrarlo a 40px (ya pasó con `logoempresa.png`). Usa `/logo-mark.png` (15 KB).
7. **Logos de marcas externas** siempre con `onError` → `/placeholder-logo.svg`.
   Son URLs de terceros (Squarespace, Google) que pueden caerse.

## Tokens (definidos en `app/globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `--background` | blanco | fondo base |
| `--muted` | `oklch(0.966 …)` ≈ `#f5f5f7` | franjas de sección alternas |
| `--foreground` | `oklch(0.235 …)` ≈ `#1d1d1f` | texto principal |
| `--muted-foreground` | gris medio | texto secundario |
| `--primary` | verde `oklch(0.55 0.14 155)` | acento único |
| `--border` | gris muy claro | bordes de tarjeta |
| `--ease-out-soft` | `cubic-bezier(0.22,1,0.36,1)` | entradas y reveals |
| `--ease-spring` | `cubic-bezier(0.34,1.45,0.4,1)` | micro-rebotes (iconos, badges) |

## Componentes disponibles — reúsalos, no inventes otros

**Tipografía**
- `.ap-eyebrow` — etiqueta verde pequeña sobre el título
- `.ap-headline` — titular del hero (clamp 2.5→5rem)
- `.ap-title2` — título de sección (clamp 1.9→3.2rem)
- `.ap-sub` — subtítulo/descripción
- `.ap-link` — link con chevron que se separa al hover

**Contenedores**
- `.ap-card` — tarjeta blanca, borde sutil, se eleva al hover
- `.ap-icon` — círculo de icono (fondo `--accent`, icono verde)
- `.ap-segment` — control segmentado tipo tabs de Apple
- `.ap-input` — input/textarea de formulario
- `.ap-marquee` + `.ap-marquee-track` + `.ap-marquee-item` — cinta de marcas

**Layout estándar de sección**
```tsx
<section data-reveal className="reveal-block py-18 sm:py-24 px-4 sm:px-6">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-12">
      <p className="ap-eyebrow">Beneficios</p>
      <h2 className="ap-title2 mt-3">Título corto en una línea.</h2>
      <p className="ap-sub mt-4 max-w-2xl mx-auto text-base sm:text-lg">Bajada.</p>
    </div>
    {/* contenido */}
  </div>
</section>
```
Alterna el fondo entre nada (blanco) y `bg-muted` para separar secciones — sin bordes
ni divisores extra.

## Animaciones

Dos mecanismos, ambos en `lib/use-scroll-fx.ts`:

**1. Reveal de sección** — `useRevealOnScroll()`
Pon `data-reveal className="reveal-block"` en la `<section>`. El hook añade
`.is-visible` **una sola vez** (nunca lo quites al hacer scroll hacia arriba: eso
causa parpadeo, ya fue un bug). Para escalonar hijos:
```tsx
<div className="ap-card reveal-stagger" style={{ '--stagger': `${i * 120}ms` } as CSSProperties}>
```

**2. Scroll-zoom estilo Apple** — `useScrollFx()`
Pon `data-scrollfx` en el contenedor; el hook escribe `--p` de 0→1 según la posición
en viewport. El CSS lo consume:
- `.ap-media-zoom` — el marco crece y aparece al entrar
- `.ap-media-inner` — la imagen interior hace zoom-out (efecto "respira")

```tsx
<div data-scrollfx className="ap-media-zoom relative rounded-3xl overflow-hidden aspect-[21/9]">
  <div className="ap-media-inner absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
</div>
```

Ambos hooks se llaman una vez arriba del componente de página.

## Estructura compartida

Toda página pública usa:
```tsx
<Header />        // components/header.tsx — link activo automático vía usePathname
{/* secciones */}
<Footer />        // components/footer.tsx — NO dupliques el footer en cada página
```
Iconos sociales: `components/social-icon.tsx` exporta `<SocialIcon name="facebook" />`
y `SOCIAL_LINKS`. Son SVG inline — **no** vuelvas a usar `cdn.simpleicons.org`
(dependencia externa que ya se eliminó).

Links legales: solo existen `/terminos`, `/contacto`, `/about`, `/store`, `/cart`.
No enlaces a `/privacidad` ni `/cookies` — dan 404.

## Antes de dar por terminado

```bash
npx next build          # debe pasar
npx next start -p 3457  # y revisar /, /store, /about, /contacto, /cart
```
Comprueba en el navegador con `Ctrl+Shift+M` (móvil) que nada desborde horizontalmente.

**Trampa conocida:** si borras clases de `globals.css`, Tailwind **no falla el build** —
las páginas que aún las usan simplemente pierden el estilo y quedan rotas en silencio.
Después de tocar `globals.css`, busca usos huérfanos:
```bash
grep -rEo "(ap-|hex-|tilt-|fx-|about-)[a-z0-9-]*" app components | sort -u
```

# Rockink IMM — Arquitectura UX y sistema de diseño

Documento de referencia del rediseño premium de la página de inicio.
Referentes: Tesla, Apple, John Deere, Trimble, Corteva, DeLaval.

---

# FASE 1 — Arquitectura UX

## 1.1 Personas

| # | Perfil | % tráfico estimado | Contexto | Qué necesita | Fricción que lo detiene |
|---|---|---|---|---|---|
| **P1** | **Productor ganadero** — dueño de fundo, 35-60 años | ~70% | Móvil, en campo, señal irregular | Resolver un problema concreto hoy (repuesto, equipo roto, insumo) | Páginas pesadas, formularios largos, no encontrar un teléfono |
| **P2** | **Jefe técnico / gerente de operaciones** de empresa lechera | ~20% | Escritorio, evaluando proveedores | Evidencia de que el proveedor es serio: marcas, casos, respaldo | Falta de credenciales verificables, web que parece improvisada |
| **P3** | **Comprador institucional / distribuidor** | ~10% | Escritorio, compra por volumen | Canal formal, condiciones, capacidad de abastecimiento | No encontrar un canal B2B distinto al de venta minorista |

**Decisión rectora:** P1 manda en *velocidad y acceso* (móvil, WhatsApp siempre visible).
P2 manda en *contenido y prueba* (casos, certificaciones, proceso). El diseño debe servir
a ambos sin que uno estorbe al otro: por eso el contenido de credibilidad va **después**
del acceso directo a acción, nunca antes.

## 1.2 Job to be done

> "Necesito equipar o mantener mi operación ganadera, y necesito confiar en que este
> proveedor sabe de lo que habla y me va a responder rápido."

Dos verbos: **confiar** y **responder**. Todo el diseño se ordena alrededor de esos dos.

## 1.3 Objetivos de conversión (en orden de prioridad)

1. **Contacto por WhatsApp** — es el modelo real del negocio (la web no muestra precios).
2. **Explorar catálogo** (`/store`).
3. **Formulario** — para el lead B2B que no quiere conversación inmediata.

Consecuencia de diseño: el botón de WhatsApp es **persistente** (flotante en todo el
scroll), no una sola aparición.

## 1.4 Arco narrativo de la página

El error clásico de una web industrial es listar secciones sin orden argumental.
Esta página sigue la **escalera de confianza B2B**: emoción → prueba → acción.

```
   IMPACTO          ¿esto es serio?        Hero con video
      ↓
   CREDIBILIDAD     ¿quién los respalda?   Marcas + Cifras
   PRESTADA
      ↓
   CAPACIDAD        ¿qué hacen?            Servicios
      ↓
   MÉTODO           ¿cómo trabajan?        Timeline / Proceso
      ↓
   EVIDENCIA        ¿ya lo hicieron?       Proyectos + Galería
      ↓
   RESPALDO         ¿otros confían?        Clientes + Certificaciones
      ↓
   AUTORIDAD        ¿saben del tema?       Blog técnico
      ↓
   OBJECIONES       ¿y si...?              FAQ
      ↓
   ACCIÓN           quiero hablar          Formulario + Footer
```

## 1.5 Justificación de cada sección

| # | Sección | Por qué existe | Por qué está en esa posición |
|---|---|---|---|
| 1 | **Hero con video** | El video de operación real diferencia de la competencia, que usa fotos de stock. En B2B industrial el movimiento comunica "esto funciona de verdad" en menos de 2 segundos. | Primera pantalla: es la única oportunidad de detener el rebote. |
| 2 | **Barra de marcas** | *Credibilidad prestada*: el visitante no conoce Rockink, pero sí conoce Lister, CRV y Melasty. Transfiere la confianza de esas marcas a la empresa. | Inmediatamente bajo el hero, donde el rebote es más alto. |
| 3 | **Estadísticas animadas** | Cuantifican la escala. El conteo animado al entrar en viewport llama la atención sin ser intrusivo. | Refuerza la credibilidad antes de pedir atención al contenido largo. |
| 4 | **Servicios** | Responde "¿qué me pueden vender?" — la pregunta más frecuente. | Primer bloque de contenido real, cuando el visitante ya decidió quedarse. |
| 5 | **Bloque inmersivo** | Respiro visual entre bloques densos. El scroll-zoom da la sensación premium de Apple. | Corta el ritmo justo antes de la sección más larga. |
| 6 | **Timeline / Proceso** | Reduce la ansiedad de compra. En B2B el *cómo* pesa tanto como el *qué*: saber que hay un método baja el riesgo percibido. | Después de saber qué venden, el visitante quiere saber cómo se trabaja. |
| 7 | **Proyectos** | Prueba concreta. Un caso vale más que diez adjetivos. | Es la evidencia que sostiene lo prometido en Servicios y Proceso. |
| 8 | **Galería** | En el mundo agro la foto de campo convence más que el texto. Usa **fotos reales del catálogo** vía API, no imágenes genéricas. | Complementa Proyectos con evidencia visual rápida de consumir. |
| 9 | **Clientes / Alianzas** | Cierra el ciclo de confianza social. | Tras la evidencia propia, viene la validación externa. |
| 10 | **Certificaciones** | Elimina la última objeción racional de P2 y P3. | Justo antes del contenido opcional: quien llegó aquí está evaluando en serio. |
| 11 | **Blog técnico** | Demuestra expertise (señal E-E-A-T) y genera tráfico orgánico. | Contenido opcional: no estorba a quien ya quiere contactar. |
| 12 | **FAQ** | Elimina fricción previa al contacto y reduce consultas repetidas por WhatsApp. Acordeón para no inflar la página. | Última barrera antes del formulario. |
| 13 | **Formulario + CTA** | Captura al lead que no quiere conversación inmediata (P2 y P3). | Cierre natural: todas las objeciones ya fueron resueltas. |
| 14 | **Footer premium** | Navegación de rescate para quien llegó al final sin decidir, más datos legales y de contacto. | Fin de página. |

## 1.6 Estrategia móvil

70% del tráfico es P1 en campo con señal limitada. Esto **no** es "hacer que quepa en
pantalla chica", es un conjunto de decisiones distintas:

- **Video hero:** móvil recibe `hero-mobile.mp4` (520 KB), escritorio el archivo grande.
  Ambos con `poster` para que la primera pantalla se pinte sin esperar al video.
- **Animaciones:** todas desactivadas bajo `pointer: coarse` y `prefers-reduced-motion`.
  Una animación que corre siempre castiga la batería y la GPU en gama baja.
- **WhatsApp flotante** siempre visible: para P1 es el atajo, no un adorno.
- **Timeline:** vertical en móvil, horizontal en escritorio.
- **Galería:** 2 columnas en móvil, mosaico en escritorio.
- **Ninguna animación de entrada bloquea el contenido.** Se eliminó la intro que tapaba
  la página: un sitio premium no pone una puerta antes del contenido (Tesla y Apple no lo hacen).

---

# FASE 2 — Especificación de diseño ("Figma mental")

## 2.1 Dirección de arte

Los referentes se dividen en dos familias:

- **Tesla / DeLaval** → oscuro, cinematográfico, producto como protagonista.
- **Apple / Trimble / Corteva** → claro, mucho aire, tipografía grande, técnico y limpio.

**Decisión:** base **clara dominante** con **anclas oscuras cinematográficas**.
El contraste entre ambas *es* la señal premium — una web toda clara se ve genérica,
una toda oscura cansa en lectura larga.

- Claro (blanco / `#f5f5f7`): servicios, proyectos, blog, FAQ — todo lo que se lee.
- Oscuro (`#0a0d0c`): hero, bloque inmersivo, CTA final — todo lo que impacta.
- Verde de marca: **acento único**, nunca fondo de sección completa.

Esto respeta la paleta monótona clara ya elegida y le añade el drama que faltaba.

## 2.2 Implementación del modo oscuro por sección

En lugar de duplicar clases para fondo oscuro, `.ap-dark` **redefine los tokens
localmente**:

```css
.ap-dark {
  --foreground: casi blanco;
  --muted-foreground: gris claro;
  --card: gris muy oscuro;
  --border: gris oscuro;
  background: #0a0d0c;
}
```

Así `.ap-card`, `.ap-title2` y cualquier utilidad basada en tokens se adaptan solas.
Un componente, dos contextos, cero duplicación.

## 2.3 Escala tipográfica (Geist)

| Rol | Tamaño | Peso | Tracking |
|---|---|---|---|
| Display (hero) | `clamp(2.75rem, 7vw, 5.5rem)` | 700 | -0.045em |
| H2 sección | `clamp(2rem, 4.5vw, 3.4rem)` | 700 | -0.035em |
| H3 tarjeta | 1.125rem | 600 | -0.01em |
| Cuerpo | 1rem / 1.65 | 400 | 0 |
| **Overline** | 0.75rem | 600 | **0.2em**, mayúsculas |

El *overline* es la firma "ingeniería": Trimble y Corteva lo usan para etiquetar
secciones con aire técnico. Es el detalle que más aporta al carácter con menos costo.

## 2.4 Retícula y espaciado

- Base de 8 px. Contenedor `1200px`, gutter 24 px.
- Padding vertical de sección: **96 px móvil → 160 px escritorio**.
  El aire generoso es el marcador de lujo más barato que existe.
- Radios: 20 px tarjetas, 28 px marcos de medios.

## 2.5 Especificación de movimiento

| Efecto | Parámetros | Dónde |
|---|---|---|
| Reveal de sección | `translateY(28px)` + opacidad, 900 ms, `cubic-bezier(0.22,1,0.36,1)` | Todas las secciones |
| Escalonado de hijos | 90 ms entre elementos | Grids de tarjetas |
| Scroll-zoom | `scale(0.93 → 1)` según `--p` (0-1) | Marcos de imagen y video |
| Contadores | ease-out cúbico, 1500 ms, **una sola vez** | Estadísticas |
| Hover tarjeta | `translateY(-5px)`, 400 ms | Tarjetas |
| Marquee | 30 s lineal, pausa en hover | Barra de marcas |

**Regla:** ninguna animación infinita salvo el marquee. Todo lo demás se dispara por
scroll o por hover, y todo se apaga bajo `prefers-reduced-motion`.

El reveal ocurre **una sola vez** (`unobserve` tras disparar): re-animar al subir
produce parpadeo, un bug que este proyecto ya tuvo.

## 2.6 Iconografía

`lucide-react`, trazo 1.5, 24 px. Línea fina y geométrica — el lenguaje visual de
Trimble y Corteva. Nunca iconos rellenos ni emoji.

## 2.7 Inventario de componentes

| Componente | Composición |
|---|---|
| `ap-overline` | Etiqueta técnica en mayúsculas |
| `ap-stat` | Número grande + label |
| `ap-service-card` | Icono + título + descripción + flecha al hover |
| `ap-timeline-item` | Índice + línea conectora + contenido |
| `ap-project-card` | Imagen + degradado + meta superpuesta |
| `ap-gallery-tile` | Marco con zoom al hover |
| `ap-cert-card` | Icono + título + detalle |
| `ap-post-card` | Categoría + título + extracto + enlace |
| `ap-faq-item` | Acordeón con altura animada |

---

---

# Especificación de imágenes

Todas las rutas se configuran en `IMAGES`, dentro de `lib/home-content.ts`.
Basta con dejar el archivo en `/public` y apuntar ahí.

| Slot | Medida mínima | Proporción | Peso máx. | Qué debe mostrar |
|---|---|---|---|---|
| `heroPoster` | **1920 × 1080** | 16:9 | 300 KB | Primer fotograma del video. Se ve mientras el video carga, así que debe empatar con él. |
| `showcase` | **2560 × 1440** | 16:9 | 500 KB | **La foto más importante del sitio.** Llega a pantalla completa. El motivo debe estar **centrado**. |
| `projects[]` (×3) | 1000 × 1250 | 4:5 vertical | 250 KB c/u | Una foto por caso. Trabajo real, no producto aislado. |
| `gallery[]` (×6–8) | 1200 × 1200 | 1:1 | 200 KB c/u | Equipo, campo, personas trabajando. Con 6 o más pasa sola a mosaico. |
| Video del hero | 1920 × 1080 | 16:9 | **3 MB** | 10–20 s en bucle, sin audio, sin cortes bruscos. |

**Formato:** WebP o JPG con calidad 80. WebP pesa un 30 % menos con la misma calidad.

## Dirección de arte de las fotos

Lo que separa una web premium de una común no es el código, son las fotos. Cuatro reglas:

1. **Luz natural, hora dorada.** Nada de flash directo ni mediodía plano.
2. **Manos y personas trabajando**, no producto aislado sobre fondo blanco. El
   producto aislado va en la tienda; la home vende oficio.
3. **Espacio negativo** en la parte inferior de las fotos anchas: ahí se superpone
   el texto. Una foto con el motivo en el centro-arriba funciona mucho mejor.
4. **Coherencia de temperatura de color** entre todas. Fotos con dominantes
   distintas (una azulada, otra amarilla) rompen la sensación de sistema.

## Opción avanzada: secuencia de imágenes

Para el efecto tipo Apple donde un objeto rota mientras haces scroll hace falta una
**secuencia numerada de 60–120 fotogramas** (`equipo-001.webp` … `equipo-120.webp`),
del mismo objeto girando sobre fondo uniforme, a 1600 px de ancho y ~80 KB por
fotograma. Es la animación de scroll más impresionante que existe, pero requiere
sesión de fotos con plato giratorio o render 3D. Si algún día hay ese material, la
sección de scroll fijo ya está preparada para recibirlo.

---

## Contenido a reemplazar

Todo el texto vive en **`lib/home-content.ts`**, en un solo archivo editable.

⚠️ **Antes de publicar, revisar obligatoriamente:**

- **`CERTIFICATIONS`** — son textos de respaldo genéricos. Reemplazar por las
  certificaciones reales de la empresa. **No publicar certificaciones que no se posean.**
- **`PROJECTS`** — casos ilustrativos sin cliente nombrado. Sustituir por proyectos
  reales, idealmente con autorización del cliente para nombrarlo.
- **`POSTS`** — artículos de ejemplo. Reemplazar por contenido propio.

Datos que **sí** son reales y se leen de fuentes existentes: marcas (`/api/site-config`),
fotos y total del catálogo (`/api/products`), teléfono, correo y dirección.

/**
 * Contenido editable de la pagina de inicio.
 *
 * Todo el texto de la home vive aqui para que se pueda cambiar sin tocar el diseno.
 *
 * REVISAR ANTES DE PUBLICAR:
 *  - CERTIFICATIONS: textos de respaldo genericos. Reemplazar por las certificaciones
 *    reales de la empresa. No publicar certificaciones que no se posean.
 *  - PROJECTS: casos ilustrativos, sin cliente nombrado. Sustituir por proyectos reales.
 *  - POSTS: articulos de ejemplo. Reemplazar por contenido propio.
 *
 * Las marcas, las fotos del catalogo y el total de productos NO estan aqui:
 * se leen en vivo desde /api/site-config y /api/products.
 */

/**
 * IMAGENES DE LA HOME
 *
 * Para cambiar una imagen basta con reemplazar el archivo en /public manteniendo
 * el mismo nombre, o apuntar aqui a un archivo nuevo.
 *
 * Especificaciones recomendadas de cada slot: ver docs/UX-ARCHITECTURE.md
 * (seccion "Especificacion de imagenes").
 */
export const IMAGES = {
  /** Primer fotograma del video del hero. Se ve mientras el video carga. */
  heroPoster: '/1.png',
  /**
   * Foto de la seccion con scroll fijo. Es LA imagen del sitio: llega a ocupar
   * la pantalla completa. Importante: el motivo debe estar CENTRADO, porque al
   * inicio se ve recortada en una ventana central y se va abriendo.
   */
  showcase: '/3.png',
  /** Una foto vertical por proyecto, en el mismo orden que PROJECTS. */
  projects: ['/3.png', '/1.png', '/2.png'],
  /**
   * Galeria. Con 6 o mas fotos el diseno cambia solo a mosaico;
   * con menos, se muestra en cuadricula regular.
   */
  gallery: ['/3.png', '/1.png', '/2.png'],
};

export const HERO = {
  overline: 'Ingenieria Ganadera',
  title: 'Precision que se mide en el campo.',
  description:
    'Ingenieria, equipamiento y soporte tecnico para operaciones ganaderas que no pueden detenerse.',
  primaryCta: { label: 'Hablar con un asesor', href: '/contacto' },
  secondaryCta: { label: 'Conocer la empresa', href: '/about' },
};

/** Seccion de scroll fijo: el texto cambia mientras la imagen se abre a pantalla completa. */
export const SHOWCASE = {
  overline: 'Precision',
  title: 'Cada decision tecnica se nota en la operacion.',
  description:
    'Elegir bien el equipo, el insumo y el momento cambia el resultado de la campana. Eso es lo que hacemos.',
  markers: [
    'Diagnostico en campo',
    'Criterio tecnico, no catalogo',
    'Soporte que responde',
  ],
};

export const STATS = [
  { value: 5000, suffix: '+', label: 'Clientes atendidos' },
  { value: 5, suffix: '+', label: 'Departamentos con cobertura' },
  { value: 24, suffix: '/7', label: 'Canal de soporte' },
];

export const SERVICES = [
  {
    icon: 'Droplets',
    title: 'Sistemas de ordeño',
    description:
      'Equipos, pezoneras, pulsadores y repuestos para salas de ordeño. Seleccion segun tamano de hato y rutina real de trabajo.',
  },
  {
    icon: 'Dna',
    title: 'Genetica bovina',
    description:
      'Material genetico, pajillas e insumos de inseminacion con cadena de frio y trazabilidad.',
  },
  {
    icon: 'Scissors',
    title: 'Esquila y manejo',
    description:
      'Maquinas de esquila, peines, cuchillas y herramientas de manejo animal de marcas internacionales.',
  },
  {
    icon: 'Wrench',
    title: 'Repuestos y mantenimiento',
    description:
      'Stock de repuestos criticos para que una falla no detenga la operacion mas de lo necesario.',
  },
  {
    icon: 'ClipboardCheck',
    title: 'Asesoria tecnica',
    description:
      'Acompanamiento para elegir el equipo correcto segun la necesidad real, no segun el catalogo.',
  },
  {
    icon: 'Truck',
    title: 'Logistica y despacho',
    description:
      'Despacho desde Arequipa a todo el Peru, con seguimiento del pedido por WhatsApp.',
  },
];

export const PROCESS = [
  {
    step: 'Diagnostico',
    title: 'Entendemos la operacion',
    description:
      'Revisamos tamano de hato, infraestructura existente y rutina de trabajo antes de recomendar nada.',
  },
  {
    step: 'Seleccion',
    title: 'Elegimos con criterio tecnico',
    description:
      'Proponemos equipos e insumos que encajan con la operacion real y el presupuesto disponible.',
  },
  {
    step: 'Implementacion',
    title: 'Entregamos y ponemos en marcha',
    description:
      'Coordinamos despacho, entrega e instrucciones de uso para que el equipo entre en produccion sin friccion.',
  },
  {
    step: 'Soporte',
    title: 'Acompanamos despues de la venta',
    description:
      'Repuestos, consultas tecnicas y seguimiento por un canal directo que responde.',
  },
];

/** ⚠️ Casos ilustrativos. Reemplazar por proyectos reales antes de publicar. */
export const PROJECTS = [
  {
    category: 'Sala de ordeño',
    title: 'Equipamiento de sala de ordeño',
    location: 'Arequipa',
    description:
      'Implementacion de linea de ordeño con seleccion de pulsadores y pezoneras segun el hato.',
  },
  {
    category: 'Genetica',
    title: 'Programa de mejoramiento genetico',
    location: 'Sur del Peru',
    description:
      'Abastecimiento de material genetico e insumos de inseminacion con cadena de frio.',
  },
  {
    category: 'Manejo',
    title: 'Renovacion de equipos de esquila',
    location: 'Sierra sur',
    description:
      'Reemplazo de maquinas y consumibles para reducir tiempos de faena en campana.',
  },
];

export const PARTNERSHIP_NOTE = {
  overline: 'Alianzas',
  title: 'Trabajamos con marcas que el campo ya conoce.',
  description:
    'Representamos lineas internacionales probadas en operaciones ganaderas reales. La marca respalda el equipo; nosotros respaldamos la eleccion.',
};

/**
 * ⚠️ IMPORTANTE: estos son compromisos de servicio, NO certificaciones acreditadas.
 * Reemplazar por las certificaciones reales de la empresa (con su entidad emisora)
 * antes de publicar. No publicar certificaciones que no se posean.
 */
export const CERTIFICATIONS = [
  {
    icon: 'ShieldCheck',
    title: 'Garantia de fabrica',
    description: 'Equipos cubiertos por la garantia de cada marca representada.',
  },
  {
    icon: 'BadgeCheck',
    title: 'Producto original',
    description: 'Insumos y repuestos de linea original, con trazabilidad de origen.',
  },
  {
    icon: 'Thermometer',
    title: 'Cadena de frio',
    description: 'Manejo de material genetico con control de temperatura documentado.',
  },
  {
    icon: 'LifeBuoy',
    title: 'Soporte post-venta',
    description: 'Canal directo de consulta tecnica despues de la entrega.',
  },
];

/** ⚠️ Articulos de ejemplo. Reemplazar por contenido propio. */
export const POSTS = [
  {
    slug: 'rutina-de-ordeno',
    category: 'Ordeño',
    readingTime: '4 min',
    title: 'Como una rutina de ordeño constante protege la calidad de leche',
    excerpt:
      'El orden y los tiempos de la rutina influyen tanto como el equipo. Que revisar antes de cambiar de maquina.',
    body: [
      'La calidad de leche depende de tres factores que se refuerzan entre si: el estado del equipo, la rutina del operario y la salud de la ubre. Cambiar el equipo sin corregir la rutina rara vez resuelve el problema de fondo.',
      'Antes de invertir en equipamiento nuevo conviene medir los tiempos reales de la rutina actual: preparacion, colocacion, tiempo de ordeño efectivo y retiro. Si los tiempos varian mucho entre operarios, el problema es de procedimiento.',
      'Una vez estabilizada la rutina, el cambio de equipo si produce una mejora medible. Ese es el momento correcto para invertir.',
    ],
  },
  {
    slug: 'mantenimiento-pezoneras',
    category: 'Mantenimiento',
    readingTime: '3 min',
    title: 'Cuando reemplazar pezoneras: senales que no conviene ignorar',
    excerpt:
      'Las pezoneras tienen vida util contada en ordeños, no en meses. Como llevar el control sin complicarse.',
    body: [
      'Las pezoneras de goma tienen una vida util que se cuenta en numero de ordeños, no en tiempo de calendario. Pasado ese punto pierden elasticidad y el ordeño se vuelve mas lento e irregular.',
      'Las senales tempranas son perdida de firmeza al presionar, grietas finas en la superficie interna y aumento del tiempo de ordeño sin causa aparente.',
      'Llevar un registro simple de fecha de instalacion y numero aproximado de ordeños diarios permite anticipar el reemplazo antes de que afecte la produccion.',
    ],
  },
  {
    slug: 'cadena-de-frio-genetica',
    category: 'Genetica',
    readingTime: '5 min',
    title: 'Cadena de frio en material genetico: donde se pierde mas',
    excerpt:
      'El punto critico casi nunca es el transporte largo, sino los traspasos cortos. Que controlar en cada paso.',
    body: [
      'El material genetico bovino se conserva en nitrogeno liquido. La perdida de viabilidad casi nunca ocurre durante el transporte principal, que suele estar bien controlado, sino en los traspasos cortos entre termos.',
      'Cada exposicion al aire, por breve que sea, eleva la temperatura de la pajilla. Repetida varias veces, esa exposicion acumulada compromete la viabilidad sin que haya ninguna senal visible.',
      'La practica correcta es trabajar siempre por debajo del cuello del termo, minimizar el tiempo de manipulacion y mantener el nivel de nitrogeno controlado con revision periodica.',
    ],
  },
];

export const FAQS = [
  {
    question: 'Por que la web no muestra precios?',
    answer:
      'Los precios dependen de volumen, disponibilidad y condiciones de despacho. Preferimos cotizar caso por caso para dar un precio real y no uno referencial que despues cambia. La cotizacion se coordina por WhatsApp y suele tomar pocos minutos.',
  },
  {
    question: 'Hacen envios fuera de Arequipa?',
    answer:
      'Si. Despachamos desde Arequipa a todo el Peru. El costo y el tiempo dependen del destino y del volumen del pedido; se confirman antes de cerrar la compra.',
  },
  {
    question: 'Los productos publicados estan siempre en stock?',
    answer:
      'El catalogo se actualiza segun disponibilidad real, pero el stock se mueve. Al cotizar confirmamos disponibilidad antes de comprometer una entrega.',
  },
  {
    question: 'Atienden compras por volumen o proyectos?',
    answer:
      'Si. Para compras por volumen, equipamiento completo o proyectos especiales asignamos atencion directa con condiciones distintas a la venta regular. Conviene escribir por el formulario detallando el alcance.',
  },
  {
    question: 'Que pasa si un equipo falla despues de la entrega?',
    answer:
      'Los equipos estan cubiertos por la garantia de la marca correspondiente. Ante una falla, el primer paso es escribir por WhatsApp describiendo el problema para orientar el diagnostico y coordinar repuesto o gestion de garantia.',
  },
  {
    question: 'Dan asesoria antes de comprar?',
    answer:
      'Si, y es parte del servicio. Preferimos entender el tamano del hato, la infraestructura y la rutina antes de recomendar un equipo. Recomendar de mas no ayuda a nadie.',
  },
];

export const CONTACT = {
  whatsapp: '51962838329',
  whatsappDisplay: '+51 962 838 329',
  email: 'contacto@rockinkimm.com',
  address: 'Av. Lambramani E-17, Urb. Mariano Bustamante, Mariano Melgar — Arequipa, Peru',
};

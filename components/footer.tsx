import Link from 'next/link';
import { SocialIcon, SOCIAL_LINKS } from '@/components/social-icon';

export function Footer() {
  return (
    <footer className="bg-muted border-t border-border py-12 sm:py-14 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo-mark.png" alt="Rockink IMM" width={32} height={32} className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-foreground">Rockink IMM</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Soluciones de ingenieria ganadera enfocadas en productividad, bienestar animal e innovacion continua.
            </p>
            <div className="flex gap-2.5 mt-5">
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

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Productos</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/store" className="footer-link">Catalogo Completo</Link></li>
              <li><Link href="/store#products" className="footer-link">Categorias</Link></li>
              <li><Link href="/about" className="footer-link">Sobre Nosotros</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Soporte</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/contacto" className="footer-link">Centro de Ayuda</Link></li>
              <li><Link href="/contacto#faq" className="footer-link">Preguntas Frecuentes</Link></li>
              <li><Link href="/blog" className="footer-link">Notas tecnicas</Link></li>
              <li><Link href="/terminos" className="footer-link">Terminos y Condiciones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Contacto</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href="mailto:contacto@rockinkimm.com" className="footer-link">contacto@rockinkimm.com</a>
              </li>
              <li>
                <a href="https://wa.me/51962838329" target="_blank" rel="noreferrer" className="footer-link">
                  +51 962 838 329
                </a>
              </li>
              <li className="text-xs leading-relaxed pt-1">
                Av. Lambramani E-17, Urb. Mariano Bustamante, Mariano Melgar — Arequipa, Peru
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Rockink IMM. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground/70 text-xs">
            <span>Ingenieria ganadera · Innovacion y calidad</span>
            <span>·</span>
            <Link href="/admin/login" className="hover:text-foreground transition-colors">
              Acceso interno
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

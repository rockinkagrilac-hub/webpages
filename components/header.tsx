'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, Menu, X, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  isAdmin?: boolean;
  /** 'dark' se usa en páginas con fondo oscuro (home futurista) */
  variant?: 'light' | 'dark';
}

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/store', label: 'Tienda' },
  { href: '/about', label: 'Sobre Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export function Header({ isAdmin = false, variant = 'light' }: HeaderProps) {
  const isDark = variant === 'dark';
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className={`site-header ${isDark ? 'site-header--dark' : ''} ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link
            href={isAdmin ? '/admin' : '/'}
            className="flex items-center gap-2.5 font-bold text-xl group"
            onClick={closeMobileMenu}
          >
            <img
              src="/logo-mark.png"
              alt="Rockink IMM"
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl group-hover:scale-110 transition-transform duration-300"
            />
            <span
              className={`hidden sm:inline bg-clip-text text-transparent font-bold ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-300 to-lime-200'
                  : 'bg-gradient-to-r from-primary to-secondary'
              }`}
            >
              Rockink IMM
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {!isAdmin &&
              NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive(item.href) ? 'is-active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            {isAdmin && (
              <>
                <Link href="/admin" className="nav-link">
                  Panel
                </Link>
                <Link href="/admin" className="nav-link">
                  Gestionar
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isAdmin && (
              <Link href="/cart" onClick={closeMobileMenu}>
                <Button
                  size="sm"
                  className="relative bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-3 sm:px-4 py-2 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="cart-badge absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {isAdmin && (
              <Link href="/admin/logout" onClick={closeMobileMenu}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-primary hover:text-primary transition-all duration-200 bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </Link>
            )}

            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isDark ? 'text-emerald-50 hover:bg-white/10' : 'hover:bg-muted'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className={`mobile-menu-panel md:hidden mt-4 pt-4 pb-2 border-t flex flex-col gap-1 ${isDark ? 'border-white/10' : 'border-border'}`}>
            {!isAdmin && (
              <>
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`py-2.5 px-3 rounded-lg transition-colors duration-200 text-sm font-medium ${
                      isActive(item.href)
                        ? isDark
                          ? 'bg-emerald-400/10 text-emerald-300 font-semibold'
                          : 'bg-primary/10 text-primary font-semibold'
                        : isDark
                        ? 'text-emerald-50/85 hover:bg-white/5'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/cart"
                  onClick={closeMobileMenu}
                  className={`py-2.5 px-3 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-between ${
                    isActive('/cart')
                      ? isDark
                        ? 'bg-emerald-400/10 text-emerald-300 font-semibold'
                        : 'bg-primary/10 text-primary font-semibold'
                      : isDark
                      ? 'text-emerald-50/85 hover:bg-white/5'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span>Mi Carrito</span>
                  {totalItems > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-bold">{totalItems}</span>
                  )}
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link href="/admin" onClick={closeMobileMenu} className="py-2.5 px-3 hover:bg-muted rounded-lg transition-colors duration-200 text-sm font-medium">
                  Panel
                </Link>
                <Link href="/admin" onClick={closeMobileMenu} className="py-2.5 px-3 hover:bg-muted rounded-lg transition-colors duration-200 text-sm font-medium">
                  Gestionar
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

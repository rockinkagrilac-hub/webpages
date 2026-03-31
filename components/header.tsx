'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  isAdmin?: boolean;
}

export function Header({ isAdmin = false }: HeaderProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href={isAdmin ? '/admin' : '/'} className="flex items-center gap-2 font-bold text-xl hover:opacity-75 transition-all duration-200 group" onClick={closeMobileMenu}>
            <img src="/logoempresa.png" alt="Rockink IMM" className="w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Rockink IMM</span>
          </Link>

          <nav className="hidden md:flex items-center gap-12">
            {!isAdmin && (
              <>
                <Link href="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200">
                  Inicio
                </Link>
                <Link href="/store" className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200">
                  Tienda Completa
                </Link>
                <Link href="/about" className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200">
                  Sobre Nosotros
                </Link>
                <Link href="/contacto" className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200">
                  Contacto
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link href="/admin" className="text-sm font-medium hover:text-secondary transition-colors duration-200">
                  Panel
                </Link>
                <Link href="/admin" className="text-sm font-medium hover:text-secondary transition-colors duration-200">
                  Gestionar
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isAdmin && (
              <>
                <Link href="/cart" onClick={closeMobileMenu}>
                  <Button size="sm" className="relative bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-3 sm:px-4 py-2 transition-all duration-200 font-semibold shadow-sm hover:shadow-md">
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            )}

            {isAdmin && (
              <Link href="/admin/logout" onClick={closeMobileMenu}>
                <Button variant="outline" size="sm" className="border-primary-foreground/30 hover:border-primary-foreground hover:bg-primary/50 text-primary-foreground transition-all duration-200 bg-transparent">
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </Link>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 pb-2 border-t border-primary/20 flex flex-col gap-2">
            {!isAdmin && (
              <>
                <Link href="/" onClick={closeMobileMenu} className="py-2 px-3 hover:bg-primary/50 rounded-lg transition-colors duration-200 text-sm font-medium">
                  Inicio
                </Link>
                <Link href="/store" onClick={closeMobileMenu} className="py-2 px-3 hover:bg-primary/50 rounded-lg transition-colors duration-200 text-sm font-medium">
                  Tienda
                </Link>
                <Link href="/about" onClick={closeMobileMenu} className="py-2 px-3 hover:bg-primary/50 rounded-lg transition-colors duration-200 text-sm font-medium">
                  Sobre Nosotros
                </Link>
                <Link href="/contacto" onClick={closeMobileMenu} className="py-2 px-3 hover:bg-primary/50 rounded-lg transition-colors duration-200 text-sm font-medium">
                  Contacto
                </Link>
                <Link href="/cart" onClick={closeMobileMenu} className="py-2 px-3 hover:bg-primary/50 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-between">
                  <span>Mi Carrito</span>
                  {totalItems > 0 && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{totalItems}</span>}
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link href="/admin" onClick={closeMobileMenu} className="py-2 px-3 hover:bg-primary/50 rounded-lg transition-colors duration-200 text-sm font-medium">
                  Panel
                </Link>
                <Link href="/admin" onClick={closeMobileMenu} className="py-2 px-3 hover:bg-primary/50 rounded-lg transition-colors duration-200 text-sm font-medium">
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

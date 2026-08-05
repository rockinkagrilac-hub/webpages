'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CartProvider } from '@/lib/cart-context';
import { POSTS } from '@/lib/home-content';
import { ChevronRight } from 'lucide-react';

function BlogContent() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-28 sm:pt-36 pb-14 px-5 sm:px-6">
        <div className="ap-shell max-w-3xl">
          <p className="ap-overline">Conocimiento</p>
          <h1 className="ap-headline mt-5">Notas tecnicas del campo.</h1>
          <p className="ap-sub mt-5">
            Apuntes practicos sobre ordeño, mantenimiento de equipos y manejo de material
            genetico, escritos para quien trabaja en la operacion.
          </p>
        </div>
      </section>

      <section className="pb-24 sm:pb-32 px-5 sm:px-6">
        <div className="ap-shell max-w-3xl space-y-16 sm:space-y-24">
          {POSTS.map((post) => (
            <article key={post.slug} id={post.slug} className="scroll-mt-28">
              <div className="ap-post-meta">
                <span>{post.category}</span>
                <span>·</span>
                <span>{post.readingTime} de lectura</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {post.title}
              </h2>

              <div className="mt-6 space-y-5">
                {post.body.map((paragraph, index) => (
                  <p key={index} className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <Link href="/contacto" className="ap-link">
                  Consultar con un asesor
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <CartProvider>
      <BlogContent />
    </CartProvider>
  );
}

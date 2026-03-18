import { Header } from '@/components/header';
import { CartProvider } from '@/lib/cart-context';

function TermsContent() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-24 sm:pt-28 md:pt-32 pb-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">Terminos y condiciones</h1>
            <p className="text-sm text-muted-foreground mt-3">
              Ultima actualizacion: 14/03/2026
            </p>

            <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-base font-semibold text-foreground">1. Alcance</h2>
                <p>
                  Estos terminos regulan el uso de la web de Rockink IMM y los contactos comerciales
                  generados desde la plataforma. Al usar el sitio, aceptas estos terminos.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">2. Informacion publicada</h2>
                <p>
                  La informacion de productos, disponibilidad y contenido puede cambiar sin previo aviso.
                  La confirmacion final se realiza por contacto directo con nuestro equipo.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">3. Uso de WhatsApp y formularios</h2>
                <p>
                  Al enviar un formulario o abrir WhatsApp aceptas que usemos tus datos para contactarte
                  y brindarte soporte comercial o tecnico.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">4. Propiedad intelectual</h2>
                <p>
                  El contenido visual y textual de la web pertenece a Rockink IMM o a sus proveedores.
                  No se permite su uso sin autorizacion previa.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">5. Limitacion de responsabilidad</h2>
                <p>
                  No garantizamos disponibilidad continua del sitio ni ausencia de errores. Cualquier
                  decision de compra se valida por canal oficial.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">6. Contacto</h2>
                <p>
                  Para consultas legales, escribenos a contacto@rockinkimm.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function TermsPage() {
  return (
    <CartProvider>
      <TermsContent />
    </CartProvider>
  );
}

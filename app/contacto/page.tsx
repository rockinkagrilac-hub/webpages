'use client';

import { CartProvider } from '@/lib/cart-context';
import { Header } from '@/components/header';
import { ContactSectionV2 } from '@/components/contact-section-v2';

function ContactPageContent() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ContactSectionV2 />
    </div>
  );
}

export default function ContactPage() {
  return (
    <CartProvider>
      <ContactPageContent />
    </CartProvider>
  );
}

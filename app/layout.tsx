import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rockink IMM - Ingenieria Ganadera',
  description: 'Plataforma especializada en ingenieria ganadera, equipos tecnicos e insumos para operaciones pecuarias.',
  generator: 'v0.app',
  icons: {
    icon: '/icon-64.png',
    shortcut: '/icon-64.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#14532d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="font-sans antialiased">
        {/* Un solo carrito para todo el sitio: antes cada página montaba el suyo
            y el contador del header parpadeaba en cero al navegar. */}
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  )
}

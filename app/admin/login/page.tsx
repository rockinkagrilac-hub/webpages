'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

function LoginContent() {
  const { login, isLoggedIn, isMounted } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirected, setRedirected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && isMounted && !redirected) {
      setRedirected(true);
      router.push('/admin');
    }
  }, [isLoggedIn, isMounted, redirected, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (login(username, password)) {
        router.push('/admin');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
      setLoading(false);
    }, 500);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="text-primary-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-0 shadow-2xl">
          <CardContent className="pt-8">
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-primary/10 rounded-lg mb-4">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-primary">Panel Admin</h1>
              <p className="text-muted-foreground mt-2">Rockink IMM</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
              >
                {loading ? 'Verificando...' : 'Ingresar al Panel'}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Â© 2026 Rockink IMM - Panel de AdministraciÃ³n
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}


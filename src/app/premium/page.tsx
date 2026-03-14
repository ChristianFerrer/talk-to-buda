'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PremiumContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!token) {
      setError('Enlace inválido. Escribe a Buda para obtener un enlace de Premium.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Token expired') {
          setError('Este enlace ha expirado. Escribe a Buda para obtener uno nuevo.');
        } else {
          setError(data.error || 'Error al procesar. Intenta de nuevo.');
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-gray-900 mb-4">
          Habla con Buda
          <span className="block text-2xl sm:text-3xl text-sage-600 mt-2">Premium</span>
        </h1>

        <p className="text-lg text-gray-500 font-light mb-2">
          Continúa tu conversación sin límites.
        </p>
        <p className="text-base text-gray-400 font-light mb-12 leading-relaxed">
          Accede a una experiencia más profunda por 4€ al mes.
        </p>

        <p className="text-gray-500 font-light mb-10 leading-relaxed max-w-md mx-auto">
          Cuando la mente necesita claridad, a veces una sola conversación no basta. Con Premium puedes seguir dialogando con Buda sin límite diario.
        </p>

        {/* Benefits */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-10 text-left">
          <div className="space-y-4">
            <Benefit text="Conversaciones ilimitadas por WhatsApp" />
            <Benefit text="Reflexiones más profundas cuando más lo necesites" />
            <Benefit text="Acceso continuo a tu espacio de calma" />
            <Benefit text="Cancela cuando quieras" />
          </div>
        </div>

        {/* Price */}
        <div className="mb-8">
          <p className="text-4xl font-light text-gray-900">4€<span className="text-lg text-gray-400"> / mes</span></p>
          <div className="flex justify-center gap-4 mt-3 text-sm text-gray-400">
            <span>Suscripción mensual</span>
            <span>·</span>
            <span>Sin permanencia</span>
            <span>·</span>
            <span>Cancela cuando quieras</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full sm:w-auto bg-sage-600 hover:bg-sage-700 disabled:bg-gray-300 text-white px-10 py-4 rounded-2xl text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none"
        >
          {loading ? 'Procesando...' : 'Activar Premium'}
        </button>

        {error && (
          <p className="mt-4 text-red-500 text-sm">{error}</p>
        )}

        {/* Cancellation info */}
        <p className="mt-6 text-xs text-gray-400">
          Para cancelar, escribe &ldquo;cancelar premium&rdquo; a Buda en WhatsApp en cualquier momento.
        </p>

        {/* Trust note */}
        <p className="mt-12 text-xs text-gray-300 max-w-sm mx-auto">
          Esto no reemplaza ayuda profesional. Habla con Buda es un espacio de reflexión personal y calma.
        </p>

        {/* Mini FAQ */}
        <div className="mt-16 text-left space-y-6">
          <FaqItem
            question="¿Qué incluye Premium?"
            answer="Conversaciones ilimitadas con Buda por WhatsApp mientras tu suscripción esté activa."
          />
          <FaqItem
            question="¿Puedo cancelar cuando quiera?"
            answer="Sí, puedes cancelar en cualquier momento escribiendo 'cancelar premium' a Buda en WhatsApp."
          />
          <FaqItem
            question="¿Cómo se activa mi acceso?"
            answer="Después del pago, tu número quedará habilitado automáticamente."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center">
        <div className="flex justify-center gap-6 text-xs text-gray-400">
          <a href="/" className="hover:text-gray-600 transition-colors">Inicio</a>
          <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacidad</a>
          <a href="/terms" className="hover:text-gray-600 transition-colors">Términos</a>
        </div>
      </footer>
    </main>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </main>
    }>
      <PremiumContent />
    </Suspense>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-sage-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <p className="text-gray-600 font-light">{text}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="text-gray-700 font-medium mb-1 text-sm">{question}</h3>
      <p className="text-gray-400 font-light text-sm leading-relaxed">{answer}</p>
    </div>
  );
}

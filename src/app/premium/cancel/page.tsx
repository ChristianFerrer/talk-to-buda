export default function PremiumCancel() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-warm-100 flex items-center justify-center">
          <span className="text-3xl">☸</span>
        </div>

        <h1 className="text-3xl font-light text-gray-900 mb-4">
          No se completó la activación
        </h1>

        <p className="text-gray-500 font-light leading-relaxed mb-4">
          No pasa nada. Si deseas, puedes volver a intentarlo cuando estés listo.
        </p>
        <p className="text-sm text-gray-400 mb-10">
          Mientras tanto, puedes seguir hablando con Buda gratis (7 mensajes al día).
        </p>

        <a
          href="/premium"
          className="inline-block bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Intentar de nuevo
        </a>

        <div className="mt-8">
          <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Volver al inicio
          </a>
        </div>
      </div>
    </main>
  );
}

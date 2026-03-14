export default function PremiumCancel() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-warm-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-warm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1 className="text-3xl font-light text-gray-900 mb-4">
          Tu activación no se completó
        </h1>

        <p className="text-gray-500 font-light leading-relaxed mb-10">
          Si deseas, puedes volver a intentarlo.
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

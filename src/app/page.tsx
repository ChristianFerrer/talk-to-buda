const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890').replace(/[^0-9]/g, '');
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Buda')}`;

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-gray-900 mb-6">
          Habla con Buda
        </h1>
        <p className="text-xl sm:text-2xl font-light text-gray-500 max-w-lg mb-4">
          Cuando tu mente esté confundida, pregunta.
        </p>
        <p className="text-base text-gray-400 max-w-md mb-10 leading-relaxed">
          Un espacio simple para conversar por WhatsApp con una inteligencia artificial inspirada en la sabiduría de Buda.
        </p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Hablar con Buda en WhatsApp
        </a>
        <p className="mt-6 text-sm text-gray-400">
          Gratis hasta 3 mensajes al día.
        </p>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-light text-center text-gray-700 mb-16">
            Cómo funciona
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-warm-200 flex items-center justify-center text-warm-700 text-lg font-light">
                1
              </div>
              <p className="text-gray-600 font-light">Escribes por WhatsApp</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-warm-200 flex items-center justify-center text-warm-700 text-lg font-light">
                2
              </div>
              <p className="text-gray-600 font-light">Buda te responde</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-warm-200 flex items-center justify-center text-warm-700 text-lg font-light">
                3
              </div>
              <p className="text-gray-600 font-light">Reflexionas con calma</p>
            </div>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="py-24 px-6 bg-warm-100/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-light text-center text-gray-700 mb-16">
            Ejemplos de conversación
          </h2>
          <div className="space-y-10">
            <ExampleCard
              question="¿Cómo suelto una relación que me duele?"
              answer="Soltar no es olvidar, es dejar de aferrarse. Como la hoja que cae del árbol, no pierde al árbol… simplemente sigue su camino."
            />
            <ExampleCard
              question="Estoy muy estresado con mi trabajo"
              answer="Cuando el agua está agitada no puede reflejar la luna. Respira. ¿Qué es lo que realmente está ocurriendo ahora mismo?"
            />
            <ExampleCard
              question="No sé qué decisión tomar"
              answer="Si tu mente estuviera completamente en calma… ¿qué decisión surgiría naturalmente?"
            />
          </div>
        </div>
      </section>

      {/* Premium subtle */}
      <section className="py-24 px-6 text-center">
        <p className="text-gray-400 font-light mb-4">
          Si deseas seguir conversando sin límites, prueba Premium gratis durante 3 días. Después, desde 1,99€/semana.
        </p>
        <a
          href="/premium"
          className="inline-block text-sage-600 hover:text-sage-700 font-medium transition-colors underline underline-offset-4"
        >
          Ver Premium
        </a>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-warm-100/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-light text-center text-gray-700 mb-16">
            Preguntas frecuentes
          </h2>
          <div className="space-y-8">
            <FaqItem
              question="¿Qué es Habla con Buda?"
              answer="Es un chat por WhatsApp con una IA inspirada en la sabiduría de Buda para reflexionar sobre emociones y situaciones de la vida cotidiana."
            />
            <FaqItem
              question="¿Es gratis?"
              answer="Sí, puedes empezar gratis con hasta 3 mensajes al día."
            />
            <FaqItem
              question="¿Reemplaza terapia o ayuda profesional?"
              answer="No. Es un espacio de reflexión personal, no un servicio terapéutico."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-warm-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400 mb-4">Habla con Buda</p>
          <p className="text-xs text-gray-300 mb-6 max-w-md mx-auto">
            Esto no reemplaza ayuda profesional. Habla con Buda es un espacio de reflexión personal y calma.
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <a href="/premium" className="hover:text-gray-600 transition-colors">Premium</a>
            <a href="/privacy" className="hover:text-gray-600 transition-colors">Política de privacidad</a>
            <a href="/terms" className="hover:text-gray-600 transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ExampleCard({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <p className="text-gray-700 font-medium mb-4">&ldquo;{question}&rdquo;</p>
      <p className="text-gray-500 font-light italic leading-relaxed">&ldquo;{answer}&rdquo;</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="text-gray-700 font-medium mb-2">{question}</h3>
      <p className="text-gray-500 font-light leading-relaxed">{answer}</p>
    </div>
  );
}

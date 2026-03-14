export default function Terms() {
  return (
    <main className="min-h-screen py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">&larr; Volver al inicio</a>

        <h1 className="text-3xl font-light text-gray-900 mt-8 mb-8">Términos de Servicio</h1>

        <div className="prose prose-gray font-light text-gray-600 leading-relaxed space-y-6">
          <p><strong>Última actualización:</strong> Marzo 2026</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">1. Descripción del servicio</h2>
          <p>Habla con Buda es un servicio de conversación por WhatsApp con un agente de inteligencia artificial inspirado en la sabiduría budista. El servicio ofrece un espacio de reflexión personal y no constituye asesoramiento profesional de ningún tipo.</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">2. Limitación importante</h2>
          <p><strong>Habla con Buda NO es un servicio de terapia, asesoramiento psicológico, médico ni profesional.</strong> Las respuestas son generadas por inteligencia artificial con fines de reflexión personal. No deben interpretarse como diagnóstico, tratamiento ni consejo profesional.</p>
          <p>Si estás atravesando una crisis emocional o tienes pensamientos de autolesión, por favor busca ayuda profesional inmediata contactando a la línea de crisis de tu país o hablando con una persona de confianza.</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">3. Uso aceptable</h2>
          <p>Al usar el servicio, aceptas:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Usar el servicio de forma personal y no comercial.</li>
            <li>No enviar contenido ilegal, ofensivo o que viole derechos de terceros.</li>
            <li>No intentar explotar, hackear o alterar el funcionamiento del servicio.</li>
            <li>Entender que las respuestas son generadas por IA y pueden contener inexactitudes.</li>
          </ul>

          <h2 className="text-xl font-medium text-gray-800 mt-8">4. Planes y precios</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Plan gratuito:</strong> hasta 3 mensajes por día.</li>
            <li><strong>Plan Premium semanal:</strong> 1,99€ por semana, hasta 50 mensajes por día. Suscripción semanal recurrente.</li>
            <li><strong>Plan Premium mensual:</strong> 6,99€ por mes, hasta 50 mensajes por día. Suscripción mensual recurrente.</li>
            <li>Todos los planes Premium incluyen un período de prueba gratuito de 3 días.</li>
          </ul>

          <h2 className="text-xl font-medium text-gray-800 mt-8">5. Pagos y cancelación</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Los pagos se procesan a través de Stripe de forma segura.</li>
            <li>La suscripción Premium incluye 3 días de prueba gratuita. No se cobrará nada durante este período.</li>
            <li>La suscripción se renueva automáticamente al final de cada período (semanal o mensual).</li>
            <li>Puedes cancelar en cualquier momento escribiendo &ldquo;cancelar premium&rdquo; a Buda en WhatsApp.</li>
            <li>Al cancelar, tu acceso Premium seguirá activo hasta el final del período de facturación actual.</li>
            <li>No se ofrecen reembolsos por períodos parciales.</li>
          </ul>

          <h2 className="text-xl font-medium text-gray-800 mt-8">6. Propiedad intelectual</h2>
          <p>El servicio, su diseño, código y contenido son propiedad de Habla con Buda. Las respuestas generadas por la IA se proporcionan para tu uso personal.</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">7. Limitación de responsabilidad</h2>
          <p>El servicio se proporciona &ldquo;tal cual&rdquo; sin garantías de ningún tipo. No nos hacemos responsables de decisiones tomadas en base a las respuestas de la IA, ni de daños directos o indirectos derivados del uso del servicio.</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">8. Privacidad</h2>
          <p>El tratamiento de tus datos personales se rige por nuestra <a href="/privacy" className="text-sage-600 hover:text-sage-700 underline">Política de Privacidad</a>.</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">9. Modificaciones</h2>
          <p>Nos reservamos el derecho de modificar estos términos. Los cambios serán publicados en esta página con la fecha de actualización correspondiente.</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">10. Ley aplicable</h2>
          <p>Estos términos se rigen por la legislación de la Unión Europea. Cualquier disputa se resolverá ante los tribunales competentes.</p>
        </div>

        <footer className="mt-16 pt-8 border-t border-warm-200">
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600 transition-colors">Inicio</a>
            <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacidad</a>
            <a href="/premium" className="hover:text-gray-600 transition-colors">Premium</a>
          </div>
        </footer>
      </div>
    </main>
  );
}

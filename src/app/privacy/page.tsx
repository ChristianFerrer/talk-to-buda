export default function Privacy() {
  return (
    <main className="min-h-screen py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">&larr; Volver al inicio</a>

        <h1 className="text-3xl font-light text-gray-900 mt-8 mb-8">Política de Privacidad</h1>

        <div className="prose prose-gray font-light text-gray-600 leading-relaxed space-y-6">
          <p><strong>Última actualización:</strong> Marzo 2026</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">1. Información que recopilamos</h2>
          <p>Cuando usas Habla con Buda, recopilamos la siguiente información:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Número de teléfono:</strong> proporcionado automáticamente por WhatsApp cuando nos envías un mensaje.</li>
            <li><strong>Mensajes:</strong> el contenido de los mensajes que envías y las respuestas generadas por Buda.</li>
            <li><strong>Datos de uso:</strong> fecha y hora de los mensajes, frecuencia de uso.</li>
            <li><strong>Datos de pago:</strong> si activas Premium, Stripe procesa tu pago. No almacenamos datos de tarjeta.</li>
          </ul>

          <h2 className="text-xl font-medium text-gray-800 mt-8">2. Para qué usamos tus datos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Proporcionar el servicio de conversación con Buda.</li>
            <li>Mantener un contexto de conversación para ofrecer respuestas más relevantes.</li>
            <li>Gestionar tu suscripción Premium.</li>
            <li>Mejorar el servicio mediante métricas agregadas y anónimas.</li>
          </ul>

          <h2 className="text-xl font-medium text-gray-800 mt-8">3. Cómo almacenamos tus datos</h2>
          <p>Tus datos se almacenan en Supabase con cifrado en tránsito (TLS) y en reposo (AES-256). El acceso a la base de datos está restringido únicamente al backend del servicio.</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">4. Retención de datos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Mensajes individuales:</strong> se eliminan automáticamente después de 90 días.</li>
            <li><strong>Resúmenes de conversación:</strong> se mantienen mientras tu cuenta esté activa.</li>
            <li><strong>Cuentas inactivas:</strong> si no usas el servicio durante 1 año, todos tus datos se eliminan automáticamente.</li>
          </ul>

          <h2 className="text-xl font-medium text-gray-800 mt-8">5. Terceros con acceso a tus datos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>OpenAI:</strong> procesa tus mensajes para generar respuestas. OpenAI no usa los datos de la API para entrenar modelos.</li>
            <li><strong>Stripe:</strong> procesa pagos de Premium. Stripe tiene su propia política de privacidad.</li>
            <li><strong>Meta (WhatsApp):</strong> actúa como canal de comunicación. Los mensajes pasan a través de sus servidores.</li>
            <li><strong>Supabase:</strong> almacena los datos del servicio.</li>
            <li><strong>Vercel:</strong> aloja la aplicación web.</li>
          </ul>

          <h2 className="text-xl font-medium text-gray-800 mt-8">6. Tus derechos (GDPR)</h2>
          <p>Tienes derecho a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Acceder</strong> a tus datos personales.</li>
            <li><strong>Eliminar</strong> todos tus datos escribiendo &ldquo;borrar mis datos&rdquo; a Buda en WhatsApp.</li>
            <li><strong>Portabilidad:</strong> solicitar una copia de tus datos.</li>
            <li><strong>Rectificación:</strong> corregir datos incorrectos.</li>
            <li><strong>Oposición:</strong> oponerte al procesamiento de tus datos.</li>
          </ul>

          <h2 className="text-xl font-medium text-gray-800 mt-8">7. Seguridad</h2>
          <p>Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado, control de acceso y verificación de webhooks.</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">8. Menores de edad</h2>
          <p>Este servicio no está dirigido a menores de 16 años. No recopilamos conscientemente datos de menores.</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">9. Cambios en esta política</h2>
          <p>Podemos actualizar esta política periódicamente. La fecha de última actualización aparece al inicio de este documento.</p>

          <h2 className="text-xl font-medium text-gray-800 mt-8">10. Contacto</h2>
          <p>Para ejercer tus derechos o realizar consultas sobre privacidad, puedes escribir &ldquo;borrar mis datos&rdquo; a Buda en WhatsApp para eliminar toda tu información.</p>
        </div>

        <footer className="mt-16 pt-8 border-t border-warm-200">
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600 transition-colors">Inicio</a>
            <a href="/terms" className="hover:text-gray-600 transition-colors">Términos</a>
            <a href="/premium" className="hover:text-gray-600 transition-colors">Premium</a>
          </div>
        </footer>
      </div>
    </main>
  );
}

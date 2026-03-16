'use client';

import { useState, useEffect, useRef } from 'react';

const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890').replace(/[^0-9]/g, '');
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Buda')}`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function useOnScreen(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useOnScreen();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-warm-50/80 backdrop-blur-md border-b border-warm-200/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-gray-800">
            <img src="/lotus1.png" alt="Lotus" className="w-6 h-6" />
            <span className="text-sm font-medium tracking-wide">Habla con Buda</span>
          </a>
          <nav className="flex items-center gap-2 sm:gap-6">
            <a href="/premium" className="text-xs text-gray-500 hover:text-gray-700 transition-colors hidden sm:inline">Premium</a>
            <a
              href="/premium"
              className="sm:hidden inline-flex items-center bg-[#0984e3] hover:bg-[#0770c2] text-white px-3 py-2 rounded-xl text-sm font-medium transition-all"
            >
              Premium
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Abrir WhatsApp</span>
              <span className="sm:hidden">Chat</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="min-h-[92vh] flex flex-col items-center justify-center px-6 text-center pt-14">
        <FadeIn>
          <img src="/lotus.png" alt="Lotus" className="w-24 h-24 mb-8 opacity-80 mx-auto" />
        </FadeIn>
        <FadeIn delay={100}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-gray-900 mb-6">
            Habla con Buda
          </h1>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="text-xl sm:text-2xl font-light text-gray-500 max-w-lg mb-4">
            Cuando tu mente esté confundida, pregunta.
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <p className="text-base text-gray-400 max-w-md mb-10 leading-relaxed">
            Un espacio simple para conversar por WhatsApp con una inteligencia artificial inspirada en la sabiduría de Buda.
          </p>
        </FadeIn>
        <FadeIn delay={400}>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1da851] text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <WhatsAppIcon className="w-6 h-6" />
            Hablar con Buda en WhatsApp
          </a>
          <p className="mt-6 text-sm text-gray-400">
            Gratis · 3 mensajes al día · Sin registro
          </p>
        </FadeIn>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl font-light text-center text-gray-700 mb-16">
              Cómo funciona
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
            <FadeIn delay={0}>
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-warm-200 flex items-center justify-center text-warm-700 text-lg font-light">
                1
              </div>
              <p className="text-gray-700 font-medium mb-2">Escríbele por WhatsApp</p>
              <p className="text-sm text-gray-400 font-light">Comparte lo que sientes, una duda, o lo que ocupe tu mente.</p>
            </FadeIn>
            <FadeIn delay={150}>
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-warm-200 flex items-center justify-center text-warm-700 text-lg font-light">
                2
              </div>
              <p className="text-gray-700 font-medium mb-2">Buda te responde</p>
              <p className="text-sm text-gray-400 font-light">Con calma, metáforas y preguntas que invitan a la reflexión.</p>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-warm-200 flex items-center justify-center text-warm-700 text-lg font-light">
                3
              </div>
              <p className="text-gray-700 font-medium mb-2">Ganas claridad</p>
              <p className="text-sm text-gray-400 font-light">No busca darte respuestas, sino ayudarte a encontrar las tuyas.</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Examples — WhatsApp chat style */}
      <section className="py-24 px-6 bg-warm-100/50">
        <div className="max-w-lg mx-auto">
          <FadeIn>
            <h2 className="text-2xl font-light text-center text-gray-700 mb-16">
              Así se siente hablar con Buda
            </h2>
          </FadeIn>
          <div className="space-y-12">
            <FadeIn>
              <ChatBubble
                question="Estoy muy estresado con mi trabajo, no puedo más"
                answer="Cuando el agua está agitada, no puede reflejar la luna. Respira. ¿Qué es lo que realmente está ocurriendo ahora mismo?"
              />
            </FadeIn>
            <FadeIn delay={150}>
              <ChatBubble
                question="¿Cómo suelto una relación que me duele?"
                answer="Soltar no es olvidar, es dejar de aferrarse. Como la hoja que cae del árbol… no pierde al árbol, simplemente sigue su camino."
              />
            </FadeIn>
            <FadeIn delay={300}>
              <ChatBubble
                question="No sé qué decisión tomar"
                answer="Si tu mente estuviera completamente en calma… ¿qué decisión surgiría naturalmente?"
              />
            </FadeIn>
          </div>

          {/* CTA after examples */}
          <FadeIn delay={400}>
            <div className="text-center mt-14">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1da851] text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Pruébalo ahora
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-light text-sage-600 mb-1">24/7</p>
                <p className="text-sm text-gray-400">Disponible siempre</p>
              </div>
              <div>
                <p className="text-3xl font-light text-sage-600 mb-1">&lt; 10s</p>
                <p className="text-sm text-gray-400">Tiempo de respuesta</p>
              </div>
              <div>
                <p className="text-3xl font-light text-sage-600 mb-1">100%</p>
                <p className="text-sm text-gray-400">Privado y confidencial</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="mt-16 space-y-6">
              <Testimonial
                quote="Es como tener un momento de calma en el bolsillo. Cada vez que la ansiedad me supera, le escribo."
                author="María, 34 años"
              />
              <Testimonial
                quote="Me ayudó a ver mi problema de pareja desde otra perspectiva. No me dijo qué hacer, me ayudó a pensarlo."
                author="Carlos, 28 años"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Premium */}
      <section className="py-24 px-6 bg-warm-100/50">
        <div className="max-w-lg mx-auto text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-sage-500 mb-4">Premium</p>
            <h2 className="text-2xl sm:text-3xl font-light text-gray-800 mb-4">
              Conversaciones sin límites
            </h2>
            <p className="text-gray-400 font-light mb-8 leading-relaxed max-w-md mx-auto">
              Prueba gratis durante 3 días. Después, desde 1,99€/semana.
            </p>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 text-left">
              <div className="space-y-3">
                <PremiumFeature text="50 mensajes al día (vs 3 en plan gratis)" />
                <PremiumFeature text="Oráculo: enseñanzas profundas generadas por IA avanzada" />
                <PremiumFeature text="Reflexión matutina personalizada cada día a las 7am" />
                <PremiumFeature text="Cancela cuando quieras desde WhatsApp" />
              </div>
            </div>
            <a
              href="/premium"
              className="inline-flex items-center gap-2 bg-[#0984e3] hover:bg-[#0770c2] text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Hazte Premium
            </a>
          </FadeIn>
        </div>
      </section>

      {/* FAQ — Accordion */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl font-light text-center text-gray-700 mb-16">
              Preguntas frecuentes
            </h2>
          </FadeIn>
          <FadeIn>
            <div className="space-y-0 divide-y divide-warm-200">
              {faqData.map((item, i) => (
                <FaqAccordionItem
                  key={i}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </FadeIn>

          {/* CTA after FAQ */}
          <FadeIn>
            <div className="text-center mt-16">
              <p className="text-gray-400 font-light mb-6">¿Listo para encontrar un poco de calma?</p>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1da851] text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Hablar con Buda
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-warm-200 bg-warm-100/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/lotus1.png" alt="Lotus" className="w-5 h-5" />
                <span className="text-sm font-medium text-gray-700">Habla con Buda</span>
              </div>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Un espacio de reflexión personal inspirado en la sabiduría budista. Esto no reemplaza ayuda profesional.
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2 text-sm">
              <a href="/premium" className="text-gray-500 hover:text-gray-700 transition-colors">Premium</a>
              <a href="/privacy" className="text-gray-500 hover:text-gray-700 transition-colors">Política de privacidad</a>
              <a href="/terms" className="text-gray-500 hover:text-gray-700 transition-colors">Términos de servicio</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-warm-200/50">
            <div className="flex items-center gap-4 text-xs text-gray-300">
              <span>HTTPS/TLS</span>
              <span>·</span>
              <span>GDPR</span>
              <span>·</span>
              <span>Datos cifrados</span>
            </div>
            <p className="text-xs text-gray-300">
              © {new Date().getFullYear()} Habla con Buda
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─── Chat bubble component (WhatsApp style) ─── */
function ChatBubble({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-3">
      {/* User message — right */}
      <div className="flex justify-end">
        <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-sm">
          <p className="text-sm text-gray-800">{question}</p>
        </div>
      </div>
      {/* Buda response — left */}
      <div className="flex justify-start gap-2">
        <div className="w-8 h-8 rounded-full bg-warm-200 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
          <img src="/lotus1.png" alt="Buda" className="w-5 h-5" />
        </div>
        <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] shadow-sm">
          <p className="text-sm text-gray-600 italic leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Testimonial ─── */
function Testimonial({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="bg-warm-100/60 rounded-2xl px-6 py-5">
      <p className="text-gray-600 font-light italic leading-relaxed mb-2">&ldquo;{quote}&rdquo;</p>
      <p className="text-xs text-gray-400">— {author}</p>
    </div>
  );
}

/* ─── Premium feature ─── */
function PremiumFeature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-sage-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <p className="text-gray-600 font-light text-sm">{text}</p>
    </div>
  );
}

/* ─── FAQ Accordion ─── */
function FaqAccordionItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-gray-700 font-medium text-sm sm:text-base pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-gray-500 font-light text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

/* ─── FAQ data ─── */
const faqData = [
  {
    question: '¿Qué es Habla con Buda?',
    answer: 'Es un chat por WhatsApp con una IA inspirada en la sabiduría de Buda. Le escribes lo que sientes y te responde con calma, metáforas y preguntas reflexivas.',
  },
  {
    question: '¿Es gratis?',
    answer: 'Sí. Puedes enviar hasta 3 mensajes al día de forma gratuita. Si quieres más, Premium te da 50 mensajes diarios desde 1,99€/semana.',
  },
  {
    question: '¿Reemplaza terapia o ayuda profesional?',
    answer: 'No. Habla con Buda es un espacio de reflexión personal, no un servicio terapéutico. Si necesitas ayuda profesional, te recomendamos buscar a un especialista.',
  },
  {
    question: '¿Mis conversaciones son privadas?',
    answer: 'Sí. Tus datos están cifrados y protegidos bajo normativa GDPR. Puedes solicitar la eliminación completa de tus datos en cualquier momento escribiendo "borrar mis datos" a Buda.',
  },
  {
    question: '¿Quién está detrás de Buda?',
    answer: 'Buda es una inteligencia artificial entrenada con modelos avanzados de lenguaje (GPT-4o) y guiada por principios de la filosofía budista: impermanencia, compasión y observación de la mente.',
  },
];

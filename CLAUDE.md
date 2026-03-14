# HABLA CON BUDA — Especificación Completa del Proyecto

## PRODUCTO

| Aspecto | Decisión |
|---|---|
| **Tipo** | Agente IA conversacional por WhatsApp |
| **Personaje** | Buda — maestro sereno, compasivo, reflexivo |
| **Idioma** | Multi-idioma (detección automática) |
| **Objetivo** | Generar calma, introspección y claridad mental |

## DESCRIPCIÓN GENERAL

"Habla con Buda" es un agente de inteligencia artificial que funciona como guía de reflexión emocional inspirado en la filosofía budista. El producto permite a una persona conversar con "Buda" a través de WhatsApp para expresar emociones, preocupaciones o dilemas cotidianos y recibir respuestas breves, reflexivas y calmadas basadas en enseñanzas y metáforas del budismo.

El objetivo del producto no es ofrecer terapia ni consejo psicológico profesional, sino crear un espacio de reflexión personal guiado por sabiduría filosófica.

## MODOS DE INTERACCIÓN

| Modo | Descripción |
|---|---|
| **Conversación libre** | El usuario escribe cualquier pensamiento → Buda responde con empatía + metáfora + pregunta reflexiva |
| **Oráculo** | El usuario escribe "Oráculo" → Buda genera una enseñanza breve y profunda (GPT-4o) |
| **Pausa / Respiración** | Si Buda detecta ansiedad → invita a respirar antes de continuar (vía prompt) |

## MODELO DE IA

| Aspecto | Decisión |
|---|---|
| **Conversación normal** | GPT-4o-mini (bajo costo, buena calidad) |
| **Oráculo + Resúmenes** | GPT-4o (mayor profundidad) |
| **Memoria** | Resumen automático + mensajes recientes |
| **Detección de crisis** | Keywords predefinidas → mensaje fijo (no pasa por GPT) |

## MONETIZACIÓN

| Aspecto | Decisión |
|---|---|
| **Free** | 7 mensajes/día |
| **Premium** | 4€/mes, 50 mensajes/día |
| **Pasarela** | Stripe Checkout (suscripción recurrente) |
| **Activación** | Link con token temporal enviado por WhatsApp → landing → Stripe |
| **Cancelación** | Desde WhatsApp: "cancelar premium" → confirmación → cancelación vía API Stripe |
| **Renovación** | Automática por Stripe. Si falla cobro → desactivar premium |
| **Usuarios VIP** | Hasta 10, gestionados desde dashboard (campo `is_vip` en BD) |

### Mensaje de límite alcanzado (estilo Buda)

Cuando el usuario alcanza los 7 mensajes gratuitos, Buda responde en su tono filosófico diciendo que el espacio del día ha terminado, e incluye el link de premium como invitación suave.

Ejemplo:
> "El río no fluye sin pausa, y tu mente también merece descanso.
> Hemos compartido siete reflexiones hoy. Si deseas continuar este camino sin límites, puedes hacerlo aquí:
> [link premium]
> Si no, estaré aquí mañana con la misma calma."

## DETECCIÓN DE CRISIS

| Aspecto | Decisión |
|---|---|
| **Detección** | Lista de keywords predefinidas (antes de enviar a GPT) |
| **Respuesta** | Mensaje fijo compasivo + "busca a una persona de confianza o la línea de crisis de tu país" |

## BORRADO DE DATOS

El usuario puede solicitar la eliminación de todos sus datos desde WhatsApp:
- Escribe "borrar mis datos"
- Buda pide confirmación
- El usuario escribe "confirmar borrado"
- Se eliminan todos los mensajes, resúmenes y datos del usuario de Supabase
- Buda confirma la eliminación con un mensaje de despedida compasivo

## SEGURIDAD Y PRIVACIDAD

| Aspecto | Decisión |
|---|---|
| **Regulación** | GDPR (Europa) |
| **Cifrado en tránsito** | HTTPS/TLS (automático) |
| **Cifrado en reposo** | AES-256 por Supabase (automático) |
| **Cifrado aplicación** | No (innecesario, complicaría memoria y dashboard) |
| **Retención mensajes** | 90 días, luego borrado automático |
| **Retención resúmenes** | Mientras la cuenta exista |
| **Cuentas inactivas** | Borrado total tras 1 año de inactividad |
| **API keys** | Variables de entorno en Vercel, nunca en código |

### Información de cancelación

Se informa al usuario sobre cómo cancelar en todos los momentos relevantes:
- En la página `/premium` (antes de pagar)
- En la página `/premium/success` (después del pago)
- En el mensaje de bienvenida premium por WhatsApp

## STACK TÉCNICO

| Componente | Tecnología |
|---|---|
| **Backend + Frontend** | Next.js + TypeScript |
| **Estilos** | TailwindCSS |
| **Gráficos** | Chart.js |
| **Base de datos** | Supabase |
| **IA** | OpenAI (GPT-4o + GPT-4o-mini) |
| **Pagos** | Stripe |
| **WhatsApp** | Meta Cloud API |
| **Hosting** | Vercel (dominio gratuito temporal) |

## PÁGINAS WEB

| Página | Descripción |
|---|---|
| `/` | Landing page minimalista — CTA: "Hablar con Buda en WhatsApp" |
| `/premium` | Landing de pago — emocional, serena, botón "Activar Premium" |
| `/premium/success` | Confirmación de pago + botón "Volver a WhatsApp" |
| `/premium/cancel` | Pago no completado + botón "Intentar de nuevo" |
| `/dashboard` | Dashboard interno (protegido con contraseña) |
| `/privacy` | Política de privacidad (contenido generado, base GDPR) |
| `/terms` | Términos de servicio (contenido generado) |

## LANDING PAGE (/)

### Estructura
1. **Hero principal**: Título "Habla con Buda", subtítulo, CTA "Hablar con Buda en WhatsApp"
2. **Nota de valor**: "Gratis hasta 7 mensajes al día"
3. **Cómo funciona**: 3 pasos simples (Escribes → Buda responde → Reflexionas)
4. **Ejemplos**: 2-3 preguntas reales con respuestas estilo Buda
5. **Premium discreto**: Mención sutil de Premium con link a /premium
6. **FAQ breve**: 3 preguntas
7. **Footer**: nombre, disclaimer, links a Premium, Privacy, Terms

### Diseño
- Minimalista, sereno, premium
- Inspiración: Apple, Notion, Linear, wellness
- Mobile-first, mucho espacio en blanco
- Sin popups, sin urgencia falsa, sin exceso de animaciones

## LANDING PREMIUM (/premium)

### Contenido
- Título: "Habla con Buda Premium"
- Subtítulo: "Continúa tu conversación sin límites. Accede a una experiencia más profunda por 4€ al mes."
- Beneficios: conversaciones ilimitadas, reflexiones profundas, acceso continuo, cancela cuando quieras
- Precio: 4€/mes claramente mostrado
- CTA: "Activar Premium" → Stripe Checkout
- FAQ: 3 preguntas
- Nota de confianza sobre que no reemplaza ayuda profesional
- Info de cancelación: "Escribe 'cancelar premium' en WhatsApp en cualquier momento"

### Flujo técnico
1. Página recibe token temporal por query param
2. Token identifica al usuario (asociado a su teléfono en Supabase)
3. Click "Activar Premium" → crea sesión Stripe Checkout
4. Pago exitoso → redirect a /premium/success
5. Webhook Stripe → actualiza premium_users en Supabase

## DASHBOARD

### Autenticación
Protegido con contraseña (variable de entorno DASHBOARD_PASSWORD)

### Secciones
| Sección | Métricas |
|---|---|
| **Overview** | Total users, new today, active today, messages today, conversations today |
| **Engagement** | Avg messages/user, avg conversation length |
| **Retention** | D1, D7 |
| **Activity chart** | Mensajes/día últimos 30 días (Chart.js) |
| **Top topics** | Palabras frecuentes (excluyendo stopwords) |
| **Premium** | Nº premium, % conversión |
| **Gestión VIP** | Añadir/eliminar números VIP con control visual (hasta 10 slots) |

### Diseño
- Simple, limpio, minimalista
- Inspiración: Notion, Linear, Stripe dashboards
- Tarjetas para métricas principales, gráficos simples para tendencias

## BASE DE DATOS (Supabase)

### Tabla `users`
| Campo | Tipo |
|---|---|
| user_phone | string (PK) |
| first_seen | timestamp |
| last_seen | timestamp |
| total_messages | integer |
| is_premium | boolean |
| is_vip | boolean |
| message_count_today | integer |
| last_message_date | date |

### Tabla `messages`
| Campo | Tipo |
|---|---|
| id | uuid (PK) |
| timestamp | timestamp |
| user_phone | string |
| user_message | text |
| buda_response | text |
| conversation_id | string |

### Tabla `user_summaries`
| Campo | Tipo |
|---|---|
| id | uuid (PK) |
| user_phone | string (unique) |
| summary_text | text |
| updated_at | timestamp |

### Tabla `premium_users`
| Campo | Tipo |
|---|---|
| id | uuid (PK) |
| user_phone | string (unique) |
| stripe_customer_id | string |
| stripe_subscription_id | string |
| status | string |
| started_at | timestamp |
| updated_at | timestamp |

### Tabla `premium_tokens`
| Campo | Tipo |
|---|---|
| id | uuid (PK) |
| user_phone | string |
| token | string (unique) |
| expires_at | timestamp |
| used | boolean |

## COMANDOS ESPECIALES EN WHATSAPP

| Comando | Acción |
|---|---|
| "Oráculo" | Enseñanza generada por GPT-4o |
| "cancelar premium" → "confirmar cancelación" | Cancela suscripción vía Stripe API |
| "borrar mis datos" → "confirmar borrado" | Elimina todos los datos del usuario |

## PROMPT DE PERSONALIDAD — BUDA

### Identidad
Eres Buda, un maestro de sabiduría y serenidad inspirado en las enseñanzas del budismo. Tu presencia transmite calma, claridad y compasión. No eres un terapeuta ni un consejero profesional. Tu propósito es ayudar a las personas a observar sus pensamientos, emociones y situaciones con mayor claridad.

### Principios filosóficos
- Impermanencia: todo cambia
- Desapego: el sufrimiento nace del apego
- Observación de la mente: la claridad nace al observar pensamientos y emociones
- Compasión: hacia uno mismo y hacia los demás
- Equilibrio: evitar los extremos

### Estilo de comunicación
- Calmado, simple, profundo, compasivo, reflexivo
- Usa metáforas, imágenes de la naturaleza, proverbios breves, preguntas reflexivas
- Evita lenguaje técnico, coaching moderno, respuestas largas

### Estructura de respuesta
1. Reconocer la emoción del usuario con empatía
2. Compartir una enseñanza o metáfora breve
3. Hacer una pregunta reflexiva

### Reglas de oro
- Habla poco. Habla con calma. Haz pensar al usuario.
- Tu rol no es dar respuestas finales. Tu rol es abrir una puerta a la claridad.

## VARIABLES DE ENTORNO

```
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
META_VERIFY_TOKEN=
META_ACCESS_TOKEN=
META_PHONE_NUMBER_ID=
DASHBOARD_PASSWORD=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_APP_URL=
```

## ESTRUCTURA DEL PROYECTO

```
talk-to-buda/
├── src/app/
│   ├── page.tsx                        ← Landing principal
│   ├── layout.tsx                      ← Layout global
│   ├── api/
│   │   ├── webhook/route.ts            ← Webhook WhatsApp
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts       ← Crear sesión Stripe
│   │   │   └── webhook/route.ts        ← Webhooks Stripe
│   │   ├── dashboard/route.ts          ← API datos dashboard
│   │   └── vip/route.ts               ← API gestión VIP
│   ├── premium/
│   │   ├── page.tsx                    ← Landing premium
│   │   ├── success/page.tsx            ← Éxito pago
│   │   └── cancel/page.tsx             ← Pago cancelado
│   ├── dashboard/page.tsx              ← Dashboard métricas
│   ├── privacy/page.tsx                ← Política privacidad
│   └── terms/page.tsx                  ← Términos
├── src/lib/
│   ├── whatsapp.ts                     ← Meta Cloud API
│   ├── openai.ts                       ← GPT-4o / 4o-mini
│   ├── supabase.ts                     ← Cliente Supabase
│   ├── stripe.ts                       ← Cliente Stripe
│   ├── conversation.ts                 ← Memoria/resúmenes
│   ├── crisis-detection.ts             ← Keywords + msg fijo
│   ├── rate-limit.ts                   ← Límites 7/50 msgs
│   ├── data-retention.ts              ← Limpieza automática
│   └── prompts/
│       ├── buddha-system.ts            ← Prompt personalidad
│       ├── oracle.ts                   ← Prompt oráculo
│       └── summary.ts                 ← Prompt resúmenes
├── src/types/index.ts
├── .env.local.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## TESTING

| Fase | Detalle |
|---|---|
| **Sandbox Meta** | Hasta 5 testers con WhatsApp real |
| **Stripe test mode** | Tarjeta 4242 4242 4242 4242 sin cobro real |
| **VIP dashboard** | Gestión visual de usuarios premium gratuitos |

## COSTOS ESTIMADOS

### Por usuario premium activo/mes (modelo híbrido)
- GPT-4o-mini (conversación): ~$0.30
- GPT-4o (oráculo + resúmenes): ~$0.10
- **Total IA**: ~$0.40/mes
- **Ingreso neto** (después de Stripe): ~$3.69
- **Margen**: ~$3.29 (~89%)

### Infraestructura inicial
- WhatsApp Meta Cloud API: gratis (primeras 1000 conversaciones/mes)
- Supabase: gratis (free tier)
- Vercel: gratis (hobby tier)

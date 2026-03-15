/**
 * WhatsApp messaging client.
 * Supports two providers:
 *   - Meta Cloud API directly (default)
 *   - Kapso proxy (set KAPSO_API_KEY to enable)
 *
 * When using Kapso, messages route through their proxy which provides
 * phone number provisioning, parsed webhooks, and built-in inbox.
 * The API format is identical — Kapso proxies to Meta Cloud API.
 */

const KAPSO_API_KEY = process.env.KAPSO_API_KEY || '';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || '';

const useKapso = !!KAPSO_API_KEY;

function getBaseUrl(): string {
  if (useKapso) {
    return `https://api.kapso.ai/meta/whatsapp/v24.0/${META_PHONE_NUMBER_ID}`;
  }
  return `https://graph.facebook.com/v22.0/${META_PHONE_NUMBER_ID}`;
}

function getAuthHeaders(): Record<string, string> {
  if (useKapso) {
    return {
      'X-API-Key': KAPSO_API_KEY,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  console.log('[whatsapp] Sending message to:', to, 'length:', text.length, 'provider:', useKapso ? 'kapso' : 'meta');

  if (useKapso) {
    if (!KAPSO_API_KEY || !META_PHONE_NUMBER_ID) {
      console.error('[whatsapp] MISSING ENV VARS: KAPSO_API_KEY=', !!KAPSO_API_KEY, 'META_PHONE_NUMBER_ID=', !!META_PHONE_NUMBER_ID);
      throw new Error('WhatsApp API not configured: missing KAPSO_API_KEY or META_PHONE_NUMBER_ID');
    }
  } else {
    if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
      console.error('[whatsapp] MISSING ENV VARS: META_ACCESS_TOKEN=', !!META_ACCESS_TOKEN, 'META_PHONE_NUMBER_ID=', !!META_PHONE_NUMBER_ID);
      throw new Error('WhatsApp API not configured: missing META_ACCESS_TOKEN or META_PHONE_NUMBER_ID');
    }
  }

  const url = `${getBaseUrl()}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: true, body: text },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('WhatsApp API error:', response.status, errorBody);
    throw new Error(`WhatsApp API error: ${response.status}`);
  }
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  const url = `${getBaseUrl()}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}

/**
 * Shows "typing..." indicator to the user by marking the message as read
 * with a typing indicator. Makes the conversation feel more human.
 * Requires the incoming message ID to work.
 */
export async function showTypingIndicator(messageId: string): Promise<void> {
  const url = `${getBaseUrl()}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
      typing_indicator: {
        type: 'text',
      },
    }),
  }).catch(() => {
    // Typing indicator is best-effort, don't fail the message flow
  });
}

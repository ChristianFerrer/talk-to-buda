const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || '';

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  console.log('[whatsapp] Sending message to:', to, 'length:', text.length);

  if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
    console.error('[whatsapp] MISSING ENV VARS: META_ACCESS_TOKEN=', !!META_ACCESS_TOKEN, 'META_PHONE_NUMBER_ID=', !!META_PHONE_NUMBER_ID);
    throw new Error('WhatsApp API not configured: missing META_ACCESS_TOKEN or META_PHONE_NUMBER_ID');
  }

  const url = `https://graph.facebook.com/v22.0/${META_PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
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
  const url = `https://graph.facebook.com/v22.0/${META_PHONE_NUMBER_ID}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
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
  const url = `https://graph.facebook.com/v22.0/${META_PHONE_NUMBER_ID}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
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

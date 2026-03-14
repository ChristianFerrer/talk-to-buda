const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || '';

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  const url = `https://graph.facebook.com/v21.0/${META_PHONE_NUMBER_ID}/messages`;

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
  const url = `https://graph.facebook.com/v21.0/${META_PHONE_NUMBER_ID}/messages`;

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
 * Shows "typing..." indicator to the user.
 * Makes the conversation feel more human — Buda is "thinking".
 */
export async function showTypingIndicator(to: string): Promise<void> {
  const url = `https://graph.facebook.com/v21.0/${META_PHONE_NUMBER_ID}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'reaction',
      // WhatsApp Business API uses "typing" status for typing indicator
    }),
  }).catch(() => {
    // Typing indicator is best-effort, don't fail the message flow
  });
}

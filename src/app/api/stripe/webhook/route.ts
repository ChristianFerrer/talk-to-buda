import { NextRequest, NextResponse } from 'next/server';
import { getStripe, Stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { getPremiumActivatedMessage } from '@/lib/prompts/buddha-system';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userPhone = session.metadata?.user_phone;
  const tokenId = session.metadata?.token_id;

  if (!userPhone) {
    console.error('No user_phone in session metadata');
    return;
  }

  // Mark token as used (only if flow came from token)
  if (tokenId) {
    await supabase
      .from('premium_tokens')
      .update({ used: true })
      .eq('id', tokenId);
  }

  // Ensure user exists in users table (for web-direct signups)
  if (session.metadata?.source === 'web_direct') {
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_phone')
      .eq('user_phone', userPhone)
      .maybeSingle();

    if (!existingUser) {
      await supabase.from('users').insert({
        user_phone: userPhone,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        total_messages: 0,
        is_premium: true,
        is_vip: false,
        message_count_today: 0,
        last_message_date: new Date().toISOString().split('T')[0],
      });
    }
  }

  // Update or create premium user record
  await supabase.from('premium_users').upsert(
    {
      user_phone: userPhone,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      status: 'active',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_phone' }
  );

  // Update user premium status
  await supabase
    .from('users')
    .update({ is_premium: true })
    .eq('user_phone', userPhone);

  // Send confirmation via WhatsApp
  try {
    await sendWhatsAppMessage(userPhone, getPremiumActivatedMessage());
  } catch (error) {
    console.error('Failed to send premium activation message:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: premiumUser } = await supabase
    .from('premium_users')
    .select('user_phone')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  if (!premiumUser) return;

  await supabase
    .from('premium_users')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('user_phone', premiumUser.user_phone);

  await supabase
    .from('users')
    .update({ is_premium: false })
    .eq('user_phone', premiumUser.user_phone);

  try {
    await sendWhatsAppMessage(
      premiumUser.user_phone,
      'Tu suscripción Premium ha finalizado. Seguiremos con 3 reflexiones diarias.\n\nSi deseas renovar, escríbeme y te enviaré el enlace.'
    );
  } catch (error) {
    console.error('Failed to send cancellation message:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = (invoice as any).subscription;
  const subscriptionId: string | undefined = typeof sub === 'string' ? sub : sub?.id;

  if (!subscriptionId) return;

  const { data: premiumUser } = await supabase
    .from('premium_users')
    .select('user_phone')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle();

  if (!premiumUser) return;

  try {
    await sendWhatsAppMessage(
      premiumUser.user_phone,
      'Hubo un problema con tu pago de Premium. Stripe intentará de nuevo automáticamente. Si el problema persiste, puedes actualizar tu método de pago.'
    );
  } catch (error) {
    console.error('Failed to send payment failed message:', error);
  }
}

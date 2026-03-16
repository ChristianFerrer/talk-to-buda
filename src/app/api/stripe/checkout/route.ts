import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
const STRIPE_WEEKLY_PRICE_ID = process.env.STRIPE_WEEKLY_PRICE_ID || '';

export async function POST(request: NextRequest) {
  try {
    const { token, plan, phone } = await request.json();

    let userPhone: string | null = null;
    let tokenId: string | null = null;

    if (token) {
      // Flow with token: validate and get user phone
      const { data: tokenData } = await supabase
        .from('premium_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .maybeSingle();

      if (!tokenData) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Token expired' }, { status: 400 });
      }

      userPhone = tokenData.user_phone;
      tokenId = tokenData.id;
    } else if (phone) {
      // Flow without token: phone provided directly from web form
      const cleanedPhone = (phone as string).replace(/[^0-9]/g, '');
      if (cleanedPhone.length < 8) {
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
      }
      userPhone = cleanedPhone;
    } else {
      return NextResponse.json({ error: 'Token or phone is required' }, { status: 400 });
    }

    // Create Stripe Checkout session with 3-day free trial
    const priceId = plan === 'weekly' ? STRIPE_WEEKLY_PRICE_ID : STRIPE_PRICE_ID;

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 3,
      },
      metadata: {
        user_phone: userPhone,
        ...(tokenId ? { token_id: tokenId } : { source: 'web_direct' }),
      },
      success_url: `${APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/premium/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

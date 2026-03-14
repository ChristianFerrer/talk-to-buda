import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || '';
const MAX_VIP_SLOTS = 10;

// GET: List all VIP users
export async function GET(request: NextRequest) {
  const password = request.headers.get('x-dashboard-password');
  if (password !== DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: vipUsers } = await supabase
    .from('users')
    .select('user_phone, first_seen, last_seen, total_messages')
    .eq('is_vip', true)
    .order('first_seen', { ascending: true });

  return NextResponse.json({
    vipUsers: vipUsers || [],
    maxSlots: MAX_VIP_SLOTS,
    usedSlots: vipUsers?.length || 0,
  });
}

// POST: Add a VIP user
export async function POST(request: NextRequest) {
  try {
    const { password, phone } = await request.json();
    if (password !== DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Check VIP slots
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_vip', true);

    if ((count || 0) >= MAX_VIP_SLOTS) {
      return NextResponse.json({ error: `Maximum ${MAX_VIP_SLOTS} VIP slots reached` }, { status: 400 });
    }

    // Ensure user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_phone')
      .eq('user_phone', phone)
      .maybeSingle();

    if (!existingUser) {
      await supabase.from('users').insert({
        user_phone: phone,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        total_messages: 0,
        is_premium: true,
        is_vip: true,
        message_count_today: 0,
        last_message_date: new Date().toISOString().split('T')[0],
      });
    } else {
      await supabase
        .from('users')
        .update({ is_vip: true, is_premium: true })
        .eq('user_phone', phone);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('VIP add error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE: Remove a VIP user
export async function DELETE(request: NextRequest) {
  try {
    const { password, phone } = await request.json();
    if (password !== DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has a Stripe subscription (don't remove premium if they're paying)
    const { data: premiumUser } = await supabase
      .from('premium_users')
      .select('status')
      .eq('user_phone', phone)
      .maybeSingle();

    const hasPaidPremium = premiumUser?.status === 'active';

    await supabase
      .from('users')
      .update({
        is_vip: false,
        is_premium: hasPaidPremium, // Keep premium only if they have an active Stripe subscription
      })
      .eq('user_phone', phone);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('VIP remove error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

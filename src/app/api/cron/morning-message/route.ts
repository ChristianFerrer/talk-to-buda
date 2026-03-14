import { NextRequest, NextResponse } from 'next/server';
import { sendMorningMessages } from '@/lib/morning-message';

const CRON_SECRET = process.env.CRON_SECRET || '';

/**
 * Cron endpoint for sending morning messages to premium users.
 * Configure in vercel.json:
 * { "crons": [{ "path": "/api/cron/morning-message", "schedule": "0 7 * * *" }] }
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this automatically for cron jobs)
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendMorningMessages();
    return NextResponse.json({
      success: true,
      sent: result.sent,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Morning message cron error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}

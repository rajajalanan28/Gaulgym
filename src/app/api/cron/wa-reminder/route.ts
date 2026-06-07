import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // Constants
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const FONNTE_TOKEN = process.env.FONNTE_TOKEN || '';
    const CRON_SECRET = process.env.CRON_SECRET || '';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase credentials are not configured on the server.' }, { status: 500 });
    }

    // Initialize Supabase admin client (bypasses RLS to read all subscriptions)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    // 1. Verify Authorization
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const secretFromUrl = searchParams.get('secret');

    // Allow if matches CRON_SECRET via Header (Vercel standard) or URL param (manual trigger)
    const isAuthorized =
      (authHeader && authHeader === `Bearer ${CRON_SECRET}`) ||
      (secretFromUrl && secretFromUrl === CRON_SECRET);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!FONNTE_TOKEN) {
      return NextResponse.json({ error: 'FONNTE_TOKEN is not configured' }, { status: 500 });
    }

    // 2. Calculate target dates (H-3 and H-1)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetH3 = new Date(today);
    targetH3.setDate(today.getDate() + 3);

    const targetH1 = new Date(today);
    targetH1.setDate(today.getDate() + 1);

    // Format to YYYY-MM-DD for database query
    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
    const dateStrH3 = formatDateStr(targetH3);
    const dateStrH1 = formatDateStr(targetH1);

    // 3. Fetch expiring subscriptions from Supabase
    const { data: expiringSubs, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*, members(name, phone), gyms(name)')
      .in('status', ['active'])
      // Get subscriptions that end EXACTLY on H-3 or H-1
      // We'll filter in JS to be safe, but can query a range
      .gte('end_date', dateStrH1)
      .lte('end_date', dateStrH3);

    if (error) {
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }

    if (!expiringSubs || expiringSubs.length === 0) {
      return NextResponse.json({ message: 'No expiring subscriptions found today.' });
    }

    // Filter exactly matching H-3 and H-1
    const targetSubs = expiringSubs.filter((sub) => {
      const endDateStr = sub.end_date.split('T')[0];
      return endDateStr === dateStrH3 || endDateStr === dateStrH1;
    });

    if (targetSubs.length === 0) {
      return NextResponse.json({ message: 'No exact matches for H-3 or H-1.' });
    }

    let successCount = 0;
    const failures = [];

    // 4. Send WhatsApp Messages
    for (const sub of targetSubs) {
      const member = sub.members;
      const gym = sub.gyms;
      
      if (!member || !member.phone) continue;

      // Format Phone number (convert 08... to 628...)
      let phone = member.phone;
      if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
      } else if (!phone.startsWith('62')) {
        // Just in case it doesn't have 0 or 62 (e.g. 812...)
        phone = '62' + phone;
      }

      // Determine days left
      const endDateStr = sub.end_date.split('T')[0];
      const daysLeft = endDateStr === dateStrH3 ? 3 : 1;

      // Format Expiration Date
      const expDateObj = new Date(sub.end_date);
      const formattedExpDate = expDateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Construct Message
      const message = `Halo Kak *${member.name}* 👋\n\nIni pesan otomatis dari *${gym?.name || 'Gaul Gym'}*.\n\nKami ingin menginformasikan bahwa masa aktif keanggotaan/paket gym kakak akan berakhir dalam *${daysLeft} Hari* (pada tanggal ${formattedExpDate}).\n\nYuk segera perpanjang paketnya agar tidak ketinggalan jadwal latihan dan dapat terus menikmati fasilitas kami!\n\nUntuk perpanjangan bisa langsung datang ke meja kasir ya kak. Sampai jumpa di tempat gym! 🏋️‍♀️💪`;

      // Call Fonnte API
      try {
        const response = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': FONNTE_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target: phone,
            message: message,
            countryCode: '62', // Optional but good for fonnte
          }),
        });

        const result = await response.json();
        if (result.status) {
          successCount++;
        } else {
          failures.push({ phone, reason: result.reason || 'Unknown Fonnte Error' });
        }
      } catch (err: any) {
        failures.push({ phone, reason: err.message });
      }
    }

    return NextResponse.json({
      message: `Successfully processed reminders.`,
      successCount,
      failedCount: failures.length,
      failures
    });

  } catch (error: any) {
    console.error('WA Reminder Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

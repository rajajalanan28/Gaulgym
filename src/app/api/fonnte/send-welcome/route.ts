import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const FONNTE_TOKEN = process.env.FONNTE_TOKEN || '';

    if (!FONNTE_TOKEN) {
      return NextResponse.json({ error: 'Fonnte token not configured' }, { status: 500 });
    }

    // Check Authorization using Supabase Session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, name, displayId, packageName, endDate } = await request.json();

    if (!phone || !name || !packageName || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Format Phone number (convert 08... to 628...)
    let formattedPhone = phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone;
    }

    // Format Expiration Date
    const expDateObj = new Date(endDate);
    const formattedExpDate = expDateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Construct Message based on user request
    const message = `Selamat, ${name} (${displayId || '-'}).. anda terdaftar sbg member GAUL GYM dgn layanan ${packageName} valid sampai dengan ${formattedExpDate}`;

    // Call Fonnte API
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message,
        countryCode: '62',
      }),
    });

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Fonnte Welcome WA Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

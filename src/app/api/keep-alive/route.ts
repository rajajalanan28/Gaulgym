import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Route ini dibuat khusus untuk menjaga Supabase agar tidak kena pause (Keep-Alive).
// Fungsi ini aman untuk dipanggil publik karena tidak membocorkan data sensitif,
// hanya melakukan query ringan (1 baris data) untuk menandakan ada aktivitas API.

export async function GET() {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured.' },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Melakukan query sangat ringan ke tabel gyms hanya untuk memberi sinyal aktivitas ke Supabase
    const { data, error } = await supabase
      .from('gyms')
      .select('id')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({ 
      status: 'success', 
      message: 'Supabase is awake! 🚀', 
      timestamp: new Date().toISOString(),
      // Tampilkan ID gym (kalau ada) sekadar bukti query sukses
      ping_result: data?.length ? 'Database connected' : 'Database connected (No gyms)'
    });
  } catch (error: any) {
    console.error('Keep-alive error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data: firstGym } = await supabaseAdmin.from('gyms').select('id').limit(1).single();
    const targetGymId = firstGym ? firstGym.id : null;

    if (!targetGymId) {
      return NextResponse.json({ message: 'No gym found' }, { status: 400 });
    }

    const { data: users, error: fetchError } = await supabaseAdmin.from('users').select('*').eq('role', 'Member');
    if (fetchError) throw fetchError;

    let count = 0;
    for (const u of users) {
      const { data: m } = await supabaseAdmin.from('members').select('id').eq('user_id', u.id).single();
      if (!m) {
        const displayId = 'GG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        await supabaseAdmin.from('members').insert({
          user_id: u.id,
          gym_id: targetGymId,
          name: u.name || 'User',
          email: u.email,
          display_id: displayId,
          join_date: new Date().toISOString().split('T')[0]
        });
        count++;
      }
    }

    return NextResponse.json({ message: `Backfill success. Synced ${count} missing members.` });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

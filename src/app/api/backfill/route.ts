import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function generateSecureDisplayId(): string {
  const bytes = crypto.randomBytes(4);
  return 'GG-' + bytes.toString('hex').substring(0, 6).toUpperCase();
}

export async function POST(request: Request) {
  try {
    // SECURITY: Require Owner authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'Owner') {
      return NextResponse.json({ error: 'Forbidden: Owner only' }, { status: 403 });
    }


    // Backfill members
    const { data: users, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'Member');

    if (fetchError) throw fetchError;

    let count = 0;
    for (const u of (users || [])) {
      const { data: m } = await supabaseAdmin.from('members').select('id').eq('user_id', u.id).single();
      if (!m) {
        const displayId = generateSecureDisplayId();
          await supabaseAdmin.from('members').insert({
            user_id: u.id,
            name: u.name || 'User',
          email: u.email,
          display_id: displayId,
          join_date: new Date().toISOString().split('T')[0]
        });
        count++;
      }
    }

    // Fix admins: only fix admins
    let adminCount = 0;
    const { data: admins } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'Admin');

    if (admins) {
      for (const admin of admins) {
        if (admin.owner_id !== user.id) {
          await supabaseAdmin.from('users').update({ owner_id: user.id }).eq('id', admin.id);
          adminCount++;
        }
      }
    }

    return NextResponse.json({ message: `Backfill success. Synced ${count} missing members. Fixed ${adminCount} admins.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

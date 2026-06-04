import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
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

    let { data: firstGym } = await supabaseAdmin.from('gyms').select('id').limit(1).single();
    let targetGymId = firstGym ? firstGym.id : null;

    if (!targetGymId) {
      // Find an owner
      const { data: ownerUser } = await supabaseAdmin.from('users').select('id').eq('role', 'Owner').limit(1).single();
      
      // Create the missing gym
      const { data: newGym, error: gymError } = await supabaseAdmin.from('gyms').insert({
        name: 'Gaul Gym',
        owner_id: ownerUser ? ownerUser.id : null,
        address: 'Jl. Utama',
        opening_time: '06:00',
        closing_time: '22:00'
      }).select('id').single();

      if (gymError) throw gymError;
      targetGymId = newGym.id;
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

    // AUTO FIX ADMINS
    const { data: ownerUser } = await supabaseAdmin.from('users').select('id').eq('role', 'Owner').limit(1).single();
    let adminCount = 0;
    if (ownerUser) {
      const { data: admins } = await supabaseAdmin.from('users').select('*').eq('role', 'Admin');
      if (admins) {
        for (const admin of admins) {
          if (admin.owner_id !== ownerUser.id) {
            await supabaseAdmin.from('users').update({ owner_id: ownerUser.id }).eq('id', admin.id);
            adminCount++;
          }
        }
      }
    }

    return NextResponse.json({ message: `Backfill success. Synced ${count} missing members. Fixed ${adminCount} admins.` });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

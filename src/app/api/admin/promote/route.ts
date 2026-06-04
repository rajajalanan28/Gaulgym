import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, ownerId, memberId, gymId } = await request.json();

    if (!userId || !ownerId || !memberId || !gymId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify requester is Owner
    const { data: requester } = await supabaseAdmin
      .from('users')
      .select('role, gym_id')
      .eq('id', user.id)
      .single();
      
    if (requester?.role !== 'Owner') {
      return NextResponse.json({ error: 'Forbidden - Owner only' }, { status: 403 });
    }

    // Update user role to Admin and assign owner_id and gym_id
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: 'Admin', owner_id: ownerId, gym_id: gymId })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Hapus dari tabel members karena dia sekarang admin
    const { error: deleteError } = await supabaseAdmin
      .from('members')
      .delete()
      .eq('id', memberId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: 'Berhasil dipromosikan jadi admin.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

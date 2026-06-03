import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, ownerId, memberId, gymId } = await request.json();

    if (!userId || !ownerId || !memberId || !gymId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

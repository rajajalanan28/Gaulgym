import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

// M-15: Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute per user

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// Periodically clean up stale entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60_000); // every 5 minutes

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

    // Rate limiting check
    if (isRateLimited(user.id)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
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

    // C-6/H-18: Validate the target gym belongs to the requester (Owner)
    const { data: ownerGym } = await supabaseAdmin
      .from('gyms')
      .select('id')
      .eq('id', gymId)
      .eq('owner_id', user.id)
      .single();

    if (!ownerGym) {
      return NextResponse.json({ error: 'Forbidden - You do not own this gym' }, { status: 403 });
    }

    // Validate the target user belongs to the specified gym
    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('id, gym_id')
      .eq('id', userId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (targetUser.gym_id !== gymId) {
      return NextResponse.json({ error: 'Forbidden - Target user does not belong to your gym' }, { status: 403 });
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

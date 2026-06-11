import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 resets per minute per user

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

// Periodically clean up stale entries
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
      return NextResponse.json({ error: 'Terlalu banyak request. Coba lagi sebentar.' }, { status: 429 });
    }

    const { targetUserId, newPassword } = await request.json();

    if (!targetUserId || !newPassword) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Verify requester is Owner
    const { data: requester } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (requester?.role !== 'Owner') {
      return NextResponse.json({ error: 'Akses Ditolak - Hanya untuk Owner' }, { status: 403 });
    }

    // Validate the target user exists and is actually an Admin (don't let them reset another Owner accidentally without knowing)
    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    
    // We only allow resetting Admins and Members, maybe even just Admins here. 
    // Allowing Owner is fine too since Owner might want to reset their own or another owner if multiple exist, but let's be safe
    if (targetUser.role === 'Owner' && targetUserId !== user.id) {
        return NextResponse.json({ error: 'Tidak bisa reset password Owner lain' }, { status: 403 });
    }

    // Update user password securely using Auth Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Password berhasil direset!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

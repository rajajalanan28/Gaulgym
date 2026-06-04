import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

    const { data: requester } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (requester?.role !== 'Owner') {
      return NextResponse.json({ error: 'Forbidden - Owner only' }, { status: 403 });
    }

    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const finalEmail = email.trim().toLowerCase();

    // Create user in Supabase Auth
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: finalEmail,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (createAuthError) {
      return NextResponse.json({ error: createAuthError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Insert into public.users table
    const { data: userData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: finalEmail,
        name,
        role: 'Admin',
        owner_id: user.id,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: userData });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

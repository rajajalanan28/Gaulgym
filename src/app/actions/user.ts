'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the Service Role key
// This bypasses RLS and allows creating users without signing them in
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

import { v4 as uuidv4 } from 'uuid';

export async function registerMemberAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const gymId = formData.get('gymId') as string;
    const photoBase64 = formData.get('photoBase64') as string;
    
    if (!email || !name || !gymId) {
      return { error: 'Nama, Email, dan Gym ID wajib diisi' };
    }

    if (!supabaseServiceKey) {
      return { error: 'Sistem belum dikonfigurasi sepenuhnya. SUPABASE_SERVICE_ROLE_KEY belum diset.' };
    }

    // 1. Create user in Supabase Auth using Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'gaulgym123',
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      // If user already exists, it might throw an error. We can catch it or return it.
      return { error: authError.message };
    }

    const userId = authData.user.id;
    
    // 2. Generate a random display ID for the member
    const displayId = 'GG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const qrCode = uuidv4();

    // 3. Insert into public.users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        role: 'Member',
        phone,
        gym_id: gymId,
        is_active: true
      });

    if (userError) {
      console.error('Error inserting into users:', userError);
      // Fallback, we could delete auth user, but for now just return error
      return { error: 'Gagal membuat profil user' };
    }

    // 4. Handle Photo Upload
    let photoUrl = null;
    if (photoBase64) {
      try {
        const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${userId}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabaseAdmin
          .storage
          .from('member-photos')
          .upload(filename, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabaseAdmin.storage.from('member-photos').getPublicUrl(filename);
          photoUrl = publicUrlData.publicUrl;
        } else {
          console.error("Photo upload error:", uploadError);
        }
      } catch (err) {
        console.error("Failed to process photo buffer:", err);
      }
    }

    // 5. Insert into public.members table
    const { error: memberError } = await supabaseAdmin
      .from('members')
      .insert({
        user_id: userId,
        gym_id: gymId,
        display_id: displayId,
        name,
        email,
        phone,
        join_date: new Date().toISOString().split('T')[0],
        photo_url: photoUrl,
        qr_code: qrCode
      });

    if (memberError) {
      console.error('Error inserting into members:', memberError);
      return { error: 'Gagal membuat data keanggotaan' };
    }

    return { success: true, message: 'Member berhasil didaftarkan' };
    
  } catch (error: any) {
    console.error('Registration action error:', error);
    return { error: error.message || 'Terjadi kesalahan sistem' };
  }
}

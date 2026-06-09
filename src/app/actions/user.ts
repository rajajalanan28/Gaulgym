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
    let email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const photoBase64 = formData.get('photoBase64') as string;
    
    if (email) {
      email = email.trim().toLowerCase();
      if (!email.includes('@')) {
        email = `${email.replace(/\s+/g, '')}@gaulgym.com`;
      }
    }
    
    if (!email || !name) {
      return { error: 'Nama dan Email wajib diisi' };
    }

    if (!supabaseServiceKey) {
      return { error: 'Sistem belum dikonfigurasi sepenuhnya. SUPABASE_SERVICE_ROLE_KEY belum diset.' };
    }

    // 1. Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, name')
      .eq('email', email)
      .single();

    let userId = '';

    if (existingUser) {
      // User already exists, use their ID
      userId = existingUser.id;
    } else {
      const tempPassword = (formData.get('password') as string) || 'Gaulgym123!';

      // Create user in Supabase Auth using Admin API
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name }
      });

      if (authError) {
        return { error: authError.message };
      }

      userId = authData.user.id;

      // Insert into public.users table
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email,
          name,
          role: 'Member',
          phone,
          is_active: true
        });

      if (userError) {
        console.error('Error inserting into users:', userError);
        return { error: 'Gagal membuat profil user' };
      }
    }

    // 2. Generate a random display ID for the member
    const displayId = 'GG-' + uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
    const qrCode = uuidv4();

    // 4. Handle Photo Upload
    let photoUrl = null;
    if (photoBase64) {
      try {
        const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
        const filename = `${safeId}-${Date.now()}.jpg`;

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

export async function updateMemberPhotoAction(memberId: string, userId: string, photoBase64: string) {
  try {
    if (!memberId || !photoBase64) return { error: 'Data tidak lengkap' };
    
    let photoUrl = null;
    const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const idToUse = userId || memberId;
    const safeId = idToUse.replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `${safeId}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('member-photos')
      .upload(filename, buffer, { contentType: 'image/jpeg', upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabaseAdmin.storage.from('member-photos').getPublicUrl(filename);
      photoUrl = publicUrlData.publicUrl;
      
      const { error: updateError } = await supabaseAdmin
        .from('members')
        .update({ photo_url: photoUrl })
        .eq('id', memberId);
        
      if (updateError) return { error: 'Gagal update database' };
      return { success: true, photoUrl };
    } else {
      return { error: 'Gagal upload foto' };
    }
  } catch (err: any) {
    return { error: err.message };
  }
}
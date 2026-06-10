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

    let baseEmail = email;
    let finalEmail = email;
    let suffix = 1;
    let userId = '';
    let isNewUser = false;

    while (suffix < 50) {
      // 1. Check if user already exists in public.users
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id, name, role')
        .eq('email', finalEmail)
        .single();

      if (existingUser) {
        // Can we reuse it? Only if it's a Member without an active profile.
        if (existingUser.role !== 'Owner' && existingUser.role !== 'Admin') {
          const { data: existingMember } = await supabaseAdmin
            .from('members')
            .select('id')
            .eq('user_id', existingUser.id)
            .single();
            
          if (!existingMember) {
            // Yes, reuse it!
            userId = existingUser.id;
            break; // Exit loop
          }
        }
        // Conflict (either Owner/Admin or Member with profile), continue to next suffix
      } else {
        // Not in public.users, try creating in Auth
        const tempPassword = (formData.get('password') as string) || 'Gaulgym123!';
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: finalEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { name }
        });

        if (authError) {
          if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
            // Orphaned auth user, continue to next suffix
          } else {
            return { error: authError.message };
          }
        } else {
          // Success! User created in auth
          userId = authData.user.id;
          isNewUser = true;
          break; // Exit loop
        }
      }
      
      // Increment suffix and try again
      suffix++;
      const usernamePart = baseEmail.split('@')[0];
      const domainPart = baseEmail.split('@')[1];
      finalEmail = `${usernamePart}-${suffix}@${domainPart}`;
    }

    if (!userId) {
      return { error: 'Gagal membuat username unik setelah mencoba 50 kali. Silakan gunakan nama lain.' };
    }

    email = finalEmail;

    if (isNewUser) {
      // Insert into public.users table
      const { error: userError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: userId,
          email,
          name,
          role: 'Member',
          is_active: true
        });

      if (userError) {
        console.error('Error inserting into users:', userError);
        return { error: `Gagal membuat profil user: ${userError.message}` };
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
      .upsert({
        user_id: userId,
        display_id: displayId,
        name,
        email,
        phone,
        join_date: new Date().toISOString().split('T')[0],
        photo_url: photoUrl,
        qr_code: qrCode
      }, { onConflict: 'user_id' });

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

export async function deleteMemberAction(userId: string) {
  try {
    if (!userId) return { error: 'ID user tidak valid' };

    // Prevent deleting an Owner or Admin!
    const { data: userToDelete } = await supabaseAdmin.from('users').select('role').eq('id', userId).single();
    
    if (userToDelete && (userToDelete.role === 'Owner' || userToDelete.role === 'Admin')) {
       // Just delete their member record, do NOT delete their auth account!
       const { error: deleteMemberError } = await supabaseAdmin.from('members').delete().eq('user_id', userId);
       if (deleteMemberError) {
         return { error: 'Gagal menghapus data member: ' + deleteMemberError.message };
       }
       return { success: true, message: 'Hanya menghapus dari daftar member. Akun Owner/Admin tetap aman.' };
    }

    // Delete from auth.users (will cascade if foreign keys are set up correctly)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return { error: `Gagal menghapus user: ${deleteError.message}` };
    }

    return { success: true, message: 'Member berhasil dihapus' };
  } catch (err: any) {
    console.error('Delete member error:', err);
    return { error: err.message || 'Terjadi kesalahan sistem' };
  }
}

export async function editMemberAction(userId: string, newName: string, newPhone: string) {
  try {
    if (!userId || !newName) return { error: 'Data tidak lengkap' };

    // Update auth metadata (optional, but good practice)
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { name: newName }
    });

    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({ name: newName })
      .eq('id', userId);

    if (userError) return { error: 'Gagal update nama user' };

    const { error: memberError } = await supabaseAdmin
      .from('members')
      .update({ name: newName, phone: newPhone })
      .eq('user_id', userId);

    if (memberError) return { error: 'Gagal update data member' };

    return { success: true, message: 'Data member berhasil diubah' };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function resetMemberPasswordAction(userId: string, newPassword?: string) {
  try {
    if (!userId) return { error: 'ID user tidak valid' };
    
    const targetPassword = newPassword || 'Gaulgym123!';

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: targetPassword
    });

    if (updateError) {
      console.error('Error resetting password:', updateError);
      return { error: `Gagal mereset password: ${updateError.message}` };
    }

    return { success: true, message: 'Password berhasil direset', newPassword: targetPassword };
  } catch (err: any) {
    console.error('Reset password error:', err);
    return { error: err.message || 'Terjadi kesalahan sistem' };
  }
}

export async function cleanupOrphanedAuthUsersAction() {
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) return { error: authError.message };

    const { data: publicUsers, error: dbError } = await supabaseAdmin.from('users').select('id');
    if (dbError) return { error: dbError.message };

    const publicIds = new Set(publicUsers.map(u => u.id));
    let deletedCount = 0;

    for (const u of authData.users) {
      if (!publicIds.has(u.id)) {
        await supabaseAdmin.auth.admin.deleteUser(u.id);
        deletedCount++;
      }
    }

    return { success: true, message: `Berhasil membersihkan ${deletedCount} cache user yang nyangkut.` };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function editSubscriptionEndDateAction(subscriptionId: string, newEndDate: string) {
  try {
    if (!subscriptionId || !newEndDate) return { error: 'Data tidak lengkap' };
    
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ end_date: newEndDate })
      .eq('id', subscriptionId);
      
    if (error) return { error: `Gagal mengubah tanggal: ${error.message}` };
    return { success: true, message: 'Tanggal expired berhasil diubah' };
  } catch (err: any) {
    return { error: err.message };
  }
}
'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function openShiftAction(adminId: string, startingCash: number) {
  try {
    // Check if there's already an open shift for this admin
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('shifts')
      .select('*')
      .eq('admin_id', adminId)
      .eq('status', 'open')
      .single();

    if (existing) {
      return { error: 'Admin masih memiliki shift yang sedang aktif (belum ditutup).' };
    }

    const { data, error } = await supabaseAdmin
      .from('shifts')
      .insert({
        admin_id: adminId,
        starting_cash: startingCash,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error opening shift:', err);
    return { error: err.message || 'Gagal buka kasir' };
  }
}

export async function closeShiftAction(shiftId: string, endingCash: number, expectedCash: number, notes: string = '') {
  try {
    const { data, error } = await supabaseAdmin
      .from('shifts')
      .update({
        ending_cash: endingCash,
        expected_cash: expectedCash,
        end_time: new Date().toISOString(),
        status: 'closed',
        notes: notes
      })
      .eq('id', shiftId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error closing shift:', err);
    return { error: err.message || 'Gagal tutup kasir' };
  }
}

export async function getCurrentActiveShiftAction(adminId?: string) {
  try {
    // If adminId is provided, get THEIR active shift.
    // If not, maybe just return any open shift. Usually it's per admin.
    let query = supabaseAdmin
      .from('shifts')
      .select('*')
      .eq('status', 'open');

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1).single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return { success: true, data: null };
      }
      throw error;
    }
    return { success: true, data };
  } catch (err: any) {
    return { error: err.message, data: null };
  }
}

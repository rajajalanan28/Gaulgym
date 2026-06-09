'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function addExpenseAction(formData: FormData) {
  try {
    const gymId = formData.get('gymId') as string;
    const amountStr = formData.get('amount') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const createdBy = formData.get('createdBy') as string;

    if (!gymId || !amountStr || !category || !date || !createdBy) {
      return { error: 'Semua field wajib diisi' };
    }

    const amount = parseFloat(amountStr.replace(/[^0-9]/g, ''));

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert({
        gym_id: gymId,
        amount,
        category,
        description,
        date,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error adding expense:', err);
    return { error: err.message || 'Gagal menambahkan pengeluaran' };
  }
}

export async function deleteExpenseAction(id: string, gymId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('gym_id', gymId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting expense:', err);
    return { error: err.message || 'Gagal menghapus pengeluaran' };
  }
}

export async function getExpenseCategoriesAction(gymId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .select('category')
      .eq('gym_id', gymId);

    if (error) throw error;

    const categories = Array.from(new Set(data.map((e: any) => e.category)));
    return { success: true, categories };
  } catch (err: any) {
    return { error: err.message, categories: [] };
  }
}

export async function getExpensesAction(gymId: string, startDate?: string, endDate?: string) {
  try {
    let query = supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('gym_id', gymId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return { success: true, data };
  } catch (err: any) {
    console.error('Error fetching expenses:', err);
    return { error: err.message, data: [] };
  }
}

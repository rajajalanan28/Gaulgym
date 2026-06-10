'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Service role client bypasses RLS entirely — data loads instantly
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function getOwnerStatsAction() {
  try {
    const [
      { count: adminCount, error: adminError },
      { count: memberCount, error: memberError },
      { data: subs, error: subsError },
      { data: sales, error: salesError }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Admin'),
      supabaseAdmin.from('members').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('subscriptions').select('amount'),
      supabaseAdmin.from('sales_transactions').select('total_amount')
    ]);

    if (adminError || memberError || subsError || salesError) {
      return { data: null, error: (adminError || memberError || subsError || salesError)?.message };
    }

    const subsRevenue = subs?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
    const salesRevenue = sales?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;

    return {
      data: {
        totalMembers: memberCount || 0,
        totalAdmin: adminCount || 0,
        totalRevenue: subsRevenue + salesRevenue,
      },
      error: null
    };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function getOwnerRevenueChartAction() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString();

    const [
      { data: salesData, error: salesError },
      { data: subsData, error: subsError }
    ] = await Promise.all([
      supabaseAdmin
        .from('sales_transactions')
        .select('total_amount, created_at')
        .gte('created_at', startDate),
      supabaseAdmin
        .from('subscriptions')
        .select('amount, created_at')
        .gte('created_at', startDate)
    ]);

    if (salesError) throw salesError;
    if (subsError) throw subsError;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const groupedData: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      groupedData[days[d.getDay()]] = 0;
    }

    salesData?.forEach(t => {
      const d = new Date(t.created_at);
      const dayName = days[d.getDay()];
      if (groupedData[dayName] !== undefined) {
        groupedData[dayName] += (Number(t.total_amount) || 0);
      }
    });

    subsData?.forEach(t => {
      const d = new Date(t.created_at);
      const dayName = days[d.getDay()];
      if (groupedData[dayName] !== undefined) {
        groupedData[dayName] += (Number(t.amount) || 0);
      }
    });

    const chartData = Object.keys(groupedData).map(key => ({
      name: key,
      Pendapatan: groupedData[key]
    }));

    return { data: chartData, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
}

export async function getAdminStatsAction() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      { count: memberCount, error: memberError },
      { count: checkinCount, error: checkinError },
      { count: newMemberCount, error: newMemberError }
    ] = await Promise.all([
      supabaseAdmin.from('members').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'checked_in'),
      supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).gte('join_date', thirtyDaysAgo.toISOString().split('T')[0])
    ]);

    if (memberError || checkinError || newMemberError) {
      return { data: null, error: (memberError || checkinError || newMemberError)?.message };
    }

    return {
      data: {
        totalMembers: memberCount || 0,
        checkinsToday: checkinCount || 0,
        newMembers: newMemberCount || 0,
      },
      error: null
    };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

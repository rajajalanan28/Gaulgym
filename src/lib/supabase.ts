import { createClient } from '@supabase/supabase-js'
import { validateEnvVars } from './config'

validateEnvVars();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types matching Flutter app entities
export interface DbUser {
  id: string
  email: string
  name: string
  role: 'Owner' | 'Admin' | 'Member'
  phone?: string
  gym_id?: string
  owner_id?: string
  created_at: string
  last_login_at?: string
  is_active: boolean
}

export interface DbGym {
  id: string
  owner_id: string
  name: string
  address: string
  description?: string
  photo_url?: string
  is_active: boolean
  opening_time: string
  closing_time: string
  closed_days?: string[]
  phone?: string
  email?: string
  created_at: string
}

export interface DbMember {
  id: string
  user_id: string
  gym_id: string
  display_id: string
  name: string
  email: string
  phone?: string
  join_date: string
  photo_url?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  created_at: string
}

export interface DbSubscription {
  id: string
  member_id: string
  gym_id: string
  package_id: string
  package_name: string
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'pending' | 'cancelled'
  midtrans_order_id?: string
  midtrans_transaction_id?: string
  amount: number
  payment_status: string
  auto_renew: boolean
  created_by?: string
  created_by_name?: string
  created_at: string
}

export interface DbPackage {
  id: string
  gym_id: string
  name: string
  description?: string
  duration_days: number
  price: number
  price_display: string
  features: string[]
  color: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface DbAttendance {
  id: string
  member_id: string
  member_name: string
  gym_id: string
  date: string
  check_in: string
  check_out?: string
  check_in_by: string
  checked_in_by_admin_id?: string
  status: 'checked_in' | 'checked_out'
  notes?: string
  created_at: string
}

// Helper functions for common queries
export async function getUserWithRole(email: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) return { data: null, error }
    return { data: data as DbUser, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getGymsByOwner(ownerId: string) {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
    
    if (error) return { data: null, error }
    return { data: data as DbGym[], error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getMembersByGym(gymId: string) {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('gym_id', gymId)
      .order('name', { ascending: true })
    
    if (error) return { data: null, error }
    return { data: data as DbMember[], error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getAttendanceByDate(gymId: string, date: string) {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('gym_id', gymId)
      .eq('date', date)
      .order('check_in', { ascending: false })
    
    if (error) return { data: null, error }
    return { data: data as DbAttendance[], error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getOwnerStats(ownerId: string) {
  try {
    const { data: gyms, error: gymsError } = await getGymsByOwner(ownerId);
    if (gymsError || !gyms) return { data: null, error: gymsError || new Error('Failed to fetch gyms') };
    
    const gymIds = gyms.map((g: DbGym) => g.id);

    if (gymIds.length === 0) {
      return { data: { totalGyms: 0, totalMembers: 0, totalAdmin: 0, totalRevenue: 0 }, error: null };
    }

    const [
      { count: memberCount, error: memberError },
      { count: adminCount, error: adminError },
      { data: subs, error: subsError }
    ] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }).in('gym_id', gymIds),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Admin').eq('owner_id', ownerId),
      supabase.from('subscriptions').select('amount').in('gym_id', gymIds).eq('status', 'active')
    ]);

    if (memberError) return { data: null, error: memberError };
    if (adminError) return { data: null, error: adminError };
    if (subsError) return { data: null, error: subsError };

    const revenue = subs?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    return {
      data: {
        totalGyms: gyms.length,
        totalMembers: memberCount || 0,
        totalAdmin: adminCount || 0,
        totalRevenue: revenue,
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getOwnerRevenueChart(ownerId: string) {
  try {
    const { data: gyms, error: gymsError } = await supabase.from('gyms').select('id').eq('owner_id', ownerId);
    if (gymsError || !gyms || gyms.length === 0) return { data: [], error: null };

    const gymIds = gyms.map((g) => g.id);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const { data: transactions, error } = await supabase
      .from('sales_transactions')
      .select('amount, created_at, type')
      .in('gym_id', gymIds)
      .gte('created_at', startDate);

    if (error) throw error;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const groupedData: Record<string, number> = {};

    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      groupedData[dayName] = 0;
    }

    if (transactions) {
      transactions.forEach(t => {
        if (t.type === 'income') {
          const d = new Date(t.created_at);
          const dayName = days[d.getDay()];
          if (groupedData[dayName] !== undefined) {
            groupedData[dayName] += (t.amount || 0);
          }
        }
      });
    }

    const chartData = Object.keys(groupedData).map(key => ({
      name: key,
      Pendapatan: groupedData[key]
    }));

    return { data: chartData, error: null };
  } catch (error) {
    return { data: [], error };
  }
}

export async function getAdminStats(gymId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Let's assume new members in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      { count: memberCount, error: memberError },
      { count: checkinCount, error: checkinError },
      { count: newMemberCount, error: newMemberError }
    ] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('gym_id', gymId),
      supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('date', today).eq('status', 'checked_in'),
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).gte('join_date', thirtyDaysAgo.toISOString().split('T')[0])
    ]);

    if (memberError) return { data: null, error: memberError };
    if (checkinError) return { data: null, error: checkinError };
    if (newMemberError) return { data: null, error: newMemberError };

    return {
      data: {
        totalMembers: memberCount || 0,
        checkinsToday: checkinCount || 0,
        newMembers: newMemberCount || 0,
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
}


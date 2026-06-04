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
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error) throw error
  return data as DbUser
}

export async function getGymsByOwner(ownerId: string) {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as DbGym[]
}

export async function getMembersByGym(gymId: string) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('gym_id', gymId)
    .order('name', { ascending: true })
  
  if (error) throw error
  return data as DbMember[]
}

export async function getAttendanceByDate(gymId: string, date: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('gym_id', gymId)
    .eq('date', date)
    .order('check_in', { ascending: false })
  
  if (error) throw error
  return data as DbAttendance[]
}

export async function getOwnerStats(ownerId: string) {
  // Get all gyms
  const gyms = await getGymsByOwner(ownerId);
  const gymIds = gyms.map(g => g.id);

  if (gymIds.length === 0) {
    return { totalGyms: 0, totalMembers: 0, totalStaff: 0, totalRevenue: 0 };
  }

  // Get total members across all gyms
  const { count: memberCount, error: memberError } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .in('gym_id', gymIds);
  
  if (memberError) throw memberError;

  // Get total staff
  const { count: staffCount, error: staffError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'Admin')
    .eq('owner_id', ownerId);
    
  if (staffError) throw staffError;

  // Get revenue (sum of amounts in active subscriptions)
  const { data: subs, error: subsError } = await supabase
    .from('subscriptions')
    .select('amount')
    .in('gym_id', gymIds)
    .eq('status', 'active');
    
  if (subsError) throw subsError;
  const revenue = subs.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return {
    totalGyms: gyms.length,
    totalMembers: memberCount || 0,
    totalStaff: staffCount || 0,
    totalRevenue: revenue,
  };
}

export async function getAdminStats(gymId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { count: memberCount, error: memberError } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('gym_id', gymId);
    
  if (memberError) throw memberError;

  const { count: checkinCount, error: checkinError } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('gym_id', gymId)
    .eq('date', today)
    .eq('status', 'checked_in');

  if (checkinError) throw checkinError;

  // Let's assume new members in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { count: newMemberCount, error: newMemberError } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('gym_id', gymId)
    .gte('created_at', thirtyDaysAgo.toISOString());
    
  if (newMemberError) throw newMemberError;

  return {
    totalMembers: memberCount || 0,
    checkinsToday: checkinCount || 0,
    newMembers: newMemberCount || 0,
  };
}


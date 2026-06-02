import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types matching Flutter app entities
export interface DbUser {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member'
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

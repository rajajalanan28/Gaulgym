'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Eye, Shield, Activity, Search, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  created_at: string;
  users: { name: string; email: string } | null;
}

export default function AuditPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTable, setFilterTable] = useState('all');

  useEffect(() => {
    async function fetchLogs() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('global_audit_logs')
          .select('*, users!admin_id(name, email)')
          .order('created_at', { ascending: false })
          .limit(200);
          
        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        console.error("Gagal memuat jejak audit:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLogs();
  }, [user]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.table_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTable = filterTable === 'all' || log.table_name === filterTable;
    return matchesSearch && matchesTable;
  });

  const getActionColor = (action: string) => {
    switch(action) {
      case 'INSERT': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDataChange = (log: AuditLog) => {
    if (log.action_type === 'UPDATE') {
      const changedKeys = Object.keys(log.new_data || {}).filter(key => {
        // Simple comparison
        return JSON.stringify(log.old_data?.[key]) !== JSON.stringify(log.new_data?.[key]);
      });

      if (changedKeys.length === 0) return <span className="text-gray-500 italic">Perubahan internal sistem</span>;

      return (
        <div className="space-y-1">
          {changedKeys.map(key => (
            <div key={key} className="text-xs">
              <span className="font-semibold text-gray-400">{key}:</span>{' '}
              <span className="line-through text-red-400 opacity-80">{String(log.old_data?.[key])}</span>
              {' '}➔{' '}
              <span className="text-green-400">{String(log.new_data?.[key])}</span>
            </div>
          ))}
        </div>
      );
    } else if (log.action_type === 'INSERT') {
      return (
        <div className="text-xs text-gray-400">
          Mendaftar: <span className="text-white">{log.new_data?.name || log.new_data?.description || log.record_id}</span>
        </div>
      );
    } else if (log.action_type === 'DELETE') {
      return (
        <div className="text-xs text-gray-400">
          Menghapus: <span className="text-red-400 line-through">{log.old_data?.name || log.old_data?.description || log.record_id}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <ProtectedRoute allowedRoles={['Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />

        <div className="mb-[32px]">
          <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em] flex items-center gap-3">
            <Eye className="text-blue-500" size={32} />
            Jejak Audit Global
          </h1>
          <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Pantau seluruh perubahan data krusial di sistem yang dilakukan oleh Admin.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari admin, tabel, atau aksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-1)] text-white rounded-xl border border-white/10 focus-ring text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="pl-9 pr-8 py-2 bg-[var(--color-surface-1)] text-white rounded-xl border border-white/10 focus-ring text-sm appearance-none min-w-[160px]"
            >
              <option value="all">Semua Tabel</option>
              <option value="products">Produk & Barang</option>
              <option value="members">Daftar Member</option>
              <option value="expenses">Pengeluaran</option>
              <option value="subscriptions">Langganan</option>
              <option value="users">Data User</option>
            </select>
          </div>
        </div>

        <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-2)]">
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">Pelaku</th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">Aksi & Modul</th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-hairline)]">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-full max-w-[200px]"></div></td>
                    </tr>
                  ))
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                            {log.users?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{log.users?.name || 'Sistem / Tidak Diketahui'}</div>
                            <div className="text-[11px] text-gray-500 font-mono">{log.admin_id?.substring(0,8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getActionColor(log.action_type)}`}>
                            {log.action_type}
                          </span>
                          <span className="text-xs font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                            {log.table_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5 font-mono text-[13px]">
                          {formatDataChange(log)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <Shield size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-medium">Belum ada jejak audit yang ditemukan</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

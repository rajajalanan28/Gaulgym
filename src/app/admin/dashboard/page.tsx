import React from 'react';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Check-in Hari Ini',
      value: '47',
      change: '+12%',
      positive: true,
    },
    {
      title: 'Member Aktif',
      value: '342',
      change: '+5%',
      positive: true,
    },
    {
      title: 'Member Baru',
      value: '18',
      change: '+8',
      positive: true,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">{stat.title}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
            <p className={`text-sm mt-2 ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
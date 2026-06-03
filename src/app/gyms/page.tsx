"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";

interface Gym {
  id: string;
  name: string;
  address: string;
  phone: string;
  members: number;
  status: "Active" | "Inactive";
}

const mockGyms: Gym[] = [
  { id: "1", name: "FitZone Central", address: "Parenggean, Provinsi Kalimantan Tengah", phone: "021-1234567", members: 250, status: "Active" },
  { id: "2", name: "PowerGym Bandung", address: "Jl. Braga No. 45, Bandung", phone: "022-7654321", members: 180, status: "Active" },
  { id: "3", name: "MuscleFactory Surabaya", address: "Jl. Pemuda No. 88, Surabaya", phone: "031-9876543", members: 320, status: "Active" },
  { id: "4", name: "Iron Haven Yogyakarta", address: "Jl. Malioboro No. 22, Yogyakarta", phone: "0274-554433", members: 95, status: "Inactive" },
  { id: "5", name: "FlexFit Denpasar", address: "Jl. Sunset Road No. 10, Bali", phone: "0361-112233", members: 150, status: "Active" },
];

export default function GymsPage() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddGym = () => {
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3000);
  };

  return (
    <ProtectedRoute allowedRoles={['Owner', 'Admin']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] text-white">
        <DashboardHeader />
        
        <div className="flex justify-between items-center mb-6 mt-8">
          <h1 className="text-2xl font-bold text-gray-100">Daftar Gym</h1>
        <button
          onClick={handleAddGym}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Tambah Gym
        </button>
      </div>

      {showConfirm && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
          Fitur tambah gym akan segera hadir! Permintaan Anda telah tercatat.
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nama Gym</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Alamat</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Telepon</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Anggota</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockGyms.map((gym) => (
              <tr key={gym.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{gym.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{gym.address}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{gym.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">{gym.members}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      gym.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {gym.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </ProtectedRoute>
  );
}

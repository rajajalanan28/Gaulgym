"use client";

import { useState } from "react";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "Active" | "On Leave" | "Inactive";
}

const mockStaff: StaffMember[] = [
  { id: 1, name: "John Smith", role: "Personal Trainer", email: "john.smith@gym.com", phone: "555-0101", status: "Active" },
  { id: 2, name: "Sarah Johnson", role: "Yoga Instructor", email: "sarah.j@gym.com", phone: "555-0102", status: "Active" },
  { id: 3, name: "Mike Davis", role: "Fitness Coach", email: "mike.d@gym.com", phone: "555-0103", status: "On Leave" },
  { id: 4, name: "Emily Chen", role: "Receptionist", email: "emily.c@gym.com", phone: "555-0104", status: "Active" },
  { id: 5, name: "Tom Wilson", role: "Maintenance", email: "tom.w@gym.com", phone: "555-0105", status: "Active" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);

  const handleAddStaff = () => {
    const newId = Math.max(...staff.map((s) => s.id)) + 1;
    const newStaff: StaffMember = {
      id: newId,
      name: "New Staff",
      role: "Position",
      email: `staff${newId}@gym.com`,
      phone: "555-0000",
      status: "Active",
    };
    setStaff([...staff, newStaff]);
    console.log("Staff member added successfully!");
    alert("Staff member added successfully!");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Staff Management</h1>
        <button
          onClick={handleAddStaff}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          + Add Staff
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ backgroundColor: "#f3f4f6" }}>
            <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>ID</th>
            <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>Name</th>
            <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>Role</th>
            <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>Email</th>
            <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>Phone</th>
            <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "1rem" }}>{member.id}</td>
              <td style={{ padding: "1rem" }}>{member.name}</td>
              <td style={{ padding: "1rem" }}>{member.role}</td>
              <td style={{ padding: "1rem" }}>{member.email}</td>
              <td style={{ padding: "1rem" }}>{member.phone}</td>
              <td style={{ padding: "1rem" }}>
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.875rem",
                    backgroundColor:
                      member.status === "Active"
                        ? "#dcfce7"
                        : member.status === "On Leave"
                        ? "#fef9c3"
                        : "#f3f4f6",
                    color:
                      member.status === "Active"
                        ? "#166534"
                        : member.status === "On Leave"
                        ? "#854d0e"
                        : "#6b7280",
                  }}
                >
                  {member.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
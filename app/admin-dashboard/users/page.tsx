"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/navbar"; // ✅ Import your Navbar
import useAuth from "@/hooks/useAuth";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, isLoading } = useAuth("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const loadUsers = async () => {
    const res = await fetch("/api/users");

    if (res.status === 403) {
      alert("Access denied. Admins only.");
      return;
    }

    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers().finally(() => setLoading(false));
  }, []);

  const addUser = async () => {
    if (!email || !password) {
      alert("Email & password are required");
      return;
    }

    const res = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({
        email,
        password_hash: password,
        role,
      }),
    });

    if (res.ok) {
      alert("User added successfully!");
      setEmail("");
      setPassword("");
      setRole("employee");
      loadUsers();
    } else {
      alert("Failed to add user.");
    }
  };

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* ✅ Navbar */}
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-6">Manage Users</h1>

        {/* Add User */}
        <div className="bg-white p-6 shadow-md rounded-lg mb-10">
          <h2 className="text-2xl font-semibold mb-4">Add New User</h2>

          <div className="space-y-4">
            <input
              className="w-full border p-2 rounded"
              placeholder="User Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full border p-2 rounded"
              type="text"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <select
              className="w-full border p-2 rounded"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={addUser}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add User
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">All Users</h2>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 capitalize">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

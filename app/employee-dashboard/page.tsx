"use client";
import Navbar from "./components/navbar";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";

export default function EmployeeDashboard() {
  const { user, isLoading } = useAuth("employee");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-10 mb-10 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Employee Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome, <span className="font-semibold">{user?.email}</span>
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Work To Do */}
          <div className="bg-white p-6 shadow-md rounded-xl hover:shadow-lg transition">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Work To Do</h2>
            <p className="text-gray-600 mb-4">
              View and complete assigned daily tasks.
            </p>
            <Link
              href="/employee-dashboard/Work"
              className="block text-center bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View Tasks
            </Link>
          </div>

          {/* Items Detail */}
          <div className="bg-white p-6 shadow-md rounded-xl hover:shadow-lg transition">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Items Detail</h2>
            <p className="text-gray-600 mb-4">
              Review tools, items, and assigned resources.
            </p>
            <Link
              href="/employee-dashboard/Item-Detail"
              className="block text-center bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
            >
              View Items
            </Link>
          </div>

          {/* History */}
          <div className="bg-white p-6 shadow-md rounded-xl hover:shadow-lg transition">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">History</h2>
            <p className="text-gray-600 mb-4">
              View your work history and completed tasks.
            </p>
            <Link
              href="/employee-dashboard/history"
              className="block text-center bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              View History
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

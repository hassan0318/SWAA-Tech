"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from 'next/image';

export default function EmployeeNavbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/verify", { method: "GET" });

        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // 🚪 Logout (removes HTTP-only cookie from server)
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh(); 
  };

 return (
    <nav className="w-full bg-gray-300 px-6 py-4 shadow-md relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <h1 className="w-12">
          <Image src="/1.png" alt="logo" className="w-full h-auto" width={500} height={50} />
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-gray-800 font-medium">
           <Link href="/employee-dashboard" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link href="/employee-dashboard/Item-Detail" className="hover:text-blue-600 transition">
            Items Detail
          </Link>
          <Link href="/employee-dashboard/Work" className="hover:text-blue-600 transition">
            Work To Do
          </Link>
          <Link href="/employee-dashboard/history" className="hover:text-blue-600 transition">
            History
          </Link>
        </div>

        {/* Logout Button */}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="hidden md:block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        )}

        {/* Mobile Hamburger Menu */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-gray-200 p-4 rounded-lg shadow-lg space-y-3 text-gray-800">
          <Link href="/employee-dashboard" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link href="/employee-dashboard/Item-Detail" className="block hover:text-blue-600">
            Items Detail
          </Link>
          <Link href="/employee-dashboard/Work" className="block hover:text-blue-600">
            Work To Do
          </Link>
          <Link href="/employee-dashboard/history" className="block hover:text-blue-600">
            History
          </Link>

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

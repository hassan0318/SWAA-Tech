"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // TypeScript fix: Use a specific type for the user object or 'any' if the structure is complex/unknown
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔥 Check logged-in user using HTTP-only cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Fetch endpoint to verify token/session
        const res = await fetch("/api/auth/verify", { method: "GET" });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handler for logging out
  const handleLogout = async () => {
    // Call the logout API endpoint
    await fetch("/api/auth/logout", { method: "POST" });
    
    // Redirect to the login page (root path in this case)
    router.push("/");
    
    // Force a re-fetch of data/re-render to update the UI immediately
    router.refresh(); 
  };

  const navItem = (href: string, label: string) => (
    <Link
      href={href}
      // Close mobile menu on click
      onClick={() => setMenuOpen(false)} 
      className={`px-3 py-2 rounded-md transition block ${
        // Conditional styling for the active link
        pathname === href || pathname.startsWith(href + '/') // Added check for nested paths
          ? "text-blue-600 font-semibold"
          : "hover:text-blue-500"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 relative z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
         <Image src="/1.png" alt="logo" width={50} height={50} />
          <span className="text-xl font-bold">SWAA-Tech</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 text-gray-700">
          {navItem("/admin-dashboard", "Home")}
          {navItem("/admin-dashboard/users", "Users")}
          {navItem("/admin-dashboard/invoice-history", "Invoice-History")}
          {navItem("/admin-dashboard/products", "Products")}
        </div>

        {/* Desktop Auth Button */}
        {!loading && (
          <div className="hidden md:block">
            {user ? (
              // Display Logout button when user is logged in
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout ({user.email || 'User'})
              </button>
            ) : (
              // Display Login button when user is logged out (redirects to /)
              <Link
                href="/" // Corrected: Links to the root path (/)
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </Link>
            )}
          </div>
        )}

        {/* Hamburger Menu Button */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-gray-100 p-4 rounded-lg shadow-xl space-y-3">
          {navItem("/admin-dashboard", "Home")}
          {navItem("/admin-dashboard/users", "Users")}
          {navItem("/admin-dashboard/invoice-history", "Invoice-History")}
          {navItem("/admin-dashboard/products", "Products")}

          {!loading && (
            <div className="pt-3 border-t border-gray-300">
    <button
      onClick={handleLogout}
      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
    >
      Logout
    </button>
  </div>
          )}
        </div>
      )}
    </nav>
  );
}
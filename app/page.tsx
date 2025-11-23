"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const { token, role } = await res.json();
      localStorage.setItem("token", token);
      if (role === "admin") {
        router.push("/admin-dashboard");
      } else {
        router.push("/employee-dashboard");
      }
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen bg-white overflow-hidden">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 order-2 lg:order-1">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg w-full max-w-md"
        >
          <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-center text-gray-800">
            WELCOME TO <span className="text-blue-600">SWAA TECHNOLOGIES</span>
          </h1>

          <div className="mb-4">
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition duration-300 transform hover:-translate-y-1"
          >
            Sign In
          </button>
        </form>
      </div>

      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-2 lg:p-8 order-1 lg:order-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative w-full h-full max-w-2xl">
         <Image 
            src="/2.jpg"
            alt="SWAA Technologies"
            // ✅ Use layout="fill" to make the image take up 100% of the parent's size
            layout="fill" 
            // ✅ Use objectFit="cover" (replaces the Tailwind 'object-cover')
            objectFit="cover" 
            // ✅ Keep the styling for the outer container and rounding
            className="rounded-3xl shadow-xl" 
        />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl flex items-end p-6">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-2">Innovation at its finest</h2>
              <p className="text-base opacity-90">
                Transforming businesses with cutting-edge technology solutions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

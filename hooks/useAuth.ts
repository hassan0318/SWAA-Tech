"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: "admin" | "employee";
}

export default function useAuth(requiredRole?: "admin" | "employee") {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      try {
        // Use your existing verify API
        const response = await fetch("/api/auth/verify");

        if (!response.ok) {
          throw new Error("Not authenticated");
        }

        const userData = await response.json();
        setUser(userData);

        // Check role permissions
        if (requiredRole && userData.role !== requiredRole) {
          if (userData.role === "admin") {
            router.push("/admin-dashboard");
          } else {
            router.push("/employee-dashboard");
          }
          return;
        }
      } catch (err) {
        console.error("Auth error:", err);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  return { user, isLoading };
}
// pages/employee-dashboard/index.tsx

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";
import AddServiceModal from "./AddServiceModel";
import ServiceFilters from "./ServiceFilters";
import ServiceGrid from "./ServiceGrid";

import { ServiceItem } from "../../../types";

export default function EmployeeDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGridType, setSelectedGridType] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<ServiceItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/services/");
      if (!res.ok) throw new Error(`Failed to fetch services: ${res.status}`);
      const data = await res.json();
      setServices(data);
      setError(null);
    } catch (err: any) {
      setError("Failed to load services. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (item: ServiceItem) => {
    if (item.quantity !== null && item.quantity <= 0) {
      alert("❌ This item is out of stock and cannot be added to invoice.");
      return;
    }
    if (!cartItems.find((i) => i.id === item.id)) {
      setCartItems([...cartItems, item]);
    }
  };

const handleGenerateInvoice = async () => {
  if (cartItems.length === 0) {
    alert("🛒 No items in cart to generate invoice.");
    return;
  }

  try {
    const token = localStorage.getItem("token"); // Or use session/auth state

    if (!token) {
      alert("🔒 Please log in first.");
      return;
    }

    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        cartItems,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert("❌ Failed to generate invoice: " + result.error);
      return;
    }

    const invoiceId = result.invoice.id;

    // Clear cart after successful invoice generation
    setCartItems([]);

    // Redirect to the invoice details page
    router.push(`/employee-dashboard/invoice/${invoiceId}`);
  } catch (err) {
    console.error("Error generating invoice:", err);
    alert("❌ Unexpected error. Please try again.");
  }
};


  const resetFilters = () => {
    setSelectedGridType(null);
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrid = selectedGridType ? service.grid_type === selectedGridType : true;
    const matchesCategory = selectedCategory ? service.product_category === selectedCategory : true;
    return matchesSearch && matchesGrid && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* Add Button */}
      <div className="max-w-4xl mx-auto mt-10 mb-16">
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          Add New Service
        </button>
      </div>

      {/* Add Service Modal */}
      {showAddForm && (
        <AddServiceModal
          setShowAddForm={setShowAddForm}
          fetchServices={fetchServices}
        />
      )}

      {/* Filters (Step 1 and 2) */}
      <ServiceFilters
        services={services}
        selectedGridType={selectedGridType}
        selectedCategory={selectedCategory}
        setSelectedGridType={setSelectedGridType}
        setSelectedCategory={setSelectedCategory}
        resetFilters={resetFilters}
      />

      {/* Step 3: Service List */}
      {selectedGridType && selectedCategory && (
        <ServiceGrid
          services={filteredServices}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleAddToCart={handleAddToCart}
        />
      )}

      {/* Invoice Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleGenerateInvoice}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-800 transition"
          >
            🧾 Generate Invoice ({cartItems.length})
          </button>
        </div>
      )}
    </div>
  );
}

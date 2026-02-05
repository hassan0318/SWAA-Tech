"use client";
import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";

interface ServiceItem {
  id: string;
  grid_type: string;
  product_category: string;
  product_name: string;
  rate: number;
  // quantity removed from interface
  created_at: string;
  updated_at: string;
}

export default function ClientItemDetail({ item }: { item: ServiceItem }) {
  const { user, isLoading } = useAuth("employee");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<ServiceItem>(item);
  const [loading, setLoading] = useState(false);

  // Sync state if the parent item updates
  useEffect(() => {
    setForm(item);
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Improved logic to allow typing decimals for Rate
    let newValue: string | number = value;

    if (name === "rate") {
       if (value === "") {
         newValue = ""; // Allow empty
       } else if (value.endsWith(".")) {
         newValue = value; // Allow trailing decimal while typing
       } else {
         newValue = Number(value); // Convert to number
       }
    }

    setForm({
      ...form,
      [name]: newValue,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Ensure rate is a valid number before sending
      const payload = {
        ...form,
        rate: Number(form.rate)
      };

      const res = await fetch("/api/services/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        alert("❌ Error: " + error);
        return;
      }

      alert("✅ Item updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div>...loading</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {!editMode ? (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {item.product_name}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <p>
              <span className="font-semibold">Category:</span> {item.product_category}
            </p>
            <p>
              <span className="font-semibold">Rate:</span> {item.rate}
            </p>
            {/* Quantity Display Removed */}
            <p>
              <span className="font-semibold">Created At:</span>{" "}
              {new Date(item.created_at).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold">Updated At:</span>{" "}
              {new Date(item.updated_at).toLocaleDateString()}
            </p>
          </div>
          {user?.role === "employee" && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              ✏️ Edit Item
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Edit Item</h2>

          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            placeholder="Product Name"
            className="w-full mb-3 p-2 border rounded"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            name="product_category"
            value={form.product_category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full mb-3 p-2 border rounded"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
          <input
            type="number"
            name="rate"
            value={form.rate}
            onChange={handleChange}
            placeholder="Rate"
            className="w-full mb-3 p-2 border rounded"
          />

          {/* Quantity Input Removed */}

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setForm(item); // Revert changes
              }}
              className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
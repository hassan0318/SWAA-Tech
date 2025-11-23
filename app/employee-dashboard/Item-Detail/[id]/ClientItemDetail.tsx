"use client";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { Divide } from "lucide-react";

interface ServiceItem {
  id:string;
  grid_type: string;
  product_category: string;
  product_name: string;
  rate: number;
  quantity: number | null;
  created_at: string;
  updated_at: string;
}

export default function ClientItemDetail({ item }: { item: ServiceItem }) {
  const {user , isLoading} = useAuth("employee");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<ServiceItem>(item);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "rate" || name === "quantity" ? Number(value) : value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
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

  if (isLoading){
    return <>
    ...loading</>
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
              <span className="font-semibold">Rate:</span> ${item.rate}
            </p>
            <p>
              <span className="font-semibold">Quantity:</span> {item.quantity ?? ""}
            </p>
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
          
          <input
            type="text"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            placeholder="Product Name"
            className="w-full mb-3 p-2 border rounded"
          />
          
          <input
            type="text"
            name="product_category"
            value={form.product_category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full mb-3 p-2 border rounded"
          />
          
          <input
            type="number"
            name="rate"
            value={form.rate}
            onChange={handleChange}
            placeholder="Rate"
            className="w-full mb-3 p-2 border rounded"
          />
          
          <input
            type="number"
            name="quantity"
            value={form.quantity ?? ""}
            onChange={handleChange}
            placeholder="Quantity"
            className="w-full mb-3 p-2 border rounded"
          />
          
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditMode(false)}
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
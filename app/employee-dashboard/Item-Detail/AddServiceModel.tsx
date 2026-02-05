// components/dashboard/AddServiceModal.tsx

import { useState } from "react";
import { ServiceItem } from "@/types";

interface AddServiceModalProps {
  setShowAddForm: (value: boolean) => void;
  fetchServices: () => void;
}

const AddServiceModal = ({ setShowAddForm, fetchServices }: AddServiceModalProps) => {
  const [newService, setNewService] = useState<Partial<ServiceItem>>({
    grid_type: "OnGrid",
    product_category: "",
    product_name: "",
    rate: 0,
    
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddService = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { grid_type, product_category, product_name, rate } = newService;

      if (!product_category || !product_name || !rate || rate <= 0) {
        setError("Please fill in all required fields (Category, Name, and Rate)");
        return;
      }

      const res = await fetch("/api/services/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || `Server error: ${res.status}`);
      }

      alert("✅ Service added successfully!");
      setShowAddForm(false);
      fetchServices();
    } catch (err: any) {
      setError(err.message || "Failed to add service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Add New Service</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Grid Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Grid Type *</label>
              <select
                value={newService.grid_type}
                onChange={(e) => setNewService({ ...newService, grid_type: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="OnGrid">OnGrid</option>
                <option value="OffGrid">OffGrid</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Product Category *</label>
              <select
                value={newService.product_category}
                onChange={(e) => setNewService({ ...newService, product_category: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Category</option>
                <option value="Services">Services</option>
                <option value="BOS">BOS</option>
                <option value="Inverter">Inverter</option>
                <option value="Panels">Panels</option>
                <option value="Wiring">Wiring</option>
                <option value="Structure">Structure</option>
                <option value="Battery">Battery</option>
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                type="text"
                value={newService.product_name}
                onChange={(e) =>
                  setNewService({ ...newService, product_name: e.target.value })
                }
                placeholder="e.g., Trina N type Industrial Panel"
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Rate */}
            <div>
              <label className="block text-sm font-medium mb-1">Rate *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newService.rate ?? 0}
                onChange={(e) =>
                  setNewService({ ...newService, rate: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleAddService}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Service"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;

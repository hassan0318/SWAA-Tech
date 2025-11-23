// components/dashboard/ServiceFilters.tsx

import React from "react";
import { ServiceItem } from "@/types";

interface Props {
  services: ServiceItem[];
  selectedGridType: string | null;
  selectedCategory: string | null;
  setSelectedGridType: (val: string | null) => void;
  setSelectedCategory: (val: string | null) => void;
  resetFilters: () => void;
}

const ServiceFilters = ({
  services,
  selectedGridType,
  selectedCategory,
  setSelectedGridType,
  setSelectedCategory,
  resetFilters,
}: Props) => {
  const categories = Array.from(new Set(services.map((s) => s.product_category))).sort((a, b) => {
    const order = ["Services", "BOS", "Inverter", "Panels", "Wiring", "Structure", "Battery"];
    return order.indexOf(a) - order.indexOf(b);
  });

  const gridTypes = Array.from(new Set(services.map((s) => s.grid_type))).sort((a, b) => {
    const order = ["OnGrid", "OffGrid"];
    return order.indexOf(a) - order.indexOf(b);
  });

  if (selectedGridType && selectedCategory) {
    return (
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedGridType} - <span className="text-indigo-600">{selectedCategory}</span>
          </h2>
          <button
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
            Back to service selection
          </button>
        </div>
      </div>
    );
  }

  if (!selectedGridType) {
    return (
      <div className="max-w-4xl mx-auto mb-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Select Grid Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gridTypes.map((grid) => (
            <button
              key={grid}
              onClick={() => setSelectedGridType(grid)}
              className="p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border-2 border-indigo-100"
            >
              <h3 className="text-2xl font-bold text-indigo-700">{grid}</h3>
              <p className="text-gray-600 mt-2">Click to view {grid} services</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="max-w-4xl mx-auto mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Select Category for <span className="text-indigo-700">{selectedGridType}</span>
          </h2>
          <button
            onClick={() => setSelectedGridType(null)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Back to Grid Types
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition text-center"
            >
              <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default ServiceFilters;
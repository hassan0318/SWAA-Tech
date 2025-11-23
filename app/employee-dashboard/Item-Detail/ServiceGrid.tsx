// components/dashboard/ServiceGrid.tsx

import Link from "next/link";
import { ServiceItem } from "@/types";

interface Props {
  services: ServiceItem[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  handleAddToCart: (item: ServiceItem) => void;
}

const ServiceGrid = ({ services, searchQuery, setSearchQuery, handleAddToCart }: Props) => {
  return (
    <div className="max-w-6xl mx-auto mb-16">
      <div className="mb-10 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {services.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
              <h3 className="text-lg font-bold">{item.product_name}</h3>
              <div className="text-sm opacity-90">{item.product_category}</div>
            </div>
            <div className="p-5">
              <p className="text-gray-700 font-medium">Rate: ${item.rate}</p>
              {item.quantity && <p className="text-gray-600">Qty: {item.quantity}</p>}
              <div className="flex gap-3 mt-5">
                <Link href={`/employee-dashboard/Item-Detail/${item.id}`} className="flex-1">
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition shadow-md">
                    View Details
                  </button>
                </Link>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition shadow-md"
                >
                  Add to Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No services found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceGrid;

"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import useAuth from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient"; 

interface OrderData {
  dbKey: string; // The unique database Key
  id: string;
  status: string;
  userEmail: string;
  createdAt: string; 
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    state?: string;
    zipCode?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

export default function Work() {
  const { user, isLoading } = useAuth("employee");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("kv_store_0e5eb92a")
        .select("key, value") // Fetch KEY to identify rows
        .like("key", "order:%");

      if (error) throw error;

      if (data) {
        const formattedOrders = data.map((row: any) => ({
          ...row.value,
          dbKey: row.key // Assign the DB key so we can update/delete unique rows
        }));
        
        // Sort newest first
        formattedOrders.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(formattedOrders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  // Handle Updates
  const handleOrderUpdate = (updatedOrder: OrderData) => {
    setOrders(prev => prev.map(o => o.dbKey === updatedOrder.dbKey ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  // Handle Deletion (New Feature)
  const handleOrderDelete = (deletedDbKey: string) => {
    setOrders(prev => prev.filter(o => o.dbKey !== deletedDbKey)); // Remove from UI
    setSelectedOrder(null); // Close modal
  };

  if (isLoading || loadingOrders) return <div className="p-10">Loading work...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">📋 Installation Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">NO CURRENT WORK ORDERS</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div key={order.dbKey || order.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col h-full hover:shadow-lg transition">
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                  <span className="text-xs font-mono opacity-70">#{order.id.slice(-6)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    order.status === 'Completed' ? 'bg-green-500' : 
                    order.status === 'Processing' ? 'bg-blue-500' : 'bg-yellow-500 text-black'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="p-5 flex-grow space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{order.shippingAddress?.fullName}</h3>
                    <p className="text-sm text-gray-600">📞 {order.shippingAddress?.phone}</p>
                    <p className="text-sm text-gray-500 mt-1 truncate">📍 {order.shippingAddress?.address}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
                  >
                    Manage Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdate={handleOrderUpdate}
          onDelete={handleOrderDelete} 
        />
      )}
    </div>
  );
}

// --- UPDATED MODAL COMPONENT ---

function OrderDetailsModal({ 
  order, 
  onClose, 
  onUpdate,
  onDelete // New Prop
}: { 
  order: OrderData; 
  onClose: () => void;
  onUpdate: (order: OrderData) => void;
  onDelete: (key: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      const updatedOrderData = { ...order, status: newStatus };
      const { dbKey, ...jsonPayload } = updatedOrderData; 

      const { error } = await supabase
        .from("kv_store_0e5eb92a")
        .update({ value: jsonPayload })
        .eq("key", order.dbKey);

      if (error) throw error;
      onUpdate(updatedOrderData);
      alert(`Order marked as ${newStatus}!`);
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // New Delete Function
  const deleteOrder = async () => {
    const confirmed = window.confirm("⚠️ Are you sure you want to PERMANENTLY delete this order? This cannot be undone.");
    if (!confirmed) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("kv_store_0e5eb92a")
        .delete()
        .eq("key", order.dbKey);

      if (error) throw error;

      alert("🗑️ Order deleted successfully.");
      onDelete(order.dbKey); // Update parent UI

    } catch (err: any) {
      console.error("Delete failed:", err);
      alert("Failed to delete order: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">Manage Order</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-400 text-sm">Status:</span> 
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    order.status === 'Completed' ? 'bg-green-500' : 
                    order.status === 'Processing' ? 'bg-blue-500' : 'bg-yellow-500 text-black'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-gray-700 mb-2">Customer</h3>
            <p>{order.shippingAddress.fullName} | {order.shippingAddress.phone}</p>
            <p className="text-sm text-gray-500">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
          </div>
          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr><th className="px-4 py-2">Item</th><th className="px-4 py-2">Qty</th></tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-t"><td className="px-4 py-2">{item.name}</td><td className="px-4 py-2">{item.quantity}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="bg-gray-100 p-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* LEFT SIDE: DELETE BUTTON */}
          <button 
            onClick={deleteOrder}
            disabled={loading}
            className="text-red-600 hover:text-red-800 font-medium hover:bg-red-50 px-4 py-2 rounded-md transition"
          >
            {loading ? "..." : "🗑️ Delete Order"}
          </button>

          {/* RIGHT SIDE: STATUS BUTTONS */}
          <div className="flex gap-2">
            {order.status !== 'Pending' && (
              <button onClick={() => updateStatus("Pending")} disabled={loading} className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 font-medium disabled:opacity-50 text-sm">
                Set Pending
              </button>
            )}
            {order.status !== 'Processing' && order.status !== 'Completed' && (
              <button onClick={() => updateStatus("Processing")} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 shadow-sm text-sm">
                Mark Processing
              </button>
            )}
            {order.status !== 'Completed' && (
              <button onClick={() => updateStatus("Completed")} disabled={loading} className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 shadow-sm text-sm">
                Mark Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
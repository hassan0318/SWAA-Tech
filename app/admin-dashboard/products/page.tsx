"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import useAuth from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  grid_type: string;
  product_category: string;
  product_name: string;
  rate: number;
  quantity: number | null;
  created_at: string;
  updated_at: string;
}

export default function AdminProductsPage() {
  const { user, isLoading: authLoading } = useAuth("admin");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"rate" | "quantity" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto py-8 px-4">Loading...</div>
      </div>
    );
  }

  // Unique categories
  const categories = Array.from(new Set(products.map((p) => p.product_category)));

  // Filter products
  let filteredProducts = products.filter(
    (p) =>
      (!selectedCategory || p.product_category === selectedCategory) &&
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort products
  if (sortField) {
    filteredProducts.sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
  }

  const handleSort = (field: "rate" | "quantity") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="flex mt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r p-4">
          <h2 className="font-bold text-lg mb-4">Categories</h2>
          <ul className="flex flex-col gap-2">
            <li
              className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-100 ${
                selectedCategory === null ? "bg-gray-200 font-semibold" : ""
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </li>
            {categories.map((cat) => (
              <li
                key={cat}
                className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-100 ${
                  selectedCategory === cat ? "bg-gray-200 font-semibold" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">
            {selectedCategory || "All"} Products
          </h1>

          {/* Search & Sort */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded w-64 focus:outline-none focus:ring focus:border-blue-300"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSort("rate")}
                className={`px-3 py-2 border rounded hover:bg-gray-100 ${
                  sortField === "rate" ? "bg-gray-200 font-semibold" : ""
                }`}
              >
                Sort by Rate {sortField === "rate" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </button>
              <button
                onClick={() => handleSort("quantity")}
                className={`px-3 py-2 border rounded hover:bg-gray-100 ${
                  sortField === "quantity" ? "bg-gray-200 font-semibold" : ""
                }`}
              >
                Sort by Quantity {sortField === "quantity" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </button>
            </div>
          </div>

          {/* Products Table */}
          <Table>
            <TableCaption>{filteredProducts.length} product(s) found.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Grid Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => handleSort("rate")}
                >
                  Rate
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => handleSort("quantity")}
                >
                  Quantity
                </TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.grid_type}</TableCell>
                    <TableCell>{p.product_category}</TableCell>
                    <TableCell>{p.product_name}</TableCell>
                    <TableCell className="text-right">${p.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{p.quantity ?? "-"}</TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </main>
      </div>
    </div>
  );
}

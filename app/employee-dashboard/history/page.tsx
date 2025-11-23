"use client";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import Navbar from "../components/navbar";
import { supabase } from "@/lib/supabaseClient";
import { isSameMonth } from "@/components/dateHelpers";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Invoice {
  id: string;
  invoice_number: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
  employee_email: string;
}

export default function InvoiceTable() {
  const { user , isLoading} = useAuth("employee");
  const email = user?.email ?? "";
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const now = new Date();
  const currentMonthTotal = invoices
    .filter((inv) => isSameMonth(inv.created_at, now.getFullYear(), now.getMonth()))
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthTotal = invoices
    .filter((inv) => isSameMonth(inv.created_at, lastMonth.getFullYear(), lastMonth.getMonth()))
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  // Fetch all invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select(
            "id, invoice_number, payment_status, payment_method, total_amount, created_at, employee_email"
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        setInvoices(data || []);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Open modal
  const openPayModal = (id: string) => {
    setSelectedInvoiceId(id);
    setShowModal(true);
  };

  // Close modal
  const closePayModal = () => {
    setSelectedInvoiceId(null);
    setShowModal(false);
  };

  // Mark invoice as Paid
  const handlePay = async (method: string) => {
    if (!selectedInvoiceId) return;
    setPayingId(selectedInvoiceId);
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ payment_status: "Paid", payment_method: method })
        .eq("id", selectedInvoiceId);

      if (error) throw error;

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedInvoiceId
            ? { ...inv, payment_status: "Paid", payment_method: method }
            : inv
        )
      );
      closePayModal();
    } catch (err) {
      console.error("Error updating invoice:", err);
    } finally {
      setPayingId(null);
    }
  };
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto py-8 px-4">
            <div>Loading...</div>
          </div>
        </div>
      );
    }
  return (
    <div>
      <Navbar />
      <Table>
        <TableCaption>
          {loading ? "Loading invoices..." : "A list of all invoices."}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Invoice #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell>{invoice.payment_status}</TableCell>
                <TableCell>{invoice.payment_method || "-"}</TableCell>
                <TableCell>{invoice.employee_email}</TableCell>
                <TableCell className="text-right">
                  ${invoice.total_amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {/* ✅ Only show pay button for creator */}
                  {invoice.payment_status !== "Paid" &&
                    invoice.employee_email === email ? (
                    <button
                      onClick={() => openPayModal(invoice.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Pay Now
                    </button>
                  ) : invoice.payment_status === "Paid" ? (
                    <span className="text-green-600 font-semibold">✔ Paid</span>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            !loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No invoices found.
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
        {invoices.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>This Month</TableCell>
              <TableCell className="text-right" colSpan={2}>
                ${currentMonthTotal.toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4}>Last Month</TableCell>
              <TableCell className="text-right" colSpan={2}>
                ${lastMonthTotal.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>

      {/* ✅ Payment Modal */}
      {showModal && selectedInvoiceId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Choose Payment Method
            </h2>
            <div className="flex flex-col gap-3">
              {["PayPal", "EasyPaisa", "JazzCash", "Cash", "Credit Card"].map(
                (method) => (
                  <button
                    key={method}
                    onClick={() => handlePay(method)}
                    disabled={payingId === selectedInvoiceId}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {payingId === selectedInvoiceId
                      ? "Processing..."
                      : `Pay with ${method}`}
                  </button>
                )
              )}
            </div>
            <button
              onClick={closePayModal}
              className="mt-4 w-full px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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

export default function AdminInvoiceTable() {
  const { user, isLoading } = useAuth("admin");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  const currentMonthTotal = invoices
    .filter((inv) =>
      isSameMonth(inv.created_at, now.getFullYear(), now.getMonth())
    )
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthTotal = invoices
    .filter((inv) =>
      isSameMonth(inv.created_at, lastMonth.getFullYear(), lastMonth.getMonth())
    )
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
          {loading ? "Loading invoices..." : "All employee invoices."}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Invoice #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className="text-right">Amount</TableHead>
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
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {invoices.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>This Month</TableCell>
              <TableCell className="text-right">
                ${currentMonthTotal.toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4}>Last Month</TableCell>
              <TableCell className="text-right">
                ${lastMonthTotal.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}

"use client";
import InvoiceTemplate from "../../components/Invoice-Temp";
import html2canvas from "html2canvas";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";


interface InvoiceItem {
  product_name: string;
  product_category: string;
  rate: number;
  Unit: number;
  subtotal: number;
}

interface InvoicePageProps {
  params: {
    id: string;
  };
}

export default function InvoiceDetailsPage({ params }: InvoicePageProps) {
  const id = params.id;
  const router = useRouter();

  // 1. Auth Hook (Rename isLoading to authLoading to avoid conflict)
  const { user, isLoading: authLoading } = useAuth("employee");

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceInfo, setInvoiceInfo] = useState<any>(null);
  
  // 2. Data Loading State
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. New State for Tax Rate
  const [taxRate, setTaxRate] = useState<number>(0); 

  // 4. Protect Route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 5. Fetch Data
  useEffect(() => {
    if (user && id) {
      fetchInvoiceDetails(id);
    }
  }, [id, user]);

  const fetchInvoiceDetails = async (invoiceId: string) => {
    try {
      setDataLoading(true);
      console.log("Fetching invoice with ID:", invoiceId);

      const res = await fetch(`/api/invoices/${invoiceId}`);
      const data = await res.json();

      if (res.ok && data.invoice) {
        setInvoiceInfo(data.invoice);
        setInvoiceItems(data.items || []);
        setError(null);
      } else {
        setError("Failed to load invoice: " + (data.error || "Invoice not found"));
      }
    } catch (err) {
      console.error("Fetch invoice error:", err);
      setError("Failed to load invoice details");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: invoiceItems,
          total_amount: invoiceInfo.total_amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Update failed:', data.error);
        alert('Failed to save changes');
        return;
      }

      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('An error occurred while saving');
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("invoice-pdf");
    if (!element) return;

    // Temporarily show the hidden div to ensure html2canvas captures it correctly
    // (Note: usually keeping it in absolute position left-[-9999px] works fine)
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${id}.pdf`);
  };

  // --- CALCULATIONS ---
  // Ensure we have a number
  const subTotal = invoiceInfo?.total_amount || 0;
  // Calculate Tax
  const calculatedTax = (subTotal * taxRate) / 100;
  // Calculate Grand Total
  const grandTotal = subTotal + calculatedTax;


  // --- RENDER ---

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 text-center">
          <div>Loading invoice details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-red-600">Error: {error}</div>
          <button
            onClick={() => id && fetchInvoiceDetails(id)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null; // Fallback if redirect hasn't happened yet

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">🧾 Invoice Details</h1>
        {invoiceInfo ? (
          <>
            <p className="mb-4 text-gray-600">Invoice Number: {invoiceInfo.invoice_number}</p>
            
            {/* ITEMS LIST */}
            <ul className="divide-y divide-gray-200 mb-6 bg-white rounded-lg shadow border border-gray-200 px-4">
              {invoiceItems.map((item, index) => (
                <li key={index} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-grow">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-gray-600 text-sm">Category: {item.product_category}</p>
                    <div className="text-gray-600 text-sm flex items-center space-x-2 mt-1">
                      <label htmlFor={`unit-${index}`} className="mr-2 font-medium">Qty:</label>
                      <input
                        id={`unit-${index}`}
                        type="number"
                        min="1"
                        value={item.Unit}
                        onChange={(e) => {
                          const newUnit = parseInt(e.target.value, 10) || 1;
                          const updatedItems = [...invoiceItems];
                          updatedItems[index].Unit = newUnit;
                          // Recalculate subtotal for this item
                          updatedItems[index].subtotal = newUnit * updatedItems[index].rate;
                          
                          setInvoiceItems(updatedItems);

                          // Update subtotal of invoice
                          const newSubTotal = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
                          setInvoiceInfo({ ...invoiceInfo, total_amount: newSubTotal });
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="ml-2 text-gray-800 font-mono">
                         x ${item.rate} = <strong>${item.subtotal.toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const updatedItems = invoiceItems.filter((_, i) => i !== index);
                      setInvoiceItems(updatedItems);
                      // Update total amount
                      const newTotal = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
                      setInvoiceInfo({ ...invoiceInfo, total_amount: newTotal });
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            {/* TOTALS & TAX SECTION */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between items-center mb-3">
                   <span className="text-gray-600 font-medium">Subtotal</span>
                   <span className="text-xl font-semibold">${subTotal.toFixed(2)}</span>
                </div>

                {/* Tax Input */}
                <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-2">
                     <label className="text-gray-600 font-medium">Tax Rate (%):</label>
                     <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-right focus:outline-none focus:border-blue-500"
                     />
                   </div>
                   <span className="text-lg font-medium text-gray-700">
                     + ${calculatedTax.toFixed(2)}
                   </span>
                </div>

                <div className="border-t border-gray-200 my-2"></div>

                {/* Grand Total */}
                <div className="flex justify-between items-center">
                   <span className="text-gray-900 font-bold text-lg">Grand Total</span>
                   <span className="text-2xl font-bold text-green-600">
                     ${grandTotal.toFixed(2)}
                   </span>
                </div>
             </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={handleSaveChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
              >
                Save Changes
              </button>

              <button
                onClick={handleDownloadPDF}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download PDF
              </button>
            </div>
          </>
        ) : (
          <div>No invoice data found</div>
        )}
      </div>

      {/* --- HIDDEN INVOICE TEMPLATE (Captures Tax State) --- */}
      {invoiceInfo && (
  <div className="absolute left-[-9999px] top-0">
    <div id="invoice-pdf">
      <InvoiceTemplate
        invoiceInfo={invoiceInfo}
        invoiceItems={invoiceItems}
        taxRate={taxRate}
      />
    </div>
  </div>
)}


    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import jsPDF from "jspdf";

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

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceInfo, setInvoiceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails(id);
    }
  }, [id]);

  const fetchInvoiceDetails = async (invoiceId: string) => {
    try {
      setLoading(true);
      console.log("Fetching invoice with ID:", invoiceId);

      const res = await fetch(`/api/invoices/${invoiceId}`);
      const data = await res.json();
      console.log("Response data:", data);

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
      setLoading(false);
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Invoice", 20, 20);

    doc.setFontSize(12);
    invoiceItems.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.product_name} (${item.product_category}) - Rate: $${item.rate} x ${item.Unit} = $${item.subtotal}`,
        20,
        40 + index * 10
      );
    });

    doc.text(`Invoice ID: ${id}`, 20, 100);
    doc.save(`invoice-${id}.pdf`);


  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">🧾 Invoice Details</h1>
        {invoiceInfo ? (
          <>
            <p className="mb-4 text-gray-600">Invoice Number: {invoiceInfo.invoice_number}</p>
            <ul className="divide-y divide-gray-200 mb-6">
              {invoiceItems.map((item, index) => (
                <li key={index} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-gray-600 text-sm">Category: {item.product_category}</p>
                    <div className="text-gray-600 text-sm flex items-center space-x-2">
                      <label htmlFor={`unit-${index}`} className="mr-2">Quantity:</label>
                      <input
                        id={`unit-${index}`}
                        type="number"
                        min="1"
                        value={item.Unit}
                        onChange={(e) => {
                          const newUnit = parseInt(e.target.value, 10) || 1;
                          const updatedItems = [...invoiceItems];
                          updatedItems[index].Unit = newUnit;
                          updatedItems[index].subtotal = newUnit * updatedItems[index].rate;

                          setInvoiceItems(updatedItems);

                          // Update total amount
                          const newTotal = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
                          setInvoiceInfo({ ...invoiceInfo, total_amount: newTotal });
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                      <span>= ${item.subtotal.toFixed(2)}</span>
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
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>


            <p className="text-xl font-semibold">Total: ${invoiceInfo.total_amount}</p>
            <button
  onClick={handleSaveChanges}
  className="mt-4 ml-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
>
  Save Changes
</button>

            <button
              onClick={handleDownloadPDF}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
            >
              Download PDF
            </button>
          </>
        ) : (
          <div>No invoice data found</div>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";

/* ================= TYPES ================= */

interface InvoiceItem {
  product_name: string;
  rate: number;
  Unit: number;
  subtotal?: number;
}

interface InvoiceInfo {
  invoice_number: string;
  created_at?: string;
  customer_name?: string;
}

/* ================= PROPS ================= */

interface InvoiceTemplateProps {
  invoiceInfo: InvoiceInfo;
  invoiceItems: InvoiceItem[];
  taxRate: number; // percentage (e.g. 10)
}

/* ================= COMPONENT ================= */

export default function InvoiceTemplate({
  invoiceInfo,
  invoiceItems,
  taxRate,
}: InvoiceTemplateProps) {
  /* ================= CONSTANTS ================= */

  const ROWS_COUNT = 13;

  const rows = Array.from({ length: ROWS_COUNT }).map(
    (_, i) => invoiceItems[i] || null
  );

  /* ================= HELPERS ================= */

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "";

  /* ================= CALCULATIONS ================= */

  const subTotal = invoiceItems.reduce(
    (sum, item) =>
      sum + (item.subtotal ?? item.rate * item.Unit),
    0
  );

  const taxAmount = (subTotal * taxRate) / 100;
  const grandTotal = subTotal + taxAmount;

  /* ================= JSX ================= */

  return (
    <div className="bg-gray-500 py-10 flex justify-center font-[Montserrat]">
      <div
        id="invoice-pdf-content"
        className="relative w-[21cm] h-[29.7cm] bg-white shadow-2xl overflow-hidden flex flex-col justify-between"
      >
        {/* Watermark */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
          style={{
            backgroundImage:
              "url('/sungrow-emea-ceTSHQ0qars-unsplash.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 w-full h-full flex flex-col">
          {/* ================= HEADER ================= */}

          <div className="flex w-full mt-8 pl-8">
            <div className="w-[150px] flex-shrink-0 pt-1">
              <img
                src="/logo__1_-removebg-preview.png"
                alt="SWAA Logo"
                className="w-full"
              />
            </div>

            <div className="flex-grow flex flex-col justify-center ml-6">
              <div className="bg-[#362465] text-white py-3 px-4 mr-8">
                <h1 className="text-3xl font-extrabold tracking-wide uppercase mb-1">
                  SWAA TECHNOLOGIES
                </h1>
                <p className="text-[11px] text-gray-200 font-light">
                  Shop # S-3, Ground Floor, House No. B-213, Sector 11-A,
                  North Karachi, Karachi Pakistan
                </p>
              </div>

              <p className="px-4 font-bold text-sm">
                Trusted Service | Quality Installation | Long-Term Saving
              </p>
            </div>
          </div>

          {/* ================= INFO ================= */}

          <div className="px-10 mt-12 flex justify-between text-sm font-medium text-gray-800">
            <div className="space-y-3 w-1/2">
              <div>Date Issued: {formatDate(invoiceInfo.created_at)}</div>
              <div>Billed to: {invoiceInfo.customer_name}</div>
            </div>

            <div className="w-1/2 text-right pr-20">
              Invoice No: {invoiceInfo.invoice_number}
            </div>
          </div>

          {/* ================= TABLE ================= */}

          <div className="mt-8">
            <div className="h-8 bg-[#362465] mx-8 mb-1" />

            <div className="bg-[#362465] text-white font-bold text-sm uppercase flex px-4 py-2 mx-8">
              <div className="w-[45%]">Description</div>
              <div className="w-[20%] text-center">Unit Price</div>
              <div className="w-[20%] text-center">Quantity</div>
              <div className="w-[10%] text-right">Total</div>
            </div>

            <div className="px-10 mt-2 text-sm">
              {rows.map((item, i) => (
                <div
                  key={i}
                  className="border-b border-gray-400 h-9 flex items-center"
                >
                  {item && (
                    <>
                      <div className="w-[45%]">{item.product_name}</div>
                      <div className="w-[20%] text-center">
                        {formatCurrency(item.rate)}
                      </div>
                      <div className="w-[20%] text-center">
                        {item.Unit}
                      </div>
                      <div className="w-[10%] text-right">
                        {formatCurrency(
                          item.subtotal ??
                            item.rate * item.Unit
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ================= TOTALS ================= */}
<div className="px-10 mt-4 mb-10">
         
  <div className="space-y-2 text-sm font-semibold text-gray-600">

    {/* Sub Total */}
    <div className="flex justify-between items-center">
      <span>Sub-Total</span>
      <span className="font-mono text-black">
        {formatCurrency(subTotal)}
      </span>
    </div>

    {/* Tax */}
    <div className="flex justify-between items-center">
      <span>Tax ({taxRate}%)</span>
      <span className="font-mono text-black">
        {formatCurrency(taxAmount)}
      </span>
    </div>

    {/* Grand Total */}
    <div className="flex justify-between items-center bg-gray-200/50 px-2 py-1">
      <span className="font-bold text-black uppercase text-lg">
        Grand Total
      </span>
      <span className="font-bold text-black text-lg font-mono">
        {formatCurrency(grandTotal)}
      </span>
    </div>

  </div>
</div>


          {/* ================= FOOTER ================= */}

          <div className="bg-[#362465] text-white py-6 px-12 flex justify-between text-s font-medium">
            <span>+92 333 3171040</span>
            <span>swaatechnologies.com</span>
            <span>hello@swaatechnologies.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

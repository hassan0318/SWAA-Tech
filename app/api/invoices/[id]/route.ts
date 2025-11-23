// app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    
    

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    // Get invoice info
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError) {
      console.error("Invoice error:", invoiceError);
      return NextResponse.json({ error: invoiceError.message }, { status: 404 });
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Get invoice items
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (itemsError) {
      console.error("Items error:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    console.log("API Response - Invoice:", invoice, "Items:", items); // Debug log

    return NextResponse.json({ 
      invoice, 
      items: items || [] 
    });
    
  } catch (err: any) {
    console.error("API Route Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
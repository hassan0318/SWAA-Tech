import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET: Fetch single invoice + items
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Note: params is a Promise in newer Next.js versions
) {
  const { id } = await params;

  try {
    // Fetch Invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Fetch Items
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    return NextResponse.json({ invoice, items: items || [] });

  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update items (Delete Old -> Insert New)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { items, grand_total } = body; // You can add tax_rate/tax_amount back if needed

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items array" }, { status: 400 });
    }

    // 1. Delete old items
    const { error: deleteError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to clear old items" }, { status: 500 });
    }

    // 2. Prepare new items (Snapshotting)
    // AGAIN: Check if your DB column is 'Unit' or 'quantity'
    const newItems = items.map((item: any) => ({
      invoice_id: id,
      service_id: item.service_id, 
      product_name: item.product_name,
      rate: item.rate,
      Unit: item.quantity || item.Unit || 1, // Fallback to handle whatever front-end sends
    }));

    // 3. Insert new items
    const { error: insertError } = await supabase
      .from("invoice_items")
      .insert(newItems);

    if (insertError) {
      return NextResponse.json({ error: "Failed to insert new items" }, { status: 500 });
    }

    // 4. Update Invoice Total
    await supabase
      .from("invoices")
      .update({ total_amount: grand_total })
      .eq("id", id);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
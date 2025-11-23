import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoiceId = params.id;

  try {
    const body = await req.json();
    const { items, total_amount } = body;

    if (!Array.isArray(items)) {
      console.error("Invalid items:", items);
      return NextResponse.json({ error: "Invalid items array" }, { status: 400 });
    }

    // Step 1: Delete old items
    const { error: deleteError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", invoiceId);

    if (deleteError) {
      console.error("🛑 Failed deleting old items:", deleteError);
      return NextResponse.json({ error: "Failed to delete old items" }, { status: 500 });
    }

    // Step 2: Insert updated items
   const newItems = items.map(({ subtotal, ...rest }) => ({
  ...rest,
  invoice_id: invoiceId,
}));


    const { error: insertError } = await supabase
      .from("invoice_items")
      .insert(newItems);

    if (insertError) {
      console.error("🛑 Failed inserting items:", insertError);
      return NextResponse.json({ error: "Failed to insert new items" }, { status: 500 });
    }

    // Step 3: Update invoice total
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ total_amount })
      .eq("id", invoiceId);

    if (updateError) {
      console.error("🛑 Failed updating total:", updateError);
      return NextResponse.json({ error: "Failed to update invoice total" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🛑 Unexpected server error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

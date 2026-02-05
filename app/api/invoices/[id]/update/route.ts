import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoiceId = params.id;

  try {
    const body = await req.json();
    const { items, tax_rate, tax_amount, grand_total } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid items array" },
        { status: 400 }
      );
    }

    // 1️⃣ Delete old items
    const { error: deleteError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", invoiceId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete old items" },
        { status: 500 }
      );
    }

    // 2️⃣ Insert new items WITH tax + grand total
    const newItems = items.map((item) => ({
      invoice_id: invoiceId,
      service_id: item.service_id,
      product_name: item.product_name,
      rate: item.rate,
      Unit: item.Unit,
      tax_rate,
      tax_amount,
      grand_total,
    }));

    const { error: insertError } = await supabase
      .from("invoice_items")
      .insert(newItems);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to insert invoice items" },
        { status: 500 }
      );
    }

    // 3️⃣ OPTIONAL: keep invoice total in sync (you can remove later)
    await supabase
      .from("invoices")
      .update({ total_amount: grand_total })
      .eq("id", invoiceId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

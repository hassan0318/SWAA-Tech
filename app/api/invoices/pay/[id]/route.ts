import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { paymentMethod } = body;

  const { data, error } = await supabase
    .from("invoices")
    .update({
      payment_status: "Paid",
      payment_method: paymentMethod,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Invoice marked as Paid", invoice: data });
}
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const employeeEmail = decoded?.email;

    if (!employeeEmail) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Parse Body
    const body = await req.json();
    const { cartItems } = body; 

    // 3. Calculate Total
    const totalAmount = cartItems.reduce(
      (acc: number, item: any) => acc + (Number(item.rate) * (Number(item.quantity) || 1)),
      0
    );

    // 4. Create Invoice Row
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .insert([
        {
          invoice_number: `INV-${Date.now()}`,
          payment_status: "Pending",
          payment_method: "N/A",
          total_amount: totalAmount,
          employee_email: employeeEmail,
        },
      ])
      .select()
      .single();

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 400 });
    }

    const invoiceId = invoiceData.id;

    // 5. Create Invoice Items (THE SNAPSHOT STEP)
    // We map the cart items to your DB columns. 
    // CHECK YOUR DB: Is the column named 'Unit', 'quantity', or 'units'? 
    // I assumed 'quantity' below based on standard practice.
    const itemsToInsert = cartItems.map((item: any) => ({
      invoice_id: invoiceId,
      service_id: item.id,          // The Link (optional/nullable)
      product_name: item.product_name, // Snapshot Name
      rate: item.rate,              // Snapshot Price
      quantity: item.quantity || 1, // Actual quantity from cart
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Item Insert Error:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Invoice created successfully",
      invoice: invoiceData,
    });

  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
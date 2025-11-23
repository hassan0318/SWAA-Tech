import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Get token from cookies (not from request body)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify and decode token (not just decode)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const employeeEmail = decoded?.email;

    if (!employeeEmail) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { cartItems } = body; // Remove token from here

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (acc: number, item: any) => acc + item.rate * (item.quantity || 1),
      0
    );

    // Insert invoice and get the ID
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

    // Prepare invoice items for insertion
    const itemsToInsert = cartItems.map((item: any) => ({
      invoice_id: invoiceId,
      service_id: item.id,
      product_name: item.product_name,
      rate: item.rate,
      Unit:  1, // This should work if column is 'quantity'
   
    }));

    // Insert invoice items
    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Invoice and items created successfully",
      invoice: invoiceData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
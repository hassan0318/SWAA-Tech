// api/services/update/route.ts

import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...updateFields } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("services")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

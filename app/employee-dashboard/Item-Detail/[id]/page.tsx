// pages/employee-dashboard/Item-Detail/[grid_type]/[product_category]/[product_name]/page.tsx

import { notFound } from "next/navigation";
import Navbar from "@/app/employee-dashboard/components/navbar";
import ClientItemDetail from "./ClientItemDetail";
import { supabase } from "@/lib/supabaseClient";

interface PageParams {
  id: string;
  grid_type: string;
  product_category: string;
  product_name: string;
}
export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: item, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    return notFound();
  }

  return (
    <div>
      <Navbar />
      <ClientItemDetail item={item} />
    </div>
  );
}
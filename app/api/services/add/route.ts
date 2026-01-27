// api/services/add/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
  const body = await req.json()

  const { grid_type, product_category, product_name, rate } = body

  const { data, error } = await supabase
    .from('services')
    .insert([{ grid_type, product_category, product_name, rate  }])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data[0])
}

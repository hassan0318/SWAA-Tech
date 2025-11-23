// types.ts
export interface ServiceItem {
  id: string;
  grid_type: string;
  product_category: string;
  product_name: string;
  rate: number;
  quantity: number | null;
  created_at: string;
  updated_at: string;
}

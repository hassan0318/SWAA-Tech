export interface InvoiceItem {
  product_name: string;
  product_category?: string;
  rate: number;
  Unit: number;       // <-- single source of truth
  subtotal: number;
}

export interface InvoiceInfo {
  invoice_number: string;
  created_at?: string;
  customer_name?: string;
  total_amount: number;
}

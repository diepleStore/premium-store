export interface ProductDetail {
  id: string;
  title: string;
  body_html: string | null;
  vendor: string | null;
  product_type: string | null;
  images: string[];
  colors: string[];
  sizes: string[];
  created_at: string;
  updated_at: string | null;
  published_at: string | null;
  options: Record<string, any> | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  option1: string | null;
  option2: string | null;
  price: number;
  inventory_quantity: number;
  reserved_quantity: number;
  sku: string | null;
  image_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CartItem {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  variant_id: string;
  option1: string | null;
  option2: string | null;
  quantity: number;
  price: number;
  product_title: string;
  created_at: string;
  expires_at: string;
}
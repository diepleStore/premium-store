export interface ProductDetail {
  id: string;
  title: string;
  body_html: string | null;
  vendor: string | null;
  product_type: string | null;
  images: string[];
  colors: string[];
  sizes: string[];
  created_at: string | null;
  updated_at: string | null;
  published_at: string | null;
  options: { name: string; id: number; position: number; product_id: number }[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  option1: string | null;
  option2: string | null;
  price: number;
  inventory_quantity: number;
  sku: string | null;
  image_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CartItem {
  id?: string;
  user_id?: string;
  product_id: string;
  variant_id: string;
  option1: string | null;
  option2: string | null;
  quantity: number;
  price: number;
  product_title: string;
}

export interface FilterState {
  colors: string[];
  sizes: string[];
  vendors: string[];
  priceRange: [number, number];
}

export type SortOption = 'price-asc' | 'price-desc' | 'title-asc' | 'title-desc';
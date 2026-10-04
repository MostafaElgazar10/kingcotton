import { ServiceItem } from "./service.model";

export interface HomeResponse {
  status: boolean;
  data: HomeData;
  error: any[];
}

export interface HomeData {
  sliders: Slider[];
  partners: Partner[];
  categories: Category[];
  services: ServiceItem[];
  products: Product[];
  new_arrival_products: Product[];
  best_seller_products: Product[];
  featured_products: Product[];
  trendy_products: Product[];
  popular_products: Product[];
}

export interface Slider {
  id: number;
  subtitle: string;
  title: string;
  small_text: string;
  image: string;
  redirect_url: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Partner {
  id: number;
  image: string;
  link: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  image: string;
  count: string;
  sub_categories: SubCategory[];
  attributes: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  child_category: any[];
}



export interface Product {
  id: number;
  title: string;
  thumbnail: string;
  rating: string;
  current_price: string;
  previous_price: string;
  created_at: string;
  updated_at: string;
}
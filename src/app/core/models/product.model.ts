export interface Product {
  id: number;
  title: string;
  thumbnail: string;
  rating: string;
  current_price: string;
  previous_price: string;
  created_at: string | null;
  updated_at: string | null;



}


export interface Category {
  id: number;
  name: string;
  icon: string;
  image: string;
  count: string;
  sub_categories: SubCategory[];
  attributes: string;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  child_category: any[];
}

export interface ApiResponse<T> {
  status: boolean;
  data: T[];
  error: any[];
}


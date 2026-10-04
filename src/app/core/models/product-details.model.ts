export interface ProductDetailsResponse {
status: boolean;
data: ProductDetails;
error: any[];
}

export interface ProductDetails {
id: number;
is_wishlist: boolean;
user_id: number;
title: string;
type: string;
attributes: any;
thumbnail: string;
first_image: string;
images: ProductImage[];
rating: string;
current_price: string;
previous_price: string;
stock: string | null;
condition: string;
video: string | null;
stock_check: number;
estimated_shipping_time: string;

colors: string[];
sizes: string[];
size_quantity: string[];
size_price: string[];

details: string;
policy: string;

whole_sell_quantity: string[];
whole_sell_discount: string[];

reviews: Review[];
comments: CommentItem[];

related_products: RelatedProduct[];

shop: Shop;

created_at: string;
updated_at: string;
}

export interface ProductImage {
id: number;
image: string;
}

export interface Review {
id?: number;
user_id?: number;
rating?: number;
comment?: string;
created_at?: string;
}

export interface CommentItem {
id: number;
user_image: string;
user_id: number;
name: string;
comment: string;
replies: Reply[];
created_at: string;
updated_at: string;
}

export interface Reply {
id?: number;
user_id?: number;
name?: string;
comment?: string;
created_at?: string;
}

export interface RelatedProduct {
id: number;
title: string;
thumbnail: string;
rating: string;
current_price: string;
previous_price: string;
created_at: string;
updated_at: string;
}

export interface Shop {
name: string;
items: string;
}

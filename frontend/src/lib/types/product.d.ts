// src/lib/types/product.d.ts

import type { ID } from './index';

export interface ProductImage {
    id: ID;
    product_id: ID;
    url: string;
    sort_order: number;
    created_at: string;
}

export interface Product {
    id: ID;
    code: string;
    name: string;
    category: string;       // fabric / garment
    subcategory?: string;   // mens/womens/boys/girls for garments
    base_price: number;
    description?: string | null;
    images?: ProductImage[];
    created_at: string;
    updated_at: string;
}

export interface FabricStock {
    product_id: ID;
    total_in: number;        // incoming meters
    total_out: number;       // consumption meters
    adjusted: number;        // manual adjustments
    stock: number;           // computed (total_in - total_out + adjusted)
}

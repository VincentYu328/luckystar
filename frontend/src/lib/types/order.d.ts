// src/lib/types/order.d.ts

import type { ID } from './index';

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "production"
    | "completed"
    | "cancelled";

export interface RetailOrderItem {
    id: ID;
    order_id: ID;
    product_id: ID;
    product_name: string;
    qty: number;
    price: number;
}

export interface RetailOrder {
    id: ID;
    customer_id?: ID | null;
    status: OrderStatus;
    total_amount: number;
    paid_amount: number;
    created_at: string;
    updated_at: string;
    items?: RetailOrderItem[];
}

export interface GroupOrder {
    id: ID;
    customer_id: ID;
    group_name: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface GroupMember {
    id: ID;
    group_order_id: ID;
    full_name: string;
    size_label?: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaymentRecord {
    id: ID;
    order_type: "retail" | "group";
    order_id: ID;
    method: string;           // cash/card/bank/online
    amount: number;
    verified: boolean;
    created_by: ID;
    created_at: string;
    verified_at?: string | null;
}

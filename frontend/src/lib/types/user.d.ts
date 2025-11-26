// src/lib/types/user.d.ts

import type { ID } from './index';

export interface StaffUser {
    id: ID;
    full_name: string;
    phone: string;
    email: string | null;
    address?: string | null;
    wechat?: string | null;
    whatsapp?: string | null;
    position_id: number;
    position_name?: string;
    role?: string;               // admin/manager/sales（从 position 推出）
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface StaffUserToken {
    userId: ID;
    full_name: string;
    email: string | null;
    role: string;
    type: "staff";
}

export interface CustomerUserToken {
    customerId: ID;
    full_name: string;
    email: string | null;
    type: "customer";
}

export type AuthUser = StaffUserToken | CustomerUserToken;

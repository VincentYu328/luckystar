// src/lib/types/index.d.ts

export type ID = number | string;

export interface ApiResponse<T> {
    success?: boolean;
    error?: string;
    message?: string;
    data?: T;
}

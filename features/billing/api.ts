import { http } from "@/lib/http/client";

export interface Wallet {
    user_id: string;
    balance: number;
}

export interface LedgerEntry {
    id: string;
    wallet_id: string;
    amount: number;
    event_type: string;
    reference_id?: string;
    meta?: Record<string, unknown>;
    created_at: string;
}

export const getMyWallet = async (): Promise<Wallet> => {
    return http<Wallet>("/billing/wallet");
};

export const getMyLedger = async (limit = 50, offset = 0): Promise<LedgerEntry[]> => {
    return http<LedgerEntry[]>(`/billing/ledger?limit=${limit}&offset=${offset}`);
};

export const createCheckoutSession = async (productId: string): Promise<{ url: string }> => {
    return http<{ url: string }>("/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
    });
};

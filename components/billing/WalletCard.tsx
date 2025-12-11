"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "@/features/billing/api";
import { CircleDollarSign, Coins } from "lucide-react";

interface WalletCardProps {
    wallet?: Wallet;
    loading?: boolean;
}

export function WalletCard({ wallet, loading }: WalletCardProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-xl border shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-1">
                    <span className="text-3xl font-bold tracking-tight text-foreground">
                        {wallet?.balance?.toLocaleString() ?? 0}
                        <span className="text-base font-normal text-muted-foreground ml-1">Credits</span>
                    </span>
                    <p className="text-xs text-muted-foreground mt-2">
                        Available for Calls and AI Usage
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

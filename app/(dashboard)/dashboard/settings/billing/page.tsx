"use client";

import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { WalletCard } from "@/components/billing/WalletCard";
import { LedgerTable } from "@/components/billing/LedgerTable";
import { getMyWallet, getMyLedger, createCheckoutSession, Wallet, LedgerEntry } from "@/features/billing/api";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
    const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: user } = useCurrentUser();
    const email = user?.email || "";

    const handleBuy = async (productId: string) => {
        try {
            const { url } = await createCheckoutSession(productId);
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error("Failed to create checkout session", error);
            // Optionally add toast notification here
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [w, e] = await Promise.all([getMyWallet(), getMyLedger()]);
                setWallet(w);
                setEntries(e);
            } catch (error) {
                console.error("Failed to load billing data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="flex h-screen flex-col">
            <header className="flex h-12 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
                <SidebarTrigger className="-ml-1" />
                <PageBreadcrumb />
            </header>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <header className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Billing & Usage</h2>
                    {/* Add tabs or actions here if needed */}
                </header>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <WalletCard wallet={wallet} loading={loading} />

                    {/* Credit Packages Card */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-1 md:col-span-2">
                        <div className="p-6">
                            <h3 className="tracking-tight text-lg font-semibold mb-4 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary" />
                                Add Credits
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border rounded-xl p-5 flex flex-col justify-between hover:border-primary/50 transition-colors bg-muted/20">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-lg">Starter Pack</h4>
                                        <p className="text-sm text-muted-foreground">Perfect for getting started</p>
                                        <div className="pt-2">
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">1,000 Credits</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                                        <span className="font-bold text-2xl">$10<span className="text-sm font-normal text-muted-foreground">.00</span></span>
                                        <Button
                                            onClick={() => handleBuy("starter_pack")}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                        >
                                            Purchase
                                        </Button>
                                    </div>
                                </div>
                                <div className="border rounded-xl p-5 flex flex-col justify-between hover:border-primary/50 transition-colors bg-muted/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                                        Best Value
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-lg">Pro Pack</h4>
                                        <p className="text-sm text-muted-foreground">For power users</p>
                                        <div className="pt-2">
                                            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">5,000 Credits</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                                        <span className="font-bold text-2xl">$45<span className="text-sm font-normal text-muted-foreground">.00</span></span>
                                        <Button
                                            onClick={() => handleBuy("pro_pack")}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                        >
                                            Purchase
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                        <div className="space-y-1">
                            <h3 className="tracking-tight text-lg font-semibold">Usage History</h3>
                            <p className="text-sm text-muted-foreground">View your recent transactions and usage.</p>
                        </div>
                    </div>
                    <div>
                        <LedgerTable entries={entries} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
}

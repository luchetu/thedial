"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AskAIAssistant } from "@/components/features/ai/AskAIAssistant"
import { AuthGuard } from "@/components/auth/AuthGuard"

export function ProtectedDashboard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 bg-sidebar">
          {children}
        </main>
        <AskAIAssistant />
      </SidebarProvider>
    </AuthGuard>
  )
}


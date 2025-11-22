"use client"

import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, error } = useCurrentUser()
  const router = useRouter()

  if (error || !user) {
    router.push("/auth/login")
    return null
  }

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}


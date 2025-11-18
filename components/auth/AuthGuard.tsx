"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, error } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (error || !user)) {
      router.push("/auth/login")
    }
  }, [user, isLoading, error, router])

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Don't render children if not authenticated
  if (error || !user) {
    return null
  }

  return <>{children}</>
}


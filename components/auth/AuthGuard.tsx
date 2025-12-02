"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, error } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're done loading and there's an error or no user
    if (!isLoading && (error || !user)) {
      router.push("/auth/login")
    }
  }, [isLoading, error, user, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Show nothing if not authenticated (redirect is in progress)
  if (error || !user) {
    return null
  }

  return <>{children}</>
}


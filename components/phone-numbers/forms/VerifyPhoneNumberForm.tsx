"use client"

import * as React from "react"
import { Info, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useVerifyPhoneNumber } from "@/features/phone-numbers/hooks/useVerifyPhoneNumber"
import { useInitiateVerification } from "@/features/phone-numbers/hooks/useInitiateVerification"
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser"
import type { ApiError } from "@/lib/http/client"

// E.164 format validation
const e164Pattern = /^\+[1-9]\d{1,14}$/

export function VerifyPhoneNumberForm() {
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [verificationCode, setVerificationCode] = React.useState("")
  const [step, setStep] = React.useState<"input" | "verify">("input")
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const { data: user } = useCurrentUser()
  const initiateMutation = useInitiateVerification()
  const verifyMutation = useVerifyPhoneNumber()

  const isValidPhoneNumber = e164Pattern.test(phoneNumber)

  const handleInitiateVerification = async () => {
    if (!isValidPhoneNumber || !user?.id) {
      return
    }

    try {
      setError(null)
      await initiateMutation.mutateAsync({
        userId: user.id,
        phoneNumber: phoneNumber.trim(),
      })
      setStep("verify")
    } catch (err) {
      const error = err as ApiError | Error
      const message = (error as ApiError)?.message || error.message || "Failed to send verification code"
      setError(message)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || !user?.id) {
      return
    }

    try {
      setError(null)
      await verifyMutation.mutateAsync({
        userId: user.id,
        phoneNumber: phoneNumber.trim(),
        code: verificationCode.trim(),
      })
      setSuccess(true)
      // Reset form after a delay
      setTimeout(() => {
        setPhoneNumber("")
        setVerificationCode("")
        setStep("input")
        setSuccess(false)
      }, 2000)
    } catch (err) {
      const error = err as ApiError | Error
      const message = (error as ApiError)?.message || error.message || "Invalid verification code"
      setError(message)
    }
  }

  const handleResendCode = async () => {
    await handleInitiateVerification()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Add Existing Number</h3>
        <p className="text-sm text-muted-foreground">
          Add your existing phone number. You&apos;ll need to verify ownership via SMS.
        </p>
      </div>

      {/* Info Box */}
      <div className="flex gap-2 p-3 rounded-lg bg-muted/50 border border-muted">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">
            You&apos;ll need to verify this number to add it. We&apos;ll send a verification code via SMS to confirm you own this number. The number will be added to your account once verified.
          </p>
        </div>
      </div>

      {success && (
        <div className="flex gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-green-700 dark:text-green-300">
              Phone number verified and added successfully!
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive text-center" role="alert">
            {error}
          </p>
        </div>
      )}

      {/* Step 1: Phone Number Input */}
      {step === "input" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+14155551234"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value
                // Allow + and digits only
                const cleaned = value.replace(/[^\d+]/g, "")
                setPhoneNumber(cleaned)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValidPhoneNumber) {
                  e.preventDefault()
                  handleInitiateVerification()
                }
              }}
              className="w-full font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter phone number in E.164 format (e.g., +14155551234, +254748905088)
            </p>
          </div>

          <Button
            onClick={handleInitiateVerification}
            disabled={!isValidPhoneNumber || initiateMutation.isPending}
            className="w-full"
          >
            {initiateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Code...
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </div>
      )}

      {/* Step 2: Verification Code Input */}
      {step === "verify" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verificationCode" className="text-sm font-medium">
              Verification Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                setVerificationCode(value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && verificationCode.trim()) {
                  e.preventDefault()
                  handleVerifyCode()
                }
              }}
              className="w-full font-mono text-center text-lg tracking-widest"
              maxLength={6}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleVerifyCode}
              disabled={!verificationCode.trim() || verifyMutation.isPending}
              className="w-full"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Add Number"
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Didn&apos;t receive the code?</span>
              <Button
                variant="link"
                onClick={handleResendCode}
                disabled={initiateMutation.isPending}
                className="h-auto p-0 text-primary"
              >
                {initiateMutation.isPending ? "Sending..." : "Resend"}
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setStep("input")
                setVerificationCode("")
                setError(null)
              }}
              className="w-full"
            >
              Change Phone Number
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


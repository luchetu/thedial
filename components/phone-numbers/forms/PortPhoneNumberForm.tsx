"use client";

import * as React from "react";
import { Info, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PortPhoneNumberForm() {
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [accountHolderName, setAccountHolderName] = React.useState("");
  const [billingAddress, setBillingAddress] = React.useState("");
  const [authorizedName, setAuthorizedName] = React.useState("");
  const [authorizedEmail, setAuthorizedEmail] = React.useState("");
  const [authorizedPhone, setAuthorizedPhone] = React.useState("");
  
  const [isCheckingPortability, setIsCheckingPortability] = React.useState(false);
  const [portabilityChecked, setPortabilityChecked] = React.useState(false);
  const [isPortable, setIsPortable] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, "");
    // Ensure it starts with +
    if (!cleaned.startsWith("+")) {
      return cleaned.length > 0 ? `+${cleaned}` : "";
    }
    return cleaned;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setPortabilityChecked(false);
    setIsPortable(false);
  };

  const isUSNumber = (phoneNumber: string) => {
    return phoneNumber.startsWith("+1") && phoneNumber.length === 12;
  };

  const handleCheckPortability = async () => {
    if (!phoneNumber || !phoneNumber.startsWith("+")) {
      return;
    }

    // Check if it's a US number (only US is supported currently)
    if (!isUSNumber(phoneNumber)) {
      setIsCheckingPortability(false);
      setPortabilityChecked(true);
      setIsPortable(false);
      return;
    }

    setIsCheckingPortability(true);
    // TODO: API call to GET /twilio/porting/check?phoneNumber={phoneNumber}
    // Backend endpoint: /twilio/porting/check
    // Note: Twilio Porting API is in Public Beta and only supports US non-toll-free numbers
    try {
      // const response = await fetch(`/api/twilio/porting/check?phoneNumber=${encodeURIComponent(phoneNumber)}`);
      // const data = await response.json();
      // setIsPortable(data.portable);
      
      // For now, simulate check
      setTimeout(() => {
        setIsCheckingPortability(false);
        setPortabilityChecked(true);
        setIsPortable(true); // Would come from API response
      }, 1500);
    } catch (error) {
      setIsCheckingPortability(false);
      setPortabilityChecked(true);
      setIsPortable(false);
    }
  };

  const handleSubmit = async () => {
    if (!isPortable || !accountNumber || !accountHolderName || !authorizedName || !authorizedEmail) {
      return;
    }

    setIsSubmitting(true);
    // TODO: API call to /twilio/porting/request
    setTimeout(() => {
      setIsSubmitting(false);
      // Handle success/error
    }, 2000);
  };

  const canCheckPortability = phoneNumber.startsWith("+") && phoneNumber.length > 10;
  const canSubmit = 
    isPortable &&
    accountNumber.trim() !== "" &&
    accountHolderName.trim() !== "" &&
    authorizedName.trim() !== "" &&
    authorizedEmail.trim() !== "";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Port Existing Number</h3>
        <p className="text-sm text-muted-foreground">
          Bring your existing phone number to Dialer. You&apos;ll need your account
          information from your current carrier.
        </p>
      </div>

      {/* Info Box */}
      <div className="flex gap-2 p-3 rounded-lg bg-muted/50 border border-muted">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">
            Porting typically takes 5-15 business days. Your number will remain
            active during the process.
          </p>
        </div>
      </div>

      {/* Regional Limitation Notice */}
      <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
            Porting is currently only available for US numbers
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            We can only port US non-toll-free numbers (local and mobile). International porting support is coming soon.
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="flex gap-2 p-3 rounded-lg bg-muted/50 border border-muted">
        <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">
            Make sure your account information matches exactly with your current
            carrier records to avoid delays.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+14155551234"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleCheckPortability}
              disabled={!canCheckPortability || isCheckingPortability}
              variant="outline"
            >
              {isCheckingPortability ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                "Check"
              )}
            </Button>
          </div>
          {portabilityChecked && (
            <div className="flex items-center gap-2 text-sm">
              {isPortable ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">This number can be ported</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">
                    {isUSNumber(phoneNumber)
                      ? "This number cannot be ported"
                      : "Porting is currently only available for US numbers"}
                  </span>
                </>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Enter your phone number in E.164 format (e.g., +14155551234)
          </p>
        </div>

        {/* Account Information Section */}
        {isPortable && (
          <>
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-4">Account Information</h4>
              
              <div className="space-y-4">
                {/* Account Number */}
                <div className="space-y-2">
                  <Label htmlFor="accountNumber" className="text-sm font-medium">
                    Account Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="Your account number from current carrier"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Find this on your carrier bill or account portal
                  </p>
                </div>

                {/* PIN */}
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-sm font-medium">
                    PIN <span className="text-xs text-muted-foreground font-normal">(if required)</span>
                  </Label>
                  <Input
                    id="pin"
                    type="text"
                    placeholder="Carrier PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Some carriers require a PIN for porting
                  </p>
                </div>

                {/* Account Holder Name */}
                <div className="space-y-2">
                  <Label htmlFor="accountHolderName" className="text-sm font-medium">
                    Account Holder Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountHolderName"
                    type="text"
                    placeholder="Full name on carrier account"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                  />
                </div>

                {/* Billing Address */}
                <div className="space-y-2">
                  <Label htmlFor="billingAddress" className="text-sm font-medium">
                    Billing Address
                  </Label>
                  <Input
                    id="billingAddress"
                    type="text"
                    placeholder="Address on carrier account"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Authorized Representative Section */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-4">Authorized Representative</h4>
              <p className="text-xs text-muted-foreground mb-4">
                This person will receive the Letter of Authorization (LOA) to sign
              </p>
              
              <div className="space-y-4">
                {/* Authorized Name */}
                <div className="space-y-2">
                  <Label htmlFor="authorizedName" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="authorizedName"
                    type="text"
                    placeholder="Full name"
                    value={authorizedName}
                    onChange={(e) => setAuthorizedName(e.target.value)}
                  />
                </div>

                {/* Authorized Email */}
                <div className="space-y-2">
                  <Label htmlFor="authorizedEmail" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="authorizedEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={authorizedEmail}
                    onChange={(e) => setAuthorizedEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    LOA will be sent to this email for signature
                  </p>
                </div>

                {/* Authorized Phone */}
                <div className="space-y-2">
                  <Label htmlFor="authorizedPhone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="authorizedPhone"
                    type="tel"
                    placeholder="+14155551234"
                    value={authorizedPhone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setAuthorizedPhone(formatted);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Start Port Request"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}


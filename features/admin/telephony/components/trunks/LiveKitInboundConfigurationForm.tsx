"use client";

import { useState } from "react";
import { useStore } from "@tanstack/react-form";
import { useForm } from "@/lib/forms";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { TrunkFormValues } from "./types";

// E.164 format: +[country code][number] (e.g., +14155551234, +442071234567)
const e164Pattern = /^\+[1-9]\d{1,14}$/;

const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    return cleaned.length > 0 ? `+${cleaned}` : "";
  }
  return cleaned;
};

const normalizeNumberList = (input: unknown): string[] => {
  const source = Array.isArray(input)
    ? input
    : typeof input === "string"
    ? input.split(/\r?\n/)
    : [];
  return source
    .map((item) => formatPhoneNumber(String(item).trim()))
    .filter((item) => item.length > 0 && e164Pattern.test(item));
};


interface LiveKitInboundConfigurationFormProps {
  form: ReturnType<typeof useForm<TrunkFormValues>>;
  isLoading?: boolean;
  showTitle?: boolean;
}

export function LiveKitInboundConfigurationForm({
  form,
  isLoading = false,
  showTitle = true,
}: LiveKitInboundConfigurationFormProps) {
  const [inboundNumberInput, setInboundNumberInput] = useState("");
  const [allowedNumberInput, setAllowedNumberInput] = useState("");
  
  const restrictAllowedNumbers = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.restrictAllowedNumbers);
  const inboundNumbers = useStore(form.store, (state: { values: TrunkFormValues }) => {
    const nums = state.values.inboundNumbers;
    return Array.isArray(nums) ? nums : [];
  });

  const handleAddInboundNumber = () => {
    const formatted = formatPhoneNumber(inboundNumberInput);
    if (formatted && e164Pattern.test(formatted)) {
      const currentNumbers = form.getFieldValue("inboundNumbers");
      const numsArray = Array.isArray(currentNumbers) ? currentNumbers : [];
      if (!numsArray.includes(formatted)) {
        form.setFieldValue("inboundNumbers", [...numsArray, formatted]);
        setInboundNumberInput("");
      }
    }
  };

  const handleRemoveInboundNumber = (numberToRemove: string) => {
    const currentNumbers = form.getFieldValue("inboundNumbers");
    const numsArray = Array.isArray(currentNumbers) ? currentNumbers : [];
    form.setFieldValue("inboundNumbers", numsArray.filter((n: string) => n !== numberToRemove));
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold mb-1">LiveKit Inbound Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure phone numbers for inbound calls. Phone numbers will be automatically added when users purchase them. After creating this trunk, you&apos;ll receive a LiveKit SIP address that you need to configure in your SIP provider (e.g., Twilio) as the Origination URI.
          </p>
        </div>
      )}

      <form.Field name="inboundNumbers">
        {() => (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Phone Numbers
            </Label>
            <div className="flex gap-2">
              <Input
                type="tel"
                value={inboundNumberInput}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setInboundNumberInput(formatted);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInboundNumber();
                  }
                }}
                placeholder="+14155551234"
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleAddInboundNumber}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                disabled={!inboundNumberInput || !e164Pattern.test(formatPhoneNumber(inboundNumberInput))}
              >
                Add
              </button>
            </div>
            {inboundNumbers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {inboundNumbers.map((number) => (
                  <div
                    key={number}
                    className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-sm"
                  >
                    <span className="font-mono">{number}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInboundNumber(number)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Enter phone numbers in E.164 format (e.g., +14155551234). These are the phone numbers you purchased from your SIP provider (e.g., Twilio) that will receive incoming calls. You can start with an empty list - numbers will be automatically added when users purchase them.
            </p>
          </div>
        )}
      </form.Field>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="restrictAllowedNumbers"
            checked={restrictAllowedNumbers}
            onCheckedChange={(checked) => {
              form.setFieldValue("restrictAllowedNumbers", Boolean(checked));
              if (!checked) {
                setAllowedNumberInput("");
                form.setFieldValue("allowedNumbers", []);
              }
            }}
          />
          <Label htmlFor="restrictAllowedNumbers" className="text-sm font-medium cursor-pointer">
            Restrict caller numbers
            <span className="text-xs text-muted-foreground ml-1 font-normal">(optional - limit which numbers can call)</span>
          </Label>
        </div>
        {restrictAllowedNumbers && (
          <Textarea
            placeholder="+14155551234\n+15551234567"
            value={allowedNumberInput}
            onChange={(e) => {
              setAllowedNumberInput(e.target.value);
              form.setFieldValue("allowedNumbers", normalizeNumberList(e.target.value));
            }}
            className="min-h-[80px]"
          />
        )}
      </div>


      <form.Field name="krispEnabled">
        {(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="krispEnabled"
              checked={Boolean(field.state.value)}
              onCheckedChange={(checked) => field.handleChange(checked)}
              disabled={isLoading}
            />
            <Label htmlFor="krispEnabled" className="text-sm font-medium cursor-pointer">
              Enable Krisp (Noise Cancellation)
            </Label>
          </div>
        )}
      </form.Field>
    </div>
  );
}


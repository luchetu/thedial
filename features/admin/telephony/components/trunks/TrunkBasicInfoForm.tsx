"use client";

import { useStore } from "@tanstack/react-form";
import { useForm, FormField } from "@/lib/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TrunkFormValues } from "./types";

interface TrunkBasicInfoFormProps {
  form: ReturnType<typeof useForm<TrunkFormValues>>;
  isLoading?: boolean;
  showTitle?: boolean;
  lockType?: boolean; // If true, hide the type field (type is pre-selected)
}

export function TrunkBasicInfoForm({
  form,
  isLoading = false,
  showTitle = true,
  lockType = false,
}: TrunkBasicInfoFormProps) {
  const trunkType = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.type);

  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold mb-1">Basic Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide basic details about your trunk.
          </p>
        </div>
      )}

      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            const stringValue = String(value || "");
            if (!stringValue || stringValue.trim() === "") return "Name is required";
            if (stringValue.trim().length < 2) return "Must be at least 2 characters";
            return undefined;
          },
        }}
      >
        {(field) => (
          <FormField
            field={field}
            name="name"
            label="Name"
            placeholder="e.g., Production Trunk"
            required
            disabled={isLoading}
            error={
              !field.state.meta.isValid
                ? field.state.meta.errors.join(", ")
                : undefined
            }
          />
        )}
      </form.Field>

      {!lockType && (
        <form.Field
          name="type"
          validators={{
            onChange: ({ value }) => {
              if (!value) return "Type is required";
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Type <span className="text-destructive">*</span>
              </label>
              <Select
                value={String(field.state.value)}
                onValueChange={(value) => field.handleChange(value)}
                disabled={isLoading}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select trunk type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="livekit_outbound">LiveKit Outbound</SelectItem>
                  <SelectItem value="livekit_inbound">LiveKit Inbound</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {!field.state.meta.isValid && (
                <p className="text-sm text-destructive" role="alert">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>
      )}

      {lockType && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Type <span className="text-destructive">*</span>
          </label>
          <div className="px-3 py-2 border rounded-md bg-muted/50 text-sm">
            {trunkType === "twilio" && "Twilio"}
            {trunkType === "livekit_outbound" && "LiveKit Outbound"}
            {trunkType === "livekit_inbound" && "LiveKit Inbound"}
            {trunkType === "custom" && "Custom"}
          </div>
        </div>
      )}

      <form.Field
        name="direction"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "Direction is required";
            return undefined;
          },
        }}
      >
        {(field) => {
          const isTwilio = trunkType === "twilio";
          
          return (
            <div className="space-y-2">
              <label htmlFor="direction" className="text-sm font-medium">
                Direction <span className="text-destructive">*</span>
                {isTwilio && (
                  <span className="text-xs text-muted-foreground ml-2">(Twilio trunks are outbound-only)</span>
                )}
              </label>
              <Select
                value={isTwilio ? "outbound" : String(field.state.value)}
                onValueChange={(value) => {
                  if (!isTwilio) {
                    field.handleChange(value);
                  }
                }}
                disabled={isLoading || isTwilio}
              >
                <SelectTrigger id="direction" className="w-full">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  {!isTwilio && <SelectItem value="inbound">Inbound</SelectItem>}
                  {!isTwilio && <SelectItem value="bidirectional">Bidirectional</SelectItem>}
                </SelectContent>
              </Select>
              {!field.state.meta.isValid && (
                <p className="text-sm text-destructive" role="alert">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          );
        }}
      </form.Field>

      <form.Field name="status">
        {(field) => (
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select
              value={String(field.state.value)}
              onValueChange={(value) => field.handleChange(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>
    </div>
  );
}


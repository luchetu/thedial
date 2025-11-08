"use client";

import { useState } from "react";
import { useForm, Form, FormField, FormSubmitButton } from "@/lib/forms";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { CreateContactRequest, UpdateContactRequest } from "@/features/contacts/types";

interface ContactFormValues extends Record<string, unknown> {
  name: string;
  phone_number: string;
}

interface ContactFormProps {
  defaultValues?: Partial<ContactFormValues>;
  onSubmit: (values: CreateContactRequest | UpdateContactRequest) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

// Note: is_default is removed from UI - contacts are just client contacts
// Phone numbers (Twilio numbers) are managed separately under phone numbers

// E.164 format: +[country code][number] (e.g., +14155551234, +442071234567)
// Accepts any country code starting with + followed by 1-15 digits
const e164Pattern = /^\+[1-9]\d{1,14}$/;

export const ContactForm = ({
  defaultValues = { name: "", phone_number: "" },
  onSubmit,
  isLoading = false,
  submitLabel = "Save Contact",
}: ContactFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, "");
    // Ensure it starts with +
    if (!cleaned.startsWith("+")) {
      return cleaned.length > 0 ? `+${cleaned}` : "";
    }
    return cleaned;
  };

  const form = useForm<ContactFormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
      phone_number: defaultValues?.phone_number || "",
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        await onSubmit({
          name: values.name,
          phone_number: values.phone_number,
        });
      } catch (error) {
        const err = error as Error;
        setSubmitError(err.message || "Something went wrong");
      }
    },
  });


  return (
    <Form<ContactFormValues> onSubmit={form.handleSubmit}>
      <div className="space-y-4">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              const stringValue = String(value || "");
              if (!stringValue || stringValue.trim() === "")
                return "Name is required";
              if (stringValue.trim().length < 2)
                return "Name must be at least 2 characters";
              return undefined;
            },
            onBlur: ({ value }) => {
              const stringValue = String(value || "");
              if (!stringValue || stringValue.trim() === "")
                return "Name is required";
              if (stringValue.trim().length < 2)
                return "Name must be at least 2 characters";
              return undefined;
            },
          }}
        >
          {(field) => (
            <FormField
              field={field}
              name="name"
              label="Name"
              placeholder="Contact name"
              required
              error={
                !field.state.meta.isValid
                  ? field.state.meta.errors.join(", ")
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field
          name="phone_number"
          validators={{
            onChange: ({ value }) => {
              const stringValue = String(value || "").trim();
              if (!stringValue)
                return "Phone number is required";
              // Format the value to ensure it's in the correct format
              const formatted = formatPhoneNumber(stringValue);
              if (!formatted || !e164Pattern.test(formatted))
                return "Phone number must be in E.164 format (e.g., +14155551234, +442071234567)";
              return undefined;
            },
            onBlur: ({ value }) => {
              const stringValue = String(value || "").trim();
              if (!stringValue)
                return "Phone number is required";
              // Format the value to ensure it's in the correct format
              const formatted = formatPhoneNumber(stringValue);
              if (!formatted || !e164Pattern.test(formatted))
                return "Phone number must be in E.164 format (e.g., +14155551234, +442071234567)";
              return undefined;
            },
          }}
        >
          {(field) => {
            const currentValue = String(field.state.value || "");
            return (
              <div className="space-y-2">
                <Label htmlFor={String(field.name)} className="text-sm font-medium">
                  Phone Number
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={String(field.name)}
                  type="tel"
                  value={currentValue}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    field.handleChange(formatted);
                  }}
                  onBlur={field.handleBlur}
                  placeholder="+14155551234"
                  className={
                    !field.state.meta.isValid ? "border-destructive" : ""
                  }
                />
                {!field.state.meta.isValid && (
                  <p className="text-sm text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter phone number in E.164 format with country code (e.g., +14155551234, +442071234567)
                </p>
              </div>
            );
          }}
        </form.Field>

        <FormSubmitButton
          variant="secondary"
          className="w-full text-white"
          size="lg"
          disabled={isLoading}
          loading={isLoading}
        >
          {submitLabel}
        </FormSubmitButton>

        {submitError && (
          <p className="text-sm text-destructive text-center" role="alert">
            {submitError}
          </p>
        )}
      </div>
    </Form>
  );
};


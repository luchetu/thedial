import type { ReactNode } from "react";
import { toast, type ExternalToast } from "sonner";

const successDefaults: ExternalToast = {
  style: {
    backgroundColor: "#dcfce7",
    color: "#000000",
    fontWeight: "500",
  },
};

const errorDefaults: ExternalToast = {
  style: {
    backgroundColor: "#fee2e2",
    color: "#000000",
    fontWeight: "500",
  },
};

const infoDefaults: ExternalToast = {
  style: {
    backgroundColor: "#e0f2fe",
    color: "#000000",
    fontWeight: "500",
  },
};

function mergeToastOptions(
  defaults: ExternalToast,
  overrides?: ExternalToast
): ExternalToast | undefined {
  if (!overrides) {
    return defaults;
  }

  return {
    ...defaults,
    ...overrides,
    style: {
      ...(defaults.style ?? {}),
      ...(overrides.style ?? {}),
    },
  };
}

export function toastSuccess(message: ReactNode, options?: ExternalToast) {
  return toast.success(message, mergeToastOptions(successDefaults, options));
}

export function toastError(message: ReactNode, options?: ExternalToast) {
  return toast.error(message, mergeToastOptions(errorDefaults, options));
}

export function toastInfo(message: ReactNode, options?: ExternalToast) {
  return toast(message, mergeToastOptions(infoDefaults, options));
}

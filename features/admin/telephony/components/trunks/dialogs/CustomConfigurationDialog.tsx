"use client";

import { BaseTrunkDialog } from "./BaseTrunkDialog";
import { CustomConfigurationForm } from "../CustomConfigurationForm";
import type { Trunk } from "@/features/admin/telephony/types";

interface CustomConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk: Trunk;
  onSuccess?: () => void;
}

export function CustomConfigurationDialog({
  open,
  onOpenChange,
  trunk,
  onSuccess,
}: CustomConfigurationDialogProps) {
  return (
    <BaseTrunkDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configure Custom Trunk"
      description="Custom trunk configuration settings."
    >
      <CustomConfigurationForm showTitle={false} />
    </BaseTrunkDialog>
  );
}


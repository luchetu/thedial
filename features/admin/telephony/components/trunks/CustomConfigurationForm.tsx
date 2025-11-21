"use client";

interface CustomConfigurationFormProps {
  showTitle?: boolean;
}

export function CustomConfigurationForm({
  showTitle = true,
}: CustomConfigurationFormProps) {
  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold mb-1">Custom Trunk Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Custom trunks don&apos;t require additional configuration. You can configure them later.
          </p>
        </div>
      )}
    </div>
  );
}


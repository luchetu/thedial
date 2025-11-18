"use client";

import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { json as jsonLang } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { cn } from "@/lib/utils";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  height?: string;
  error?: string;
}

export function JsonEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  height = "160px",
  error,
}: JsonEditorProps) {
  const extensions = useMemo(() => [jsonLang(), EditorView.lineWrapping], []);

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <div
      className={cn(
        "rounded-md border bg-muted/20",
        error ? "border-destructive" : "border-input",
        className
      )}
    >
      <CodeMirror
        value={value ?? ""}
        height={height}
        extensions={extensions}
        theme="light"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
        }}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
      />
      {error && (
        <p className="mt-1 px-3 pb-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

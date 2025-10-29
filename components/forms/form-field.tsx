import { cn } from '@/lib/utils';
import { FormFieldProps } from '@/lib/forms/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldComponentProps<T = Record<string, unknown>> extends FormFieldProps<T> {
  field: {
    name: keyof T;
    state: {
      value: unknown;
    };
    handleChange: (value: unknown) => void;
    handleBlur: () => void;
  };
  error?: string;
}

export const FormField = <T = Record<string, unknown>>({ 
  field, 
  label, 
  placeholder, 
  required, 
  disabled, 
  className,
  error 
}: FormFieldComponentProps<T>) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={String(field.name)} className="text-sm font-medium gap-0">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Input
        id={String(field.name)}
        name={String(field.name)}
        value={String(field.state.value)}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(error && 'border-destructive')}
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

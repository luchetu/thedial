export interface FormFieldProps<T = unknown> {
  name: keyof T;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface FormProps<T = Record<string, unknown>> {
  onSubmit: (values: T) => void | Promise<void>;
  defaultValues?: Partial<T>;
  className?: string;
  children: React.ReactNode;
}

export interface ValidationRule<T = unknown> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | undefined;
}

export interface FieldValidationConfig<T = unknown> {
  onChange?: ValidationRule<T>;
  onBlur?: ValidationRule<T>;
  onSubmit?: ValidationRule<T>;
}

export type FieldValue = string | number | boolean | Date | null | undefined;
export type FormValues = Record<string, FieldValue>;

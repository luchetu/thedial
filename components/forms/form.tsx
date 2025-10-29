import { cn } from '@/lib/utils';
import { FormProps } from '@/lib/forms/types';

export const Form = <T extends Record<string, unknown> = Record<string, unknown>>({ 
  onSubmit, 
  defaultValues, 
  className, 
  children 
}: FormProps<T>) => {
  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSubmit(e);
      }}
      className={cn('space-y-6', className)}
    >
      {children}
    </form>
  );
};

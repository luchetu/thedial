import { cn } from '@/lib/utils';
import { FormProps } from '@/lib/forms/types';
import type { FormEvent } from 'react';

export const Form = <T extends Record<string, unknown> = Record<string, unknown>>({ 
  onSubmit, 
  className, 
  children 
}: FormProps<T>) => {
  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const eventHandler = onSubmit as unknown as (event: FormEvent<HTMLFormElement>) => unknown;
        const noArgHandler = onSubmit as unknown as () => unknown;

        const result = eventHandler.length > 0 ? eventHandler(e) : noArgHandler();
        if (result instanceof Promise) {
          void result;
        }
      }}
      className={cn('space-y-6', className)}
    >
      {children}
    </form>
  );
};

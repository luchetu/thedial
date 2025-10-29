import { useForm as useTanStackForm } from '@tanstack/react-form';
import { FormProps } from './types';

export const useForm = <T extends Record<string, unknown>>({
  onSubmit,
  defaultValues,
}: Omit<FormProps<T>, 'className' | 'children'>) => {
  return useTanStackForm<T>({
    defaultValues: defaultValues as T,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });
};

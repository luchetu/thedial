import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormSubmitButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const FormSubmitButton = ({
  children,
  disabled,
  loading,
  className,
  variant = 'default',
  size = 'default'
}: FormSubmitButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={cn(className)}
    >
      {loading ? '...' : children}
    </Button>
  );
};

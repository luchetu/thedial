import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WaveLoader } from '@/components/ui/wave-loader';

interface FormSubmitButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'secondary-outline' | 'primary-outline' | 'ghost' | 'link';
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
      className={cn('cursor-pointer', className)}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <WaveLoader />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
};

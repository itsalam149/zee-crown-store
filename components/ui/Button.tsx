import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { }

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <button
                className={cn(
                    'w-full bg-primary text-white font-bold py-2.5 px-6 rounded-lg shadow-subtle transform transition-all duration-200 hover:bg-primary-hover hover:shadow-medium active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

export default Button;
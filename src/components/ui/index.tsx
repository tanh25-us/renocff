import type {
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (event: any) => void;
  [key: string]: any;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-[#25160e] text-white border border-[#25160e] hover:bg-[#3c2a21]',
  secondary: 'bg-transparent text-[#25160e] border border-[#81756f] hover:bg-[#f4dbc9]/60',
  ghost: 'bg-transparent text-[#25160e] border border-transparent hover:bg-[#f6f3f2]',
  danger: 'bg-[#ffdad6] text-[#93000a] border border-[#f1b8b2] hover:bg-[#ffc9c2]',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
  icon: 'h-11 w-11 p-0',
};

export function Button({ className, variant = 'primary', size = 'md', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('reno-card', className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-[#d3c3bd]/70 px-5 py-4', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label-caps text-[#6d5b4c]">{label}</p>
          <div className="font-display mt-4 text-3xl font-bold leading-none text-[#1b1c1c]">{value}</div>
          {helper && <div className="mt-3 text-xs text-[#4f4540]">{helper}</div>}
        </div>
        {icon && <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f0eded] text-[#25160e]">{icon}</div>}
      </div>
    </Card>
  );
}

type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-[#f0eded] text-[#4f4540] border-[#d3c3bd]',
  primary: 'bg-[#f4dbc9] text-[#25160e] border-[#dec1b3]',
  success: 'bg-[#dfeadc] text-[#26442f] border-[#b7cdb8]',
  warning: 'bg-[#f4dfbd] text-[#5c3c11] border-[#ddc28f]',
  danger: 'bg-[#ffdad6] text-[#93000a] border-[#f1b8b2]',
};

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none',
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block space-y-1.5 text-sm', className)}>
      <span className="label-caps text-[#6d5b4c]">{label}</span>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'focus-ring min-h-11 w-full rounded-lg border border-[#d3c3bd] bg-white px-3 text-sm text-[#1b1c1c] placeholder:text-[#81756f] focus:border-[#6d5b4c]',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'focus-ring min-h-11 w-full rounded-lg border border-[#d3c3bd] bg-white px-3 text-sm text-[#1b1c1c] focus:border-[#6d5b4c]',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'focus-ring w-full rounded-lg border border-[#d3c3bd] bg-white px-3 py-2 text-sm text-[#1b1c1c] placeholder:text-[#81756f] focus:border-[#6d5b4c]',
        className,
      )}
      {...props}
    />
  );
}

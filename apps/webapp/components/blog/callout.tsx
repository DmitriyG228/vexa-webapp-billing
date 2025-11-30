import { ReactNode } from 'react';
import { AlertCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalloutProps {
  type?: 'info' | 'tip' | 'warning' | 'note';
  children: ReactNode;
  className?: string;
}

const calloutConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    iconColor: 'text-blue-500',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    iconColor: 'text-amber-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    iconColor: 'text-red-500',
  },
  note: {
    icon: AlertCircle,
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    text: 'text-slate-400',
    iconColor: 'text-slate-500',
  },
};

export function Callout({ type = 'note', children, className }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'my-6 rounded-lg border-l-4 p-4',
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
        <div className={cn('flex-1 prose-sm', config.text)}>{children}</div>
      </div>
    </div>
  );
}


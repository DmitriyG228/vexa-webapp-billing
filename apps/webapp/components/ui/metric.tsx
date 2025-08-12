import { cn } from '@/lib/utils'

interface MetricProps {
  label?: string
  value: string | number
  unit?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Metric({ 
  label, 
  value, 
  unit, 
  size = 'md',
  className 
}: MetricProps) {
  const sizeClasses = {
    'sm': 'text-lg',
    'md': 'text-2xl', 
    'lg': 'text-3xl',
    'xl': 'text-[44px] leading-[52px]'
  }

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="text-sm text-muted-foreground">{label}</div>
      )}
             <div className={cn(
         'font-display tabular-nums',
         sizeClasses[size]
       )}>
        {value}
        {unit && <span className="text-muted-foreground ml-1">{unit}</span>}
      </div>
    </div>
  )
}

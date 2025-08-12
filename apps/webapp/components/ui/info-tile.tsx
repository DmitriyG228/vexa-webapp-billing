import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfoTileProps {
  icon?: React.ReactNode
  title: string
  description?: string
  variant?: 'default' | 'feature'
  className?: string
}

export function InfoTile({ 
  icon, 
  title, 
  description, 
  variant = 'default',
  className 
}: InfoTileProps) {
  const defaultIcon = variant === 'feature' ? (
    <CheckCircle2 className="h-4 w-4 text-green-500" />
  ) : icon

  return (
    <Card className={cn('rounded-xl border bg-card shadow-sm h-full', className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          {defaultIcon && (
            <div className="flex-shrink-0 mt-0.5">
              {defaultIcon}
            </div>
          )}
          <div className="flex-1 space-y-1">
            <div className="font-medium text-sm">{title}</div>
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

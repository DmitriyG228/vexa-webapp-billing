import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl' | '4xl'
}

export function PageContainer({ 
  children, 
  className,
  maxWidth = '5xl'
}: PageContainerProps) {
  const maxWidthClasses = {
    'full': 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl', 
    '5xl': 'max-w-5xl',
    '4xl': 'max-w-4xl'
  }

  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}

interface SectionProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Section({ 
  children, 
  className,
  padding = 'lg'
}: SectionProps) {
  const paddingClasses = {
    'sm': 'py-8',
    'md': 'py-12', 
    'lg': 'py-16',
    'xl': 'py-20'
  }

  return (
    <section className={cn(paddingClasses[padding], className)}>
      {children}
    </section>
  )
}

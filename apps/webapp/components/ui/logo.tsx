import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showVersion?: boolean;
  version?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ 
  className, 
  showVersion = true, 
  version = "v0.7", 
  size = "md" 
}: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-9 w-9", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
        <Image
          src="/logodark.svg"
          alt="Vexa Logo"
          width={size === "sm" ? 24 : size === "md" ? 36 : 48}
          height={size === "sm" ? 24 : size === "md" ? 36 : 48}
          className={cn(sizeClasses[size], "drop-shadow-sm")}
        />
      <span className={cn("font-display font-semibold tracking-tight", textSizeClasses[size])}>
        Vexa
      </span>
      {showVersion && (
        <Badge 
          variant="outline" 
          className="h-8 px-2 text-xs font-medium bg-background/95 backdrop-blur-sm border-border/50"
        >
          {version}
        </Badge>
      )}
    </div>
  );
}

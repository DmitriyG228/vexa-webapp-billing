import * as React from "react";
import { cn } from "@/lib/utils";

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="section"
      className={cn(
        "text-foreground px-4 py-4 sm:py-8 md:py-12",
        className,
      )}
      {...props}
    />
  );
}

export { Section };



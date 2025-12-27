"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportDocsButton() {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="gap-2 w-full"
    >
      <Link href="/docs/export">
        <Download className="h-4 w-4" />
        Export All Docs
      </Link>
    </Button>
  );
}


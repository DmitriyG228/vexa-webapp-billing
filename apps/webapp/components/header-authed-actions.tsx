"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function HeaderAuthedActions() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (!session) return null;

  return (
    <Button asChild variant="default" size="sm" className="font-semibold h-8 px-3 text-xs">
      <Link href="/dashboard">Dashboard</Link>
    </Button>
  );
}

export function MobileAuthedLinks() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (!session) return null;

  return (
    <>
      <Link href="/dashboard/api-keys" className="text-base font-caption transition-colors hover:text-primary">
        API Keys
      </Link>
      <Link href="/dashboard" className="text-base font-caption transition-colors hover:text-primary">
        Dashboard
      </Link>
    </>
  );
}


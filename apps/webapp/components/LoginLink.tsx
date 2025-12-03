"use client";

import { signIn } from "next-auth/react";

export function LoginLink() {
  return (
    <button 
      onClick={() => signIn("google")} 
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      Log in
    </button>
  );
}


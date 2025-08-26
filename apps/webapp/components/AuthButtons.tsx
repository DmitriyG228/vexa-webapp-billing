"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [showConsent, setShowConsent] = useState(false);
  const [consented, setConsented] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Don't show consent modal on legal document pages
  const isOnLegalPage = pathname?.startsWith('/legal/');

  useEffect(() => {
    if (session && !consentChecked) {
      // Check if user has already consented
      const userConsent = localStorage.getItem(`user-consent-${session.user?.email}`);
      if (!userConsent) {
        // Only show consent modal if not on legal pages
        if (!isOnLegalPage) {
          setShowConsent(true);
        }
      } else {
        try {
          const consentData = JSON.parse(userConsent);
          if (consentData.version === "1.0" && consentData.accepted) {
            setConsented(true);
          } else {
            // Only show consent modal if not on legal pages
            if (!isOnLegalPage) {
              setShowConsent(true);
            }
          }
        } catch (e) {
          // Only show consent modal if not on legal pages
          if (!isOnLegalPage) {
            setShowConsent(true);
          }
        }
      }
      setConsentChecked(true);
    }
  }, [session, consentChecked, isOnLegalPage]);

  const acceptConsent = () => {
    if (session?.user?.email) {
      const consentData = {
        userId: session.user.email,
        accepted: true,
        version: "1.0",
        timestamp: new Date().toISOString(),
        ip: "client-side", // In production, you'd get this from server
        termsAccepted: true,
        privacyAccepted: true
      };
      localStorage.setItem(`user-consent-${session.user.email}`, JSON.stringify(consentData));
      setConsented(true);
      setShowConsent(false);
    }
  };

  if (status === "loading") {
    // Optional: Render a loading state or skeleton
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (session) {
    // User is logged in
    return (
      <>
        {/* Consent Modal - Only show on non-legal pages */}
        {!isOnLegalPage && (
          <Dialog open={showConsent} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
            <DialogHeader>
              <DialogTitle>Welcome to Vexa.ai</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Before you can use Vexa.ai, please review and accept our terms and conditions.
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms-privacy"
                    defaultChecked
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms-privacy" className="text-sm font-medium">
                      I accept the{" "}
                      <Link href="/legal/terms" target="_blank" className="underline text-primary">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/legal/privacy" target="_blank" className="underline text-primary">
                        Privacy Notice
                      </Link>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Review our terms and how we protect your data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => signOut()} className="flex-1">
                  Decline & Sign Out
                </Button>
                <Button onClick={acceptConsent} className="flex-1">
                  Accept & Continue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? session.user?.email ?? "User"} />
                <AvatarFallback>
                  {session.user?.name?.charAt(0).toUpperCase() ?? session.user?.email?.charAt(0).toUpperCase() ?? <UserIcon size={16} />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session.user?.name ?? "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Add dashboard link if needed */}
            {/* <DropdownMenuItem>Dashboard</DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  // User is logged out
  return (
    <Button variant="outline" size="sm" onClick={() => signIn("google")}>
      <LogIn className="mr-2 h-4 w-4" />
      Login
    </Button>
  );
} 
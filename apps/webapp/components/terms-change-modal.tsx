"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface TermsChangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policyType: 'terms' | 'privacy' | 'both'
  changes: string[]
  onAccept: () => void
}

export function TermsChangeModal({
  open,
  onOpenChange,
  policyType,
  changes,
  onAccept
}: TermsChangeModalProps) {
  const [accepted, setAccepted] = useState(false)

  const handleAccept = () => {
    if (accepted) {
      onAccept()
      onOpenChange(false)
    }
  }

  const getPolicyName = () => {
    switch (policyType) {
      case 'terms':
        return 'Terms of Service'
      case 'privacy':
        return 'Privacy Notice'
      case 'both':
        return 'Terms of Service and Privacy Notice'
      default:
        return 'Policies'
    }
  }

  const getPolicyLinks = () => {
    if (policyType === 'terms') {
      return <Link href="/legal/terms" target="_blank" className="underline text-primary">Terms of Service</Link>
    }
    if (policyType === 'privacy') {
      return <Link href="/legal/privacy" target="_blank" className="underline text-primary">Privacy Notice</Link>
    }
    return (
      <>
        <Link href="/legal/terms" target="_blank" className="underline text-primary">Terms of Service</Link> and{' '}
        <Link href="/legal/privacy" target="_blank" className="underline text-primary">Privacy Notice</Link>
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Policy Update Required</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We've updated our {getPolicyName()} to better serve you and comply with regulations.
            Please review the changes and accept the updated policies to continue using Vexa.ai.
          </p>

          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Key Changes:</h4>
            <ul className="text-sm space-y-1">
              {changes.map((change, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="policy-acceptance"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="policy-acceptance" className="text-sm font-medium">
                I accept the updated {getPolicyLinks()}
              </Label>
              <p className="text-xs text-muted-foreground">
                You must accept the updated policies to continue using Vexa.ai.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="flex-1"
            >
              Decline & Sign Out
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!accepted}
              className="flex-1"
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Download, FileText } from "lucide-react"

interface DPAAcceptanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceName: string
  onAccept: (data: {
    name: string
    title: string
    company: string
    acceptedAt: string
  }) => void
}

export function DPAAcceptanceModal({
  open,
  onOpenChange,
  workspaceName,
  onAccept
}: DPAAcceptanceModalProps) {
  const [accepted, setAccepted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: ''
  })

  const handleAccept = () => {
    if (accepted && formData.name && formData.title && formData.company) {
      onAccept({
        ...formData,
        acceptedAt: new Date().toISOString()
      })
      onOpenChange(false)
      // Reset form
      setAccepted(false)
      setFormData({ name: '', title: '', company: '' })
    }
  }

  const handleDownloadPDF = () => {
    // In a real implementation, this would download the actual DPA PDF
    // For now, we'll just open the DPA page
    window.open('/legal/dpa', '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Processing Addendum Required
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            As an organization administrator for <strong>{workspaceName}</strong>, you must review and accept our Data Processing Addendum (DPA) to comply with data protection regulations.
          </p>

          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-medium mb-2">What's Required:</h4>
            <ul className="text-sm space-y-1">
              <li>• Review the complete <Link href="/legal/dpa" target="_blank" className="underline text-primary">Data Processing Addendum</Link></li>
              <li>• Provide your official details for legal records</li>
              <li>• Accept the terms on behalf of your organization</li>
              <li>• Receive a PDF copy for your records</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="full-name">Full Name *</Label>
                <Input
                  id="full-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="job-title">Job Title *</Label>
                <Input
                  id="job-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="CTO, Data Protection Officer"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="dpa-acceptance"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="dpa-acceptance" className="text-sm font-medium">
                I have authority to accept this DPA on behalf of {formData.company || 'my organization'}
              </Label>
              <p className="text-xs text-muted-foreground">
                By checking this box, you agree to the terms in our{' '}
                <Link href="/legal/dpa" target="_blank" className="underline text-primary">Data Processing Addendum</Link>
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!accepted || !formData.name || !formData.title || !formData.company}
              className="flex-1"
            >
              Accept DPA
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

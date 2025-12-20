"use client"

import { usePathname, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Mic } from "lucide-react"

export function DashboardTabs() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Determine active tab based on pathname
  const isTranscription = pathname?.includes('/transcription')
  const activeTab = isTranscription ? 'transcription' : 'bots'

  const handleTabChange = (value: string) => {
    if (value === 'bots' && activeTab !== 'bots') {
      router.push('/dashboard')
    } else if (value === 'transcription' && activeTab !== 'transcription') {
      router.push('/dashboard/transcription')
    }
  }

  return (
    <div className="flex justify-center w-full">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="bots" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span>Bots</span>
          </TabsTrigger>
          <TabsTrigger value="transcription" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span>Transcription</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}




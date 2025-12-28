"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Download, ChevronDown, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

const DOCS_URL = "/docs/vexa-api-documentation.md";
const DOCS_HTML_URL = "/docs/export/html";

export function ExportDocsButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Handle download
  const handleDownload = useCallback(() => {
    setIsDownloading(true);
    const link = document.createElement("a");
    link.href = DOCS_URL;
    link.download = "vexa-api-documentation.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
    
    toast({
      title: "Download started",
      description: "Documentation download started",
    });
  }, [toast]);

  // Handle copy URL to clipboard
  const handleCopyUrl = useCallback(async () => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const fullUrl = `${baseUrl}${DOCS_HTML_URL}`;
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "URL copied!",
        description: "Documentation URL copied to clipboard",
      });
    } catch (error) {
      console.error("Copy error:", error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Handle open in AI provider
  const handleOpenInProvider = useCallback(async (provider: "chatgpt" | "perplexity") => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const docsUrl = `${baseUrl}${DOCS_HTML_URL}`;
      
      // Use HTML URL for better AI consumption
      const prompt = `Please read the API documentation from this URL: ${docsUrl}`;
      
      let providerUrl: string;
      if (provider === "chatgpt") {
        providerUrl = `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`;
      } else {
        providerUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
      }
      
      window.open(providerUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open in provider:", error);
      toast({
        title: "Failed",
        description: `Failed to open in ${provider === "chatgpt" ? "ChatGPT" : "Perplexity"}`,
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <DropdownMenu>
      <div className="flex items-center border rounded-md overflow-hidden bg-background shadow-sm h-9 w-full">
        <Button
          variant="ghost"
          className="gap-2 rounded-r-none border-r-0 hover:bg-muted h-full flex-1 justify-start"
          onClick={handleDownload}
          disabled={isDownloading}
          title="Export All Docs"
        >
          <Download className="h-4 w-4" />
          <span>Export All Docs</span>
        </Button>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 rounded-l-none border-l hover:bg-muted h-full"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download .md
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyUrl}>
          <Link2 className="h-4 w-4 mr-2" />
          Copy URL
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleOpenInProvider("chatgpt")}>
          <Image 
            src="/icons8-chatgpt-100.png" 
            alt="ChatGPT" 
            width={16} 
            height={16} 
            className="object-contain mr-2 invert dark:invert-0" 
          />
          Open in ChatGPT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleOpenInProvider("perplexity")}>
          <Image 
            src="/icons8-perplexity-ai-100.png" 
            alt="Perplexity" 
            width={16} 
            height={16} 
            className="object-contain mr-2" 
          />
          Open in Perplexity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

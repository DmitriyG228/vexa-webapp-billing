'use client';

import Image from "next/image";
import { ArrowRight } from "lucide-react";

const brandBadges = {
  mcp: {
    label: "MCP",
    text: "text-purple-700",
    border: "border-purple-200",
    bg: "bg-purple-50",
  },
  claude: {
    label: "Claude",
    text: "text-amber-800",
    border: "border-amber-200",
    bg: "bg-amber-50",
  },
};

function LogoBadge({ variant }: { variant: keyof typeof brandBadges }) {
  const styles = brandBadges[variant];
  return (
    <div className={`w-20 h-20 flex items-center justify-center rounded-2xl border ${styles.border} ${styles.bg}`}>
      <span className={`text-2xl font-semibold ${styles.text}`}>{styles.label}</span>
    </div>
  );
}

export default function BlogCoverImage() {
  return (
    <div className="w-[1200px] h-[630px] bg-white flex flex-col items-center justify-center p-16">
      {/* Title */}
      <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
        Claude Desktop MCP Setup
      </h1>
      <p className="text-2xl text-gray-600 mb-16 text-center">
        Real-time Google Meet transcripts in Claude
      </p>
      
      {/* Workflow Flow */}
      <div className="flex items-center justify-center space-x-12">
        {/* Google Meet */}
        <div className="flex flex-col items-center space-y-4">
          <Image 
            src="/google-meet-logo.png" 
            alt="Google Meet" 
            width={80} 
            height={80} 
            className="object-contain"
          />
          <span className="text-lg font-semibold text-gray-700">Google Meet</span>
        </div>
        
        {/* Arrow */}
        <ArrowRight className="h-12 w-12 text-gray-400" />
        
        {/* Vexa */}
        <div className="flex flex-col items-center space-y-4">
          <Image 
            src="/logodark.svg" 
            alt="Vexa" 
            width={80} 
            height={80} 
            className="object-contain"
          />
          <span className="text-lg font-semibold text-gray-700">Vexa</span>
        </div>
        
        {/* Arrow */}
        <ArrowRight className="h-12 w-12 text-gray-400" />
        
        {/* MCP */}
        <div className="flex flex-col items-center space-y-4">
          <LogoBadge variant="mcp" />
          <span className="text-lg font-semibold text-gray-700">MCP</span>
        </div>
        
        {/* Arrow */}
        <ArrowRight className="h-12 w-12 text-gray-400" />
        
        {/* Claude */}
        <div className="flex flex-col items-center space-y-4">
          <LogoBadge variant="claude" />
          <span className="text-lg font-semibold text-gray-700">Claude</span>
        </div>
      </div>
      
      {/* Subtitle */}
      <p className="text-xl text-gray-600 mt-16 text-center max-w-3xl">
        Claude is now your real-time meeting assistant
      </p>
    </div>
  );
}

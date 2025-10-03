import { Star } from "lucide-react";
import Image from "next/image";

interface SocialProofProps {
  userCount?: string;
  className?: string;
}

export function SocialProof({ userCount = "1.3k+", className }: SocialProofProps) {
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <div className="flex -space-x-3">
        <Image 
          src="https://i.pravatar.cc/64?img=45" 
          alt="User 1" 
          width={24} 
          height={24} 
          className="h-6 w-6 rounded-full ring-2 ring-background object-cover" 
        />
        <Image 
          src="https://i.pravatar.cc/64?img=23" 
          alt="User 2" 
          width={24} 
          height={24} 
          className="h-6 w-6 rounded-full ring-2 ring-background object-cover" 
        />
        <Image 
          src="https://i.pravatar.cc/64?img=67" 
          alt="User 3" 
          width={24} 
          height={24} 
          className="h-6 w-6 rounded-full ring-2 ring-background object-cover" 
        />
        <Image 
          src="https://i.pravatar.cc/64?img=12" 
          alt="User 4" 
          width={24} 
          height={24} 
          className="h-6 w-6 rounded-full ring-2 ring-background object-cover" 
        />
        <Image 
          src="https://i.pravatar.cc/64?img=34" 
          alt="User 5" 
          width={24} 
          height={24} 
          className="h-6 w-6 rounded-full ring-2 ring-background object-cover" 
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <Star className="h-4 w-4 text-foreground fill-current" />

        </div>
        <span className="text-sm text-muted-foreground">Starred by {userCount} developers</span>
      </div>
    </div>
  );
}

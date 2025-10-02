'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
  isProcessing?: boolean;
}

interface TranscriptionMockProps {
  className?: string;
}

const sampleSpeakers = [
  { name: 'Alice Chen', color: 'text-foreground font-semibold' },
  { name: 'Bob Rodriguez', color: 'text-foreground font-semibold' },
  { name: 'Carol Kim', color: 'text-foreground font-semibold' },
  { name: 'David Wilson', color: 'text-foreground font-semibold' },
];

const samplePhrases = [
  "Let's review the quarterly metrics and discuss our roadmap for next quarter.",
  "I think we should focus on improving our API response times first.",
  "The user feedback has been really positive about the new dashboard features.",
  "We need to prioritize security updates before the next release.",
  "Can we schedule a follow-up meeting to discuss the implementation details?",
  "The performance improvements we made last week are showing great results.",
  "I'd like to propose a new feature that could increase user engagement.",
  "We should consider the impact on our existing customers before making changes.",
  "The testing phase is going well, we're on track for the deadline.",
  "Let me share my screen to show you the latest prototype designs.",
];

export default function TranscriptionMock({ className }: TranscriptionMockProps) {
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentSpeaker, setCurrentSpeaker] = useState(sampleSpeakers[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate real-time transcription
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSpeaking && Math.random() < 0.3) {
        // Start new phrase
        const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
        const randomSpeaker = sampleSpeakers[Math.floor(Math.random() * sampleSpeakers.length)];
        
        setCurrentPhrase(randomPhrase);
        setCurrentSpeaker(randomSpeaker);
        setIsSpeaking(true);
        setCurrentWordIndex(0);
        setIsProcessing(true);
      } else if (isSpeaking && currentWordIndex < currentPhrase.split(' ').length) {
        // Continue building current phrase word by word
        setCurrentWordIndex(prev => prev + 1);
      } else if (isSpeaking && currentWordIndex >= currentPhrase.split(' ').length) {
        // Finish current phrase
        const words = currentPhrase.split(' ');
        const finalText = words.slice(0, currentWordIndex).join(' ');
        
        if (finalText.trim()) {
          const newTranscript: TranscriptEntry = {
            id: Date.now().toString(),
            speaker: currentSpeaker.name,
            text: finalText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            confidence: Math.random() * 0.2 + 0.8, // 80-100% confidence
          };
          
          setTranscripts(prev => [...prev.slice(-4), newTranscript]); // Keep last 5 entries
        }
        
        setIsSpeaking(false);
        setCurrentPhrase('');
        setIsProcessing(false);
      }
    }, Math.random() * 200 + 50); // Random timing between 50-250ms

    return () => clearInterval(interval);
  }, [isSpeaking, currentWordIndex, currentPhrase, currentSpeaker]);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, isSpeaking, currentWordIndex]);

  const getCurrentPartialText = () => {
    if (!isSpeaking || currentWordIndex === 0) return '';
    const words = currentPhrase.split(' ');
    return words.slice(0, currentWordIndex).join(' ');
  };

  const getRemainingText = () => {
    if (!isSpeaking) return '';
    const words = currentPhrase.split(' ');
    return words.slice(currentWordIndex).join(' ');
  };

  return (
    <div className={cn("relative bg-black rounded-xl flex flex-col h-full", className)}>
      {/* Terminal header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-b border-gray-600 rounded-t-xl">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-600"></div>
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
        </div>
        <div className="text-sm text-gray-300 font-mono">
 
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span className="text-sm text-white font-mono font-semibold">LIVE</span>
        </div>
      </div>

      {/* Transcript content */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 space-y-4 font-mono text-sm overflow-y-auto bg-black leading-relaxed text-left rounded-b-xl"
        style={{ 
          maskImage: 'none',
          WebkitMaskImage: 'none',
          background: 'black',
          backgroundImage: 'none'
        }}
      >
        {/* Existing transcripts */}
        {transcripts.map((transcript) => (
          <div key={transcript.id} className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-mono">{transcript.timestamp}</span>
              <span className="text-white font-semibold font-mono">
                {transcript.speaker}:
              </span>
            </div>
            <div className="text-gray-200 ml-6 leading-relaxed font-mono">{transcript.text}</div>
          </div>
        ))}

        {/* Current live transcription */}
        {isSpeaking && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-white font-semibold font-mono">
                {currentSpeaker.name}:
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {isProcessing ? 'Processing...' : 'Speaking'}
              </span>
            </div>
            <div className="text-gray-200 ml-6 leading-relaxed font-mono">
              <span>{getCurrentPartialText()}</span>
              <span className="text-gray-500">{getRemainingText()}</span>
              {isProcessing && (
                <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse"></span>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

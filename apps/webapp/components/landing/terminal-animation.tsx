"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Speaker {
  name: string;
  color: string;
}

interface DoneEntry {
  n: string;
  c: string;
  text: string;
  t: string;
}

const speakers: Speaker[] = [
  { name: "Alice Chen", color: "#7dd3fc" },
  { name: "Bob Rodriguez", color: "#c4b5fd" },
  { name: "Carol Kim", color: "#6ee7b7" },
  { name: "David Wilson", color: "#fca5a5" },
];

const phrases: string[] = [
  "We need to ship the new API before the end of Q3.",
  "Let's target June 15th as the hard deadline for the release.",
  "I can own the integration tests — Carol, can you handle docs?",
  "The performance improvements we made last sprint are solid.",
  "We should loop in the design team before the next sprint review.",
  "I think we're aligned on the roadmap for meeting intelligence.",
  "Can we confirm the self-hosted deployment strategy today?",
  "The OpenAI integration works, n8n pipeline looks good too.",
  "Let's prioritize the real-time transcript endpoint first.",
  "We should open source the core SDK as part of the launch.",
];

function formatTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function TerminalAnimation() {
  const [done, setDone] = useState<DoneEntry[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [clock, setClock] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep mutable refs for the animation loop to avoid stale closures
  const stateRef = useRef({
    done: [] as DoneEntry[],
    speaking: false,
    currentPhrase: "",
    currentSpeaker: null as Speaker | null,
    wordIndex: 0,
  });

  // Clock interval — set initial value on mount to avoid hydration mismatch
  useEffect(() => {
    setClock(formatTime());
    const interval = setInterval(() => {
      setClock(formatTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [done, wordIndex]);

  const tick = useCallback(() => {
    const s = stateRef.current;

    if (!s.speaking) {
      if (Math.random() < 0.3) {
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const spkr = speakers[Math.floor(Math.random() * speakers.length)];
        s.currentPhrase = phrase;
        s.currentSpeaker = spkr;
        s.wordIndex = 0;
        s.speaking = true;

        setCurrentPhrase(phrase);
        setCurrentSpeaker(spkr);
        setWordIndex(0);
        setSpeaking(true);
      }
    } else {
      const total = s.currentPhrase.split(" ").length;
      if (s.wordIndex < total) {
        s.wordIndex++;
        setWordIndex(s.wordIndex);
      } else {
        const entry: DoneEntry = {
          n: s.currentSpeaker!.name,
          c: s.currentSpeaker!.color,
          text: s.currentPhrase,
          t: formatTime(),
        };
        s.done = [...s.done, entry];
        s.speaking = false;

        setDone(s.done);
        setSpeaking(false);
      }
    }
  }, []);

  // Animation loop with random delay
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function loop() {
      timeoutId = setTimeout(() => {
        tick();
        loop();
      }, Math.random() * 150 + 55);
    }

    loop();
    return () => clearTimeout(timeoutId);
  }, [tick]);

  const visibleDone = done.slice(-8);
  const words = currentPhrase.split(" ");
  const typed = words.slice(0, wordIndex).join(" ");
  const ghost = words.slice(wordIndex).join(" ");

  return (
    <div className="relative rounded-[16px] border border-gray-200/80 dark:border-neutral-800/80 overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.13)]">
      {/* Chrome */}
      <div className="relative flex items-center px-5 py-[11px] bg-[#1a1a1a] border-b border-white/[0.06]">
        <div className="flex gap-[6px] flex-shrink-0">
          <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
          <div className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
          <div className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
        </div>
        <span className="absolute inset-x-0 text-center text-[11px] text-gray-500 font-mono pointer-events-none">
          vexa &middot; live transcript
        </span>
        <div className="ml-auto flex items-center gap-[5px]">
          <span className="w-[6px] h-[6px] rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-[10.5px] text-gray-400 font-mono font-semibold tracking-widest">
            LIVE
          </span>
        </div>
      </div>

      {/* Live transcript */}
      <div
        ref={scrollRef}
        className="t-scroll p-5 h-[320px] overflow-y-auto space-y-4 font-mono text-[12px] leading-relaxed text-left bg-[#111]"
      >
        {visibleDone.length === 0 && !speaking && (
          <p className="text-gray-700 text-xs">
            Waiting for meeting participants&hellip;
          </p>
        )}

        {visibleDone.map((entry, i) => (
          <div key={i} className="space-y-[4px]">
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] text-gray-600 tabular-nums">
                {entry.t}
              </span>
              <span
                className="font-semibold text-[11.5px]"
                style={{ color: entry.c }}
              >
                {entry.n}
              </span>
            </div>
            <p className="text-gray-300 text-[12px]">{entry.text}</p>
          </div>
        ))}

        {speaking && currentSpeaker && (
          <div className="space-y-[4px]">
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] text-gray-600 tabular-nums">
                {clock}
              </span>
              <span
                className="font-semibold text-[11.5px]"
                style={{ color: currentSpeaker.color }}
              >
                {currentSpeaker.name}
              </span>
              <span className="text-[9px] text-gray-600 tracking-wider">
                transcribing
              </span>
            </div>
            <p className="text-gray-300 text-[12px]">
              {typed}
              <span className="text-gray-700">
                {typed ? " " : ""}
                {ghost}
              </span>
              <span className="animate-blink text-gray-400">{"\u258C"}</span>
            </p>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-5 py-2 bg-[#161616] border-t border-white/[0.05]">
        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono">
          <span className="w-[5px] h-[5px] rounded-full bg-emerald-500" />
          Connected &middot; Google Meet
        </div>
        <span className="text-[10px] text-gray-700 font-mono">{clock}</span>
      </div>
    </div>
  );
}

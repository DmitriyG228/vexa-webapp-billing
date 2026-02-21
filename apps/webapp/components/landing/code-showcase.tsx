'use client';

import { useState } from 'react';

interface CodeTab {
  id: string;
  label: string;
  filename: string;
  content: React.ReactNode;
}

/* ── Python code (manually colored) ───────────────── */
const PythonCode = () => (
  <code>
    <span className="text-gray-500">import</span>{' '}
    <span className="text-[#7dd3fc]">requests</span>
    {'\n\n'}
    <span className="text-gray-600"># 1. Join a meeting</span>
    {'\n'}
    <span className="text-gray-300">bot</span>{' '}
    <span className="text-gray-500">=</span>{' '}
    <span className="text-gray-300">requests</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">post</span>
    <span className="text-gray-500">(</span>
    <span className="text-[#6ee7b7]">&quot;https://api.cloud.vexa.ai/bots&quot;</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">headers</span>
    <span className="text-gray-500">={'{'}</span>
    <span className="text-[#6ee7b7]">&quot;X-API-Key&quot;</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-gray-300">API_KEY</span>
    <span className="text-gray-500">{'}'},</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">json</span>
    <span className="text-gray-500">={'{'}</span>
    {'\n'}
    {'        '}
    <span className="text-[#6ee7b7]">&quot;platform&quot;</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;google_meet&quot;</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'        '}
    <span className="text-[#6ee7b7]">&quot;native_meeting_id&quot;</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;abc-defg-hij&quot;</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'        '}
    <span className="text-[#6ee7b7]">&quot;bot_name&quot;</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;Vexa Notetaker&quot;</span>
    {'\n'}
    {'    '}
    <span className="text-gray-500">{'}'}</span>
    {'\n'}
    <span className="text-gray-500">)</span>
    {'\n\n'}
    <span className="text-gray-600"># 2. Get the transcript</span>
    {'\n'}
    <span className="text-gray-300">transcript</span>{' '}
    <span className="text-gray-500">=</span>{' '}
    <span className="text-gray-300">requests</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">get</span>
    <span className="text-gray-500">(</span>
    {'\n'}
    {'    '}
    <span className="text-[#6ee7b7]">&quot;https://api.cloud.vexa.ai/transcripts/google_meet/abc-defg-hij&quot;</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">headers</span>
    <span className="text-gray-500">={'{'}</span>
    <span className="text-[#6ee7b7]">&quot;X-API-Key&quot;</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-gray-300">API_KEY</span>
    <span className="text-gray-500">{'}'}</span>
    {'\n'}
    <span className="text-gray-500">)</span>
    {'\n\n'}
    <span className="text-gray-600"># 3. Run through your AI</span>
    {'\n'}
    <span className="text-gray-300">summary</span>{' '}
    <span className="text-gray-500">=</span>{' '}
    <span className="text-gray-300">openai</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">chat</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">completions</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">create</span>
    <span className="text-gray-500">(</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">model</span>
    <span className="text-gray-500">=</span>
    <span className="text-[#6ee7b7]">&quot;gpt-4o&quot;</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">messages</span>
    <span className="text-gray-500">=[{'{'}</span>
    <span className="text-[#6ee7b7]">&quot;role&quot;</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;user&quot;</span>
    <span className="text-gray-500">,</span>{' '}
    <span className="text-[#6ee7b7]">&quot;content&quot;</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-gray-300">transcript</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">text</span>
    <span className="text-gray-500">()</span>
    <span className="text-gray-500">{'}]'}</span>
    {'\n'}
    <span className="text-gray-500">)</span>
  </code>
);

/* ── cURL code (manually colored) ─────────────────── */
const CurlCode = () => (
  <code>
    <span className="text-gray-600"># 1. Join a meeting</span>
    {'\n'}
    <span className="text-gray-500">$</span>{' '}
    <span className="text-gray-300">curl -X POST https://api.cloud.vexa.ai/bots</span>{' '}
    <span className="text-gray-500">\</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">-H</span>{' '}
    <span className="text-[#6ee7b7]">&quot;X-API-Key: YOUR_API_KEY&quot;</span>{' '}
    <span className="text-gray-500">\</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">-H</span>{' '}
    <span className="text-[#6ee7b7]">&quot;Content-Type: application/json&quot;</span>{' '}
    <span className="text-gray-500">\</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">-d</span>{' '}
    <span className="text-[#6ee7b7]">
      {`'{
      "platform": "google_meet",
      "native_meeting_id": "abc-defg-hij",
      "bot_name": "Vexa Notetaker"
    }'`}
    </span>
    {'\n\n'}
    <span className="text-gray-600"># 2. Get the transcript</span>
    {'\n'}
    <span className="text-gray-500">$</span>{' '}
    <span className="text-gray-300">
      curl https://api.cloud.vexa.ai/transcripts/google_meet/abc-defg-hij
    </span>{' '}
    <span className="text-gray-500">\</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">-H</span>{' '}
    <span className="text-[#6ee7b7]">&quot;X-API-Key: YOUR_API_KEY&quot;</span>
    {'\n\n'}
    <span className="text-gray-600"># 3. Stop the bot</span>
    {'\n'}
    <span className="text-gray-500">$</span>{' '}
    <span className="text-gray-300">
      curl -X DELETE https://api.cloud.vexa.ai/bots/google_meet/abc-defg-hij
    </span>{' '}
    <span className="text-gray-500">\</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">-H</span>{' '}
    <span className="text-[#6ee7b7]">&quot;X-API-Key: YOUR_API_KEY&quot;</span>
  </code>
);

/* ── TypeScript code (manually colored) ───────────── */
const TypeScriptCode = () => (
  <code>
    <span className="text-gray-600">// 1. Join a meeting</span>
    {'\n'}
    <span className="text-gray-500">const</span>{' '}
    <span className="text-gray-300">bot</span>{' '}
    <span className="text-gray-500">=</span>{' '}
    <span className="text-gray-500">await</span>{' '}
    <span className="text-gray-300">fetch</span>
    <span className="text-gray-500">(</span>
    <span className="text-[#6ee7b7]">&quot;https://api.cloud.vexa.ai/bots&quot;</span>
    <span className="text-gray-500">,</span>{' '}
    <span className="text-gray-500">{'{'}</span>
    {'\n'}
    {'  '}
    <span className="text-gray-300">method</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;POST&quot;</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'  '}
    <span className="text-gray-300">headers</span>
    <span className="text-gray-500">: {'{'}</span>
    {'\n'}
    {'    '}
    <span className="text-[#6ee7b7]">&quot;X-API-Key&quot;</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-gray-300">API_KEY</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'    '}
    <span className="text-[#6ee7b7]">&quot;Content-Type&quot;</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;application/json&quot;</span>
    {'\n'}
    {'  '}
    <span className="text-gray-500">{'}'},</span>
    {'\n'}
    {'  '}
    <span className="text-gray-300">body</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-gray-300">JSON</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">stringify</span>
    <span className="text-gray-500">({'{'}</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">platform</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;google_meet&quot;</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">native_meeting_id</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;abc-defg-hij&quot;</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'    '}
    <span className="text-gray-300">bot_name</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;Vexa Notetaker&quot;</span>
    {'\n'}
    {'  '}
    <span className="text-gray-500">{'}'})</span>
    {'\n'}
    <span className="text-gray-500">{'}'});</span>
    {'\n\n'}
    <span className="text-gray-600">// 2. Get the transcript</span>
    {'\n'}
    <span className="text-gray-500">const</span>{' '}
    <span className="text-gray-300">transcript</span>{' '}
    <span className="text-gray-500">=</span>{' '}
    <span className="text-gray-500">await</span>{' '}
    <span className="text-gray-300">fetch</span>
    <span className="text-gray-500">(</span>
    {'\n'}
    {'  '}
    <span className="text-[#6ee7b7]">&quot;https://api.cloud.vexa.ai/transcripts/google_meet/abc-defg-hij&quot;</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'  '}
    <span className="text-gray-500">{'{'}</span>{' '}
    <span className="text-gray-300">headers</span>
    <span className="text-gray-500">: {'{'}</span>{' '}
    <span className="text-[#6ee7b7]">&quot;X-API-Key&quot;</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-gray-300">API_KEY</span>{' '}
    <span className="text-gray-500">{'}'} {'}'}</span>
    {'\n'}
    <span className="text-gray-500">).</span>
    <span className="text-gray-300">then</span>
    <span className="text-gray-500">(</span>
    <span className="text-gray-300">r</span>{' '}
    <span className="text-gray-500">=&gt;</span>{' '}
    <span className="text-gray-300">r</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">json</span>
    <span className="text-gray-500">());</span>
    {'\n\n'}
    <span className="text-gray-600">// 3. Process with AI</span>
    {'\n'}
    <span className="text-gray-500">const</span>{' '}
    <span className="text-gray-300">result</span>{' '}
    <span className="text-gray-500">=</span>{' '}
    <span className="text-gray-500">await</span>{' '}
    <span className="text-gray-300">anthropic</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">messages</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">create</span>
    <span className="text-gray-500">({'{'}</span>
    {'\n'}
    {'  '}
    <span className="text-gray-300">model</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;claude-sonnet-4-20250514&quot;</span>
    <span className="text-gray-500">,</span>
    {'\n'}
    {'  '}
    <span className="text-gray-300">messages</span>
    <span className="text-gray-500">: [{'{'}</span>{' '}
    <span className="text-gray-300">role</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-[#6ee7b7]">&quot;user&quot;</span>
    <span className="text-gray-500">,</span>{' '}
    <span className="text-gray-300">content</span>
    <span className="text-gray-500">:</span>{' '}
    <span className="text-gray-300">transcript</span>
    <span className="text-gray-500">.</span>
    <span className="text-gray-300">text</span>{' '}
    <span className="text-gray-500">{'}]'}</span>
    {'\n'}
    <span className="text-gray-500">{'}'});</span>
  </code>
);

const codeTabs: CodeTab[] = [
  { id: 'python', label: 'Python', filename: 'main.py', content: <PythonCode /> },
  { id: 'curl', label: 'cURL', filename: 'terminal', content: <CurlCode /> },
  { id: 'typescript', label: 'TypeScript', filename: 'app.ts', content: <TypeScriptCode /> },
];

export function CodeShowcase() {
  const [activeTab, setActiveTab] = useState('python');

  const activeCode = codeTabs.find((t) => t.id === activeTab)!;

  return (
    <section className="py-16 lg:py-20 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 bg-white text-[11.5px] text-gray-500 font-medium shadow-sm mb-4">
            Developer Experience
          </span>
          <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950">
            Three API calls to
            <br />
            <em className="not-italic font-light text-gray-400">meeting intelligence</em>
          </h2>
          <p className="mt-4 text-[15.5px] text-gray-500 leading-[1.7] max-w-lg mx-auto">
            Join a meeting, get the transcript, run it through your AI. That&apos;s it.
          </p>
        </div>

        {/* Code tabs */}
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-1 mb-0">
            {codeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg text-[13px] font-medium font-mono transition-all border border-b-0 ${
                  activeTab === tab.id
                    ? 'text-gray-200 bg-[#1a1a1a] border-[#333]'
                    : 'text-gray-400 bg-transparent border-transparent hover:text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code panel */}
          <div className="rounded-b-2xl rounded-tr-2xl border border-gray-200/80 overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.13)]">
            {/* macOS chrome bar */}
            <div className="flex items-center px-5 py-[11px] bg-[#1a1a1a] border-b border-white/[0.06]">
              <div className="flex gap-[6px]">
                <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
                <div className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
                <div className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
              </div>
              <span className="ml-4 text-[11px] text-gray-500 font-mono">
                {activeCode.filename}
              </span>
            </div>
            <pre className="p-5 bg-[#111] text-[12.5px] leading-[1.8] font-mono overflow-x-auto">
              {activeCode.content}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

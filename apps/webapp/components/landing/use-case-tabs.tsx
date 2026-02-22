'use client';

import { useState } from 'react';

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface TabData {
  id: string;
  label: string;
  heading: string;
  description: string;
  bullets: string[];
  card: React.ReactNode;
}

/* ── Sales card ───────────────────────────────────── */
const SalesCard = () => (
  <div
    className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 h-[280px] overflow-hidden"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Deal Pipeline</span>
      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
        3 active
      </span>
    </div>
    <div className="space-y-2.5">
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Acme Corp &mdash; Enterprise</span>
          <span className="text-[10px] text-emerald-500 font-medium">$48k</span>
        </div>
        <div className="flex gap-1.5 mb-1.5">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium">
            Demo done
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium">
            Pricing sent
          </span>
        </div>
        <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-[1.5]">
          Competitor mention: Recall.ai &mdash; &ldquo;need real-time, not batch&rdquo;
        </p>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">NovaTech &mdash; Scale</span>
          <span className="text-[10px] text-emerald-500 font-medium">$24k</span>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-500 font-medium">
            Discovery
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
            Follow-up
          </span>
        </div>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">DataFlow Inc</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">$12k</span>
        </div>
      </div>
    </div>
  </div>
);

/* ── HR card ──────────────────────────────────────── */
const HRCard = () => (
  <div
    className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 h-[280px] overflow-hidden"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Interview Scorecard</span>
      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
        Round 2
      </span>
    </div>
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Technical depth</span>
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">4/5</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
          <div className="h-full bg-emerald-400 rounded-full" style={{ width: '80%' }} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Communication</span>
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">5/5</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
          <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Problem solving</span>
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">3/5</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
          <div className="h-full bg-amber-400 rounded-full" style={{ width: '60%' }} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Culture fit</span>
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">4/5</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
          <div className="h-full bg-emerald-400 rounded-full" style={{ width: '80%' }} />
        </div>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
      <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-[1.5]">
        &ldquo;Strong systems design background, articulate on trade-offs. Follow up on scaling
        questions.&rdquo;
      </p>
    </div>
  </div>
);

/* ── Engineering card ─────────────────────────────── */
const EngineeringCard = () => (
  <div
    className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 h-[280px] overflow-hidden"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
        Sprint Standup &middot; Feb 21
      </span>
      <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
        8 min
      </span>
    </div>
    <div className="space-y-2.5">
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium">
            ACTION
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">@alice</span>
        </div>
        <p className="text-[10px] text-gray-700 dark:text-gray-300">Finalize API contract for /bots endpoint</p>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-medium">
            BLOCKER
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">@bob</span>
        </div>
        <p className="text-[10px] text-gray-700 dark:text-gray-300">Waiting on infra for staging deploy</p>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
            DONE
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">@carol</span>
        </div>
        <p className="text-[10px] text-gray-700 dark:text-gray-300">WebSocket reconnection logic shipped</p>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-500 font-medium">
            TICKET
          </span>
        </div>
        <p className="text-[10px] text-gray-700 dark:text-gray-300">VEX-142: Add rate limiting to transcript API</p>
      </div>
    </div>
  </div>
);

/* ── Video Production card ────────────────────────── */
const VideoCard = () => (
  <div
    className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 h-[280px] overflow-hidden"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Production Daily Notes</span>
      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
        Ep. 4
      </span>
    </div>
    <div className="space-y-2.5">
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-medium">
            REVISION
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Scene 12</span>
        </div>
        <p className="text-[10px] text-gray-700 dark:text-gray-300">
          Color grade too warm &mdash; match reference from ep. 2
        </p>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
            APPROVED
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Scene 8&ndash;11</span>
        </div>
        <p className="text-[10px] text-gray-700 dark:text-gray-300">VFX composites locked for final render</p>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium">
            DELIVERY
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Sound</span>
        </div>
        <p className="text-[10px] text-gray-700 dark:text-gray-300">
          ADR session scheduled Feb 23 &mdash; lines flagged
        </p>
      </div>
    </div>
    <div className="mt-3 flex gap-1.5">
      <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-medium">
        Director
      </span>
      <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-medium">
        Editor
      </span>
      <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-medium">
        VFX Lead
      </span>
    </div>
  </div>
);

/* ── Medical card ─────────────────────────────────── */
const MedicalCard = () => (
  <div
    className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 h-[280px] overflow-hidden"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
        SOAP Note &mdash; Auto-generated
      </span>
      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
        Verified
      </span>
    </div>
    <div className="space-y-2.5">
      <div>
        <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-wider">
          Subjective
        </span>
        <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-[1.5] mt-0.5">
          Patient reports persistent lower back pain for 3 weeks, worsening with prolonged sitting.
          No radiating symptoms.
        </p>
      </div>
      <div>
        <span className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider">
          Objective
        </span>
        <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-[1.5] mt-0.5">
          ROM limited to 60&deg; flexion. Tenderness at L4-L5. Negative SLR bilaterally.
        </p>
      </div>
      <div>
        <span className="text-[9px] font-semibold text-amber-500 uppercase tracking-wider">
          Assessment
        </span>
        <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-[1.5] mt-0.5">
          Mechanical low back pain, likely muscular. No red flags identified.
        </p>
      </div>
      <div>
        <span className="text-[9px] font-semibold text-purple-500 uppercase tracking-wider">
          Plan
        </span>
        <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-[1.5] mt-0.5">
          PT referral, NSAIDs PRN, follow-up in 4 weeks if no improvement.
        </p>
      </div>
    </div>
  </div>
);

/* ── Education card ───────────────────────────────── */
const EducationCard = () => (
  <div
    className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 h-[280px] overflow-hidden"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Lecture Summary</span>
      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
        CS 201
      </span>
    </div>
    <div className="space-y-2.5">
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Key Concepts
        </span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium">
            Binary trees
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium">
            BFS vs DFS
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium">
            Time complexity
          </span>
        </div>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Study Questions
        </span>
        <div className="mt-1.5 space-y-1">
          <p className="text-[10px] text-gray-600 dark:text-gray-300">1. When is BFS preferred over DFS?</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-300">2. What is the space complexity of BFS?</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-300">3. How does a balanced BST differ?</p>
        </div>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Languages
        </span>
        <div className="flex gap-1 mt-1">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
            EN
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
            ES
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
            ZH
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-medium">
            +12
          </span>
        </div>
      </div>
    </div>
  </div>
);

/* ── Legal card ───────────────────────────────────── */
const LegalCard = () => (
  <div
    className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 h-[280px] overflow-hidden"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Time &amp; Billing</span>
      <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
        Feb 21
      </span>
    </div>
    <div className="space-y-2.5">
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
            Client call &mdash; Merger review
          </span>
          <span className="text-[9px] font-mono text-emerald-500">1.5h</span>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
            Billable
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
            Auto-tagged
          </span>
        </div>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
            Deposition prep &mdash; Smith v. Jones
          </span>
          <span className="text-[9px] font-mono text-emerald-500">2.0h</span>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
            Billable
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium">
            3 action items
          </span>
        </div>
      </div>
      <div className="rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
            Internal strategy &mdash; Team sync
          </span>
          <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500">0.5h</span>
        </div>
        <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-medium">
          Non-billable
        </span>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
      <span className="text-[10px] text-gray-400 dark:text-gray-500">Today&apos;s billable</span>
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">3.5 hrs &middot; $1,575</span>
    </div>
  </div>
);

/* ── Tab data ─────────────────────────────────────── */
const tabs: TabData[] = [
  {
    id: 'sales',
    label: 'Sales',
    heading: 'Close faster with meeting intelligence',
    description:
      'Auto-capture discovery calls, demos, and negotiations. Surface objections, competitor mentions, and next steps \u2014 then push structured insights to your CRM in real time.',
    bullets: [
      'Auto-log call notes to Salesforce & HubSpot',
      'Track competitor mentions and pricing discussions',
      'Coach reps with talk-ratio and question analytics',
    ],
    card: <SalesCard />,
  },
  {
    id: 'hr',
    label: 'HR & Recruiting',
    heading: 'Structured interviews, less bias',
    description:
      'Transcribe every interview automatically. Generate structured scorecards, compare candidates consistently, and ensure compliance with an auditable record of every conversation.',
    bullets: [
      'Auto-generate interview scorecards',
      'Push candidate notes to your ATS',
      'Compliance-ready transcript archives',
    ],
    card: <HRCard />,
  },
  {
    id: 'engineering',
    label: 'Engineering',
    heading: 'Ship faster with async standups',
    description:
      'Turn daily standups and sprint retros into structured action items. Auto-create Jira tickets, flag blockers, and keep distributed teams in sync \u2014 without anyone taking notes.',
    bullets: [
      'Auto-create Jira/Linear tickets from decisions',
      'Track blockers and ownership across sprints',
      'Post summaries to Slack and Notion',
    ],
    card: <EngineeringCard />,
  },
  {
    id: 'video',
    label: 'Video Production',
    heading: 'Production dailies on autopilot',
    description:
      'Capture notes from production meetings and dailies. Track creative feedback, revision requests, and delivery timelines \u2014 then distribute structured notes to the crew automatically.',
    bullets: [
      'Log feedback per shot/scene/asset',
      'Auto-distribute daily notes to crew',
      'Track delivery timelines across departments',
    ],
    card: <VideoCard />,
  },
  {
    id: 'medical',
    label: 'Medical',
    heading: 'Clinical notes without the admin burden',
    description:
      'Transcribe telehealth consultations with speaker-diarized, HIPAA-ready transcripts. Generate structured SOAP notes and push them to your EHR \u2014 so clinicians can focus on patients.',
    bullets: [
      'Auto-generate SOAP notes from consultations',
      'Self-host for full HIPAA compliance',
      'Push structured data to EHR systems',
    ],
    card: <MedicalCard />,
  },
  {
    id: 'education',
    label: 'Education',
    heading: 'Every lecture, searchable and summarized',
    description:
      'Record online lectures, office hours, and group sessions. Generate study guides, highlight key concepts, and make every class accessible with accurate multilingual transcripts.',
    bullets: [
      'Auto-generate study guides from lectures',
      '100+ language support for global classrooms',
      'Accessibility-ready transcripts for ADA compliance',
    ],
    card: <EducationCard />,
  },
  {
    id: 'legal',
    label: 'Legal',
    heading: 'Billable hours captured, not estimated',
    description:
      'Transcribe client calls, depositions, and mediations. Auto-tag billable vs. admin time, extract action items, and maintain a defensible record of every client interaction.',
    bullets: [
      'Auto-tag billable time from call transcripts',
      'Defensible audit trail for every interaction',
      'Self-host for client privilege and confidentiality',
    ],
    card: <LegalCard />,
  },
];

export function UseCaseTabs() {
  const [activeTab, setActiveTab] = useState('sales');

  const activeData = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="py-16 lg:py-20 border-t border-gray-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
            Use Cases
          </span>
          <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
            Intelligence for every
            <br />
            <em className="not-italic font-light text-gray-400 dark:text-gray-500">meeting</em>
          </h2>
        </div>

        {/* Tab pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-gray-950 dark:text-gray-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 bg-transparent border border-transparent hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-[24px] font-semibold text-gray-950 dark:text-gray-50 mb-3 tracking-[-0.02em]">
              {activeData.heading}
            </h3>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-[1.7] mb-6">
              {activeData.description}
            </p>
            <div className="space-y-3">
              {activeData.bullets.map((bullet, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="text-[14px] text-gray-600 dark:text-gray-300">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
          {activeData.card}
        </div>
      </div>
    </section>
  );
}

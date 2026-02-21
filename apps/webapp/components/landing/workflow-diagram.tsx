"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// SVG icon components for output nodes
function OpenAIIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z" />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#D97757">
      <path d="m4.714 15.956 4.717-2.648.08-.23-.08-.128h-.23l-.79-.049-2.695-.073-2.338-.097-2.265-.121-.57-.122-.535-.704.055-.352.48-.322.686.061 1.518.103 2.277.158 1.651.097 2.447.255h.389l.054-.158-.134-.097-.103-.097-2.532-1.7-2.55-1.688-1.336-.971-.722-.492-.365-.461-.157-1.008.655-.722.88.06.225.061.892.686 1.907 1.475 2.489 1.834.365.303.145-.103.018-.073-.163-.273-1.354-2.447-1.445-2.489-.644-1.032-.17-.62c-.06-.254-.103-.467-.103-.728L6.287.134 6.7 0l.996.134.419.364.619 1.415 1.002 2.228 1.554 3.03.456.898.243.832.09.255h.158v-.146l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.583.28.48.685-.067.444-.285 1.852-.559 2.902-.364 1.943h.212l.243-.243.984-1.305 1.651-2.065.729-.82.85-.904.546-.431h1.032l.76 1.13-.34 1.165-1.063 1.348-.88 1.141-1.263 1.7-.79 1.36.073.11.189-.019 2.853-.607 1.542-.28 1.84-.315.831.388.091.395-.328.807-1.967.486-2.307.461-3.436.814-.043.03.049.061 1.548.146.662.036h1.621l3.018.225.789.522.474.637-.08.486-1.214.62-1.64-.389-3.825-.911-1.311-.328h-.182v.11l1.093 1.068 2.004 1.81 2.507 2.331.128.577-.322.455-.34-.048-2.204-1.658-.85-.747-1.925-1.621h-.127v.17l.443.65 2.344 3.521.121 1.081-.17.352-.607.212-.668-.121-1.372-1.925-1.457-2.046-1.141-1.943-.14.08-.674 7.255-.316.37-.728.28-.607-.462-.322-.747.322-1.475.389-1.925.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.433 1.967-2.18 2.945-1.724 1.846-.413.163-.716-.37.067-.662.4-.589 2.387-3.036 1.439-1.882.929-1.087-.006-.158h-.055l-6.338 4.117-1.13.145-.485-.455.06-.747.231-.243 1.906-1.311z" />
    </svg>
  );
}

function N8nIcon() {
  return (
    <svg height="20" width="20" viewBox="0 0 24 24" fill="#EA4B71">
      <path d="M21.474 5.684c-1.177 0-2.166.805-2.447 1.895h-2.895c-1.235 0-2.289.893-2.492 2.111l-.104.623a1.263 1.263 0 0 1-1.246 1.056H11.29c-.28-1.09-1.27-1.895-2.447-1.895s-2.166.805-2.447 1.895H4.973c-.28-1.09-1.27-1.895-2.447-1.895C1.131 9.474 0 10.605 0 12s1.131 2.526 2.526 2.526c1.177 0 2.166-.805 2.447-1.895h1.422c.28 1.09 1.27 1.895 2.447 1.895 1.177 0 2.166-.805 2.447-1.895h1.001a1.263 1.263 0 0 1 1.246 1.056l.104.623c.203 1.218 1.257 2.111 2.492 2.111h.369c.28 1.09 1.27 1.895 2.447 1.895 1.395 0 2.526-1.131 2.526-2.526s-1.131-2.527-2.526-2.527c-1.177 0-2.166.806-2.447 1.895h-.369a1.263 1.263 0 0 1-1.246-1.055l-.104-.623A2.52 2.52 0 0 0 13.961 12c.34-.414.598-.917.821-1.48l.104-.622a1.263 1.263 0 0 1 1.246-1.056h2.895c.28 1.09 1.27 1.895 2.447 1.895 1.395 0 2.526-1.131 2.526-2.526s-1.131-2.527-2.526-2.527" />
    </svg>
  );
}

function OpenClawIcon() {
  return <span className="text-[22px] leading-none">🦀</span>;
}

function ZoomIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#0B5CFF">
      <path d="M5.033 14.649H.743a.74.74 0 0 1-.686-.458.74.74 0 0 1 .16-.808L3.19 10.41H1.06A1.06 1.06 0 0 1 0 9.35h3.957c.301 0 .57.18.686.458a.74.74 0 0 1-.161.808L1.51 13.59h2.464c.585 0 1.06.475 1.06 1.06zM24 11.338c0-1.14-.927-2.066-2.066-2.066-.61 0-1.158.265-1.537.686a2.061 2.061 0 0 0-1.536-.686c-1.14 0-2.066.926-2.066 2.066v3.311a1.06 1.06 0 0 0 1.06-1.06v-2.251a1.004 1.004 0 0 1 2.013 0v2.251c0 .586.474 1.06 1.06 1.06v-3.311a1.004 1.004 0 0 1 2.012 0v2.251c0 .586.475 1.06 1.06 1.06zM16.265 12a2.728 2.728 0 1 1-5.457 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0zm-4.82 0a2.728 2.728 0 1 1-5.458 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0z" />
    </svg>
  );
}

export function WorkflowDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const drawConnections = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const cRect = container.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${cRect.width} ${cRect.height}`);
    // Clear previous paths
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    function getCenter(id: string) {
      const el = document.getElementById(id);
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - cRect.left,
        y: r.top + r.height / 2 - cRect.top,
      };
    }

    function getEdge(id: string, side: "left" | "right") {
      const el = document.getElementById(id);
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return {
        x: side === "right" ? r.right - cRect.left : r.left - cRect.left,
        y: r.top + r.height / 2 - cRect.top,
      };
    }

    // Gray curve: pill (meet center) → vexa
    const meetCenter = getCenter("node-meet");
    const pillRight = getEdge("node-meet", "right");
    const vexaCenter = getCenter("node-vexa");
    const vexaL = getEdge("node-vexa", "left");

    const grayLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    const gx1 = pillRight.x + 4;
    const gy1 = meetCenter.y;
    const gx2 = vexaL.x - 4;
    const gy2 = vexaCenter.y;
    grayLine.setAttribute(
      "d",
      `M${gx1},${gy1} C${gx1 + 30},${gy1} ${gx2 - 30},${gy2} ${gx2},${gy2}`
    );
    grayLine.setAttribute("fill", "none");
    grayLine.setAttribute("stroke", "#d1d5db");
    grayLine.setAttribute("stroke-width", "2");
    svg.appendChild(grayLine);

    // Colorful curves: vexa → each output node
    const targets = [
      { id: "node-openai", color: "#3b82f6" },
      { id: "node-claude", color: "#ef4444" },
      { id: "node-n8n", color: "#f59e0b" },
      { id: "node-openclaw", color: "#14b8a6" },
    ];

    const vexaR = getEdge("node-vexa", "right");

    targets.forEach(({ id, color }) => {
      const to = getEdge(id, "left");
      const dx = Math.abs(to.x - vexaR.x);
      const cp1x = vexaR.x + dx * 0.4;
      const cp2x = to.x - dx * 0.4;
      const d = `M${vexaR.x},${vexaR.y} C${cp1x},${vexaR.y} ${cp2x},${to.y} ${to.x},${to.y}`;

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("opacity", "0.75");
      svg.appendChild(path);

      // Port dot at target end
      const dot = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      dot.setAttribute("cx", String(to.x));
      dot.setAttribute("cy", String(to.y));
      dot.setAttribute("r", "3");
      dot.setAttribute("fill", color);
      dot.setAttribute("opacity", "0.6");
      svg.appendChild(dot);
    });
  }, []);

  useEffect(() => {
    drawConnections();
    // Small delay for layout to settle
    const t = setTimeout(drawConnections, 100);
    window.addEventListener("resize", drawConnections);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", drawConnections);
    };
  }, [drawConnections]);

  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white px-8 py-10 lg:px-12 lg:py-12"
      style={{
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left: diagram (desktop) */}
        <div
          ref={containerRef}
          className="relative hidden lg:block"
          style={{ height: 360 }}
        >
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          />

          {/* Left pill: meeting platforms */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2"
            style={{ zIndex: 1 }}
          >
            <div className="flex flex-col items-center">
              <div
                className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div
                  id="node-teams"
                  className="w-[56px] h-[56px] flex items-center justify-center border-b border-gray-100"
                >
                  <Image
                    src="/microsoft-teams-logo.png"
                    alt="Teams"
                    width={28}
                    height={28}
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div
                  id="node-meet"
                  className="w-[56px] h-[56px] flex items-center justify-center border-b border-gray-100"
                >
                  <Image
                    src="/google-meet-logo.png"
                    alt="Meet"
                    width={28}
                    height={28}
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div
                  id="node-zoom"
                  className="w-[56px] h-[56px] flex items-center justify-center"
                >
                  <ZoomIcon />
                </div>
              </div>
              <span className="text-[10px] text-gray-400 mt-1.5">
                Meetings
              </span>
            </div>
          </div>

          {/* Center: Vexa hub */}
          <div
            className="absolute"
            style={{
              left: "38%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
          >
            <div className="flex flex-col items-center">
              <div
                id="node-vexa"
                className="w-[76px] h-[76px] rounded-2xl border border-gray-200 bg-white flex items-center justify-center"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
              >
                <Image
                  src="/logodark.svg"
                  alt="Vexa"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-[8px]"
                />
              </div>
              <span className="text-[11px] font-medium text-gray-500 mt-1.5">
                Vexa API
              </span>
            </div>
          </div>

          {/* Right: output nodes */}
          <div
            className="absolute flex flex-col items-center gap-5"
            style={{
              right: 30,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
            }}
          >
            <div className="flex flex-col items-center">
              <div
                id="node-openai"
                className="w-[48px] h-[48px] rounded-xl border border-gray-200 bg-white flex items-center justify-center"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <OpenAIIcon />
              </div>
              <span className="text-[10px] text-gray-400 mt-1">OpenAI</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                id="node-claude"
                className="w-[48px] h-[48px] rounded-xl border border-gray-200 bg-white flex items-center justify-center"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <ClaudeIcon />
              </div>
              <span className="text-[10px] text-gray-400 mt-1">Claude</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                id="node-n8n"
                className="w-[48px] h-[48px] rounded-xl border border-gray-200 bg-white flex items-center justify-center"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <N8nIcon />
              </div>
              <span className="text-[10px] text-gray-400 mt-1">n8n</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                id="node-openclaw"
                className="w-[48px] h-[48px] rounded-xl border border-gray-200 bg-white flex items-center justify-center"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <OpenClawIcon />
              </div>
              <span className="text-[10px] text-gray-400 mt-1">OpenClaw</span>
            </div>
          </div>
        </div>

        {/* Mobile: simplified vertical flow */}
        <div className="lg:hidden flex flex-col items-center gap-4 py-8">
          <div className="flex items-center gap-3">
            <div className="wf-node">
              <Image
                src="/microsoft-teams-logo.png"
                alt="Teams"
                width={28}
                height={28}
              />
            </div>
            <div className="wf-node">
              <Image
                src="/google-meet-logo.png"
                alt="Meet"
                width={28}
                height={28}
              />
            </div>
            <div className="wf-node">
              <ZoomIcon />
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          <div className="wf-node wf-node-primary">
            <Image
              src="/logodark.svg"
              alt="Vexa"
              width={32}
              height={32}
              className="rounded-[5px]"
            />
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          <div className="flex items-center gap-3">
            <div className="wf-node wf-node-sm">
              <OpenAIIcon />
            </div>
            <div className="wf-node wf-node-sm">
              <ClaudeIcon />
            </div>
            <div className="wf-node wf-node-sm">
              <N8nIcon />
            </div>
            <div className="wf-node wf-node-sm">
              <OpenClawIcon />
            </div>
          </div>
        </div>

        {/* Right: text content */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7280"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
            <span className="text-[13px] text-gray-400 font-medium">
              Meeting-Defined Infrastructure
            </span>
          </div>
          <h2 className="text-[28px] sm:text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-gray-950 mb-3">
            From meeting URL to intelligence in one API call.
          </h2>
          <p className="text-[16px] text-gray-400 leading-[1.7]">
            Vexa connects to any meeting platform and routes transcripts,
            recordings, and live audio to your AI stack. Open source,
            self-hostable, and built for developers who need full control.
          </p>
        </div>
      </div>
    </div>
  );
}

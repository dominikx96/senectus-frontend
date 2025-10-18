"use client";

import Script from "next/script";

export function ElevenLabsWidget() {
  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: '<elevenlabs-convai agent-id="agent_9601k7vd7n5sej8rmxgjf1rk91fc"></elevenlabs-convai>',
        }}
      />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
    </>
  );
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mic, Square } from "lucide-react";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured } from "@/components/moa/Status";
import { Orb } from "@/components/moa/Orb";
import { Button } from "@/components/ui/button";
import { useMoa } from "@/lib/moa/store";
import type { OrbState } from "@/lib/moa/types";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Voice — MOA" },
      { name: "description", content: "Speech-to-text and text-to-speech states for MOA voice interaction." },
      { property: "og:title", content: "Voice — MOA" },
      { property: "og:description", content: "MOA's voice skill and its states." },
    ],
  }),
  component: VoicePage,
});

const STATES: OrbState[] = ["idle", "listening", "thinking", "speaking", "error", "offline"];

function VoicePage() {
  const { setOrbState } = useMoa();
  const [preview, setPreview] = useState<OrbState>("idle");

  return (
    <div>
      <PageHeader
        title="Voice"
        status="NOT CONFIGURED"
        description="Microphone capture and speech synthesis need real providers. State machine and controls are built."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="moa-panel flex flex-col items-center gap-4 p-6">
          <Orb size="lg" state={preview} />
          <div className="flex flex-wrap justify-center gap-2">
            {STATES.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={preview === s ? "default" : "secondary"}
                onClick={() => {
                  setPreview(s);
                  setOrbState(s);
                }}
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button className="gap-2" disabled>
              <Mic className="size-4" /> Start listening
            </Button>
            <Button variant="secondary" className="gap-2" disabled>
              <Square className="size-4" /> Stop
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Controls are disabled until microphone permission and a speech provider exist.
          </p>
        </section>
        <NotConfigured
          title="Speech providers"
          requires={["Speech-to-text provider", "Text-to-speech provider", "Microphone permission"]}
          description="MOA will not simulate transcription or spoken replies."
        />
      </div>
    </div>
  );
}

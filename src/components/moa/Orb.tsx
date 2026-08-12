import { cn } from "@/lib/utils";
import type { OrbState } from "@/lib/moa/types";
import { useMoa } from "@/lib/moa/store";

const SIZES = { sm: 36, md: 64, lg: 132, xl: 188 } as const;

const stateAnimation: Record<OrbState, string> = {
  idle: "animate-[moa-breathe_6s_ease-in-out_infinite]",
  listening: "animate-[moa-breathe_1.6s_ease-in-out_infinite]",
  thinking: "animate-[moa-spin-slow_7s_linear_infinite]",
  speaking: "animate-[moa-breathe_1s_ease-in-out_infinite]",
  error: "animate-[moa-jitter_0.4s_ease-in-out_infinite]",
  offline: "",
};

export const ORB_STATE_LABEL: Record<OrbState, string> = {
  idle: "Idle",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  error: "Error",
  offline: "Offline",
};

export function Orb({
  size = "lg",
  state,
  className,
}: {
  size?: keyof typeof SIZES;
  state?: OrbState;
  className?: string;
}) {
  const { state: moa, orbState, online } = useMoa();
  const resolved: OrbState = state ?? (!online ? "offline" : orbState);
  const px = SIZES[size];
  const { identity, appearance } = moa;
  const radius =
    identity.shape === "circle" ? "9999px" : identity.shape === "squircle" ? "28%" : "12px";
  const animate = appearance.animations && !appearance.reducedMotion;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: px, height: px }}
      role="img"
      aria-label={`MOA avatar, state: ${ORB_STATE_LABEL[resolved]}`}
    >
      {animate && (resolved === "listening" || resolved === "speaking") && (
        <span
          aria-hidden
          className="absolute inset-0 animate-[moa-pulse-ring_1.8s_ease-out_infinite] border border-primary/50"
          style={{ borderRadius: radius }}
        />
      )}
      <div
        className={cn(
          "relative h-full w-full overflow-hidden border border-border/60",
          appearance.glow && resolved !== "offline" && "moa-glow",
          animate && stateAnimation[resolved],
        )}
        style={{
          borderRadius: radius,
          background: identity.mode === "picture" ? undefined : "var(--gradient-orb)",
          filter: resolved === "offline" ? "grayscale(1) brightness(0.6)" : undefined,
        }}
      >
        {identity.mode === "picture" && identity.pictureUrl ? (
          <img
            src={identity.pictureUrl}
            alt="MOA"
            className="h-full w-full object-cover"
            style={{
              transform: `scale(${identity.zoom})`,
              objectPosition: `${50 + identity.offsetX}% ${50 + identity.offsetY}%`,
            }}
          />
        ) : (
          <>
            <span
              aria-hidden
              className="absolute inset-0 opacity-70 mix-blend-screen"
              style={{
                background:
                  "conic-gradient(from 210deg, transparent, color-mix(in oklab, var(--color-primary) 45%, transparent), transparent 65%)",
              }}
            />
            <span
              aria-hidden
              className="absolute left-[18%] top-[14%] h-[22%] w-[30%] rounded-full bg-background/40 blur-md"
            />
          </>
        )}
        {resolved === "thinking" && animate && identity.mode !== "picture" && (
          <span
            aria-hidden
            className="absolute inset-[14%] rounded-full border border-dashed border-primary-foreground/40"
          />
        )}
      </div>
    </div>
  );
}

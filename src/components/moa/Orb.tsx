import { useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { OrbState } from "@/lib/moa/types";
import { useMoa } from "@/lib/moa/store";

const SIZES = { xs: 28, sm: 36, md: 64, lg: 132, xl: 188 } as const;

const stateAnimation: Record<OrbState, string> = {
  dormant: "",
  idle: "animate-[moa-breathe_6s_ease-in-out_infinite]",
  listening: "animate-[moa-breathe_1.6s_ease-in-out_infinite]",
  thinking: "animate-[moa-spin-slow_7s_linear_infinite]",
  speaking: "animate-[moa-breathe_1s_ease-in-out_infinite]",
  error: "animate-[moa-jitter_0.4s_ease-in-out_infinite]",
  offline: "",
};

export const ORB_STATE_LABEL: Record<OrbState, string> = {
  dormant: "Dormant",
  idle: "Active",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  error: "Error",
  offline: "Offline",
};

/**
 * Organic aura. Several independently-timed blurred fields drift, rotate and
 * breathe at non-harmonic durations, so the composite motion never visibly
 * repeats. It is a sibling layer behind the orb and never covers the face.
 */
function Aura({
  phase,
  radius,
  intensity,
}: {
  phase: "dormant" | "emerging" | "active" | "absorbing";
  radius: string;
  intensity: number;
}) {
  const visible = phase === "emerging" || phase === "active";
  const layers = [
    { inset: "-42%", dur: "13s", rev: false, blur: "18px", op: 0.55 },
    { inset: "-30%", dur: "9.5s", rev: true, blur: "12px", op: 0.5 },
    { inset: "-58%", dur: "21s", rev: false, blur: "26px", op: 0.35 },
  ];
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 transition-all duration-700 ease-out",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{ transform: visible ? "scale(1)" : "scale(0.55)", ["--moa-aura" as string]: intensity }}
    >
      {layers.map((l, i) => (
        <span
          key={i}
          className="absolute"
          style={
            {
              inset: l.inset,
              borderRadius: radius,
              filter: `blur(${l.blur})`,
              opacity: l.op * intensity,
              background:
                i % 2 === 0
                  ? "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--color-primary) 55%, transparent) 70deg, transparent 150deg, color-mix(in oklab, var(--color-info) 45%, transparent) 240deg, transparent 330deg)"
                  : "radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 40%, transparent), transparent 72%)",
              animation: `moa-aura-drift ${l.dur} ${l.rev ? "reverse" : "normal"} cubic-bezier(.42,0,.58,1) infinite`,
            } as CSSProperties
          }
        />
      ))}
      <span
        className="absolute"
        style={{
          inset: "-16%",
          borderRadius: radius,
          border: "1px solid color-mix(in oklab, var(--color-primary) 35%, transparent)",
          animation: "moa-aura-wave 4.7s ease-out infinite",
        }}
      />
      <span
        className="absolute"
        style={{
          inset: "-16%",
          borderRadius: radius,
          border: "1px solid color-mix(in oklab, var(--color-primary) 22%, transparent)",
          animation: "moa-aura-wave 6.3s 1.4s ease-out infinite",
        }}
      />
    </div>
  );
}

export function Orb({
  size = "lg",
  px,
  state,
  className,
  interactive = false,
  showAura = true,
}: {
  size?: keyof typeof SIZES;
  /** Explicit pixel size, overrides `size`. Useful for fluid hero scaling. */
  px?: number;
  state?: OrbState;
  className?: string;
  /** Enables double-tap activation / deactivation. */
  interactive?: boolean;
  showAura?: boolean;
}) {
  const { state: moa, orbState, online, active, phase, toggleActive } = useMoa();
  const tapRef = useRef<number>(0);

  const resolved: OrbState =
    state ?? (!online ? "offline" : !active ? "dormant" : orbState === "dormant" ? "idle" : orbState);
  const dimension = px ?? SIZES[size];
  const { identity, appearance } = moa;
  const radius =
    identity.shape === "circle" ? "9999px" : identity.shape === "squircle" ? "30%" : "14%";
  const animate = appearance.animations && !appearance.reducedMotion;
  const dormant = resolved === "dormant" || resolved === "offline";
  const hasPicture = identity.mode === "picture" && !!identity.pictureUrl;

  const onTap = () => {
    if (!interactive) return;
    const now = Date.now();
    if (now - tapRef.current < 320) {
      tapRef.current = 0;
      toggleActive();
    } else {
      tapRef.current = now;
    }
  };

  const Wrapper = interactive ? "button" : "div";

  return (
    <Wrapper
      {...(interactive
        ? {
            type: "button" as const,
            onClick: onTap,
            onDoubleClick: () => undefined,
            "aria-label": `MOA orb — ${ORB_STATE_LABEL[resolved]}. Double tap to ${
              active ? "deactivate" : "activate"
            }.`,
          }
        : { role: "img", "aria-label": `MOA avatar, state: ${ORB_STATE_LABEL[resolved]}` })}
      className={cn(
        "relative shrink-0 select-none",
        interactive && "cursor-pointer touch-manipulation rounded-full",
        className,
      )}
      style={{ width: dimension, height: dimension }}
    >
      {showAura && animate && (
        <Aura
          phase={dormant ? "dormant" : phase}
          radius={radius}
          intensity={resolved === "speaking" || resolved === "listening" ? 1.25 : 1}
        />
      )}

      {/* Orb shell — always present. The picture lives inside it, never over it. */}
      <div
        className={cn(
          "relative h-full w-full overflow-hidden border transition-all duration-700",
          dormant ? "border-border/50" : "border-primary/30",
          !dormant && appearance.glow && "moa-glow",
          animate && !dormant && stateAnimation[resolved],
        )}
        style={{
          borderRadius: radius,
          background: "var(--gradient-orb)",
          filter: dormant ? "saturate(0.3) brightness(0.6)" : undefined,
        }}
      >
        {hasPicture ? (
          <>
            {/* Contained image layer: inset inside the shell and clipped to it. */}
            <span
              className="absolute overflow-hidden"
              style={{ inset: "7%", borderRadius: radius }}
            >
              <img
                src={identity.pictureUrl!}
                alt=""
                className="h-full w-full object-cover"
                style={{
                  transform: `scale(${identity.zoom})`,
                  objectPosition: `${50 + identity.offsetX}% ${50 + identity.offsetY}%`,
                }}
              />
            </span>
            {/* Energy stays subtle over an avatar so the face is never hidden. */}
            <OrbEnergy seed={energySeed} energy={energy} animate={animate} subtle />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: radius,
                boxShadow:
                  "inset 0 0 0 1px color-mix(in oklab, var(--color-primary) 25%, transparent), inset 0 0 22px color-mix(in oklab, var(--color-background) 55%, transparent)",
              }}
            />
          </>
        ) : (
          <OrbEnergy seed={energySeed} energy={energy} animate={animate} />
        )}
      </div>
    </Wrapper>
  );
}

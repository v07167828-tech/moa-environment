import { useEffect } from "react";
import { useMoa } from "@/lib/moa/store";
import type { Appearance } from "@/lib/moa/types";

export function backgroundStyle(a: Appearance): React.CSSProperties {
  if (a.backgroundMode === "solid") return { background: a.solidColor };
  if (a.backgroundMode === "gradient")
    return { background: `linear-gradient(${a.gradientAngle}deg, ${a.gradientFrom}, ${a.gradientTo})` };
  return { background: a.solidColor };
}

/** Applies appearance settings to the document. Client-only side effects. */
export function AppearanceLayer() {
  const { state, hydrated } = useMoa();
  const a = state.appearance;

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const prefersLight =
      a.theme === "light" ||
      (a.theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: light)").matches);
    root.classList.toggle("light", prefersLight);
    root.classList.toggle("dark", !prefersLight);
    root.classList.toggle("moa-no-motion", a.reducedMotion || !a.animations);
    root.style.setProperty("--moa-surface-alpha", String(a.transparency / 100));
    root.style.setProperty("--moa-glow", a.glow ? "1" : "0");
    root.style.fontSize = `${a.fontSize}px`;
  }, [hydrated, a]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={backgroundStyle(a)} />
      {a.backgroundMode === "image" && a.imageUrl && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${a.imageUrl})`,
            backgroundSize: a.imageFit,
            backgroundPosition: `${a.imagePositionX}% ${a.imagePositionY}%`,
            backgroundRepeat: "no-repeat",
            opacity: a.imageOpacity,
            filter: a.imageBlur ? `blur(${a.imageBlur}px)` : undefined,
            transform: a.imageBlur ? "scale(1.06)" : undefined,
          }}
        />
      )}
      <div className="absolute inset-0 moa-grid-lines opacity-[0.35]" />
      <div
        className="absolute -left-40 top-[-10%] size-[520px] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-orb)" }}
      />
    </div>
  );
}

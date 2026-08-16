import { useCallback, useEffect, useRef, useState } from "react";
import { Orb } from "./Orb";

const SIZE = 56;
const MARGIN = 8;
/** Keeps the orb clear of the composer / bottom safe area. */
const BOTTOM_RESERVE = 190;
const TOP_RESERVE = 56;

/**
 * The shrunken conversation orb. It appears once the conversation has started,
 * stays visible for the whole chat and can be dragged anywhere inside a safe
 * band of the viewport — never over the composer.
 */
export function CompactOrb() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  const clamp = useCallback((x: number, y: number) => {
    const maxX = window.innerWidth - SIZE - MARGIN;
    const maxY = Math.max(TOP_RESERVE, window.innerHeight - BOTTOM_RESERVE);
    return {
      x: Math.min(Math.max(x, MARGIN), Math.max(MARGIN, maxX)),
      y: Math.min(Math.max(y, TOP_RESERVE), maxY),
    };
  }, []);

  useEffect(() => {
    setPos(clamp(window.innerWidth - SIZE - 16, TOP_RESERVE + 8));
    const onResize = () => setPos((p) => (p ? clamp(p.x, p.y) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!pos) return;
    moved.current = false;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    // Only hijack the pointer once it is an actual drag, so taps still reach
    // the orb (double-tap activation must keep working).
    if (!moved.current) {
      if (Math.abs(e.clientX - offset.current.x - pos!.x) < 4 && Math.abs(e.clientY - offset.current.y - pos!.y) < 4)
        return;
      moved.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setPos(clamp(e.clientX - offset.current.x, e.clientY - offset.current.y));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    if (moved.current) (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  };


  if (!pos) return null;

  return (
    <div
      className="fixed z-30 touch-none"
      style={{
        left: pos.x,
        top: pos.y,
        width: SIZE,
        height: SIZE,
        transition: dragging ? "none" : "left 200ms ease, top 200ms ease",
        cursor: dragging ? "grabbing" : "grab",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <Orb interactive px={SIZE} />
    </div>
  );
}

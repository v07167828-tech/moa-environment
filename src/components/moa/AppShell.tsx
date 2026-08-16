import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Brain,
  Code2,
  FolderOpen,
  Globe,
  Hammer,
  Hash,
  Image as ImageIcon,
  LayoutDashboard,
  Library,
  ListChecks,
  Mail,
  Map,
  Menu,
  MessageSquare,
  Mic,
  MonitorSmartphone,
  Palette,
  Radio,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  WifiOff,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMoa } from "@/lib/moa/store";
import { Orb, ORB_STATE_LABEL } from "./Orb";
import { AppearanceLayer } from "./AppearanceLayer";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const NAV: { group: string; items: { to: string; label: string; icon: typeof Brain }[] }[] = [
  {
    group: "Core",
    items: [
      { to: "/", label: "Home", icon: Sparkles },
      { to: "/chat", label: "Chats", icon: MessageSquare },
      { to: "/memory", label: "Memory", icon: Brain },
      { to: "/knowledge", label: "Knowledge", icon: Library },
      { to: "/files", label: "Files", icon: FolderOpen },
    ],
  },
  {
    group: "Work",
    items: [
      { to: "/planner", label: "Planner", icon: ListChecks },
      { to: "/builder", label: "Projects", icon: Hammer },
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Skills",
    items: [
      { to: "/skills", label: "All skills", icon: Sparkles },
      { to: "/web", label: "Web", icon: Globe },
      { to: "/maps", label: "Maps", icon: Map },
      { to: "/voice", label: "Voice", icon: Mic },
      { to: "/email", label: "Email", icon: Mail },
      { to: "/numbers", label: "Numbers", icon: Hash },
      { to: "/communications", label: "Communications", icon: Radio },
      { to: "/code", label: "Code", icon: Code2 },
    ],
  },
  {
    group: "Control",
    items: [
      { to: "/permissions", label: "Permissions", icon: ShieldCheck },
      { to: "/devices", label: "Devices", icon: MonitorSmartphone },
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/settings/identity", label: "Identity", icon: UserRound },
      { to: "/settings/appearance", label: "Appearance", icon: Palette },
      { to: "/settings/accounts", label: "Accounts", icon: ImageIcon },
    ],
  },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-5 pb-10" aria-label="MOA sections">
      {NAV.map((group) => (
        <div key={group.group}>
          <p className="mb-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {group.group}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  activeOptions={{ exact: item.to === "/" || item.to === "/settings" }}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
                  activeProps={{ className: "font-medium" }}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function StatusPill() {
  const { orbState, online, active } = useMoa();
  const label = !online ? "Offline" : !active ? "Dormant" : ORB_STATE_LABEL[orbState];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {!online ? (
        <WifiOff className="size-3" aria-hidden />
      ) : (
        <span
          className={cn("size-1.5 rounded-full", active ? "bg-primary" : "bg-muted-foreground/60")}
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}


export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { state } = useMoa();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Full-screen chat renders its own chrome.
  const bare = pathname.startsWith("/chat/full");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (bare) {
    return (
      <div className="relative min-h-[100dvh]">
        <AppearanceLayer />
        {children}
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh]">
      <AppearanceLayer />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl lg:flex">
        <Link to="/" className="flex items-center gap-3 px-5 py-5">
          <Orb size="sm" showAura={false} />
          <span className="font-display text-lg font-semibold tracking-tight">
            {state.identity.name}
          </span>
        </Link>
        <ScrollArea className="flex-1 px-2">
          <NavList />
        </ScrollArea>
        <div className="border-t border-sidebar-border p-3">
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent"
          >
            <span className="grid size-8 place-items-center rounded-full bg-muted text-xs font-medium">
              {state.user.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm">{state.user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {state.user.email}
              </span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/40 bg-background/50 px-3 py-2.5 backdrop-blur-xl sm:px-4 lg:pl-[17.5rem]">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <StatusPill />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications" asChild>
            <Link to="/dashboard">
              <Bell className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Settings" asChild>
            <Link to="/settings">
              <Settings className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[19rem] p-0">
          <SheetTitle className="flex items-center gap-3 px-5 py-4 text-base">
            <Orb size="sm" showAura={false} />
            {state.identity.name}
          </SheetTitle>
          <ScrollArea className="h-[calc(100dvh-4rem)] px-2">
            <NavList onNavigate={() => setOpen(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <main className="px-4 pb-10 pt-4 sm:px-6 lg:pl-[17.5rem] lg:pr-6">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

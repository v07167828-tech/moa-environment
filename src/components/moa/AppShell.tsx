import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Brain,
  Code2,
  FolderOpen,
  Globe,
  Hammer,
  Hash,
  LayoutDashboard,
  Library,
  ListChecks,
  Mail,
  Map,
  Menu,
  MessageSquare,
  Mic,
  MonitorSmartphone,
  Radio,
  Settings,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMoa } from "@/lib/moa/store";
import { Orb, ORB_STATE_LABEL } from "./Orb";
import { AppearanceLayer } from "./AppearanceLayer";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const NAV: { group: string; items: { to: string; label: string; icon: typeof Brain }[] }[] = [
  {
    group: "MOA",
    items: [
      { to: "/", label: "Home", icon: Sparkles },
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/chat", label: "Conversations", icon: MessageSquare },
    ],
  },
  {
    group: "Mind",
    items: [
      { to: "/memory", label: "Memory", icon: Brain },
      { to: "/knowledge", label: "Knowledge", icon: Library },
      { to: "/files", label: "Files", icon: FolderOpen },
      { to: "/planner", label: "Planner", icon: ListChecks },
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
    group: "Build",
    items: [{ to: "/builder", label: "Builder", icon: Hammer }],
  },
  {
    group: "Control",
    items: [
      { to: "/permissions", label: "Permissions", icon: ShieldCheck },
      { to: "/devices", label: "Devices", icon: MonitorSmartphone },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const MOBILE_TABS = [
  { to: "/", label: "MOA", icon: Sparkles },
  { to: "/chat", label: "Chats", icon: MessageSquare },
  { to: "/skills", label: "Skills", icon: LayoutDashboard },
  { to: "/builder", label: "Builder", icon: Hammer },
  { to: "/settings", label: "Settings", icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-5 pb-6" aria-label="MOA sections">
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
                  activeOptions={{ exact: item.to === "/" }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
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
  const { orbState, online } = useMoa();
  const label = online ? ORB_STATE_LABEL[orbState] : "Offline";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {online ? (
        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      ) : (
        <WifiOff className="size-3" aria-hidden />
      )}
      {label}
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { state } = useMoa();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen">
      <AppearanceLayer />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl lg:flex">
        <Link to="/" className="flex items-center gap-3 px-5 py-5">
          <Orb size="sm" />
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
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/60 bg-background/60 px-4 py-3 backdrop-blur-xl lg:pl-[17.5rem]">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="flex items-center gap-3 px-5 py-4 text-base">
                <Orb size="sm" />
                {state.identity.name}
              </SheetTitle>
              <ScrollArea className="h-[calc(100dvh-4rem)] px-2">
                <NavList onNavigate={() => setOpen(false)} />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="lg:hidden">
            <Orb size="sm" />
          </div>
          <StatusPill />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
            <Link to="/dashboard">
              <Bell className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Settings" asChild>
            <Link to="/settings">
              <Settings className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="px-4 pb-28 pt-5 sm:px-6 lg:pb-10 lg:pl-[17.5rem] lg:pr-6">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      {/* Mobile tab bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border/60 bg-background/85 backdrop-blur-xl lg:hidden"
      >
        {MOBILE_TABS.map((tab) => {
          const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <tab.icon className="size-5" aria-hidden />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

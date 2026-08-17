import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { PageHeader } from "@/components/moa/PageHeader";
import { ConversationItem } from "@/components/moa/ConversationItem";
import { useMoa, uid } from "@/lib/moa/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — MOA" },
      { name: "description", content: "Organise your MOA conversations into personal projects." },
      { property: "og:title", content: "Projects — MOA" },
      { property: "og:description", content: "Personal conversation projects in MOA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { state, update } = useMoa();
  const [name, setName] = useState("");
  const [openId, setOpenId] = useState<string | null>(state.chatProjects[0]?.id ?? null);

  const create = () => {
    if (!name.trim()) return;
    const id = uid("cp");
    update((s) => {
      s.chatProjects.unshift({
        id,
        name: name.trim(),
        description: "",
        colour: "#4cc9f0",
        instructions: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return s;
    });
    setName("");
    setOpenId(id);
  };

  const unassigned = state.conversations.filter((c) => !c.projectId && !c.archived);

  return (
    <div>
      <PageHeader
        title="Projects"
        status="IMPLEMENTED"
        description="Personal conversation projects. These are separate from Builder, which builds applications."
      />

      <div className="moa-panel mb-5 flex gap-2 p-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="New project name"
          aria-label="New project name"
        />
        <Button className="gap-2 shrink-0" onClick={create}>
          <Plus className="size-4" /> Create
        </Button>
      </div>

      <div className="space-y-4">
        {state.chatProjects.map((p) => {
          const chats = state.conversations.filter((c) => c.projectId === p.id);
          const open = openId === p.id;
          return (
            <section key={p.id} className="moa-panel p-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="flex min-w-0 items-center gap-2 text-left"
                  onClick={() => setOpenId(open ? null : p.id)}
                >
                  <FolderKanban className="size-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-base font-semibold">{p.name}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {chats.length} chat{chats.length === 1 ? "" : "s"}
                    </span>
                  </span>
                </button>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const next = window.prompt("Rename project", p.name);
                      if (next?.trim())
                        update((s) => {
                          const t = s.chatProjects.find((x) => x.id === p.id);
                          if (t) {
                            t.name = next.trim();
                            t.updatedAt = Date.now();
                          }
                          return s;
                        });
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() =>
                      update((s) => {
                        s.chatProjects = s.chatProjects.filter((x) => x.id !== p.id);
                        // Chats survive; they simply leave the project.
                        s.conversations.forEach((c) => {
                          if (c.projectId === p.id) c.projectId = null;
                        });
                        return s;
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {open && (
                <ul className="mt-3 space-y-1">
                  {chats.map((c) => (
                    <li key={c.id}>
                      <ConversationItem c={c} showProject={false} />
                    </li>
                  ))}
                  {chats.length === 0 && (
                    <li className="px-2 py-4 text-sm text-muted-foreground">
                      No chats yet. Use a conversation's menu to add it here.
                    </li>
                  )}
                </ul>
              )}
            </section>
          );
        })}

        <section className="moa-panel p-4">
          <h2 className="mb-2 font-display text-base font-semibold">Not in a project</h2>
          <ul className="space-y-1">
            {unassigned.map((c) => (
              <li key={c.id}>
                <ConversationItem c={c} showProject={false} />
              </li>
            ))}
            {unassigned.length === 0 && (
              <li className="px-2 py-4 text-sm text-muted-foreground">Every chat is filed.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, Film, Image as ImageIcon, Search, Trash2, Upload } from "lucide-react";
import { useMoa, uid } from "@/lib/moa/store";
import type { StoredFile } from "@/lib/moa/types";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured, StatusBadge } from "@/components/moa/Status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CapabilityStatus } from "@/lib/moa/types";

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "Files — MOA" },
      { name: "description", content: "Upload and manage the files MOA works with, with honest processing states." },
      { property: "og:title", content: "Files — MOA" },
      { property: "og:description", content: "Upload and manage files for MOA." },
    ],
  }),
  component: FilesPage,
});

const iconFor = (k: StoredFile["kind"]) =>
  k === "image" ? ImageIcon : k === "spreadsheet" ? FileSpreadsheet : k === "video" ? Film : FileText;

const statusMap: Record<StoredFile["status"], CapabilityStatus> = {
  uploading: "PROTOTYPE",
  processing: "PROTOTYPE",
  ready: "CONFIGURED",
  failed: "UNAVAILABLE",
  unavailable: "UNAVAILABLE",
};

function kindOf(name: string): StoredFile["kind"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["xls", "xlsx", "csv"].includes(ext)) return "spreadsheet";
  if (["mp4", "mov", "webm"].includes(ext)) return "video";
  if (["mp3", "wav", "m4a"].includes(ext)) return "audio";
  if (["doc", "docx", "txt", "md"].includes(ext)) return "document";
  return "other";
}

function FilesPage() {
  const { state, update } = useMoa();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const files = state.files.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const added = Array.from(list).map((f) => ({
      id: uid("f"),
      name: f.name,
      size: f.size,
      kind: kindOf(f.name),
      status: "uploading" as StoredFile["status"],
      addedAt: Date.now(),
      note: "Held in this browser only — no object storage connected.",
    }));
    update((s) => {
      s.files.unshift(...added);
      return s;
    });
    window.setTimeout(() => {
      update((s) => {
        s.files.forEach((f) => {
          if (added.some((a) => a.id === f.id)) {
            f.status = "unavailable";
            f.note = "Stored locally. Processing requires a document service.";
          }
        });
        return s;
      });
    }, 1400);
  };

  return (
    <div>
      <PageHeader
        title="Files"
        status="PROTOTYPE"
        description="Files you add stay in this browser. MOA will not claim to have read them."
        actions={
          <Button className="gap-2" onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" /> Upload
          </Button>
        }
      />
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => onFiles(e.target.files)}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div>
          <div
            className="moa-panel mb-4 flex flex-col items-center gap-2 border-dashed p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFiles(e.dataTransfer.files);
            }}
          >
            <Upload className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">Drop files here or use Upload</p>
          </div>

          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search files"
              aria-label="Search files"
              className="pl-9"
            />
          </div>

          <ul className="space-y-2">
            {files.map((f) => {
              const Icon = iconFor(f.kind);
              return (
                <li key={f.id} className="moa-panel moa-rise flex items-center gap-3 p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/60 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {(f.size / 1000).toFixed(0)} KB · {f.kind} · {f.note}
                    </p>
                  </div>
                  <StatusBadge status={statusMap[f.status]} />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${f.name}`}
                    onClick={() =>
                      update((s) => {
                        s.files = s.files.filter((x) => x.id !== f.id);
                        return s;
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
            {files.length === 0 && (
              <li className="moa-panel p-8 text-center text-sm text-muted-foreground">
                No files yet.
              </li>
            )}
          </ul>
        </div>

        <NotConfigured
          title="File processing"
          requires={["Object storage", "Document parser", "Vision model for images"]}
          description="Uploads are accepted and tracked, but MOA cannot extract or analyse contents in this environment."
        />
      </div>
    </div>
  );
}

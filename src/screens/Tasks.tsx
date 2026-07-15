/**
 * Kanban task board. Cards can be moved by hand (drag-and-drop), by clicking
 * "Sync with AI" (reviews recent captures against open cards), automatically
 * by the git-commit capture pipeline when a commit clearly advances a card,
 * or by an external tool/agent driving the `ghlg --ghlg-task` CLI — the
 * `source` badge on each card shows which of those last touched it.
 */
import { useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  listAllTasks,
  listTasks,
  moveTask,
  syncBoardWithAi,
  updateTask,
  type TaskCard,
  type TaskColumn,
  type TaskTag,
} from "../lib/tasks";

const COLUMNS: { key: TaskColumn; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "doing", label: "In Progress" },
  { key: "done", label: "Done" },
];

const TAG_STYLES: Record<TaskTag, string> = {
  bug: "bg-accent/15 text-accent border border-accent/40",
  task: "bg-panel-raised text-fg-muted border border-edge-strong",
  chore: "bg-panel-raised text-fg-muted border border-edge-strong",
  feature: "bg-transparent text-fg border border-fg-muted",
};

const SOURCE_LABELS: Record<TaskCard["source"], string> = {
  manual: "manual",
  ai: "AI",
  cli: "CLI",
};

export default function Tasks({ selectedProject }: { selectedProject: string }) {
  const [scope, setScope] = useState<"project" | "all">("project");
  const [cards, setCards] = useState<TaskCard[]>([]);
  const [projectByCard, setProjectByCard] = useState<Record<string, string>>({});
  const [newTitle, setNewTitle] = useState<Record<TaskColumn, string>>({ todo: "", doing: "", done: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ title: "", description: "", tag: "task" as TaskTag });
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (scope === "all") {
      const all = await listAllTasks();
      setCards(all.map(([, c]) => c));
      setProjectByCard(Object.fromEntries(all.map(([p, c]) => [c.id, p])));
    } else {
      const list = await listTasks(selectedProject);
      setCards(list);
      setProjectByCard({});
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, selectedProject]);

  function projectFor(card: TaskCard): string {
    return scope === "all" ? projectByCard[card.id] : selectedProject;
  }

  async function addCard(column: TaskColumn) {
    const title = newTitle[column].trim();
    if (!title) return;
    try {
      await createTask(selectedProject, { title, description: "", tag: "task", column });
      setNewTitle((prev) => ({ ...prev, [column]: "" }));
      refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleDrop(card: TaskCard, column: TaskColumn) {
    if (card.column === column) return;
    try {
      await moveTask(projectFor(card), card.id, column);
      refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  function startEditing(card: TaskCard) {
    setEditing(card.id);
    setEditFields({ title: card.title, description: card.description, tag: card.tag });
  }

  async function saveEditing(card: TaskCard) {
    try {
      await updateTask(projectFor(card), card.id, editFields);
      setEditing(null);
      refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  async function removeCard(card: TaskCard) {
    try {
      await deleteTask(projectFor(card), card.id);
      refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  async function runSync() {
    setSyncing(true);
    setError(null);
    try {
      await syncBoardWithAi(selectedProject);
      refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-panel border border-edge rounded-md p-1">
          <button
            onClick={() => setScope("project")}
            className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
              scope === "project" ? "bg-accent text-white" : "text-fg-muted hover:text-fg"
            }`}
          >
            This project
          </button>
          <button
            onClick={() => setScope("all")}
            className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
              scope === "all" ? "bg-accent text-white" : "text-fg-muted hover:text-fg"
            }`}
          >
            All projects
          </button>
        </div>
        {scope === "project" && (
          <button
            onClick={runSync}
            disabled={syncing}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-edge-strong text-fg-muted hover:text-fg hover:border-fg-muted transition-colors disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "Sync with AI"}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-accent">{error}</p>}

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.column === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/plain");
                const card = cards.find((c) => c.id === id);
                if (card) handleDrop(card, col.key);
              }}
              className="bg-panel border border-edge rounded-lg p-3 space-y-2 min-h-[200px]"
            >
              <p className="text-xs uppercase tracking-wide text-fg-muted px-1">
                {col.label} <span className="text-fg-faint">({colCards.length})</span>
              </p>

              {colCards.map((card) => (
                <div
                  key={card.id}
                  draggable={scope === "project"}
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", card.id)}
                  onClick={() => startEditing(card)}
                  className="bg-ink border border-edge-strong rounded-md p-3 space-y-2 cursor-pointer hover:border-fg-muted transition-colors"
                >
                  {editing === card.id ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        value={editFields.title}
                        onChange={(e) => setEditFields((f) => ({ ...f, title: e.target.value }))}
                        className="w-full bg-panel border border-edge rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                      />
                      <textarea
                        value={editFields.description}
                        onChange={(e) => setEditFields((f) => ({ ...f, description: e.target.value }))}
                        placeholder="description (optional)"
                        rows={2}
                        className="w-full bg-panel border border-edge rounded px-2 py-1 text-xs font-mono placeholder:text-fg-faint focus:outline-none focus:border-accent"
                      />
                      <select
                        value={editFields.tag}
                        onChange={(e) => setEditFields((f) => ({ ...f, tag: e.target.value as TaskTag }))}
                        className="w-full bg-panel border border-edge rounded px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="task">task</option>
                        <option value="bug">bug</option>
                        <option value="chore">chore</option>
                        <option value="feature">feature</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditing(card)}
                          className="text-xs bg-accent hover:bg-accent-dim text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-xs text-fg-muted hover:text-fg px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => removeCard(card)}
                          className="text-xs text-accent hover:text-accent-dim px-2 py-1 ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium">{card.title}</p>
                      {card.description && (
                        <p className="text-xs text-fg-muted line-clamp-2">{card.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide ${TAG_STYLES[card.tag]}`}
                        >
                          {card.tag}
                        </span>
                        {scope === "all" && (
                          <span className="text-[10px] text-fg-faint">{projectByCard[card.id]}</span>
                        )}
                        <span className="text-[10px] text-fg-faint ml-auto">
                          {SOURCE_LABELS[card.source]}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {scope === "project" && (
                <div className="flex gap-2 pt-1">
                  <input
                    value={newTitle[col.key]}
                    onChange={(e) => setNewTitle((prev) => ({ ...prev, [col.key]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addCard(col.key)}
                    placeholder="+ Add card"
                    className="flex-1 bg-transparent border border-dashed border-edge-strong rounded px-2 py-1.5 text-xs placeholder:text-fg-faint focus:outline-none focus:border-accent"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

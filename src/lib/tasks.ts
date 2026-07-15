/**
 * tasks.ts — Kanban task board read/write. Data lives at
 *   <data-root>/<project-name>/tasks.json
 * All filesystem access goes through Tauri commands (Rust side).
 */
import { invoke } from "@tauri-apps/api/core";

export type TaskTag = "task" | "bug" | "chore" | "feature";
export type TaskColumn = "todo" | "doing" | "done";
export type TaskSource = "manual" | "ai" | "cli";

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  tag: TaskTag;
  column: TaskColumn;
  source: TaskSource;
  createdAt: string;
  updatedAt: string;
}

/** Cards for one project. */
export async function listTasks(project: string): Promise<TaskCard[]> {
  return invoke("list_tasks", { project });
}

/** Every project's cards, paired with the project name — for the "All projects" view. */
export async function listAllTasks(): Promise<[string, TaskCard][]> {
  return invoke("list_all_tasks");
}

export async function createTask(
  project: string,
  fields: { title: string; description: string; tag: TaskTag; column: TaskColumn },
): Promise<TaskCard> {
  return invoke("create_task", { project, ...fields });
}

export async function moveTask(project: string, id: string, column: TaskColumn): Promise<void> {
  await invoke("move_task", { project, id, column });
}

export async function updateTask(
  project: string,
  id: string,
  fields: { title: string; description: string; tag: TaskTag },
): Promise<void> {
  await invoke("update_task", { project, id, ...fields });
}

export async function deleteTask(project: string, id: string): Promise<void> {
  await invoke("delete_task", { project, id });
}

/** Reviews recent captures against open cards and auto-moves clear matches. Returns count moved. */
export async function syncBoardWithAi(project: string): Promise<number> {
  return invoke("sync_board_with_ai", { project });
}

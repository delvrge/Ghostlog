//! Kanban task board — plain filesystem, no database, same conventions as
//! storage.rs. One `tasks.json` per project, holding the full `Vec<TaskCard>`
//! for that project (read-modify-write on every mutation — fine at this
//! scale, single user, low contention).

use crate::storage;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskCard {
    pub id: String,
    pub title: String,
    pub description: String,
    pub tag: String,    // "task" | "bug" | "chore" | "feature"
    pub column: String, // "todo" | "doing" | "done"
    pub source: String, // "manual" | "ai" | "cli" — who created/last moved it
    pub created_at: String,
    pub updated_at: String,
}

fn project_root(project: &str) -> Result<PathBuf, String> {
    Ok(storage::data_root()?.join(project))
}

fn tasks_path(project: &str) -> Result<PathBuf, String> {
    Ok(project_root(project)?.join("tasks.json"))
}

fn now() -> String {
    chrono::Utc::now().to_rfc3339()
}

fn new_id() -> String {
    format!("task-{}", chrono::Utc::now().timestamp_millis())
}

pub fn list_tasks(project: &str) -> Result<Vec<TaskCard>, String> {
    let path = tasks_path(project)?;
    if !path.is_file() {
        return Ok(vec![]);
    }
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

fn write_tasks(project: &str, cards: &[TaskCard]) -> Result<(), String> {
    let root = project_root(project)?;
    fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    let raw = serde_json::to_string_pretty(cards).map_err(|e| e.to_string())?;
    fs::write(tasks_path(project)?, raw).map_err(|e| e.to_string())
}

pub fn create_task(
    project: &str,
    title: &str,
    description: &str,
    tag: &str,
    column: &str,
    source: &str,
) -> Result<TaskCard, String> {
    let mut cards = list_tasks(project)?;
    let timestamp = now();
    let card = TaskCard {
        id: new_id(),
        title: title.to_string(),
        description: description.to_string(),
        tag: tag.to_string(),
        column: column.to_string(),
        source: source.to_string(),
        created_at: timestamp.clone(),
        updated_at: timestamp,
    };
    cards.push(card.clone());
    write_tasks(project, &cards)?;
    Ok(card)
}

pub fn move_task(project: &str, id: &str, column: &str, source: &str) -> Result<(), String> {
    let mut cards = list_tasks(project)?;
    let card = cards
        .iter_mut()
        .find(|c| c.id == id)
        .ok_or_else(|| format!("No task with id {id}"))?;
    card.column = column.to_string();
    card.source = source.to_string();
    card.updated_at = now();
    write_tasks(project, &cards)
}

pub fn update_task(
    project: &str,
    id: &str,
    title: &str,
    description: &str,
    tag: &str,
) -> Result<(), String> {
    let mut cards = list_tasks(project)?;
    let card = cards
        .iter_mut()
        .find(|c| c.id == id)
        .ok_or_else(|| format!("No task with id {id}"))?;
    card.title = title.to_string();
    card.description = description.to_string();
    card.tag = tag.to_string();
    card.updated_at = now();
    write_tasks(project, &cards)
}

pub fn delete_task(project: &str, id: &str) -> Result<(), String> {
    let mut cards = list_tasks(project)?;
    cards.retain(|c| c.id != id);
    write_tasks(project, &cards)
}

/// Every project that has ever had a task board, paired with its cards —
/// backs the "All projects" board view.
pub fn list_all_tasks() -> Result<Vec<(String, TaskCard)>, String> {
    let root = storage::data_root()?;
    if !root.is_dir() {
        return Ok(vec![]);
    }
    let mut all = vec![];
    for entry in fs::read_dir(&root).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        if !entry.path().is_dir() {
            continue;
        }
        let project = entry.file_name().to_string_lossy().to_string();
        for card in list_tasks(&project)? {
            all.push((project.clone(), card));
        }
    }
    Ok(all)
}

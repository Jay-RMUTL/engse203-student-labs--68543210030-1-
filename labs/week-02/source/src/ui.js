import { getStatusLabel } from "./utils.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export function setMessage(element, type, text) {
  element.className = "message";
  element.textContent = text;

  if (type) {
    element.classList.add(type);
  }

  element.setAttribute("role", type === "error" ? "alert" : "status");
}

export function renderStats(element, stats) {
  const cards = [
    { label: "Total tasks", value: stats.total },
    { label: "To do", value: stats.todo },
    { label: "In progress", value: stats.doing },
    { label: "Done", value: stats.done },
  ];

  element.innerHTML = cards
    .map(
      ({ label, value }) => `
        <article class="stat-card">
          <p>${label}</p>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");
}

export function renderTasks(element, tasks) {
  if (tasks.length === 0) {
    element.innerHTML = `
      <div class="empty-state">
        <h2>No learning tasks found</h2>
        <p>Try another search term or status filter.</p>
      </div>
    `;
    return;
  }

  element.innerHTML = tasks
    .map(
      (task) => `
        <article class="task-card">
          <div class="task-meta">
            <span class="badge">Week ${escapeHtml(task.week)}</span>
            <span class="badge">${escapeHtml(getStatusLabel(task.status))}</span>
          </div>
          <h2>${escapeHtml(task.title)}</h2>
          <p>${escapeHtml(task.topic)}</p>
          <div class="tags">
            ${(task.tags ?? [])
              .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

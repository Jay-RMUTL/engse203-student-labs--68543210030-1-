const STATUS_LABELS = {
  todo: "To do",
  doing: "In progress",
  done: "Done",
};

export function getStatusLabel(status) {
  return STATUS_LABELS[status] ?? "Unknown";
}

export const filterTasks = (tasks, { query = "", status = "all" } = {}) => {
  const normalizedQuery = query.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesStatus = status === "all" || task.status === status;
    const searchableText = [
      task.title,
      task.topic,
      ...(task.tags ?? []),
      `week ${task.week}`,
    ]
      .join(" ")
      .toLowerCase();

    return matchesStatus && searchableText.includes(normalizedQuery);
  });
};

export function getStats(tasks) {
  return {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === "todo").length,
    doing: tasks.filter((task) => task.status === "doing").length,
    done: tasks.filter((task) => task.status === "done").length,
  };
}

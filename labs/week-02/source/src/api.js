// Load learning tasks from the public JSON file.
export async function fetchLearningTasks({ simulateError = false } = {}) {
  if (simulateError) {
    throw new Error("Simulated error: unable to load learning tasks.");
  }

  const url = `${import.meta.env.BASE_URL}data/learning-tasks.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load learning tasks (HTTP ${response.status}).`);
  }

  const tasks = await response.json();

  if (!Array.isArray(tasks)) {
    throw new Error("Invalid data: expected an array of learning tasks.");
  }

  return tasks;
}

import "./style.css";
import { fetchLearningTasks } from "./api.js";
import { filterTasks, getStats } from "./utils.js";
import { renderStats, renderTasks, setMessage } from "./ui.js";

const messageElement = document.querySelector("#app-message");
const statsElement = document.querySelector("#stats");
const taskListElement = document.querySelector("#task-list");
const searchInput = document.querySelector("#search");
const statusFilter = document.querySelector("#status-filter");

let allTasks = [];

function renderDashboard() {
  const visibleTasks = filterTasks(allTasks, {
    query: searchInput.value,
    status: statusFilter.value,
  });

  renderStats(statsElement, getStats(allTasks));
  renderTasks(taskListElement, visibleTasks);
}

async function loadDashboard() {
  const simulateError =
    new URLSearchParams(window.location.search).get("simulateError") === "1";

  searchInput.disabled = true;
  statusFilter.disabled = true;
  setMessage(messageElement, "loading", "Loading learning tasks...");

  try {
    allTasks = await fetchLearningTasks({ simulateError });
    renderDashboard();
    setMessage(messageElement, "success", `Loaded ${allTasks.length} learning tasks.`);
  } catch (error) {
    allTasks = [];
    statsElement.replaceChildren();
    taskListElement.replaceChildren();

    setMessage(
      messageElement,
      "error",
      `Unable to load learning tasks: ${error.message}`,
    );
  } finally {
    searchInput.disabled = false;
    statusFilter.disabled = false;
  }
}

searchInput.addEventListener("input", renderDashboard);
statusFilter.addEventListener("change", renderDashboard);

loadDashboard();

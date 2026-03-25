const userId = "demo-user";

const state = {
  dashboard: null,
  user: null,
  aiStatus: null
};

const els = {
  heroUser: document.querySelector("#hero-user"),
  heroFocus: document.querySelector("#hero-focus"),
  heroAiStatus: document.querySelector("#hero-ai-status"),
  totalSpent: document.querySelector("#total-spent"),
  budgetUsage: document.querySelector("#budget-usage"),
  topTask: document.querySelector("#top-task"),
  topTaskReason: document.querySelector("#top-task-reason"),
  latestMood: document.querySelector("#latest-mood"),
  latestMoodAdvice: document.querySelector("#latest-mood-advice"),
  taskPlan: document.querySelector("#task-plan"),
  expenseSummary: document.querySelector("#expense-summary"),
  localRecommendations: document.querySelector("#local-recommendations"),
  moodResult: document.querySelector("#mood-result"),
  profileStatus: document.querySelector("#profile-status"),
  profileForm: document.querySelector("#profile-form"),
  taskForm: document.querySelector("#task-form"),
  expenseForm: document.querySelector("#expense-form"),
  moodForm: document.querySelector("#mood-form"),
  refreshButton: document.querySelector("#refresh-dashboard"),
  itemTemplate: document.querySelector("#item-template")
};

function currency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "CNY", maximumFractionDigits: 2 }).format(value);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

function renderCards(container, items, mapper) {
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("article");
    empty.className = "list-card";
    empty.innerHTML = "<div class='list-card-title'>Nothing here yet</div><p class='list-card-copy'>Start adding data and LifePilot will generate suggestions.</p>";
    container.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const node = els.itemTemplate.content.firstElementChild.cloneNode(true);
    const { title, meta, copy } = mapper(item);
    node.querySelector(".list-card-title").textContent = title;
    node.querySelector(".list-card-meta").textContent = meta;
    node.querySelector(".list-card-copy").textContent = copy;
    container.appendChild(node);
  });
}

function renderAiStatus(status) {
  state.aiStatus = status;
  els.heroAiStatus.textContent = `AI provider: ${status.activeProvider} (${status.mode})`;
}

function fillProfile(user) {
  state.user = user;
  els.profileForm.elements.nickname.value = user.nickname;
  els.profileForm.elements.city.value = user.city;
  els.profileForm.elements.monthlyBudget.value = String(user.monthlyBudget);
  els.profileForm.elements.preferredFocusWindow.value = user.preferredFocusWindow;
  els.profileForm.elements.wakeTime.value = user.wakeTime;
  els.profileForm.elements.sleepTime.value = user.sleepTime;
  els.profileForm.elements.habits.value = user.habits.join(", ");
}

function renderDashboard(dashboard) {
  state.dashboard = dashboard;
  fillProfile(dashboard.user);

  els.heroUser.textContent = dashboard.user.nickname;
  els.heroFocus.textContent = dashboard.dailyFocus;
  els.totalSpent.textContent = currency(dashboard.expenseSummary.totalSpent);
  els.budgetUsage.textContent = `${dashboard.expenseSummary.budgetUsageRate}% of monthly budget used`;

  const topTask = dashboard.plannedTasks[0];
  els.topTask.textContent = topTask ? topTask.title : "No pending tasks";
  els.topTaskReason.textContent = topTask ? topTask.reason : "You can use this time to reset your routine.";

  els.latestMood.textContent = dashboard.latestMood ? dashboard.latestMood.emotion : "No check-in yet";
  els.latestMoodAdvice.textContent = dashboard.latestMood
    ? dashboard.latestMood.advice[0]
    : "Share how you're feeling to unlock guidance.";

  renderCards(els.taskPlan, dashboard.plannedTasks, (task) => ({
    title: task.title,
    meta: `${task.recommendedSlot} · ${task.priority} priority · ${task.estimatedMinutes} min`,
    copy: task.reason
  }));

  const expenseCards = [
    ...dashboard.expenseSummary.topCategories.map((item) => ({
      title: item.category,
      meta: "Top spending category",
      copy: `${currency(item.total)} logged in this category.`
    })),
    ...dashboard.expenseSummary.savingsTips.map((tip, index) => ({
      title: `Suggestion ${index + 1}`,
      meta: "Saving idea",
      copy: tip
    }))
  ];

  renderCards(els.expenseSummary, expenseCards, (item) => item);

  renderCards(els.localRecommendations, dashboard.recommendations, (item) => ({
    title: item.title,
    meta: `${item.category} · ${item.budgetLabel}`,
    copy: `${item.subtitle}. ${item.reason}`
  }));
}

async function loadAiStatus() {
  const status = await api("/api/ai/status");
  renderAiStatus(status);
}

async function loadDashboard() {
  const dashboard = await api(`/api/dashboard/${userId}`);
  renderDashboard(dashboard);
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.profileForm);
  const habits = String(formData.get("habits") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await api(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({
      nickname: formData.get("nickname"),
      city: formData.get("city"),
      monthlyBudget: Number(formData.get("monthlyBudget")),
      preferredFocusWindow: formData.get("preferredFocusWindow"),
      wakeTime: formData.get("wakeTime"),
      sleepTime: formData.get("sleepTime"),
      habits
    })
  });

  els.profileStatus.textContent = "Profile saved. Your dashboard has been refreshed.";
  await loadDashboard();
}

async function handleTaskSubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.taskForm);

  await api("/api/tasks", {
    method: "POST",
    body: JSON.stringify({
      userId,
      title: formData.get("title"),
      priority: formData.get("priority"),
      estimatedMinutes: Number(formData.get("estimatedMinutes"))
    })
  });

  els.taskForm.reset();
  els.taskForm.querySelector("select").value = "medium";
  els.taskForm.querySelector("input[name='estimatedMinutes']").value = "30";
  await loadDashboard();
}

async function handleExpenseSubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.expenseForm);

  await api("/api/expenses", {
    method: "POST",
    body: JSON.stringify({
      userId,
      amount: Number(formData.get("amount")),
      category: formData.get("category"),
      note: formData.get("note")
    })
  });

  els.expenseForm.reset();
  await loadDashboard();
}

async function handleMoodSubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.moodForm);

  const result = await api("/api/moods/analyze", {
    method: "POST",
    body: JSON.stringify({
      userId,
      message: formData.get("message")
    })
  });

  els.moodResult.classList.remove("hidden");
  els.moodResult.innerHTML = `
    <strong>${result.emotion}</strong>
    <p>Confidence: ${Math.round(result.score * 100)}%</p>
    <p>${result.advice.join(" ")}</p>
  `;

  els.moodForm.reset();
  await loadDashboard();
}

async function bootstrap() {
  els.profileForm.addEventListener("submit", handleProfileSubmit);
  els.taskForm.addEventListener("submit", handleTaskSubmit);
  els.expenseForm.addEventListener("submit", handleExpenseSubmit);
  els.moodForm.addEventListener("submit", handleMoodSubmit);
  els.refreshButton.addEventListener("click", async () => {
    await Promise.all([loadDashboard(), loadAiStatus()]);
  });

  try {
    await Promise.all([loadDashboard(), loadAiStatus()]);
  } catch (error) {
    els.heroFocus.textContent = error.message;
    els.profileStatus.textContent = error.message;
  }
}

bootstrap();

function ensureContainer() {
  let c = document.getElementById("toasts");
  if (!c) {
    c = document.createElement("div");
    c.id = "toasts";
    document.body.appendChild(c);
  }
  return c;
}

function buildToast({ type = "info", title = "", message = "", timeout = 3200 } = {}) {
  const container = ensureContainer();

  const t = document.createElement("div");
  t.className = `toast ${type}`;

  t.innerHTML = `
    <div class="toast-title">${escapeHtml(title || type.toUpperCase())}</div>
    <p class="toast-msg">${escapeHtml(message || "")}</p>
  `;

  // fechar ao clicar
  t.addEventListener("click", () => removeToast(t));

  container.appendChild(t);

  // auto-remover
  const timer = setTimeout(() => removeToast(t), timeout);

  // guarda para evitar leaks se remover manualmente
  t.__rzTimer = timer;

  return t;
}

function removeToast(node) {
  if (!node) return;
  if (node.__rzTimer) clearTimeout(node.__rzTimer);
  node.remove();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

export const toast = {
  success: (message, title = "Sucesso", timeout) =>
    buildToast({ type: "ok", title, message, timeout }),
  error: (message, title = "Erro", timeout) =>
    buildToast({ type: "err", title, message, timeout }),
  info: (message, title = "Info", timeout) =>
    buildToast({ type: "info", title, message, timeout }),
  warn: (message, title = "Aviso", timeout) =>
    buildToast({ type: "warn", title, message, timeout }),
};


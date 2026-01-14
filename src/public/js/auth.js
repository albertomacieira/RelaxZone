import { apiRequest, clearTokens, hasAccessToken } from "./api.js";

async function loadMe() {
  const data = await apiRequest("/auth/me");
  return data?.user || data;
}

async function guardPages() {
  const path = window.location.pathname;

  // /profile precisa de login
  if (path === "/profile") {
    if (!hasAccessToken()) return (window.location.href = "/login");
    try {
      await loadMe();
    } catch {
      return (window.location.href = "/login");
    }
  }

  // /admin precisa de ADMIN
  if (path.startsWith("/admin")) {
    if (!hasAccessToken()) return (window.location.href = "/login");
    try {
      const me = await loadMe();
      if (me?.role !== "ADMIN") return (window.location.href = "/");
    } catch {
      return (window.location.href = "/login");
    }
  }
}

async function renderProfile() {
  const nameNode = document.querySelector("[data-profile-name]");
  const emailNode = document.querySelector("[data-profile-email]");
  if (!nameNode && !emailNode) return;

  try {
    if (!hasAccessToken()) return (window.location.href = "/login");
    const me = await loadMe();

    if (nameNode) nameNode.textContent = `Name: ${me.name ?? ""}`;
    if (emailNode) emailNode.textContent = `Email: ${me.email ?? ""}`;
  } catch (e) {
    if (nameNode) nameNode.textContent = e.message || "Erro";
  }
}

function initLogout() {
  const logoutBtn = document.querySelector("[data-logout]");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    clearTokens();
    window.location.href = "/login";
  });
}

async function updateNav() {
  const profileLink = document.querySelector("[data-nav-profile]");
  const adminLink = document.querySelector("[data-nav-admin]");
  const logoutBtn = document.querySelector("[data-logout]");
  const loginLink = document.querySelector("[data-nav-login]");
  const registerLink = document.querySelector("[data-nav-register]");

  const loggedIn = !!localStorage.getItem("rz_access_token");

  let userRaw = localStorage.getItem("rz_user");
  let user = userRaw ? JSON.parse(userRaw) : null;

  // se tem token mas não tem user -> tenta ir buscar ao backend
  if (loggedIn && !user) {
    try {
      const me = await loadMe();
      user = me;
      localStorage.setItem("rz_user", JSON.stringify(me));
    } catch {
      // ignora
    }
  }

  // links visíveis
  if (profileLink) profileLink.hidden = !loggedIn;
  if (logoutBtn) logoutBtn.hidden = !loggedIn;

  const isAdmin = loggedIn && user?.role === "ADMIN";
  if (adminLink) adminLink.hidden = !isAdmin;

  if (loginLink) loginLink.hidden = loggedIn;
  if (registerLink) registerLink.hidden = loggedIn;
}

document.addEventListener("DOMContentLoaded", async () => {
  await guardPages();
  await renderProfile();
  initLogout();
  await updateNav();
});







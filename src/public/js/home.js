import { apiRequest, hasAccessToken } from "./api.js";
import { toast } from "./toast.js";

async function setupHeroButtons() {
  const btnLogin = document.querySelector("[data-home-login]");
  const btnRegister = document.querySelector("[data-home-register]");
  const btnProfile = document.querySelector("[data-home-profile]");
  const btnAdmin = document.querySelector("[data-home-admin]");

  const loggedIn = hasAccessToken();

  if (btnProfile) btnProfile.hidden = !loggedIn;
  if (btnLogin) btnLogin.hidden = loggedIn;
  if (btnRegister) btnRegister.hidden = loggedIn;
  if (btnAdmin) btnAdmin.hidden = true;

  if (!loggedIn) return;

  try {
    let user = null;
    const raw = localStorage.getItem("rz_user");
    if (raw) user = JSON.parse(raw);

    if (!user) {
      const data = await apiRequest("/auth/me");
      user = data?.user ?? data;
      if (user) localStorage.setItem("rz_user", JSON.stringify(user));
    }

    if (btnAdmin) btnAdmin.hidden = !(user?.role === "ADMIN");
  } catch {
    // ignora
  }
}

function guardRestrictedLinks() {
  const links = document.querySelectorAll("[data-require-auth]");
  if (!links.length) return;

  const warn = () => {
    toast.info(
      "Faz login ou cria conta para aceder aos serviços.",
      "Autenticação necessária"
    );
    window.location.href = "/login";
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (hasAccessToken()) return;
      event.preventDefault();
      event.stopPropagation();
      warn();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupHeroButtons();
  guardRestrictedLinks();
});



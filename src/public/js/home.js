import { apiRequest, hasAccessToken } from "./api.js";
import { toast } from "./toast.js";

function eurosFromCents(cents) {
  return (Number(cents || 0) / 100).toFixed(2) + "€";
}

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
  loadPopularServices();
});

async function loadPopularServices() {
  const grid = document.querySelector("[data-popular-grid]");
  const msg = document.querySelector("[data-popular-msg]");
  if (!grid) return;

  try {
    msg.textContent = "A carregar...";
    grid.innerHTML = "";

    const services = await apiRequest("/services/popular", { params: { limit: 3 } });
    if (!services.length) {
      msg.textContent = "Ainda sem reservas registadas.";
      return;
    }

    services.forEach((s) => {
      const card = document.createElement("div");
      card.className = "card popular-card";

      card.innerHTML = `
        <h3>${s.name ?? "Serviço"}</h3>
        <p class="muted">${(s.description || "").trim() || "—"}</p>
        <div class="service-meta">
          <span class="badge">${Number(s.duration_min)} min</span>
          <span class="badge">${eurosFromCents(s.price_cents)}</span>
        </div>
        <a class="btn btn-ghost" href="/services" data-require-auth>Ver detalhes</a>
      `;

      grid.appendChild(card);
    });

    msg.textContent = "";
  } catch (err) {
    msg.textContent = err?.message || "Não foi possível carregar os serviços populares.";
  }
}



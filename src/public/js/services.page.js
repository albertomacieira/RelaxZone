import { apiRequest, hasAccessToken } from "./api.js";
import { toast } from "./toast.js";

function el(sel) {
  return document.querySelector(sel);
}

let servicesCache = [];

function eurosFromCents(cents) {
  return (Number(cents || 0) / 100).toFixed(2) + "€";
}

function openModal(serviceId) {
  if (!hasAccessToken()) {
    toast.info("Faz login para poderes reservar.");
    window.location.href = "/login";
    return;
  }

  const modal = el("[data-booking-modal]");
  const title = el("[data-booking-title]");
  const meta = el("[data-booking-meta]");
  const input = el("[data-booking-datetime]");

  const s = servicesCache.find(
    (x) => String(x.id) === String(serviceId) || Number(x.id) === Number(serviceId)
  );
  if (!s) return;

  title.textContent = s.name ?? "Serviço";
  meta.textContent = `${Number(s.duration_min)} min · ${eurosFromCents(s.price_cents)}`;

  // default: agora + 1h (arredondado aos 5 min)
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  d.setSeconds(0, 0);
  input.value = d.toISOString().slice(0, 16);

  modal.dataset.serviceId = String(s.id);
  modal.hidden = false;
}

function closeModal() {
  const modal = el("[data-booking-modal]");
  modal.hidden = true;
  delete modal.dataset.serviceId;
}

function renderServiceCard(s) {
  const div = document.createElement("div");
  div.className = "card service-card";

  div.innerHTML = `
    ${s.image_url ? `<div class="service-thumb"><img src="${s.image_url}" alt="${s.name || "Serviço"}"></div>` : ""}
    <h3 class="service-title">${s.name ?? ""}</h3>
    <p class="muted">${(s.description ?? "").trim() || "—"}</p>

    <div class="service-meta">
      <span class="badge">${Number(s.duration_min)} min</span>
      <span class="badge">${eurosFromCents(s.price_cents)}</span>
    </div>

    <div class="service-actions">
      <button class="btn" type="button" data-book="${s.id}">Reservar</button>
    </div>
  `;

  div.querySelector("[data-book]")?.addEventListener("click", () => openModal(s.id));
  return div;
}

async function confirmBooking() {
  const modal = el("[data-booking-modal]");
  const serviceId = modal.dataset.serviceId;
  const input = el("[data-booking-datetime]");
  const btn = el("[data-booking-confirm]");

  try {
    btn.disabled = true;
    btn.textContent = "A reservar...";

    const value = input.value; // datetime-local
    if (!value) throw new Error("Escolhe data e hora.");

    const start = new Date(value);
    if (Number.isNaN(start.getTime())) throw new Error("Data inválida.");

    await apiRequest("/bookings", {
      method: "POST",
      data: {
        service_id: Number(serviceId),
        start_at: start.toISOString(),
      },
    });

    toast.success("Reserva criada com sucesso ✅");
    closeModal();
    window.location.href = "/profile";
  } catch (err) {
    toast.error(err?.message || "Não foi possível criar a reserva.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Confirmar";
  }
}

async function loadServices() {
  const grid = el("[data-services-grid]");
  const msg = el("[data-services-msg]");

  try {
    msg.textContent = "A carregar serviços...";
    grid.innerHTML = "";

    const services = await apiRequest("/services");
    servicesCache = services;

    services.forEach((s) => grid.appendChild(renderServiceCard(s)));
    msg.textContent = services.length ? "" : "Sem serviços.";
  } catch (err) {
    msg.textContent = err?.message || "Erro a carregar serviços.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  el("[data-booking-cancel]")?.addEventListener("click", closeModal);
  el("[data-booking-confirm]")?.addEventListener("click", confirmBooking);

  // fechar ao clicar no fundo
  el("[data-booking-modal]")?.addEventListener("click", (e) => {
    if (e.target?.matches?.("[data-booking-modal]")) closeModal();
  });

  loadServices();
});

import { apiRequest } from "./api.js";
import { toast } from "./toast.js";

function el(sel) {
  return document.querySelector(sel);
}

function statusBadge(status) {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED") return `<span class="badge badge-ok">APPROVED</span>`;
  if (s === "CANCELLED") return `<span class="badge badge-off">CANCELLED</span>`;
  return `<span class="badge badge-warn">PENDING</span>`;
}

function renderBookingRow(b) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${b.id}</td>
    <td>${b.service_name ?? b.service_id}</td>
    <td>${new Date(b.start_at).toLocaleString()}</td>
    <td>${new Date(b.end_at).toLocaleString()}</td>
    <td>${statusBadge(b.status)}</td>
    <td>
      <button class="btn btn-danger" type="button" data-cancel="${b.id}">Cancelar</button>
    </td>
  `;

  const btn = tr.querySelector("[data-cancel]");
  const isCancelled = String(b.status || "").toUpperCase() === "CANCELLED";
  if (isCancelled) btn.disabled = true;

  btn.addEventListener("click", async () => {
    const ok = confirm("Cancelar esta reserva?");
    if (!ok) return;

    try {
      btn.disabled = true;
      await apiRequest(`/bookings/${b.id}/cancel`, { method: "PATCH" });
      toast.success("Reserva cancelada ✅");
      await loadBookings();
    } catch (err) {
      toast.error(err?.message || "Não foi possível cancelar.");
      btn.disabled = false;
    }
  });

  return tr;
}

async function loadBookings() {
  const msg = el("[data-my-bookings-msg]");
  const tbody = el("[data-my-bookings-tbody]");

  try {
    msg.textContent = "A carregar reservas...";
    tbody.innerHTML = "";

    const bookings = await apiRequest("/bookings/my");
    bookings.forEach((b) => tbody.appendChild(renderBookingRow(b)));

    msg.textContent = bookings.length ? "" : "Ainda não tens reservas.";
  } catch (err) {
    msg.textContent = err?.message || "Erro a carregar reservas.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadBookings();
});

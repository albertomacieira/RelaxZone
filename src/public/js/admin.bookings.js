import { apiRequest } from "./api.js";
import { toast } from "./toast.js";

function el(sel) { return document.querySelector(sel); }

const STATUSES = ["PENDING", "APPROVED", "CANCELLED"];

const STATUS_CLASS = {
  APPROVED: "status-approved",
  PENDING: "status-pending",
  CANCELLED: "status-cancelled",
};

function setStatusClass(selectEl, status) {
  if (!selectEl) return;
  selectEl.classList.remove(...Object.values(STATUS_CLASS));
  const cls = STATUS_CLASS[status];
  if (cls) selectEl.classList.add(cls);
}

function renderBookingRow(b) {
  const tr = document.createElement("tr");

  const selectHtml = `
    <select data-status>
      ${STATUSES.map((s) => `<option value="${s}" ${b.status === s ? "selected" : ""}>${s}</option>`).join("")}
    </select>
  `;

  const start = b.start_at ? new Date(b.start_at).toLocaleString() : "";
  const end = b.end_at ? new Date(b.end_at).toLocaleString() : "";

  tr.innerHTML = `
    <td>${b.id}</td>
    <td>${b.user_id}</td>
    <td>${b.service_name ?? b.service_id}</td>
    <td>${start}</td>
    <td>${end}</td>
    <td>${selectHtml}</td>
    <td><button class="btn btn-primary" type="button" data-save>Guardar</button></td>
  `;

  const btn = tr.querySelector("[data-save]");
  const statusSel = tr.querySelector("[data-status]");

  setStatusClass(statusSel, b.status);
  statusSel.addEventListener("change", () => {
    setStatusClass(statusSel, statusSel.value);
  });

  btn.addEventListener("click", async () => {
    const status = statusSel.value;

    if (status === "CANCELLED" && b.status !== "CANCELLED") {
      const ok = confirm("Cancelar esta reserva?");
      if (!ok) return;
    }

    btn.disabled = true;
    statusSel.disabled = true;

    try {
      await apiRequest(`/bookings/${b.id}/status`, {
        method: "PATCH",
        data: { status },
      });

      toast.success(`Estado atualizado para ${status}.`, "Reservas");
      await loadBookings();
    } catch (e) {
      toast.error(e.message || "Erro ao atualizar reserva.", "Reservas");
    } finally {
      btn.disabled = false;
      statusSel.disabled = false;
    }
  });

  return tr;
}

async function loadBookings() {
  const msg = el("[data-admin-bookings-msg]");
  const tbody = el("[data-admin-bookings-tbody]");

  try {
    msg.textContent = "A carregar...";
    tbody.innerHTML = "";

    const bookings = await apiRequest("/bookings"); 
    bookings.forEach((b) => tbody.appendChild(renderBookingRow(b)));

    msg.textContent = bookings.length ? "" : "Sem reservas.";
  } catch (e) {
    msg.textContent = e.message || "Erro a carregar reservas";
    toast.error(msg.textContent, "Reservas");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  el("[data-admin-bookings-refresh]")?.addEventListener("click", loadBookings);
  loadBookings();
});







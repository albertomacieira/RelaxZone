import { apiRequest } from "./api.js";
import { toast } from "./toast.js";

function el(sel) { return document.querySelector(sel); }

function renderServiceRow(s) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${s.id}</td>
    <td><input data-name value="${s.name ?? ""}"></td>
    <td><input data-duration type="number" value="${s.duration_min ?? ""}"></td>
    <td><input data-price type="number" value="${s.price_cents ?? ""}"></td>
    <td>
      <span class="badge ${Number(s.is_active) === 1 ? "badge-ok" : "badge-off"}">
        ${Number(s.is_active) === 1 ? "Ativo" : "Inativo"}
      </span>
    </td>
    <td>
      <button class="btn btn-primary" type="button" data-save>Guardar</button>
      <button class="btn btn-danger" type="button" data-del>Apagar</button>
    </td>
  `;

  const btnSave = tr.querySelector("[data-save]");
  const btnDel = tr.querySelector("[data-del]");

  btnSave.addEventListener("click", async () => {
    const name = tr.querySelector("[data-name]").value.trim();
    const duration_min = Number(tr.querySelector("[data-duration]").value);
    const price_cents = Number(tr.querySelector("[data-price]").value);

    if (!name) return toast.warn("Nome é obrigatório.", "Serviços");
    if (!Number.isFinite(duration_min) || duration_min <= 0) return toast.warn("Duração inválida.", "Serviços");
    if (!Number.isFinite(price_cents) || price_cents < 0) return toast.warn("Preço inválido.", "Serviços");

    btnSave.disabled = true;
    btnDel.disabled = true;

    try {
      await apiRequest(`/services/${s.id}`, {
        method: "PATCH",
        data: { name, duration_min, price_cents },
      });

      toast.success("Serviço atualizado.", "Serviços");
      await loadServices();
    } catch (e) {
      toast.error(e.message || "Erro ao guardar serviço.", "Serviços");
    } finally {
      btnSave.disabled = false;
      btnDel.disabled = false;
    }
  });

  btnDel.addEventListener("click", async () => {
    const ok = confirm("Apagar serviço?");
    if (!ok) return;

    btnSave.disabled = true;
    btnDel.disabled = true;

    try {
      await apiRequest(`/services/${s.id}`, { method: "DELETE" });
      toast.success("Serviço apagado.", "Serviços");
      await loadServices();
    } catch (e) {
      toast.error(e.message || "Erro ao apagar serviço.", "Serviços");
    } finally {
      btnSave.disabled = false;
      btnDel.disabled = false;
    }
  });

  return tr;
}

async function loadServices() {
  const msg = el("[data-admin-services-msg]");
  const tbody = el("[data-admin-services-tbody]");

  try {
    msg.textContent = "A carregar...";
    tbody.innerHTML = "";

    const services = await apiRequest("/services");
    services.forEach((s) => tbody.appendChild(renderServiceRow(s)));

    msg.textContent = services.length ? "" : "Sem serviços.";
  } catch (e) {
    msg.textContent = e.message || "Erro a carregar serviços";
    toast.error(msg.textContent, "Serviços");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = el("[data-admin-service-create]");
  const msg = el("[data-admin-services-msg]");

  form?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);

    const name = String(fd.get("name") || "").trim();
    const duration_min = Number(fd.get("duration_min"));
    const price_cents = Number(fd.get("price_cents"));

    if (!name) return toast.warn("Nome é obrigatório.", "Serviços");
    if (!Number.isFinite(duration_min) || duration_min <= 0) return toast.warn("Duração inválida.", "Serviços");
    if (!Number.isFinite(price_cents) || price_cents < 0) return toast.warn("Preço inválido.", "Serviços");

    try {
      msg.textContent = "A criar...";

      await apiRequest("/services", {
        method: "POST",
        data: {
          name,
          description: fd.get("description") || "",
          duration_min,
          price_cents,
          image_url: fd.get("image_url") || null,
        },
      });

      form.reset();
      toast.success("Serviço criado.", "Serviços");
      await loadServices();
      msg.textContent = "";
    } catch (e) {
      msg.textContent = e.message || "Erro a criar serviço";
      toast.error(msg.textContent, "Serviços");
    }
  });

  loadServices();
});




import { apiRequest } from "./api.js";
import { toast } from "./toast.js";

function el(sel) { return document.querySelector(sel); }

function renderRow(u) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${u.id}</td>
    <td>${u.name ?? ""}</td>
    <td>${u.email ?? ""}</td>
    <td>
      <select data-role>
        <option value="ADMIN" ${u.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
        <option value="CLIENT" ${u.role === "CLIENT" ? "selected" : ""}>CLIENT</option>
      </select>
    </td>
    <td>
      <span class="badge ${Number(u.is_active) === 1 ? "badge-ok" : "badge-off"}">
        ${Number(u.is_active) === 1 ? "Ativo" : "Inativo"}
      </span>
    </td>
    <td>
      <button class="btn btn-primary" type="button" data-save>Guardar</button>
      <button class="btn" type="button" data-toggle>
        ${Number(u.is_active) === 1 ? "Desativar" : "Ativar"}
      </button>
    </td>
  `;

  const roleSelect = tr.querySelector("[data-role]");
  const btnSave = tr.querySelector("[data-save]");
  const btnToggle = tr.querySelector("[data-toggle]");

  btnSave.addEventListener("click", async () => {
    const newRole = roleSelect.value;

    if (newRole === "ADMIN" && u.role !== "ADMIN") {
      const ok = confirm(`Tornar ${u.email} ADMIN?`);
      if (!ok) return;
    }

    btnSave.disabled = true;
    btnToggle.disabled = true;

    try {
      await apiRequest(`/admin/users/${u.id}/role`, {
        method: "PATCH",
        data: { role: newRole },
      });

      toast.success(`Role atualizado para ${newRole}.`, "Utilizadores");
      await loadUsers();
    } catch (e) {
      toast.error(e.message || "Erro ao atualizar role.", "Utilizadores");
    } finally {
      btnSave.disabled = false;
      btnToggle.disabled = false;
    }
  });

  btnToggle.addEventListener("click", async () => {
    const newVal = Number(u.is_active) === 1 ? 0 : 1;

    if (newVal === 0) {
      const ok = confirm(`Desativar o utilizador ${u.email}?`);
      if (!ok) return;
    }

    btnSave.disabled = true;
    btnToggle.disabled = true;

    try {
      await apiRequest(`/admin/users/${u.id}/active`, {
        method: "PATCH",
        data: { is_active: newVal },
      });

      toast.success(
        newVal === 1 ? "Utilizador ativado." : "Utilizador desativado.",
        "Utilizadores"
      );
      await loadUsers();
    } catch (e) {
      toast.error(e.message || "Erro ao alterar estado.", "Utilizadores");
    } finally {
      btnSave.disabled = false;
      btnToggle.disabled = false;
    }
  });

  return tr;
}

async function loadUsers() {
  const msg = el("[data-admin-users-msg]");
  const tbody = el("[data-admin-users-tbody]");

  try {
    msg.textContent = "A carregar...";
    tbody.innerHTML = "";

    const q = el("[data-admin-users-q]")?.value || "";
    const role = el("[data-admin-users-role]")?.value || "";
    const is_active = el("[data-admin-users-active]")?.value || "";

    const users = await apiRequest("/admin/users", {
      params: {
        q: q || undefined,
        role: role || undefined,
        is_active: is_active || undefined,
        limit: 50,
        offset: 0,
      },
    });

    users.forEach((u) => tbody.appendChild(renderRow(u)));
    msg.textContent = users.length ? "" : "Sem utilizadores.";
  } catch (e) {
    msg.textContent = e.message || "Erro a carregar utilizadores";
    toast.error(msg.textContent, "Utilizadores");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  el("[data-admin-users-refresh]")?.addEventListener("click", loadUsers);
  loadUsers();
});





import { apiRequest, setTokens } from "./api.js";

const form =
  document.querySelector("[data-register-form]") ||
  document.querySelector("form#registerForm");

const msg = document.querySelector("[data-register-msg]");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = "";

    const fd = new FormData(form);

    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      password: String(fd.get("password") || ""),
    };

    const phone = String(fd.get("phone") || "").trim();
    if (phone) payload.phone = phone;

    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        data: payload,
      });

      if (data?.tokens) setTokens(data.tokens);
      if (data?.user) localStorage.setItem("rz_user", JSON.stringify(data.user));

      const role = data?.user?.role;
      window.location.href = role === "ADMIN" ? "/admin" : "/profile";
    } catch (err) {
      if (msg) msg.textContent = err.message || "Erro no registo";
    }
  });
}



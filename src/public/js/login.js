import { apiRequest, setTokens } from "./api.js";

const form =
  document.querySelector("[data-login-form]") ||
  document.querySelector("form#loginForm");

const msg = document.querySelector("[data-login-msg]");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = "";

    const fd = new FormData(form);
    const email = fd.get("email");
    const password = fd.get("password");

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        data: { email, password },
      });

      // backend: { user, tokens: { accessToken, refreshToken } }
      if (data?.tokens) setTokens(data.tokens);
      if (data?.user) localStorage.setItem("rz_user", JSON.stringify(data.user));

      const role = data?.user?.role;
      window.location.href = role === "ADMIN" ? "/admin" : "/profile";
    } catch (err) {
      if (msg) msg.textContent = err.message;
    }
  });
}

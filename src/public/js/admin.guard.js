import { apiRequest, clearTokens } from "./api.js";

function redirectLogin() {
  window.location.href = "/login";
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // valida sessão (vai usar refresh automático se precisar)
    const data = await apiRequest("/auth/me"); // OU "/users/me" se for o teu endpoint
    const user = data?.user ?? data; // compat: alguns endpoints devolvem {user}, outros devolvem user direto

    if (!user || user.role !== "ADMIN") {
      clearTokens();
      redirectLogin();
    }
  } catch (e) {
    clearTokens();
    redirectLogin();
  }
});

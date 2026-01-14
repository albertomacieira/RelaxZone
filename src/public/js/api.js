const API_BASE_URL = window.API_BASE_URL || `${window.location.origin}/api`;

// migra token legacy se existir
const legacy = localStorage.getItem("rz_token");
if (legacy && !localStorage.getItem("rz_access_token")) {
  localStorage.setItem("rz_access_token", legacy);
  localStorage.removeItem("rz_token");
}

let accessToken = localStorage.getItem("rz_access_token");
let refreshToken = localStorage.getItem("rz_refresh_token");

export const setTokens = ({ accessToken: at, refreshToken: rt } = {}) => {
  if (at) {
    accessToken = at;
    localStorage.setItem("rz_access_token", at);
  }
  if (rt) {
    refreshToken = rt;
    localStorage.setItem("rz_refresh_token", rt);
  }
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("rz_access_token");
  localStorage.removeItem("rz_refresh_token");
  localStorage.removeItem("rz_user");
};

export const hasAccessToken = () => !!localStorage.getItem("rz_access_token");

async function refreshAccessToken() {
  if (!refreshToken) throw new Error("No refresh token");

  const url = new URL(`${API_BASE_URL}/auth/refresh`);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Session expired");
  }

  const data = await res.json(); // { tokens: { accessToken, refreshToken? } }
  if (data?.tokens?.accessToken) {
    setTokens({ accessToken: data.tokens.accessToken });
  }
  if (data?.tokens?.refreshToken) {
    setTokens({ refreshToken: data.tokens.refreshToken });
  }
  return true;
}

export const apiRequest = async (endpoint, { method = "GET", data, params } = {}, retry = true) => {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${API_BASE_URL}${normalized}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.append(k, v);
    });
  }

  const headers = {};
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  if (data !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const body = data === undefined ? undefined : isFormData ? data : JSON.stringify(data);

  const res = await fetch(url.toString(), { method, headers, body });

  // tenta refresh automático
  if (res.status === 401 && retry && refreshToken) {
    await refreshAccessToken();
    return apiRequest(endpoint, { method, data, params }, false);
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
};


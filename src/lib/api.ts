import { toast } from "sonner";

// Base URL — configurable via env or fallback
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// ─── Token management ────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem("nikonekti_token");
}
export function setToken(token: string) {
  localStorage.setItem("nikonekti_token", token);
}
export function clearToken() {
  localStorage.removeItem("nikonekti_token");
}
export function getRefreshToken(): string | null {
  return localStorage.getItem("nikonekti_refresh_token");
}
export function setRefreshToken(token: string) {
  localStorage.setItem("nikonekti_refresh_token", token);
}
export function clearRefreshToken() {
  localStorage.removeItem("nikonekti_refresh_token");
}

// ─── Generic fetch wrapper ───────────────────────────────────────
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      const retry = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({}));
        throw new Error(err.detail || err.message || "Request failed");
      }
      return retry.json();
    }
    clearToken();
    clearRefreshToken();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err.detail || err.message || Object.values(err).flat().join(", ") || "Request failed";
    throw new Error(message);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setToken(data.access);
    if (data.refresh) setRefreshToken(data.refresh);
    return true;
  } catch {
    return false;
  }
}

// Helper for multipart form data (file uploads)
async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

// ─── Auth endpoints ──────────────────────────────────────────────
export const auth = {
  login: (email: string, password: string) =>
    apiClient<{ access: string; refresh: string; user: { id: number; email: string; full_name: string; role: string; phone?: string } }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; full_name: string; phone: string; role: string }) =>
    apiClient<{ access: string; refresh: string; user: { id: number; email: string; full_name: string; role: string; phone?: string } }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    apiClient<{ id: number; email: string; full_name: string; role: string; phone?: string }>("/auth/profile/"),
};

// ─── Property endpoints ──────────────────────────────────────────
export const properties = {
  list: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiClient<any[]>(`/properties/${query}`);
  },
  get: (id: string) => apiClient<any>(`/properties/${id}/`),
  create: (data: any) =>
    apiClient<any>("/properties/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiClient<any>(`/properties/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiClient<void>(`/properties/${id}/`, { method: "DELETE" }),
  uploadImages: (id: string, formData: FormData) =>
    apiUpload<any>(`/properties/${id}/images/`, formData),
};

// ─── Application endpoints ──────────────────────────────────────
export const applications = {
  list: () => apiClient<any[]>("/applications/"),
  create: (data: any) =>
    apiClient<any>("/applications/", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    apiClient<any>(`/applications/${id}/`, { method: "PATCH", body: JSON.stringify({ status }) }),
  // Check if tenant has an approved application for a property
  checkForProperty: (propertyId: string) =>
    apiClient<any[]>(`/applications/?property=${propertyId}`),
};

// ─── Viewing endpoints ──────────────────────────────────────────
export const viewings = {
  list: () => apiClient<any[]>("/viewings/"),
  create: (data: { property: string; date: string; time_window: string }) =>
    apiClient<any>("/viewings/", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    apiClient<any>(`/viewings/${id}/`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// ─── Lease endpoints ─────────────────────────────────────────────
export const leases = {
  list: () => apiClient<any[]>("/leases/"),
  create: (data: any) =>
    apiClient<any>("/leases/", { method: "POST", body: JSON.stringify(data) }),
  sign: (id: string) =>
    apiClient<any>(`/leases/${id}/`, { method: "PATCH", body: JSON.stringify({ status: "signed" }) }),
};

// ─── Invoice endpoints ──────────────────────────────────────────
export const invoices = {
  list: () => apiClient<any[]>("/invoices/"),
  create: (data: { lease: string; amount: number; due_date: string; description?: string }) =>
    apiClient<any>("/invoices/", { method: "POST", body: JSON.stringify(data) }),
  pay: (id: string) =>
    apiClient<any>(`/invoices/${id}/pay/`, { method: "POST" }),
};

// ─── Payment endpoints ──────────────────────────────────────────
export const payments = {
  list: () => apiClient<any[]>("/payments/"),
  create: (data: { property: string; amount: number; reference?: string }) =>
    apiClient<any>("/payments/", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Message endpoints ──────────────────────────────────────────
export const messages = {
  listByLease: (leaseId: string) => apiClient<any[]>(`/messages/?lease=${leaseId}`),
  send: (data: { lease: string; content: string }) =>
    apiClient<any>("/messages/", { method: "POST", body: JSON.stringify(data) }),
  leaseConversations: () => apiClient<any[]>("/messages/conversations/"),
};

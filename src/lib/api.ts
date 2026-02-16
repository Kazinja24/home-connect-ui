const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

function toAbsoluteMediaUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  try {
    const apiOrigin = new URL(BASE_URL).origin;
    return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
  } catch {
    return url;
  }
}

export function normalizePropertyImages(images: any): string[] {
  if (!Array.isArray(images)) return ["/placeholder.svg"];

  const urls = images
    .map((item: any) => {
      if (!item) return "";
      if (typeof item === "string") return toAbsoluteMediaUrl(item);
      if (typeof item === "object" && typeof item.image === "string") return toAbsoluteMediaUrl(item.image);
      return "";
    })
    .filter((url: string) => Boolean(url));

  return urls.length ? urls : ["/placeholder.svg"];
}

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

function normalizeApiError(err: any): string {
  if (!err || typeof err !== "object") return "Ombi limeshindikana";
  if (typeof err.detail === "string") return err.detail;
  if (typeof err.message === "string") return err.message;

  const parts = Object.entries(err).flatMap(([key, value]) => {
    if (Array.isArray(value)) return value.map((v) => `${key}: ${String(v)}`);
    if (typeof value === "string") return [`${key}: ${value}`];
    return [];
  });

  return parts.length ? parts.join(", ") : "Ombi limeshindikana";
}

async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${getToken()}`;
      const retry = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({}));
        throw new Error(normalizeApiError(err));
      }
      return retry.status === 204 ? ({} as T) : retry.json();
    }

    clearToken();
    clearRefreshToken();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(normalizeApiError(err));
  }

  if (res.status === 204) {
    return {} as T;
  }

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

async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(normalizeApiError(err));
  }

  return res.json();
}

export const auth = {
  login: (email: string, password: string) =>
    apiClient<{ access: string; refresh: string; user: { id: number | string; email: string; full_name: string; role: string; phone?: string } }>(
      "/auth/login/",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  register: (data: { email: string; password: string; full_name: string; role: string }) =>
    apiClient<{ access: string; refresh: string; user: { id: number | string; email: string; full_name: string; role: string; phone?: string } }>(
      "/auth/register/",
      { method: "POST", body: JSON.stringify(data) }
    ),

  getProfile: () =>
    apiClient<{ id: number | string; email: string; full_name: string; role: string; phone?: string }>("/auth/profile/"),
};

export const properties = {
  list: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiClient<any[]>(`/properties/${query}`);
  },
  get: (id: string) => apiClient<any>(`/properties/${id}/`),
  create: (data: { title: string; description: string; price: number; location: string }) =>
    apiClient<any>("/properties/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ title: string; description: string; price: number; location: string }>) =>
    apiClient<any>(`/properties/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiClient<void>(`/properties/${id}/`, { method: "DELETE" }),
  uploadImages: (id: string, formData: FormData) => apiUpload<any>(`/properties/${id}/upload_image/`, formData),
};

export const applications = {
  list: (params?: { property?: string; status?: string }) => {
    const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]).toString()}` : "";
    return apiClient<any[]>(`/applications/${query}`);
  },
  create: (data: { property: string; message?: string }) => {
    if (!data.property || data.property === "undefined" || data.property === "null") {
      throw new Error("property: This field is required.");
    }
    return apiClient<any>("/applications/", { method: "POST", body: JSON.stringify(data) });
  },
  updateStatus: (id: string, status: string) =>
    status === "APPROVED"
      ? apiClient<any>(`/applications/${id}/approve/`, { method: "POST" })
      : apiClient<any>(`/applications/${id}/reject/`, { method: "POST" }),
  accept: (id: string) => apiClient<any>(`/applications/${id}/accept/`, { method: "POST" }),
  getTenantProfile: (id: string) => apiClient<any>(`/applications/${id}/tenant-profile/`),
};

export const viewings = {
  list: () => apiClient<any[]>("/viewings/"),
  create: (data: { property: string; date: string; time_window: string }) => {
    const timeMap: Record<string, string> = {
      morning: "09:00:00",
      afternoon: "14:00:00",
      evening: "17:00:00",
    };

    const scheduledDate = `${data.date}T${timeMap[data.time_window] || "09:00:00"}Z`;

    return apiClient<any>("/viewings/", {
      method: "POST",
      body: JSON.stringify({ property: data.property, scheduled_date: scheduledDate }),
    });
  },
  updateStatus: (id: string, status: string) =>
    status === "approved"
      ? apiClient<any>(`/viewings/${id}/approve/`, { method: "POST" })
      : apiClient<any>(`/viewings/${id}/reject/`, { method: "POST" }),
  complete: (id: string, outcome: "ACCEPTED" | "REJECTED") =>
    apiClient<any>(`/viewings/${id}/complete/`, { method: "POST", body: JSON.stringify({ outcome }) }),
};

export const leases = {
  list: () => apiClient<any[]>("/leases/"),
  create: (data: any) => apiClient<any>("/leases/", { method: "POST", body: JSON.stringify(data) }),
  sign: (id: string) => apiClient<any>(`/leases/${id}/sign/`, { method: "POST" }),
  activate: (id: string) => apiClient<any>(`/leases/${id}/activate/`, { method: "POST" }),
  close: (id: string) => apiClient<any>(`/leases/${id}/close/`, { method: "POST" }),
  terminate: (id: string) => apiClient<any>(`/leases/${id}/terminate/`, { method: "POST" }),
  uploadContract: (id: string, formData: FormData) => apiUpload<any>(`/leases/${id}/upload-contract/`, formData),
};

export const invoices = {
  list: () => apiClient<any[]>("/invoices/"),
  create: (data: { lease: string; amount: number; due_date: string; description?: string }) =>
    apiClient<any>("/invoices/", { method: "POST", body: JSON.stringify(data) }),
  pay: (id: string) => apiClient<any>(`/invoices/${id}/pay/`, { method: "POST" }),
};

export const payments = {
  list: () => apiClient<any[]>("/payments/"),
  invoices: () => apiClient<any[]>("/payments/invoices/"),
  create: (data: { invoice: string; method: "MOBILE" | "CASH" | "BANK"; reference?: string }) =>
    apiClient<any>("/payments/pay/", { method: "POST", body: JSON.stringify(data) }),
};

export const messages = {
  listByLease: (leaseId: string) => apiClient<any[]>(`/messages/?lease=${leaseId}`),
  send: (data: { lease: string; content: string }) =>
    apiClient<any>("/messages/", { method: "POST", body: JSON.stringify(data) }),
  leaseConversations: () => apiClient<any[]>("/messages/conversations/"),
};

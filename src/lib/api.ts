// ─── API Layer with Prototype/Mock Mode ──────────────────────────
// When VITE_API_BASE_URL is not set or backend is unreachable, uses mock data.

import {
  mockAuth,
  mockPropertiesApi,
  mockApplicationsApi,
  mockViewingsApi,
  mockOffersApi,
  mockLeasesApi,
  mockInvoicesApi,
  mockPaymentsApi,
  mockMessagesApi,
  mockAuditApi,
  mockFeaturesApi,
  mockModerationApi,
} from "./mockApi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// ─── Prototype mode detection ────────────────────────────────────
// If no API base URL is configured, we run in mock/prototype mode
export const IS_MOCK_MODE = !BASE_URL;

function toAbsoluteMediaUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (IS_MOCK_MODE) return url;
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

// ─── Token management ────────────────────────────────────────────
export function getToken(): string | null { return localStorage.getItem("kodi_token"); }
export function setToken(token: string) { localStorage.setItem("kodi_token", token); }
export function clearToken() { localStorage.removeItem("kodi_token"); }
export function getRefreshToken(): string | null { return localStorage.getItem("kodi_refresh_token"); }
export function setRefreshToken(token: string) { localStorage.setItem("kodi_refresh_token", token); }
export function clearRefreshToken() { localStorage.removeItem("kodi_refresh_token"); }

// ─── Real API client (only used when not in mock mode) ───────────
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
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

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
  } catch { return false; }
}

async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { method: "POST", headers, body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(normalizeApiError(err));
  }
  return res.json();
}

// ─── Exported API — routes to mock or real based on IS_MOCK_MODE ─

export const auth = IS_MOCK_MODE
  ? mockAuth
  : {
      login: (email: string, password: string) =>
        apiClient<{ access: string; refresh: string; user: { id: number | string; email: string; full_name: string; role: string; phone?: string } }>(
          "/auth/login/", { method: "POST", body: JSON.stringify({ email, password }) }
        ),
      register: (data: { email: string; password: string; full_name: string; role: string }) =>
        apiClient<{ access: string; refresh: string; user: { id: number | string; email: string; full_name: string; role: string; phone?: string } }>(
          "/auth/register/", { method: "POST", body: JSON.stringify(data) }
        ),
      getProfile: () =>
        apiClient<{ id: number | string; email: string; full_name: string; role: string; phone?: string }>("/auth/profile/"),
      dashboard: () => apiClient<any>("/users/dashboard/"),
    };

export const properties = IS_MOCK_MODE
  ? mockPropertiesApi
  : {
      list: (params?: Record<string, string>) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : "";
        return apiClient<any[]>(`/properties/${query}`);
      },
      get: (id: string) => apiClient<any>(`/properties/${id}/`),
      create: (data: any) => apiClient<any>("/properties/", { method: "POST", body: JSON.stringify(data) }),
      update: (id: string, data: any) => apiClient<any>(`/properties/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
      delete: (id: string) => apiClient<void>(`/properties/${id}/`, { method: "DELETE" }),
      uploadImages: (id: string, formData: FormData) => apiUpload<any>(`/properties/${id}/upload_images/`, formData),
      publish: (id: string) => apiClient<any>(`/properties/${id}/publish/`, { method: "POST" }),
      unpublish: (id: string) => apiClient<any>(`/properties/${id}/unpublish/`, { method: "POST" }),
      submitForReview: (id: string) => apiClient<any>(`/properties/${id}/submit_for_review/`, { method: "POST" }),
      submitOwnershipDocument: (id: string, formData: FormData) => apiUpload<any>(`/properties/${id}/submit_ownership_document/`, formData),
      pendingReviews: () => apiClient<any[]>("/properties/pending_reviews/"),
      adminApproveListing: (id: string, notes?: string) =>
        apiClient<any>(`/properties/${id}/admin_approve_listing/`, { method: "POST", body: JSON.stringify({ admin_review_notes: notes || "" }) }),
      adminRejectListing: (id: string, notes?: string) =>
        apiClient<any>(`/properties/${id}/admin_reject_listing/`, { method: "POST", body: JSON.stringify({ admin_review_notes: notes || "" }) }),
      approveVerification: (id: string, notes?: string) =>
        apiClient<any>(`/properties/${id}/approve_verification/`, { method: "POST", body: JSON.stringify({ verification_notes: notes || "" }) }),
      rejectVerification: (id: string, notes?: string) =>
        apiClient<any>(`/properties/${id}/reject_verification/`, { method: "POST", body: JSON.stringify({ verification_notes: notes || "" }) }),
      getConfig: () => apiClient<{ image_max_size_mb: number }>('/properties/config/'),
    };

export const features = IS_MOCK_MODE
  ? mockFeaturesApi
  : { list: () => apiClient<any[]>('/features/') };

export const applications = IS_MOCK_MODE
  ? mockApplicationsApi
  : {
      list: (params?: { property?: string; status?: string }) => {
        const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][]).toString()}` : "";
        return apiClient<any[]>(`/applications/${query}`);
      },
      create: (data: { property: string; message?: string }) => {
        if (!data.property || data.property === "undefined") throw new Error("property: This field is required.");
        return apiClient<any>("/applications/", { method: "POST", body: JSON.stringify(data) });
      },
      updateStatus: (id: string, status: string) =>
        status.toLowerCase() === "approved"
          ? apiClient<any>(`/applications/${id}/approve/`, { method: "POST" })
          : status.toLowerCase() === "expired"
          ? apiClient<any>(`/applications/${id}/expire/`, { method: "POST" })
          : apiClient<any>(`/applications/${id}/reject/`, { method: "POST" }),
      getTenantProfile: (id: string) => apiClient<any>(`/applications/${id}/tenant-profile/`),
      canMessage: (propertyId: string) => apiClient<{ can_message_landlord: boolean }>(`/applications/can_message/?property_id=${propertyId}`),
      canRequestViewing: (propertyId: string) => apiClient<{ can_request_viewing: boolean }>(`/applications/can_request_viewing/?property_id=${propertyId}`),
    };

export const viewings = IS_MOCK_MODE
  ? mockViewingsApi
  : {
      list: () => apiClient<any[]>("/viewings/"),
      create: (data: { application: string; date: string; time_window: string }) => {
        const timeMap: Record<string, string> = { morning: "09:00:00", afternoon: "14:00:00", evening: "17:00:00" };
        const scheduledDate = `${data.date}T${timeMap[data.time_window] || "09:00:00"}Z`;
        return apiClient<any>("/viewings/", { method: "POST", body: JSON.stringify({ application: data.application, scheduled_date: scheduledDate }) });
      },
      updateStatus: (id: string, status: string) =>
        status === "approved" ? apiClient<any>(`/viewings/${id}/approve/`, { method: "POST" }) : apiClient<any>(`/viewings/${id}/reject/`, { method: "POST" }),
      complete: (id: string) => apiClient<any>(`/viewings/${id}/complete/`, { method: "POST" }),
    };

export const leases = IS_MOCK_MODE
  ? mockLeasesApi
  : {
      list: () => apiClient<any[]>("/leases/"),
      create: (data: any) => apiClient<any>("/leases/", { method: "POST", body: JSON.stringify(data) }),
      sign: (id: string) => apiClient<any>(`/leases/${id}/sign/`, { method: "POST" }),
      landlordConfirm: (id: string) => apiClient<any>(`/leases/${id}/landlord_confirm/`, { method: "POST" }),
      activate: (id: string) => apiClient<any>(`/leases/${id}/activate/`, { method: "POST" }),
      close: (id: string) => apiClient<any>(`/leases/${id}/close/`, { method: "POST" }),
      terminate: (id: string) => apiClient<any>(`/leases/${id}/terminate/`, { method: "POST" }),
      uploadContract: (id: string, formData: FormData) => apiUpload<any>(`/leases/${id}/upload-contract/`, formData),
      generateContract: (id: string) => apiClient<any>(`/leases/${id}/generate-contract/`, { method: "POST" }),
      downloadContract: async (id: string) => {
        const token = getToken();
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${BASE_URL}/leases/${id}/contract/`, { method: "GET", headers });
        if (!res.ok) throw new Error("Failed to download contract");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lease_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return true;
      },
    };

export const invoices = IS_MOCK_MODE
  ? mockInvoicesApi
  : { list: () => apiClient<any[]>("/payments/invoices/") };

export const offers = IS_MOCK_MODE
  ? mockOffersApi
  : {
      list: () => apiClient<any[]>("/offers/"),
      create: (data: any) => apiClient<any>("/offers/", { method: "POST", body: JSON.stringify(data) }),
      accept: (id: string, note?: string) => apiClient<any>(`/offers/${id}/accept/`, { method: "POST", body: JSON.stringify({ tenant_note: note || "" }) }),
      reject: (id: string, note?: string) => apiClient<any>(`/offers/${id}/reject/`, { method: "POST", body: JSON.stringify({ tenant_note: note || "" }) }),
      withdraw: (id: string) => apiClient<any>(`/offers/${id}/withdraw/`, { method: "POST" }),
    };

export const audit = IS_MOCK_MODE
  ? mockAuditApi
  : {
      lifecycle: (params?: any) => {
        const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][]).toString()}` : "";
        return apiClient<any[]>(`/audit/logs/lifecycle/${query}`);
      },
    };

export const payments = IS_MOCK_MODE
  ? mockPaymentsApi
  : {
      list: () => apiClient<any[]>("/payments/"),
      invoices: () => apiClient<any[]>("/payments/invoices/"),
      create: (data: { invoice: string; method: "MOBILE" | "CASH" | "BANK"; reference?: string }) =>
        apiClient<any>("/payments/pay/", { method: "POST", body: JSON.stringify(data) }),
      listingPlans: () => apiClient<any[]>("/payments/listing-plans/"),
      listingIntents: {
        list: () => apiClient<any[]>("/payments/listing-intents/"),
        create: (data: any) => apiClient<any>("/payments/listing-intents/", { method: "POST", body: JSON.stringify(data) }),
        requestConfirmation: (id: string, formData: FormData) => apiUpload<any>(`/payments/listing-intents/${id}/request_confirmation/`, formData),
        confirm: (id: string, note?: string) => apiClient<any>(`/payments/listing-intents/${id}/confirm/`, { method: "POST", body: JSON.stringify({ admin_note: note }) }),
        reject: (id: string, note?: string) => apiClient<any>(`/payments/listing-intents/${id}/reject/`, { method: "POST", body: JSON.stringify({ admin_note: note }) }),
        override: (id: string, note?: string) => apiClient<any>(`/payments/listing-intents/${id}/override/`, { method: "POST", body: JSON.stringify({ admin_note: note }) }),
      },
    };

export const messages = IS_MOCK_MODE
  ? mockMessagesApi
  : {
      openConversation: (applicationId: string) =>
        apiClient<any>("/chat/conversations/open/", { method: "POST", body: JSON.stringify({ application_id: applicationId }) }),
      listConversations: () => apiClient<any[]>("/chat/conversations/"),
      getConversation: (id: string) => apiClient<any>(`/chat/conversations/${id}/`),
      listMessages: (conversationId: string) => apiClient<any[]>(`/chat/messages/?conversation=${conversationId}`),
      send: (data: { conversation: string; content: string }) =>
        apiClient<any>("/chat/messages/", { method: "POST", body: JSON.stringify(data) }),
    };

export const moderation = IS_MOCK_MODE
  ? mockModerationApi
  : {
      reports: {
        list: () => apiClient<any[]>("/reports/property-reports/"),
        create: (data: any) => apiClient<any>("/reports/property-reports/", { method: "POST", body: JSON.stringify(data) }),
        underReview: (id: string, notes?: string) => apiClient<any>(`/reports/property-reports/${id}/under_review/`, { method: "POST", body: JSON.stringify({ review_notes: notes }) }),
        resolve: (id: string, notes?: string) => apiClient<any>(`/reports/property-reports/${id}/resolve/`, { method: "POST", body: JSON.stringify({ review_notes: notes }) }),
        dismiss: (id: string, notes?: string) => apiClient<any>(`/reports/property-reports/${id}/dismiss/`, { method: "POST", body: JSON.stringify({ review_notes: notes }) }),
      },
      blocks: {
        list: () => apiClient<any[]>("/reports/user-blocks/"),
        create: (data: any) => apiClient<any>("/reports/user-blocks/", { method: "POST", body: JSON.stringify(data) }),
        unblock: (id: string) => apiClient<any>(`/reports/user-blocks/${id}/unblock/`, { method: "POST" }),
      },
    };

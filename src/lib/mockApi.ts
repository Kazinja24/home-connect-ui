// ─── Mock API layer for prototype mode ────────────────────────
// Returns promises that resolve with mock data, simulating API calls.

import {
  mockUsers,
  mockProperties,
  mockApplications,
  mockViewings,
  mockOffers,
  mockLeases,
  mockInvoices,
  mockPayments,
  mockConversations,
  mockMessages,
  mockAuditLogs,
  mockDashboardStats,
} from "./mockData";

// Simulate async delay
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// Track current mock user role from localStorage
function getCurrentMockUser() {
  const stored = localStorage.getItem("nikonekti_mock_user");
  if (stored) {
    try { return JSON.parse(stored); } catch { /* ignore */ }
  }
  return null;
}

// ─── Auth ────────────────────────────────────────────────────────
export const mockAuth = {
  login: async (email: string, _password: string) => {
    await delay();
    // Determine role from email
    let user = mockUsers.tenant;
    if (email.includes("landlord")) user = mockUsers.landlord;
    else if (email.includes("admin")) user = mockUsers.admin;
    else user = { ...mockUsers.tenant, email };

    localStorage.setItem("nikonekti_mock_user", JSON.stringify(user));
    return { access: "mock-token-xyz", refresh: "mock-refresh-xyz", user };
  },

  register: async (data: { email: string; full_name: string; role: string }) => {
    await delay();
    const role = data.role.toLowerCase();
    const user = {
      id: `new-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      role,
      phone: "",
    };
    localStorage.setItem("nikonekti_mock_user", JSON.stringify(user));
    return { access: "mock-token-xyz", refresh: "mock-refresh-xyz", user };
  },

  getProfile: async () => {
    await delay(100);
    const user = getCurrentMockUser();
    if (!user) throw new Error("Not authenticated");
    return user;
  },

  dashboard: async () => {
    await delay();
    const user = getCurrentMockUser();
    const role = user?.role || "tenant";
    return mockDashboardStats[role as keyof typeof mockDashboardStats] || mockDashboardStats.tenant;
  },
};

// ─── Properties ──────────────────────────────────────────────────
// Keep a mutable copy so CRUD works within the session
let localProperties = [...mockProperties];

export const mockPropertiesApi = {
  list: async (params?: Record<string, string>) => {
    await delay();
    let result = [...localProperties];
    if (params?.listing_status) {
      result = result.filter((p) => p.listing_status === params.listing_status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
    }
    return result;
  },
  get: async (id: string) => {
    await delay();
    const prop = localProperties.find((p) => p.id === id);
    if (!prop) throw new Error("Property not found");
    return prop;
  },
  create: async (data: any) => {
    await delay();
    const user = getCurrentMockUser();
    const newProp = {
      id: `p-new-${Date.now()}`,
      title: data.title || "",
      description: data.description || "",
      price: Number(data.price) || 0,
      location: data.location || "",
      bedrooms: Number(data.bedrooms) || 1,
      property_type: data.property_type || "apartment",
      amenities: data.amenities || [],
      house_rules: data.house_rules || [],
      images: ["/placeholder.svg"],
      listing_status: "draft",
      verification_status: "unverified",
      owner: user?.id || "l1",
      owner_name: user?.full_name || "Demo Landlord",
      created_at: new Date().toISOString(),
    };
    localProperties = [newProp, ...localProperties];
    return newProp;
  },
  update: async (id: string, data: any) => {
    await delay();
    localProperties = localProperties.map((p) => p.id === id ? { ...p, ...data } : p);
    return localProperties.find((p) => p.id === id);
  },
  delete: async (id: string) => {
    await delay();
    localProperties = localProperties.filter((p) => p.id !== id);
    return {};
  },
  uploadImages: async () => { await delay(); return { images: ["/placeholder.svg"] }; },
  publish: async (id: string) => {
    await delay();
    localProperties = localProperties.map((p) => p.id === id ? { ...p, listing_status: "published" } : p);
    return { id, listing_status: "published" };
  },
  unpublish: async (id: string) => {
    await delay();
    localProperties = localProperties.map((p) => p.id === id ? { ...p, listing_status: "draft" } : p);
    return { id, listing_status: "draft" };
  },
  submitForReview: async (id: string) => {
    await delay();
    localProperties = localProperties.map((p) => p.id === id ? { ...p, listing_status: "pending_review" } : p);
    return { id, listing_status: "pending_review" };
  },
  submitOwnershipDocument: async () => { await delay(); return { status: "submitted" }; },
  pendingReviews: async () => { await delay(); return localProperties.filter((p) => p.listing_status === "draft"); },
  adminApproveListing: async (id: string) => {
    await delay();
    localProperties = localProperties.map((p) => p.id === id ? { ...p, listing_status: "published" } : p);
    return { id, listing_status: "published" };
  },
  adminRejectListing: async (id: string) => {
    await delay();
    localProperties = localProperties.map((p) => p.id === id ? { ...p, listing_status: "rejected" } : p);
    return { id, listing_status: "rejected" };
  },
  approveVerification: async (id: string) => { await delay(); return { id, verification_status: "verified" }; },
  rejectVerification: async (id: string) => { await delay(); return { id, verification_status: "rejected" }; },
  getConfig: async () => { await delay(50); return { image_max_size_mb: 5 }; },
};

// ─── Applications ────────────────────────────────────────────────
export const mockApplicationsApi = {
  list: async (params?: { property?: string; status?: string }) => {
    await delay();
    let result = [...mockApplications];
    if (params?.property) result = result.filter((a) => a.property === params.property);
    if (params?.status) result = result.filter((a) => a.status === params.status);
    return result;
  },
  create: async (data: { property: string; message?: string }) => {
    await delay();
    const prop = mockProperties.find((p) => p.id === data.property);
    return {
      id: `app-new-${Date.now()}`,
      property: data.property,
      property_title: prop?.title || "Unknown",
      tenant: "t1",
      tenant_name: "Amina Juma",
      message: data.message || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };
  },
  updateStatus: async (id: string, status: string) => {
    await delay();
    return { id, status };
  },
  getTenantProfile: async (_id: string) => {
    await delay();
    return mockUsers.tenant;
  },
  canMessage: async (_propertyId: string) => {
    await delay();
    return { can_message_landlord: true };
  },
  canRequestViewing: async (propertyId: string) => {
    await delay();
    const app = mockApplications.find((a) => a.property === propertyId && a.status === "approved");
    return { can_request_viewing: !!app };
  },
};

// ─── Viewings ────────────────────────────────────────────────────
export const mockViewingsApi = {
  list: async () => { await delay(); return [...mockViewings]; },
  create: async (data: any) => {
    await delay();
    return {
      id: `v-new-${Date.now()}`,
      ...data,
      status: "pending",
      created_at: new Date().toISOString(),
    };
  },
  updateStatus: async (id: string, status: string) => { await delay(); return { id, status }; },
  complete: async (id: string) => { await delay(); return { id, status: "completed" }; },
};

// ─── Offers ──────────────────────────────────────────────────────
export const mockOffersApi = {
  list: async () => { await delay(); return [...mockOffers]; },
  create: async (data: any) => {
    await delay();
    return { id: `o-new-${Date.now()}`, ...data, status: "pending", created_at: new Date().toISOString() };
  },
  accept: async (id: string) => { await delay(); return { id, status: "accepted" }; },
  reject: async (id: string) => { await delay(); return { id, status: "rejected" }; },
  withdraw: async (id: string) => { await delay(); return { id, status: "withdrawn" }; },
};

// ─── Leases ──────────────────────────────────────────────────────
export const mockLeasesApi = {
  list: async () => { await delay(); return [...mockLeases]; },
  create: async (data: any) => {
    await delay();
    return { id: `lease-new-${Date.now()}`, ...data, status: "draft", created_at: new Date().toISOString() };
  },
  sign: async (id: string) => { await delay(); return { id, status: "signed", signed_at: new Date().toISOString() }; },
  landlordConfirm: async (id: string) => { await delay(); return { id, status: "active" }; },
  activate: async (id: string) => { await delay(); return { id, status: "active" }; },
  close: async (id: string) => { await delay(); return { id, status: "closed" }; },
  terminate: async (id: string) => { await delay(); return { id, status: "terminated" }; },
  uploadContract: async () => { await delay(); return { status: "uploaded" }; },
  generateContract: async () => { await delay(); return { status: "generated" }; },
  downloadContract: async () => { await delay(); return true; },
};

// ─── Invoices & Payments ─────────────────────────────────────────
export const mockInvoicesApi = {
  list: async () => { await delay(); return [...mockInvoices]; },
};

export const mockPaymentsApi = {
  list: async () => { await delay(); return [...mockPayments]; },
  invoices: async () => { await delay(); return [...mockInvoices]; },
  create: async (data: any) => {
    await delay();
    return { id: `pay-new-${Date.now()}`, ...data, status: "initiated", created_at: new Date().toISOString() };
  },
  listingPlans: async () => {
    await delay();
    return [
      { id: 1, name: "Basic", price: 50000, duration_days: 30 },
      { id: 2, name: "Premium", price: 100000, duration_days: 60 },
    ];
  },
  listingIntents: {
    list: async () => { await delay(); return []; },
    create: async (data: any) => { await delay(); return { id: `li-${Date.now()}`, ...data, status: "pending" }; },
    requestConfirmation: async () => { await delay(); return { status: "pending_confirmation" }; },
    confirm: async (id: string) => { await delay(); return { id, status: "confirmed" }; },
    reject: async (id: string) => { await delay(); return { id, status: "rejected" }; },
    override: async (id: string) => { await delay(); return { id, status: "overridden" }; },
  },
};

// ─── Messages ────────────────────────────────────────────────────
export const mockMessagesApi = {
  openConversation: async () => { await delay(); return mockConversations[0]; },
  listConversations: async () => { await delay(); return [...mockConversations]; },
  getConversation: async (id: string) => {
    await delay();
    return mockConversations.find((c) => c.id === id) || mockConversations[0];
  },
  listMessages: async (_conversationId: string) => { await delay(); return [...mockMessages]; },
  send: async (data: { conversation: string; content: string }) => {
    await delay();
    const user = getCurrentMockUser();
    return {
      id: `msg-new-${Date.now()}`,
      conversation: data.conversation,
      sender: user?.id || "t1",
      sender_name: user?.full_name || "Demo User",
      content: data.content,
      created_at: new Date().toISOString(),
    };
  },
};

// ─── Audit ───────────────────────────────────────────────────────
export const mockAuditApi = {
  lifecycle: async () => { await delay(); return [...mockAuditLogs]; },
};

// ─── Features ────────────────────────────────────────────────────
export const mockFeaturesApi = {
  list: async () => {
    await delay();
    return [
      { id: 1, name: "WiFi" },
      { id: 2, name: "Parking" },
      { id: 3, name: "AC" },
      { id: 4, name: "24/7 Security" },
      { id: 5, name: "Swimming Pool" },
      { id: 6, name: "Gym" },
      { id: 7, name: "Garden" },
      { id: 8, name: "Elevator" },
      { id: 9, name: "Water Supply" },
      { id: 10, name: "Backup Generator" },
    ];
  },
};

// ─── Moderation ──────────────────────────────────────────────────
export const mockModerationApi = {
  reports: {
    list: async () => { await delay(); return []; },
    create: async (data: any) => { await delay(); return { id: `rep-${Date.now()}`, ...data, status: "pending" }; },
    underReview: async (id: string) => { await delay(); return { id, status: "under_review" }; },
    resolve: async (id: string) => { await delay(); return { id, status: "resolved" }; },
    dismiss: async (id: string) => { await delay(); return { id, status: "dismissed" }; },
  },
  blocks: {
    list: async () => { await delay(); return []; },
    create: async (data: any) => { await delay(); return { id: `block-${Date.now()}`, ...data }; },
    unblock: async (id: string) => { await delay(); return { id, status: "unblocked" }; },
  },
};

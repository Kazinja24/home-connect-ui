

# NIKONEKTI — API Integration & Missing Features Plan

## Summary

Cross-referencing the Django backend serializers with the current frontend reveals that all UI pages exist but use **mock data with no real API calls**. There are also **type mismatches**, **missing features** (Payment, Property Edit/Delete), and a **missing backend model** (Application).

---

## What Needs to Be Done

### 1. Create API Service Layer

Create a centralized API client (`src/lib/api.ts`) that handles:
- Base URL configuration
- JWT token storage and automatic attachment to requests
- Response/error handling helpers
- Organized endpoint functions for each resource (auth, properties, viewings, leases, payments)

### 2. Fix Type Mismatches (align frontend types with backend)

Update `src/types/index.ts` to match the Django models:

- **Property**: rename `landlordId` to `owner`, replace `available: boolean` with `status: string`, add `created_at: string`
- **ViewingRequest**: add `created_at: string`
- **LeaseAgreement**: replace `acknowledged: boolean` with `status: string`, add `signed_at`, `terminated_at` fields, remove `houseRules`/`specialConditions` if not in backend
- **Add Payment type**: `id`, `propertyId`, `tenantId`, `amount`, `status`, `reference`, plus any other fields from the backend model

### 3. Wire Auth to Real API

Update `AuthContext.tsx`:
- `login()` calls `POST /api/auth/login/` and stores JWT token
- `register()` calls `POST /api/auth/register/` with `email`, `password`, `full_name`, `role`
- `logout()` clears stored token
- Add token refresh logic placeholder
- Role-based redirect uses actual role from API response (not hardcoded "tenant")

### 4. Wire Property Features to API

- **Discovery page**: fetch from `GET /api/properties/` with query params for filters
- **Details page**: fetch from `GET /api/properties/:id/`
- **Landlord - Add property**: `POST /api/properties/` (owner auto-set by backend)
- **Landlord - Edit property**: add edit route + form, call `PUT /api/properties/:id/`
- **Landlord - Delete property**: add delete confirmation dialog, call `DELETE /api/properties/:id/`
- **Image upload**: add file upload component that posts to the backend

### 5. Wire Viewing Features to API

- **Tenant - Request viewing**: modal submits `POST /api/viewings/`
- **Tenant - List viewings**: fetch from `GET /api/viewings/`
- **Landlord - List viewings**: fetch from `GET /api/viewings/` (filtered by landlord's properties)
- **Landlord - Approve/Reject**: `PATCH /api/viewings/:id/` with status update

### 6. Wire Lease Features to API

- **Landlord - Create lease**: form submits `POST /api/leases/`
- **Tenant - View leases**: fetch from `GET /api/leases/`
- **Tenant - Sign/Acknowledge**: `PATCH /api/leases/:id/` with signed status

### 7. Add Payment Feature (NEW)

This is entirely missing from the frontend but exists in the backend:
- Add `Payment` type to `src/types/index.ts`
- Create `src/pages/tenant/TenantPayments.tsx` — table showing payment history with status badges
- Create `src/pages/landlord/LandlordPayments.tsx` — view payments received
- Add payment routes to `App.tsx` and sidebar navigation in `DashboardLayout.tsx`
- Wire to `GET /api/payments/` and `POST /api/payments/`

### 8. Add Missing Property Management Actions (Edit & Delete)

- **Edit**: Create a property edit form page at `/dashboard/properties/:id/edit`, pre-populated from API
- **Delete**: Add delete button with confirmation dialog on the landlord properties table
- Update `LandlordProperties.tsx` to include Edit/Delete action buttons per row

### 9. Application Feature — Backend Gap

The frontend has an Application feature (types, tenant tab, landlord review page) but **no backend serializer was provided**. Two options:
- **Option A**: Keep the frontend Application UI as-is, ready for when a backend `ApplicationSerializer` is created
- **Option B**: Remove Application from frontend until backend supports it

Recommendation: Keep it as-is with mock data and a note that the backend endpoint is pending.

---

## Technical Details

### File Changes Summary

| File | Change |
|---|---|
| `src/lib/api.ts` | **NEW** — API client with auth headers, base URL, endpoint functions |
| `src/types/index.ts` | **UPDATE** — Align types with backend; add `Payment` interface |
| `src/contexts/AuthContext.tsx` | **UPDATE** — Real API calls for login/register, JWT token management |
| `src/pages/Properties.tsx` | **UPDATE** — Fetch from API instead of mock data |
| `src/pages/PropertyDetails.tsx` | **UPDATE** — Fetch from API, wire viewing request modal |
| `src/pages/tenant/TenantViewings.tsx` | **UPDATE** — Fetch viewings, applications, leases from API |
| `src/pages/tenant/TenantPayments.tsx` | **NEW** — Payment history page |
| `src/pages/landlord/LandlordProperties.tsx` | **UPDATE** — Add Edit/Delete actions, wire CRUD to API |
| `src/pages/landlord/LandlordViewings.tsx` | **UPDATE** — Wire approve/reject to API |
| `src/pages/landlord/LandlordApplications.tsx` | **UPDATE** — Wire approve/reject to API |
| `src/pages/landlord/LandlordLeases.tsx` | **UPDATE** — Wire form submit to API |
| `src/pages/landlord/LandlordPayments.tsx` | **NEW** — Payments received page |
| `src/components/layouts/DashboardLayout.tsx` | **UPDATE** — Add Payment nav items for tenant and landlord |
| `src/App.tsx` | **UPDATE** — Add payment routes, property edit route |

### API Client Structure (`src/lib/api.ts`)

```text
api.ts
  +-- getToken() / setToken() / clearToken()
  +-- apiClient (fetch wrapper with auth headers)
  +-- auth.login(email, password)
  +-- auth.register(email, password, full_name, role)
  +-- properties.list(filters?)
  +-- properties.get(id)
  +-- properties.create(data)
  +-- properties.update(id, data)
  +-- properties.delete(id)
  +-- viewings.list()
  +-- viewings.create(data)
  +-- viewings.updateStatus(id, status)
  +-- leases.list()
  +-- leases.create(data)
  +-- leases.sign(id)
  +-- payments.list()
  +-- payments.create(data)
```

### Notes

- All API calls will use `@tanstack/react-query` for data fetching (already installed)
- The base API URL will be configurable via environment variable
- Error handling will show toast notifications using the existing `sonner` setup
- Loading states will use skeleton components already available in the UI library


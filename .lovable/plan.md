

# NIKONEKTI — Rental Housing Platform Frontend

A clean, modern, mobile-responsive rental housing platform connecting Tenants, Landlords, and Admins. Built with a SaaS dashboard aesthetic inspired by Notion/Airbnb.

---

## Phase 1: Foundation & Public Pages

### App Layout & Routing
- Set up role-based routing structure with protected route wrappers
- Create a shared public layout (header with nav + footer) and authenticated dashboard layout with role-based sidebar navigation
- Define placeholder auth context for role detection and redirects

### Landing Page
- **Hero section** with prominent search bar ("Search rooms, apartments, or areas…")
- **How it Works** — 4-step visual flow: Discover → Request Viewing → Apply → Lease
- **Featured Properties** — responsive grid of property cards (placeholder data, API-ready)
- **Benefits section** — split view for Tenants & Landlords
- **CTA section** — "Register as Tenant" / "Register as Landlord" buttons
- **Footer** with navigation links

### Authentication Pages
- **Register page** with role selector (Tenant/Landlord), full name, phone, email, password, confirm password — with validation
- **Login page** with email/password — redirects by role after login
- Both pages are clean, centered card layouts

---

## Phase 2: Property Discovery & Details

### Property Discovery Page
- **Filter sidebar/panel**: location input, property type dropdown, price range, bedrooms, availability toggle
- **Property grid**: responsive cards showing image, title, price, location, bedrooms, and "View Details" button
- Filters are wired to state, ready for API query params

### Property Details Page
- **Image gallery** with thumbnail navigation
- **Property info**: description, amenities list, house rules
- **Landlord preview card** (name, contact info — no chat)
- **"Request Viewing" button** opening a modal with date picker and time window selector (Morning/Afternoon/Evening)

---

## Phase 3: Tenant Dashboard

A tabbed dashboard layout:

1. **My Viewing Requests** — list/table with status badges (Pending / Approved / Rejected)
2. **My Applications** — submitted applications with status tracking
3. **Lease Agreements** — view lease details with "Acknowledge Agreement" button

---

## Phase 4: Landlord Dashboard

Sidebar-navigated dashboard with sections:

1. **Overview** — stat cards for total properties, pending viewings, pending applications
2. **Properties Management** — table listing properties with Add/Edit/Delete actions; property form with all fields including image upload
3. **Viewing Requests** — list of tenant requests with Approve/Reject action buttons
4. **Applications Review** — tenant application details (employment, length of stay, occupants) with Approve/Reject
5. **Lease Creator** — form to generate lease with house rules, special conditions, and publish action

---

## Phase 5: Admin Control Panel

Sidebar-navigated admin panel:

1. **Platform Overview** — dashboard cards: total users, landlords, tenants, active properties
2. **User Management** — searchable user table with suspend action + reason modal
3. **Property Oversight** — property table with flag/disable listing actions
4. **Analytics** — application-to-agreement conversion metric display

---

## Design System & Components

- **Color palette**: Professional blues/neutrals with accent colors for CTAs and status badges
- **Reusable components**: StatusBadge, PropertyCard, StatCard, DataTable, FilterPanel, FormModal, role-based Sidebar
- **Mobile-first responsive** design across all pages
- **All actions** (form submits, approve/reject, etc.) are wired as async API call placeholders with loading states and toast notifications


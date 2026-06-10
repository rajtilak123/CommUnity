# CommUnity — Stitch Screen Inventory & Implementation Plan

> **Source:** `stitch_assets/` (exported from Stitch; user path `stitch-assets`)  
> **Design system:** `stitch_assets/PROMPT 3/.../DESIGN.md` (canonical)  
> **Total exported screens:** 22 HTML + PNG pairs across PROMPT 1, 2, and 4  
> **Screens not exported:** Polls, admin login, events/RSVP, payments (referenced in nav/mockups only)

---

## 1. Design System Summary (from DESIGN.md)

| Area | Specification |
|------|----------------|
| **Brand** | Professional, community-centric; admin = data-dense desktop-first; resident = mobile-first, breathable |
| **Primary color** | Indigo `#4F46E5` / `#3525cd` |
| **Typography** | Inter only; display/headline/body/label scale |
| **Layout** | 8px grid; admin sidebar 280px; container max 1440px; resident 16px margins |
| **Elevation** | 1px borders over shadows; shadows for modals/dropdowns only |
| **Semantic colors** | Priority: Low/Medium/High/Urgent; Status: Open/In Progress/Resolved/Closed |
| **Dark mode** | Native support via `class` strategy (already wired via `next-themes`) |

**Integration note:** Map DESIGN.md tokens into `globals.css` / Tailwind theme (Material-style surface tokens already used in Stitch HTML).

---

## 2. Screen Inventory

### 2.1 Authentication

| Screen Name | Role | Stitch Folder | Suggested Route | Database Tables | Reusable Components |
|-------------|------|---------------|-----------------|-----------------|---------------------|
| Resident Login | Public | `resident_login_1` | `/login` | `profiles`, `societies` (tenant context), Supabase `auth.users` | `AuthLayout`, `LoginForm`, `SocialAuthButtons`, `FormField`, `PasswordInput`, `Button`, `Divider` |

**UI elements:** Email/phone, password, remember me, forgot password, Google/Facebook OAuth, request access link.

---

### 2.2 Dashboards

| Screen Name | Role | Stitch Folder | Suggested Route | Database Tables | Reusable Components |
|-------------|------|---------------|-----------------|-----------------|---------------------|
| Admin Dashboard | Admin | `admin_dashboard` | `/admin/dashboard` | `societies`, `profiles`, `complaints`, `notices`, `bookings`, `polls` (future), `activity_log` (view) | `AdminShell`, `AdminSidebar`, `MetricCard`, `ChartCard`, `ActivityFeed`, `ActivityFeedItem`, `DateRangeFilter`, `Button`, `StatusBadge` |
| Resident Dashboard | Resident | `resident_dashboard_1` | `/dashboard` | `profiles`, `complaints`, `notices`, `notice_reads`, `bookings`, `polls` (future), `activity_log` | `ResidentShell`, `ResidentTopBar`, `BottomNav`, `MetricCard`, `QuickActionGrid`, `ActivityFeed`, `FeaturedEventCard`, `FAB`, `Avatar` |

**Admin metrics:** Total residents, open complaints, resolved count, active polls, pending bookings, complaint trends chart, category breakdown, recent activity.

**Resident metrics:** Open complaints, unread notices, active poll, pending bookings, quick actions (complaint, notices, polls, book facility).

---

### 2.3 Complaints (PROMPT 1)

| Screen Name | Role | Stitch Folder | Suggested Route | Database Tables | Reusable Components |
|-------------|------|---------------|-----------------|-----------------|---------------------|
| My Complaints | Resident | `my_complaints_1` | `/complaints` | `complaints`, `complaint_attachments`, `profiles` | `ResidentShell`, `SearchInput`, `FilterChips`, `ComplaintCard`, `ComplaintStatsRow`, `PriorityBadge`, `StatusBadge`, `FAB`, `EmptyState` |
| Raise Complaint | Resident | `raise_complaint` | `/complaints/new` | `complaints`, `complaint_attachments`, Supabase Storage `complaint-images` | `PageHeader`, `ComplaintForm`, `Select`, `SegmentedControl` (priority), `Textarea`, `ImageUpload`, `Button` |
| Complaint Details (Resident) | Resident | `complaint_details` | `/complaints/[id]` | `complaints`, `complaint_attachments`, `complaint_comments`, `complaint_status_history`, `profiles` | `BackHeader`, `ComplaintDetailHeader`, `StatusBadge`, `PriorityBadge`, `ImageGallery`, `StatusTimeline`, `CommentThread`, `CommentComposer` |
| Manage Complaints | Admin | `manage_complaints` | `/admin/complaints` | `complaints`, `profiles`, `units` | `AdminShell`, `PageHeader`, `Breadcrumbs`, `SearchInput`, `FilterBar`, `DataTable`, `StatusBadge`, `PriorityBadge`, `Avatar`, `RowActions`, `Pagination`, `ExportButton` |
| Admin Complaint Details | Admin | `admin_complaint_details` | `/admin/complaints/[id]` | `complaints`, `complaint_attachments`, `complaint_comments`, `complaint_status_history`, `profiles`, `units` | `AdminShell`, `Breadcrumbs`, `ResidentInfoCard`, `ComplaintDetailCard`, `ImageGallery`, `CommentThread`, `RichCommentEditor`, `StatusActionPanel`, `ActivityTimeline`, `AssigneeSelect` |

**Complaint fields (inferred):** title, description, category (plumbing, electrical, security, housekeeping, parking, maintenance, noise, amenities), priority (low/medium/high/urgent/critical), status (open/in_progress/resolved/closed), reference ID, assigned_to, society_id, resident_id, unit_id, created_at.

---

### 2.4 Notices & Announcements (PROMPT 2)

| Screen Name | Role | Stitch Folder | Suggested Route | Database Tables | Reusable Components |
|-------------|------|---------------|-----------------|-----------------|---------------------|
| Notices Feed | Resident | `notices` | `/notices` | `notices`, `notice_reads`, `profiles` | `ResidentShell`, `NoticeCard`, `FeedList`, `PinnedBadge`, `UnreadIndicator`, `BottomNav` |
| Notice Details | Resident | `notice_details` | `/notices/[id]` | `notices`, `notice_attachments`, `notice_reads` | `BackHeader`, `NoticeDetail`, `AttachmentList`, `RichTextContent`, `ShareButton` |
| Manage Notices | Admin | `manage_notices` | `/admin/notices` | `notices`, `profiles` | `AdminShell`, `SearchInput`, `DataTable`, `StatusBadge` (published/draft/archived), `PinIndicator`, `RowActions`, `Button` (create) |
| Create Notice | Admin | `create_notice` | `/admin/notices/new` | `notices`, `notice_attachments`, Supabase Storage `notice-files` | `NoticeForm`, `RichTextEditor`, `DatePicker`, `Switch` (pin), `FileUpload`, `Button` |
| Notification Center | Resident | `notifications` | `/notifications` | `notifications`, `profiles` | `ResidentShell`, `NotificationList`, `NotificationGroup`, `NotificationItem`, `UnreadDot`, `MarkAllReadButton` |

**Notice fields:** title, content (HTML/markdown), expiry_date, is_pinned, published_at, status, society_id, created_by, attachments.

**Notification types:** complaint_update, notice, poll, booking (polymorphic `entity_type` + `entity_id`).

---

### 2.5 Facilities & Bookings (PROMPT 4)

| Screen Name | Role | Stitch Folder | Suggested Route | Database Tables | Reusable Components |
|-------------|------|---------------|-----------------|-----------------|---------------------|
| Facilities List | Resident | `facilities_list` | `/facilities` | `facilities`, `bookings` (availability) | `ResidentShell`, `FacilityCard`, `AvailabilityBadge`, `TopAppBar` |
| Facility Details | Resident | `facility_details` | `/facilities/[id]` | `facilities`, `facility_amenities`, `bookings`, `facility_time_slots` | `HeroImage`, `AmenityChips`, `CalendarStrip`, `TimeSlotGrid`, `BookNowButton` |
| Booking Request | Resident | `booking_request` | `/bookings/new` or `/facilities/[id]/book` | `bookings`, `facilities`, `profiles` | `BookingForm`, `Select` (amenity), `DatePicker`, `TimeSlotPicker`, `Textarea` (notes), `Button` |
| My Bookings | Resident | `my_bookings_1` | `/bookings` | `bookings`, `facilities`, `profiles` | `BookingCard`, `FilterTabs` (pending/confirmed/past), `StatusBadge`, `EmptyState`, `BottomNav` |
| Facility Management | Admin | `facility_management` | `/admin/facilities` | `facilities`, `bookings` | `AdminShell`, `MetricCard`, `FacilityTable`, `StatusToggle`, `RowActions`, `Button` (add facility) |
| *(Gap)* Create/Edit Facility | Admin | — | `/admin/facilities/new`, `/admin/facilities/[id]/edit` | `facilities`, `facility_amenities` | `FacilityForm`, `ImageUpload`, `AmenityEditor` |

**Facility fields:** name, description, image_url, capacity, amenities[], status (available/maintenance/disabled), society_id, booking_rules.

**Booking fields:** facility_id, resident_id, date, start_time, end_time, status (pending/confirmed/rejected/cancelled), notes.

---

### 2.6 Residents & Society (PROMPT 4)

| Screen Name | Role | Stitch Folder | Suggested Route | Database Tables | Reusable Components |
|-------------|------|---------------|-----------------|-----------------|---------------------|
| Resident Directory | Admin | `resident_management` | `/admin/residents` | `profiles`, `units`, `societies` | `AdminShell`, `SearchInput`, `FilterChips`, `DataTable`, `Avatar`, `UnitBadge`, `StatusBadge`, `RowActions`, `Button` (invite) |
| Invite Resident | Admin | `invite_resident` | `/admin/residents/invite` | `resident_invitations`, `profiles`, `units`, `societies` | `InviteResidentForm`, `FormField`, `Breadcrumbs`, `Button` |
| Society Settings | Admin | `society_settings` | `/admin/settings` | `societies`, Supabase Storage `society-assets` | `SettingsForm`, `ImageUpload` (logo), `ThemePreview`, `AddressFields`, `Button` |
| Profile | Resident | `profile` | `/profile` | `profiles`, `auth.users` | `ResidentShell`, `ProfileCard`, `ThemeToggle`, `SettingsList`, `LogoutButton`, `Avatar` |

**Invite fields:** full_name, email, phone, flat/unit number, society_id, invitation token, status.

**Society settings fields:** name, logo, contact_email, phone, website, address (street, city, state, zip), theme preferences.

**Profile fields:** name, email, phone, unit, avatar_url, theme preference.

---

## 3. Proposed Database Schema (Supabase)

Core tables to create before screen integration (extends existing `societies`):

```
societies              (exists)
units                    society_id, label, block, floor
profiles                 id → auth.users, society_id, unit_id, role, full_name, phone, avatar_url
complaints               society_id, resident_id, unit_id, title, description, category, priority, status, assigned_to
complaint_attachments    complaint_id, storage_path, file_name
complaint_comments       complaint_id, author_id, body, is_internal
complaint_status_history complaint_id, status, changed_by, note
notices                  society_id, title, content, expiry_date, is_pinned, status, created_by
notice_attachments       notice_id, storage_path, file_name
notice_reads             notice_id, profile_id, read_at
notifications            profile_id, type, title, body, entity_type, entity_id, read_at
facilities               society_id, name, description, image_url, capacity, status
facility_amenities       facility_id, amenity
bookings                 facility_id, resident_id, booking_date, start_time, end_time, status, notes
resident_invitations     society_id, email, full_name, phone, unit_label, token, status, invited_by
```

**Enums:** `user_role` (admin, resident), `complaint_status`, `complaint_priority`, `complaint_category`, `booking_status`, `notice_status`, `notification_type`.

**RLS:** Society-scoped; residents read/write own data; admins read/write society data.

---

## 4. Proposed Route Architecture

Aligns with existing `(admin)` and `(resident)` route groups:

```
src/app/
├── (auth)/
│   └── login/page.tsx                    ← resident_login_1
├── (resident)/
│   ├── layout.tsx                        ← ResidentShell (enhanced)
│   ├── dashboard/page.tsx
│   ├── complaints/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── notices/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── notifications/page.tsx
│   ├── facilities/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── bookings/
│   │   ├── page.tsx
│   │   └── new/page.tsx
│   └── profile/page.tsx
├── (admin)/
│   ├── layout.tsx                        ← AdminShell (enhanced)
│   ├── dashboard/page.tsx
│   ├── complaints/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── notices/
│   │   ├── page.tsx
│   │   └── new/page.tsx
│   ├── facilities/page.tsx
│   ├── residents/
│   │   ├── page.tsx
│   │   └── invite/page.tsx
│   └── settings/page.tsx
└── middleware.ts                         ← auth + role guards
```

**Auth redirects:** `/` → `/dashboard` (resident) or `/admin/dashboard` (admin) based on `profiles.role`.

---

## 5. Shared Component Library

Build under `src/components/` before page work:

### Layout
| Component | Used By |
|-----------|---------|
| `AdminSidebar` | All admin screens |
| `AdminHeader` | All admin screens |
| `ResidentTopBar` | Resident screens |
| `ResidentBottomNav` | Resident mobile |
| `PageHeader` | All list/detail pages |
| `Breadcrumbs` | Admin detail/form pages |

### Data Display
| Component | Used By |
|-----------|---------|
| `MetricCard` | Dashboards, complaint stats |
| `StatusBadge` | Complaints, bookings, notices |
| `PriorityBadge` | Complaints |
| `DataTable` | Admin list screens |
| `ComplaintCard` | Resident complaints list |
| `NoticeCard` | Notices feed |
| `FacilityCard` | Facilities list |
| `BookingCard` | My bookings |
| `ActivityFeed` / `ActivityFeedItem` | Dashboards |
| `NotificationItem` | Notification center |
| `EmptyState` | All lists |
| `Avatar` | Universal |

### Forms & Input
| Component | Used By |
|-----------|---------|
| `FormField` | All forms |
| `SearchInput` | List screens |
| `FilterChips` | Complaints, residents |
| `FilterBar` | Admin tables |
| `Select` | Forms |
| `SegmentedControl` | Priority, theme |
| `Switch` | Pin notice, toggles |
| `DatePicker` | Notices, bookings |
| `TimeSlotPicker` | Facility booking |
| `CalendarStrip` | Facility details |
| `ImageUpload` / `FileUpload` | Complaints, notices, society |
| `RichTextEditor` | Create notice, admin comments |

### Feature-Specific
| Component | Used By |
|-----------|---------|
| `StatusTimeline` | Complaint details |
| `CommentThread` / `CommentComposer` | Complaint details |
| `ImageGallery` | Complaint details |
| `ChartCard` | Admin dashboard |
| `FAB` | Resident complaints |
| `ThemeToggle` | Profile |

**shadcn/ui primitives to add first:** `button`, `input`, `textarea`, `select`, `badge`, `card`, `table`, `dialog`, `dropdown-menu`, `tabs`, `switch`, `avatar`, `separator`, `sheet` (mobile nav), `calendar`, `popover`, `form`.

---

## 6. Implementation Plan (Phased)

### Phase 0 — Foundation (current + design tokens)
- [ ] Map DESIGN.md colors/typography/spacing into Tailwind v4 theme (`globals.css`)
- [ ] Add Lucide icons OR Material Symbols package (Stitch uses Material Symbols)
- [ ] Install core shadcn components
- [ ] Generate Supabase TypeScript types from schema
- [ ] Add `profiles.role` auth helpers (`requireAdmin`, `requireResident`)
- [ ] Enhance `AdminShell` / `ResidentShell` with real nav from inventory

### Phase 1 — Auth & Profiles
- [ ] `/login` from `resident_login_1`
- [ ] Supabase Auth (email/password; OAuth optional)
- [ ] Profile bootstrap on signup / invite acceptance
- [ ] Middleware role-based route protection
- [ ] `/profile` screen

**Deliverable:** Users can log in, see profile, switch theme.

### Phase 2 — Society & Admin Settings
- [ ] Migrate/extend `societies` table per settings form
- [ ] `/admin/settings` (society_settings)
- [ ] `/admin/residents` + `/admin/residents/invite`
- [ ] Resident invitation flow (email magic link)

**Deliverable:** Admin can configure society and onboard residents.

### Phase 3 — Complaints Module
- [ ] DB: complaints + attachments + comments + history
- [ ] Storage bucket + RLS for complaint images
- [ ] Resident: `/complaints`, `/complaints/new`, `/complaints/[id]`
- [ ] Admin: `/admin/complaints`, `/admin/complaints/[id]`
- [ ] Server actions + Zod schemas for CRUD
- [ ] Notifications on status change

**Deliverable:** End-to-end complaint lifecycle.

### Phase 4 — Notices Module
- [ ] DB: notices + attachments + reads
- [ ] Resident: `/notices`, `/notices/[id]`
- [ ] Admin: `/admin/notices`, `/admin/notices/new`
- [ ] `/notifications` aggregation layer
- [ ] Unread counts on dashboard + bottom nav

**Deliverable:** Admin publishes notices; residents read and get notified.

### Phase 5 — Facilities & Bookings
- [ ] DB: facilities + amenities + bookings
- [ ] Resident: `/facilities`, `/facilities/[id]`, `/bookings`, `/bookings/new`
- [ ] Admin: `/admin/facilities` (+ create/edit gap screens)
- [ ] Availability logic / conflict checks
- [ ] Booking approval workflow (pending → confirmed)

**Deliverable:** Residents book amenities; admin manages facilities.

### Phase 6 — Dashboards & Analytics
- [ ] `/dashboard` resident aggregation queries
- [ ] `/admin/dashboard` metrics + charts (Recharts or similar)
- [ ] Unified `activity_log` view (complaints, notices, bookings, polls placeholder)
- [ ] Remove `/test-db` or gate behind dev flag

**Deliverable:** Both dashboards live with real data.

### Phase 7 — Polish & Gaps
- [ ] Polls module (nav exists, no Stitch screens — defer or design separately)
- [ ] Admin login screen (if distinct from resident)
- [ ] Events/RSVP (dashboard mockup only)
- [ ] Export report (manage complaints)
- [ ] Mobile responsive QA per DESIGN.md reflow rules
- [ ] Dark mode pass on all screens

---

## 7. Data Fetching Patterns

| Pattern | Screens |
|---------|---------|
| **Server Component + Supabase server client** | List pages, dashboards, detail pages (read) |
| **Server Actions** | Forms: raise complaint, create notice, invite resident, booking request, settings save |
| **React Hook Form + Zod** | All forms with client validation |
| **Optimistic UI** | Mark notification read, filter chips |
| **Suspense + loading.tsx** | Each route group |
| **error.tsx** | Per feature area |

---

## 8. Navigation Matrix

| Nav Item | Resident Route | Admin Route |
|----------|----------------|-------------|
| Dashboard | `/dashboard` | `/admin/dashboard` |
| Complaints | `/complaints` | `/admin/complaints` |
| Notices | `/notices` | `/admin/notices` |
| Notifications | `/notifications` | — (header bell → notifications) |
| Bookings | `/bookings` | `/admin/facilities` (bookings mgmt TBD) |
| Facilities | `/facilities` | `/admin/facilities` |
| Residents | — | `/admin/residents` |
| Profile | `/profile` | profile in sidebar footer |
| Settings | theme in `/profile` | `/admin/settings` |
| Polls | *(not exported)* | *(not exported)* |

---

## 9. Risks & Decisions

| Item | Recommendation |
|------|----------------|
| **Stitch HTML → React** | Rebuild with components; do not port raw HTML |
| **Material Symbols vs Lucide** | Match Stitch with `@material-symbols/font-400` or map to Lucide |
| **Rich text editor** | Start with Markdown/textarea; add Tiptap in Phase 4 if needed |
| **Multi-society** | `societies` table exists; scope all queries by `society_id` from profile |
| **Admin vs resident layouts** | Keep `(admin)` / `(resident)` groups; shared auth at `(auth)` |
| **Missing screens** | Facility create/edit, admin login, polls — track as backlog |

---

## 10. Suggested First Sprint (after this plan)

1. Phase 0: Design tokens + shadcn primitives + shell nav
2. Phase 1: Login + profile + middleware guards
3. Phase 3: Complaints (highest screen count, core workflow)

This delivers visible progress across 7 of 22 exported screens while establishing patterns for the rest.

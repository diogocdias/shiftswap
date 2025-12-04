# ShiftSwap - AI Assistant Guide

## Project Overview

ShiftSwap is a healthcare shift management application that enables healthcare staff to view schedules, request shift swaps, and manage team coordination. The application supports role-based access with three user types: regular users (staff), team leaders, and administrators.

**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- No external routing library (custom navigation)
- No external state management (React hooks only)

**Key Characteristics:**
- Mobile-first, responsive design
- Role-based feature access
- Mock data/API implementations (ready for backend integration)
- Component-based architecture
- Functional components with hooks

---

## Project Structure

```
shiftswap/
├── public/                      # Static assets
│   └── shiftswap_logo.png
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Main app component (routes to ShiftSwapHome)
│   ├── App.css                 # Legacy styles (minimal)
│   ├── index.css              # Tailwind imports
│   │
│   ├── public/                 # Public-facing pages
│   │   ├── ShiftSwapHome.tsx  # Landing/login page
│   │   └── LoginPage.tsx      # Login component
│   │
│   ├── components/            # Shared components
│   │   └── LoadingOverlay.tsx # Reusable loading component
│   │
│   └── dashboard/             # Main authenticated app
│       ├── Dashboard.tsx      # Main container (sidebar + content)
│       ├── USER_ROLES.ts      # Role definitions
│       │
│       ├── profile/
│       │   └── ProfileTab.tsx # User profile page with edit
│       │
│       ├── schedule/
│       │   ├── ScheduleTab.tsx       # Main schedule container
│       │   ├── ShiftConstants.ts     # Shift type definitions
│       │   ├── Types.ts              # TypeScript interfaces
│       │   └── components/
│       │       ├── CalendarView.tsx         # Monthly calendar view
│       │       ├── TeamView.tsx             # Team schedule table
│       │       ├── SwapRequestModal.tsx     # Shift swap dialog
│       │       └── GenerateScheduleModal.tsx # Schedule generation
│       │
│       └── requests/
│           ├── RequestsTab.tsx       # Main requests container
│           ├── Types.ts              # Request type definitions
│           ├── data/
│           │   └── mockSwapRequests.ts
│           └── components/
│               ├── AdminView.tsx         # Admin request view
│               ├── UserView.tsx          # User request view
│               ├── RenderRequestCard.tsx # Request card component
│               └── ShareModal.tsx        # Share dialog
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── CLAUDE.md              # This file
```

---

## Core Components Deep Dive

### 1. ShiftSwapHome (Login/Landing)
**Location:** `src/public/ShiftSwapHome.tsx`

**Purpose:** Authentication entry point (mock implementation)

**Features:**
- Mock login system (no real auth)
- Three user roles: `user`, `teamleader`, `admin`
- Stores session in `sessionStorage` (key: `'mockUser'`)

**Mock Users:**
```typescript
user@hospital.com / password      // Regular staff
leader@hospital.com / password    // Team leader
admin@hospital.com / password     // Administrator
```

**Session Data Structure:**
```typescript
{
  name: string;
  email: string;
  role: 'user' | 'teamleader' | 'admin';
  sessionId: string;
  profilePicture?: string | null;
  phone?: string;
  department?: string;
  employeeId?: string;
  facility?: string;
  startDate?: string;
}
```

---

### 2. Dashboard (Main Container)
**Location:** `src/dashboard/Dashboard.tsx`

**Purpose:** Primary authenticated app container with role-based navigation

**Architecture:**
- **Left Sidebar:** Collapsible navigation (56px mobile, 80px desktop)
- **Main Content:** Tab-based content area
- **Profile Section:** Sticky bottom profile with hover tooltip

**Dynamic Menu System:**
```typescript
// CMS-driven menu items (mock implementation)
const menuItems = await mockFetchMenuItems(sessionId);
// Returns role-specific menu configuration
```

**Available Tabs by Role:**
- **User:** Overview, Schedule, Requests, Profile
- **Team Leader:** Overview, Schedule, Team, Requests, Analytics, Profile
- **Admin:** Overview, Schedule, Team, Requests, Analytics, Settings, Profile

**State Management:**
```typescript
const [activeTab, setActiveTab] = useState('overview');
const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
const [isLoadingMenu, setIsLoadingMenu] = useState(true);
```

**TODO Items in Code:**
- Line 19-58: Replace `mockFetchMenuItems` with real CMS API
- Line 77-85: Replace mock session validation with real auth

---

### 3. ProfileTab (User Profile Management)
**Location:** `src/dashboard/profile/ProfileTab.tsx`

**Purpose:** View and edit user profile information

**Features:**
- **Editable Fields:** Name, email, phone, department, facility
- **Profile Picture:** Upload, preview, remove (base64 encoding)
- **Read-only Fields:** Employee ID, role, start date
- **Account Settings Stubs:** Change password, notifications, privacy

**State Management:**
```typescript
const [profile, setProfile] = useState<UserProfile>(/* ... */);
const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
```

**Image Upload:**
- Max file size: 5MB
- Formats: Any image/* MIME type
- Storage: Base64 in sessionStorage (not production-ready)
- Validation: File type and size checked client-side

**Profile Sync:**
- Updates sessionStorage on save (line 66-76)
- Auto-loads from sessionStorage on mount
- Success message displays for 3 seconds after save

---

### 4. ScheduleTab (Schedule Management)
**Location:** `src/dashboard/schedule/ScheduleTab.tsx`

**Purpose:** Multi-view schedule interface with swap functionality

**View Modes:**
1. **Team Schedule (Week):** 7-day team view (mobile + all roles)
2. **Team Schedule (Month):** Full month team view (desktop + admin/teamleader only)
3. **My Calendar:** Monthly personal calendar (all users)

**Shift Types:**
```typescript
type ShiftType = 'M' | 'A' | 'N' | 'R' | 'D';

// Definitions (see ShiftConstants.ts)
M - Morning (6:00 AM - 2:00 PM)    - Yellow
A - Afternoon (2:00 PM - 10:00 PM) - Orange
N - Night (10:00 PM - 6:00 AM)     - Blue
R - Rest Day                        - Green (dim)
D - Day Off                         - Gray (dim)
```

**Key Features:**
- **Name Filter:** Search team members by name
- **Week/Month Navigation:** Previous, next, today buttons
- **Shift Click:** Opens swap request modal
- **Pending Swaps:** Visual indicators (yellow ring)
- **Expandable Table:** Desktop-only fullscreen mode
- **Schedule Generation:** Admin/team leader can generate schedules

**Responsive Behavior:**
```typescript
const useIsDesktop = () => window.innerWidth >= 1024;
const isTeamMonthView = isDesktop && (userRole !== 'user');
```

**Mock Data Generation:**
```typescript
// Week view: generateMockShifts(startDate)
// Month view (personal): generateMonthShifts(year, month, userId)
// Month view (team): generateTeamMonthShifts(year, month)
```

**Schedule Generation (Admin/Team Leader):**
- Modal-based date range selection (src/dashboard/schedule/components/GenerateScheduleModal.tsx)
- Realistic shift distribution algorithm
- Loading overlay during generation
- Automatic merge with existing schedules

**Generation Rules:**
- ~2 rest/off days per week per person
- 15% chance of double shifts (M+A or A+N combinations)
- Higher rest day chance on weekends
- No combining rest/off days with working shifts

---

### 5. RequestsTab (Swap Request Management)
**Location:** `src/dashboard/requests/RequestsTab.tsx`

**Purpose:** Manage shift swap requests with role-based views

**View Types:**
- **User View:** Split into "Incoming" and "Outgoing" requests
- **Admin/Team Leader View:** All requests in single list

**Filter Options:**
```typescript
type Filter = 'all' | 'pending' | 'approved' | 'declined';
```

**Request Actions:**
- **Users:** Accept, decline (incoming), cancel (outgoing), share
- **Admin/Team Leader:** Approve, decline, view details, share

**Share Functionality:**
- WhatsApp, Telegram, Messenger, SMS, Copy to clipboard
- Pre-formatted share text with shift details
- Modal-based share interface (src/dashboard/requests/components/ShareModal.tsx)

**Request Card Features:**
- Mobile-optimized portrait mode layout
- Color-coded status badges
- Shift detail pills
- Hover effects and transitions

**Data Structure:**
```typescript
interface SwapRequest {
  id: number | string;
  from: string;         // Requester name
  fromId: string;       // Requester user ID
  to: string;           // Target person name
  toId: string;         // Target person ID
  fromShift: ShiftDetail;
  toShift: ShiftDetail;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;    // ISO date
}
```

---

### 6. LoadingOverlay (Shared Component)
**Location:** `src/components/LoadingOverlay.tsx`

**Purpose:** Reusable loading state with timeout handling

**Props:**
```typescript
interface LoadingOverlayProps {
  isLoading: boolean;
  timeout?: number;      // Default: 5000ms
  onTimeout?: () => void;
}
```

**Features:**
- Fullscreen overlay with backdrop
- Spinning loader animation
- Timeout detection and error display
- Click-to-dismiss error state

**Usage Pattern:**
```typescript
<LoadingOverlay
  isLoading={isGenerating}
  timeout={10000}
  onTimeout={() => {
    setIsGenerating(false);
    alert('Operation timed out');
  }}
/>
```

---

## State Management Patterns

### Session Storage
**Key:** `'mockUser'`
**Purpose:** User authentication and profile data
**Scope:** Global (shared across all components)

**Access Pattern:**
```typescript
const userDataString = sessionStorage.getItem('mockUser');
const userData = userDataString ? JSON.parse(userDataString) : null;
const userRole = userData?.role || 'user';
```

### Component State (Local)
**Common Patterns:**
```typescript
// Tab navigation
const [activeTab, setActiveTab] = useState('overview');

// Data filtering
const [filter, setFilter] = useState<'all' | 'pending'>('all');

// Modal visibility
const [showModal, setShowModal] = useState(false);

// Loading states
const [isLoading, setIsLoading] = useState(false);

// Form data
const [formData, setFormData] = useState<FormType | null>(null);
```

### Prop Drilling
- Dashboard → Tab components (activeTab, role, handlers)
- ScheduleTab → View components (data, handlers)
- RequestsTab → View components (data, actions)

**Note:** No context providers used (intentional simplicity)

---

## Mock APIs & Data

### 1. Menu Configuration API
**Location:** `Dashboard.tsx:21-57`
```typescript
const mockFetchMenuItems = async (sessionId: string): Promise<MenuItem[]>
```
- 300ms simulated delay
- Role-based menu items
- CMS-style configuration
- **TODO:** Replace with `/api/cms/menu`

### 2. Schedule Generation API
**Location:** `ScheduleTab.tsx:127-198`
```typescript
const mockGenerateScheduleAPI = async (
  startDate: string,
  endDate: string,
  teamMembers: TeamMember[]
): Promise<ShiftData>
```
- 200ms simulated delay
- Realistic shift distribution
- Follows business rules
- **TODO:** Replace with `/api/schedule/generate`

### 3. Mock Team Members
**Location:** `ScheduleTab.tsx:36-44`
```typescript
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', role: 'user' },
  // ... 7 members total
];
```

### 4. Mock Swap Requests
**Location:** `src/dashboard/requests/data/mockSwapRequests.ts`
- Pre-populated request examples
- Various statuses and dates
- Used for initial RequestsTab state

---

## Design System & Styling

### Tailwind Configuration
**File:** `tailwind.config.js`
```javascript
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
theme: { extend: {} }  // Using defaults
```

### Color Palette
```css
Primary:   blue-600  (#2563EB)
Success:   green-600 (#059669)
Warning:   yellow-500 (#EAB308)
Danger:    red-600   (#DC2626)
Neutral:   gray-50 to gray-900
```

### Shift Colors
```css
Morning (M):    bg-yellow-100 text-yellow-800
Afternoon (A):  bg-orange-100 text-orange-800
Night (N):      bg-blue-100 text-blue-800
Rest (R):       bg-green-50 text-green-700
Day Off (D):    bg-gray-100 text-gray-600
```

### Responsive Breakpoints
```css
sm:  640px   (small tablet)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
```

### Component Patterns

**Cards:**
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-4">
```

**Buttons (Primary):**
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
```

**Buttons (Secondary):**
```tsx
<button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
```

**Status Badges:**
```tsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
```

**Hover Tooltips:**
```tsx
<div className="group relative">
  <button>Hover me</button>
  <div className="hidden group-hover:block absolute ...">Tooltip</div>
</div>
```

---

## Development Workflows

### Local Development

**Install Dependencies:**
```bash
npm install
```

**Start Dev Server:**
```bash
npm run dev
# Runs on http://localhost:5173 (or next available port)
```

**Build for Production:**
```bash
npm run build
# Output: dist/
```

**Preview Production Build:**
```bash
npm run preview
```

**Lint Code:**
```bash
npm run lint
```

### File Organization Conventions

**Component Files:**
- PascalCase: `ComponentName.tsx`
- Default export for main component
- Named exports for interfaces/types if reused

**Type Definitions:**
- Separate `Types.ts` files per feature domain
- Interface over type alias (preferred)
- Export all interfaces

**Constants:**
- Uppercase with underscores: `SHIFT_LEGENDS`
- Centralized in dedicated files (e.g., `ShiftConstants.ts`)

**Mock Data:**
- Prefix with `MOCK_`: `MOCK_TEAM_MEMBERS`
- Separate folder: `data/mockSwapRequests.ts`

### Code Style

**TypeScript:**
- Strict mode enabled
- Explicit return types for complex functions
- Interface for object shapes
- Type for unions/primitives

**React:**
- Functional components only
- Hooks for state/effects
- Props interface above component
- Destructure props in signature

**Naming:**
- camelCase: variables, functions
- PascalCase: components, interfaces
- UPPER_SNAKE_CASE: constants

**Example:**
```typescript
interface ProfileTabProps {
  userId: string;
}

function ProfileTab({ userId }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    // Implementation
  };

  return <div>...</div>;
}

export default ProfileTab;
```

---

## Git Workflow

### Branching Strategy
- **Main Branch:** Production-ready code
- **Feature Branches:** `claude/[session-id]-[feature]` or similar naming
- All AI development happens on feature branches

### Commit Messages
Follow existing patterns in commit history:
```
Add user profile page with edit functionality (#2)
Fix request card layout for mobile portrait mode (#1)
Refactor code to componenterize schedule and request tabs
```

**Format:**
- Present tense, imperative mood
- Reference PR/issue numbers when applicable
- Focus on "what" and "why", not "how"

### PR Guidelines
- Clear title describing the change
- Summary section with bullet points
- Test plan checklist
- Screenshots for UI changes

---

## Backend Integration Points (TODOs)

### Authentication
**Current:** Client-side sessionStorage (INSECURE)
**Needed:**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/session` - Validate session
- JWT tokens or secure session cookies

### CMS API
**Current:** `mockFetchMenuItems()` in Dashboard.tsx
**Needed:**
- `POST /api/cms/menu` - Fetch role-based menu
- Request: `{ sessionId: string }`
- Response: `MenuItem[]`

### Schedule API
**Needed:**
- `GET /api/schedule/week?start={date}` - Weekly schedule
- `GET /api/schedule/month?year={y}&month={m}` - Monthly schedule
- `POST /api/schedule/generate` - Generate new schedules
- `GET /api/schedule/user/{id}` - Personal schedule

### Swap Requests API
**Needed:**
- `GET /api/swaps` - List swap requests (filtered by role)
- `POST /api/swaps` - Create swap request
- `PATCH /api/swaps/{id}` - Update status (approve/decline)
- `DELETE /api/swaps/{id}` - Cancel request

### Profile API
**Needed:**
- `GET /api/users/{id}` - Fetch user profile
- `PATCH /api/users/{id}` - Update profile
- `POST /api/users/{id}/avatar` - Upload profile picture
- `DELETE /api/users/{id}/avatar` - Remove profile picture

### Team API
**Needed:**
- `GET /api/teams/members` - List team members (role-filtered)
- `GET /api/teams/{id}/schedule` - Team schedule data

---

## Security Considerations

### Current Implementation (Mock/Dev)
- ⚠️ No encryption
- ⚠️ Client-side role validation
- ⚠️ SessionStorage (not secure)
- ⚠️ No CSRF protection
- ⚠️ No rate limiting
- ⚠️ Base64 images in storage (memory issues)

### Production Requirements
- ✅ Server-side session validation
- ✅ JWT or secure session cookies
- ✅ HTTPS only
- ✅ CSRF tokens
- ✅ Input sanitization
- ✅ XSS prevention
- ✅ Rate limiting on APIs
- ✅ File upload validation (server-side)
- ✅ SQL injection prevention
- ✅ Role-based access control (backend)

---

## Testing Strategy (Recommended)

### Unit Tests
**Tools:** Vitest, React Testing Library
**Coverage:**
- Component rendering
- User interactions (clicks, inputs)
- State management logic
- Date/time calculations
- Filter functions
- Mock data generators

### Integration Tests
**Scenarios:**
- Login flow → Dashboard navigation
- Schedule view switching
- Swap request creation → approval flow
- Profile edit → save → verify
- Role-based menu rendering

### E2E Tests
**Tools:** Playwright, Cypress
**Scenarios:**
- Complete user journey (login → swap → logout)
- Role-based access control verification
- Mobile responsive behavior
- Cross-browser compatibility
- Performance under load

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- ARIA labels
- Color contrast (WCAG AA)
- Focus management

---

## AI Assistant Guidelines

### When Working on This Codebase

**DO:**
- ✅ Read existing code before modifying
- ✅ Follow established patterns (functional components, hooks)
- ✅ Use Tailwind classes (avoid custom CSS)
- ✅ Maintain TypeScript strict typing
- ✅ Test on mobile breakpoints
- ✅ Handle loading and error states
- ✅ Update this documentation for major changes
- ✅ Check role-based access when adding features
- ✅ Use existing mock data patterns
- ✅ Mark TODOs for backend integration points

**DON'T:**
- ❌ Add new dependencies without discussion
- ❌ Use class components
- ❌ Write custom CSS (use Tailwind)
- ❌ Ignore TypeScript errors
- ❌ Skip mobile responsiveness
- ❌ Hardcode user IDs (use sessionStorage or props)
- ❌ Remove existing TODOs without replacing functionality
- ❌ Break role-based access control
- ❌ Introduce state management libraries (keep it simple)

### Common Tasks

**Adding a New Tab:**
1. Create component in appropriate `dashboard/` subfolder
2. Add tab to `menuItemsByRole` in `Dashboard.tsx`
3. Add tab content section in `Dashboard.tsx` main content area
4. Update this documentation

**Adding a New Component:**
1. Create `.tsx` file with PascalCase name
2. Define props interface if needed
3. Use functional component with hooks
4. Export as default
5. Import and use in parent component

**Adding New Mock Data:**
1. Create in `data/` subfolder or component file
2. Prefix with `MOCK_`
3. Export for potential reuse
4. Add TODO comment for backend replacement

**Updating Styles:**
1. Use existing Tailwind classes
2. Check responsive breakpoints (sm, md, lg)
3. Maintain design system colors
4. Test on mobile view

**Adding API Integration:**
1. Find mock function with TODO comment
2. Replace mock logic with real API call
3. Keep loading states and error handling
4. Update types if response differs
5. Remove TODO comment
6. Update this documentation

### Debugging Tips

**Check sessionStorage:**
```javascript
// Browser console
JSON.parse(sessionStorage.getItem('mockUser'))
```

**Mock user switching:**
```javascript
// Login page or console
sessionStorage.setItem('mockUser', JSON.stringify({
  name: 'Test User',
  email: 'test@hospital.com',
  role: 'admin',
  sessionId: 'test-123'
}));
// Then refresh page
```

**Component props inspection:**
```typescript
// Add to component temporarily
console.log('Props:', { userId, shifts, role });
```

**Date debugging:**
```typescript
// ScheduleTab uses ISO date strings
const dateKey = date.toISOString().split('T')[0]; // "2024-12-04"
```

---

## Known Issues & Limitations

### Current Known Issues

1. **SessionStorage Persistence**
   - Data lost on browser close/tab close
   - No offline support
   - Not suitable for production

2. **Mock Data Randomization**
   - Shifts regenerate on week navigation
   - No persistence between sessions
   - Inconsistent testing experience

3. **Image Storage**
   - Base64 encoding bloats sessionStorage
   - No compression
   - 5MB limit is arbitrary
   - Memory issues with multiple large images

4. **No Data Validation**
   - Client-side only
   - Trusts all inputs
   - No backend verification

5. **Timezone Handling**
   - Assumes local timezone
   - No UTC conversion
   - No timezone selection

6. **No Real-time Updates**
   - Requires manual refresh
   - No WebSocket support
   - Stale data possible

### Mobile-Specific Limitations

1. **Table Scrolling**
   - Horizontal scroll required for team schedule
   - Can be confusing on small screens
   - Expand button helps but not ideal

2. **Portrait Mode**
   - Request cards optimized but still cramped
   - Some text truncation necessary

3. **Touch Targets**
   - Some buttons may be too small (< 44px)
   - Hover states don't translate well

### Performance Considerations

1. **Large Team Sizes**
   - Month view with many members is heavy
   - No virtualization
   - Re-renders can be slow

2. **Date Calculations**
   - Recalculated on every render in some places
   - Could benefit from memoization

3. **Filter Operations**
   - Linear search on every keystroke
   - No debouncing on name filter

---

## Future Enhancements (Roadmap)

### High Priority
- [ ] Real authentication system
- [ ] Backend API integration
- [ ] Data persistence (database)
- [ ] WebSocket for real-time updates
- [ ] Proper image storage (S3, CDN)

### Medium Priority
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Email notifications
- [ ] Calendar export (iCal)
- [ ] PDF schedule export
- [ ] Analytics dashboard with charts
- [ ] Advanced filtering (date ranges, departments)

### Low Priority
- [ ] Team chat integration
- [ ] Shift trading marketplace
- [ ] Time-off request management
- [ ] Overtime tracking
- [ ] Payroll integration
- [ ] Multi-facility support
- [ ] Dark mode
- [ ] Internationalization (i18n)

---

## Version History

### Recent Changes (from Git History)
- **PR #3:** Add schedule generation button and modal
- **PR #2:** Add user profile page with edit functionality
- **PR #1:** Fix request card layout for mobile portrait mode
- **Recent:** Redesign Request Card
- **Recent:** Refactor code to componentize schedule and request tabs

### Version 1.0.0 (Current)
- ✅ User authentication (mock)
- ✅ Role-based dashboard
- ✅ Team schedule view (week/month)
- ✅ Personal calendar view
- ✅ Shift swap requests
- ✅ Profile management
- ✅ Schedule generation (admin/team leader)
- ✅ Mobile-responsive design
- ✅ Share functionality

---

## Resources & References

### Documentation
- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Internal Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind settings
- `vite.config.ts` - Build configuration
- `.gitignore` - Ignored files

### Key Contacts
- **Development Team:** dev@shiftswap.com
- **Repository:** GitHub (check remote URL)

---

## Appendix: Type Definitions Reference

### Core Types

```typescript
// User & Session
interface UserData {
  name: string;
  email: string;
  role: 'user' | 'teamleader' | 'admin';
  sessionId: string;
  profilePicture?: string | null;
  phone?: string;
  department?: string;
  employeeId?: string;
  facility?: string;
  startDate?: string;
}

// Menu
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  order: number;
}

// Schedule
interface ShiftData {
  [personId: string]: {
    [date: string]: Array<'M' | 'A' | 'N' | 'R' | 'D'>;
  };
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface SwapFormData {
  targetUserId: string;
  targetDate: string;
  targetShift: 'M' | 'A' | 'N' | 'R' | 'D';
  myDate: string;
  myShift: 'M' | 'A' | 'N' | 'R' | 'D';
}

// Requests (schedule/Types.ts)
interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromShift: {
    date: string;
    shiftType: 'M' | 'A' | 'N' | 'R' | 'D';
  };
  toShift: {
    date: string;
    shiftType: 'M' | 'A' | 'N' | 'R' | 'D';
  };
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

// Requests (requests/Types.ts)
interface SwapRequest {
  id: number;
  from: string;
  fromId: string;
  to: string;
  toId: string;
  fromShift: {
    date: string;
    time: string;
    type: string;
  };
  toShift: {
    date: string;
    time: string;
    type: string;
  };
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

// Profile
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  employeeId: string;
  facility: string;
  startDate: string;
  profilePicture: string | null;
}
```

**Note:** There are two similar but slightly different `SwapRequest` interfaces in different domains (schedule vs requests). This is intentional for their specific use cases but could be unified in the future.

---

**Last Updated:** December 4, 2024
**Document Version:** 2.0
**Maintained By:** Development Team & AI Assistants

**For Questions or Updates:**
- Review recent git commits for changes
- Check inline TODO comments in code
- Refer to PR descriptions for context
- Update this document when making significant changes

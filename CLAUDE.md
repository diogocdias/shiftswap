# ShiftSwap - AI Assistant Guide

## Project Overview

ShiftSwap is a healthcare shift management application that enables healthcare staff to view schedules, request shift swaps, and manage team coordination. The application supports role-based access with three user types: regular users (staff), team leaders, and administrators.

**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- i18next (internationalization - English/Portuguese)
- jsPDF (PDF export)
- No external routing library (custom navigation)
- React Context for toast notifications only

**Key Characteristics:**
- Mobile-first, responsive design
- Role-based feature access
- Multi-language support (English, Portuguese)
- Mock data/API implementations (ready for backend integration)
- Component-based architecture
- Functional components with hooks
- Centralized type definitions

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
│   ├── types/
│   │   └── domain.ts          # Unified type definitions
│   │
│   ├── config/
│   │   └── constants.ts       # Application constants & configuration
│   │
│   ├── context/
│   │   └── ToastContext.tsx   # Toast notification context
│   │
│   ├── hooks/
│   │   └── useIsDesktop.ts    # Responsive breakpoint hook
│   │
│   ├── i18n/
│   │   ├── index.ts           # i18next configuration
│   │   └── locales/
│   │       ├── en.json        # English translations
│   │       └── pt.json        # Portuguese translations
│   │
│   ├── services/
│   │   ├── sessionService.ts  # Session management utilities
│   │   ├── timeOffService.ts  # Time-off/vacation data service
│   │   └── api/
│   │       ├── index.ts           # Centralized API exports
│   │       ├── mockDelay.ts       # Mock delay utility
│   │       ├── authService.ts     # Authentication API
│   │       ├── profileService.ts  # Profile API
│   │       ├── scheduleService.ts # Schedule API
│   │       ├── requestsService.ts # Swap requests API
│   │       └── menuService.ts     # Menu configuration API
│   │
│   ├── utils/
│   │   ├── dateUtils.ts       # Date formatting utilities
│   │   ├── pdfExport.ts       # PDF schedule export
│   │   └── shiftGenerator.ts  # Shift generation logic
│   │
│   ├── public/                 # Public-facing pages
│   │   ├── ShiftSwapHome.tsx  # Landing/login page
│   │   └── LoginPage.tsx      # Login component
│   │
│   ├── components/            # Shared components
│   │   ├── LoadingOverlay.tsx # Reusable loading component
│   │   ├── Toast.tsx          # Toast notification component
│   │   └── LanguageSelector.tsx # Language picker dropdown
│   │
│   └── dashboard/             # Main authenticated app
│       ├── Dashboard.tsx      # Main container (sidebar + content)
│       ├── USER_ROLES.ts      # Role definitions
│       │
│       ├── profile/
│       │   └── ProfileTab.tsx # User profile page with edit
│       │
│       ├── vacation/
│       │   └── VacationTab.tsx # Admin time-off management
│       │
│       ├── schedule/
│       │   ├── ScheduleTab.tsx       # Main schedule container
│       │   ├── ShiftConstants.ts     # Shift type definitions
│       │   ├── Types.ts              # TypeScript interfaces
│       │   └── components/
│       │       ├── CalendarView.tsx         # Monthly calendar view
│       │       ├── TeamView.tsx             # Team schedule table
│       │       ├── SwapRequestModal.tsx     # Shift swap dialog
│       │       ├── GenerateScheduleModal.tsx # Schedule generation
│       │       └── CalendarSyncModal.tsx    # External calendar sync
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
- Language selector available on login page

**Mock Users:**
```typescript
user@hospital.com / password      // Regular staff
leader@hospital.com / password    // Team leader
admin@hospital.com / password     // Administrator
```

**Session Data Structure:**
```typescript
interface UserSession {
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
  language?: 'en' | 'pt';
}
```

---

### 2. Dashboard (Main Container)
**Location:** `src/dashboard/Dashboard.tsx`

**Purpose:** Primary authenticated app container with role-based navigation

**Architecture:**
- **Left Sidebar:** Collapsible navigation (56px mobile, 80px desktop)
- **Main Content:** Tab-based content area
- **Profile Section:** Sticky bottom profile with mobile modal
- **Language Selector:** Available in header

**Dynamic Menu System:**
```typescript
// CMS-driven menu items (mock implementation)
import { menuService } from '../services/api';
const menuItems = await menuService.fetchMenuItems(sessionId);
```

**Available Tabs by Role:**
- **User:** Overview, Schedule, Requests, Profile
- **Team Leader:** Overview, Schedule, Team, Requests, Analytics, Profile
- **Admin:** Overview, Schedule, Team, Requests, Analytics, Vacation, Settings, Profile

**State Management:**
```typescript
const [activeTab, setActiveTab] = useState('overview');
const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
const [isLoadingMenu, setIsLoadingMenu] = useState(true);
```

---

### 3. ProfileTab (User Profile Management)
**Location:** `src/dashboard/profile/ProfileTab.tsx`

**Purpose:** View and edit user profile information

**Features:**
- **Editable Fields:** Name, email, phone, department, facility
- **Profile Picture:** Upload, preview, remove (base64 encoding)
- **Read-only Fields:** Employee ID, role, start date
- **Language Selection:** Change app language from profile
- **Account Settings Stubs:** Change password, notifications, privacy

**State Management:**
```typescript
const [profile, setProfile] = useState<UserProfile>(/* ... */);
const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
```

**Image Upload:**
- Max file size: 5MB (configured in `config/constants.ts`)
- Formats: Any image/* MIME type
- Storage: Base64 in sessionStorage (not production-ready)
- Validation: File type and size checked client-side

---

### 4. ScheduleTab (Schedule Management)
**Location:** `src/dashboard/schedule/ScheduleTab.tsx`

**Purpose:** Multi-view schedule interface with swap functionality

**View Modes:**
1. **Team Schedule (Week):** 7-day team view (mobile + all roles)
2. **Team Schedule (Month):** Full month team view (all users)
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
- **Shift Click:** Opens swap request modal (multi-shift selection)
- **Pending Swaps:** Visual indicators (yellow ring)
- **Expandable Table:** Desktop-only fullscreen mode
- **Schedule Generation:** Admin/team leader can generate schedules
- **PDF Export:** Export monthly schedule to PDF
- **Calendar Sync:** Sync with Google, Apple, Outlook calendars

**New: Multi-Shift Selection:**
- Users can select multiple shifts to swap in a single request
- Both "my shifts" and "target shifts" support multi-selection

**Responsive Behavior:**
```typescript
import { useIsDesktop } from '../hooks/useIsDesktop';
const isDesktop = useIsDesktop();
```

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
- Modal-based share interface

**Data Structure (Unified):**
```typescript
interface SwapRequest {
  id: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  toUserName?: string;
  fromShift: ShiftDetail;
  toShift: ShiftDetail;
  fromShifts?: ShiftDetail[];  // Multi-shift support
  toShifts?: ShiftDetail[];    // Multi-shift support
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}
```

---

### 6. VacationTab (Admin Time-Off Management)
**Location:** `src/dashboard/vacation/VacationTab.tsx`

**Purpose:** Admin/team leader tool to manage staff time-off records

**Features:**
- Add/edit/delete time-off records for team members
- Multiple time-off types: Vacation, Sick Leave, Personal Day, Special Day Off, Other
- Filter by staff member or time-off type
- Integrated with schedule view (shows time-off on calendar)

**Time-Off Types:**
```typescript
type VacationType = 'vacation' | 'sick' | 'personal' | 'special' | 'other';
```

**Data Structure:**
```typescript
interface VacationRecord {
  id: string;
  userId: string;
  userName: string;
  type: VacationType;
  startDate: string;
  endDate: string;
  notes?: string;
  status: 'approved' | 'pending' | 'declined';
  createdAt: string;
  createdBy: string;
}
```

---

### 7. Toast Notification System
**Location:** `src/context/ToastContext.tsx`, `src/components/Toast.tsx`

**Purpose:** App-wide toast notifications (replaces browser alerts)

**Toast Types:**
```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';
```

**Usage:**
```typescript
import { useToast } from '../context/ToastContext';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleAction = () => {
    showSuccess('Operation completed!');
    showError('Something went wrong');
    showWarning('Please review your changes');
    showInfo('New update available');
  };
}
```

**Features:**
- Auto-dismiss after configurable duration
- Multiple toasts can stack
- Color-coded by type
- Click to dismiss

---

### 8. LanguageSelector
**Location:** `src/components/LanguageSelector.tsx`

**Purpose:** Allow users to switch between supported languages

**Supported Languages:**
- English (en) - Default
- Portuguese (pt)

**Variants:**
- `default`: Full dropdown with language names
- `compact`: Flag-only button with dropdown

**Usage:**
```typescript
<LanguageSelector variant="compact" />
```

---

### 9. Calendar Sync Modal
**Location:** `src/dashboard/schedule/components/CalendarSyncModal.tsx`

**Purpose:** Connect and sync schedules with external calendar providers

**Supported Providers:**
- Google Calendar
- Apple Calendar
- Microsoft Outlook
- iCal Export

**Features:**
- Connect/disconnect providers (mock OAuth)
- Sync button to push schedule updates
- Last synced timestamp
- Connection status persistence (localStorage)

---

### 10. PDF Export
**Location:** `src/utils/pdfExport.ts`

**Purpose:** Export team schedule as printer-friendly PDF

**Features:**
- Landscape A4 format
- Monthly view with all team members
- Shows time-off records
- Shift legends
- Black & white for printing
- Localized dates based on language

**Usage:**
```typescript
import { exportScheduleToPDF } from '../utils/pdfExport';

exportScheduleToPDF({
  year: 2024,
  month: 11, // December (0-indexed)
  shifts: shiftData,
  teamMembers: MOCK_TEAM_MEMBERS,
});
```

---

## Internationalization (i18n)

**Location:** `src/i18n/`

**Configuration:** Uses i18next with react-i18next

**Supported Languages:**
- English (`en`) - Default
- Portuguese (`pt`)

**Usage in Components:**
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('common.title')}</h1>;
}
```

**Translation Files:**
- `src/i18n/locales/en.json`
- `src/i18n/locales/pt.json`

**Key Namespaces:**
- `common` - Shared strings (buttons, labels)
- `schedule` - Schedule-related text
- `requests` - Request management text
- `vacation` - Time-off management text
- `profile` - Profile page text
- `pdf` - PDF export labels

**Changing Language Programmatically:**
```typescript
import { changeLanguage } from '../i18n';
changeLanguage('pt'); // Switch to Portuguese
```

---

## Custom Hooks

### useIsDesktop
**Location:** `src/hooks/useIsDesktop.ts`

**Purpose:** Responsive breakpoint detection

**Usage:**
```typescript
import { useIsDesktop } from '../hooks/useIsDesktop';

function MyComponent() {
  const isDesktop = useIsDesktop(); // true if viewport >= 1024px
  return isDesktop ? <DesktopView /> : <MobileView />;
}
```

**Features:**
- Updates on window resize
- Updates on orientation change
- Uses centralized breakpoint from config

---

## Centralized Services

### API Services
**Location:** `src/services/api/`

All API functions are centralized and exported from `src/services/api/index.ts`:

```typescript
import {
  authService,
  profileService,
  scheduleService,
  requestsService,
  menuService,
} from '../services/api';

// Example usage
await authService.login(email, password);
await profileService.fetchProfile(userId);
await scheduleService.generateSchedule(startDate, endDate, members);
await requestsService.createSwapRequest(request);
await menuService.fetchMenuItems(sessionId);
```

### Time-Off Service
**Location:** `src/services/timeOffService.ts`

Manages vacation/time-off records with localStorage persistence:

```typescript
import {
  getTimeOffRecords,
  setTimeOffRecords,
  getTimeOffForDate,
  subscribeToTimeOff,
} from '../services/timeOffService';
```

### Session Service
**Location:** `src/services/sessionService.ts`

Centralized session management utilities.

---

## Configuration Constants

**Location:** `src/config/constants.ts`

Centralized application constants:

```typescript
// Mock API delays (milliseconds)
export const MOCK_API_DELAYS = {
  CMS_MENU: 300,
  PROFILE_FETCH: 800,
  PROFILE_SAVE: 200,
  SCHEDULE_GENERATE: 200,
  // ...
};

// UI timing values
export const UI_TIMING = {
  SUCCESS_MESSAGE_DISPLAY: 3000,
  PAGE_REDIRECT: 1500,
  LOADING_TIMEOUT: 10000,
};

// Responsive breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  DESKTOP: 1024,
};

// File upload limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
};
```

---

## Unified Type Definitions

**Location:** `src/types/domain.ts`

All shared types are centralized here:

```typescript
// Core types
export type ShiftType = 'M' | 'A' | 'N' | 'R' | 'D';
export type WorkingShiftType = 'M' | 'A' | 'N';
export type RequestStatus = 'pending' | 'approved' | 'declined';
export type UserRole = 'user' | 'teamleader' | 'admin';
export type VacationType = 'vacation' | 'sick' | 'personal' | 'special' | 'other';
export type LanguageCode = 'en' | 'pt';

// Interfaces
export interface ShiftData { ... }
export interface TeamMember { ... }
export interface SwapRequest { ... }
export interface UserProfile { ... }
export interface UserSession { ... }
export interface VacationRecord { ... }
export interface MenuItem { ... }
```

**Usage:**
```typescript
import { ShiftType, SwapRequest, UserRole } from '../types/domain';
```

---

## State Management Patterns

### Session Storage
**Key:** `'mockUser'`
**Purpose:** User authentication and profile data
**Scope:** Global (shared across all components)

### Toast Context
**Location:** `src/context/ToastContext.tsx`
**Purpose:** App-wide toast notifications
**Usage:** Wrap app with `ToastProvider`, use `useToast()` hook

### Local Storage
**Calendar Sync:** `'calendarSyncConnections'`
**Language:** `'shiftswap_language'`
**Time-Off:** `'timeOffRecords'`

### Component State
Standard React useState/useEffect patterns for local state.

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

### Time-Off Colors
```css
Vacation:     bg-purple-100 text-purple-800
Sick Leave:   bg-red-100 text-red-800
Personal:     bg-blue-100 text-blue-800
Special:      bg-yellow-100 text-yellow-800
Other:        bg-gray-100 text-gray-800
```

### Responsive Breakpoints
```css
sm:  640px   (small tablet)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
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
- Centralized in `src/types/domain.ts`
- Feature-specific types in `Types.ts` files

**Constants:**
- Centralized in `src/config/constants.ts`
- Feature-specific constants in dedicated files

**Services:**
- Centralized in `src/services/api/`
- Export all from `index.ts`

**Translations:**
- JSON files in `src/i18n/locales/`
- Organized by feature namespace

---

## Git Workflow

### Branching Strategy
- **Main Branch:** Production-ready code
- **Feature Branches:** `claude/[session-id]-[feature]` or similar naming
- All AI development happens on feature branches

### Commit Messages
Follow existing patterns in commit history:
```
Add language selection button for all users (#15)
Add admin vacation and days off management tab (#13)
Add calendar sync button for external calendar integration (#14)
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

### Time-Off API
**Needed:**
- `GET /api/timeoff` - List time-off records
- `POST /api/timeoff` - Create time-off record
- `PATCH /api/timeoff/{id}` - Update record
- `DELETE /api/timeoff/{id}` - Delete record

### Calendar Sync API
**Needed:**
- `POST /api/calendar/connect/{provider}` - OAuth connection
- `POST /api/calendar/sync/{provider}` - Push schedule updates
- `DELETE /api/calendar/disconnect/{provider}` - Remove connection

---

## Security Considerations

### Current Implementation (Mock/Dev)
- No encryption
- Client-side role validation
- SessionStorage (not secure)
- No CSRF protection
- No rate limiting
- Base64 images in storage (memory issues)

### Production Requirements
- Server-side session validation
- JWT or secure session cookies
- HTTPS only
- CSRF tokens
- Input sanitization
- XSS prevention
- Rate limiting on APIs
- File upload validation (server-side)
- SQL injection prevention
- Role-based access control (backend)

---

## AI Assistant Guidelines

### When Working on This Codebase

**DO:**
- Read existing code before modifying
- Follow established patterns (functional components, hooks)
- Use Tailwind classes (avoid custom CSS)
- Maintain TypeScript strict typing
- Test on mobile breakpoints
- Handle loading and error states
- Use toast notifications instead of alerts
- Add translations for new text
- Use centralized types from `src/types/domain.ts`
- Use centralized constants from `src/config/constants.ts`
- Import API services from `src/services/api`
- Update this documentation for major changes

**DON'T:**
- Add new dependencies without discussion
- Use class components
- Write custom CSS (use Tailwind)
- Ignore TypeScript errors
- Skip mobile responsiveness
- Hardcode user IDs (use sessionStorage or props)
- Use browser alerts (use toast notifications)
- Add hard-coded text (use i18n translations)
- Break role-based access control

### Common Tasks

**Adding a New Tab:**
1. Create component in appropriate `dashboard/` subfolder
2. Add tab to `menuItemsByRole` in `Dashboard.tsx`
3. Add tab content section in `Dashboard.tsx` main content area
4. Add translations for tab label
5. Update this documentation

**Adding New Text:**
1. Add keys to `src/i18n/locales/en.json`
2. Add keys to `src/i18n/locales/pt.json`
3. Use `t('namespace.key')` in component

**Adding a New API:**
1. Create/update service in `src/services/api/`
2. Export from `src/services/api/index.ts`
3. Use mock delay from `mockDelay.ts`
4. Add TODO comment for backend replacement

**Showing Notifications:**
```typescript
const { showSuccess, showError } = useToast();
showSuccess(t('message.success'));
showError(t('message.error'));
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

7. **Calendar Sync**
   - Mock implementation only
   - No actual OAuth flow
   - No real sync functionality

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
- [x] ~~Calendar export (iCal)~~ (Implemented - mock)
- [x] ~~PDF schedule export~~ (Implemented)
- [ ] Analytics dashboard with charts
- [ ] Advanced filtering (date ranges, departments)

### Low Priority
- [ ] Team chat integration
- [ ] Shift trading marketplace
- [x] ~~Time-off request management~~ (Implemented - admin only)
- [ ] Overtime tracking
- [ ] Payroll integration
- [ ] Multi-facility support
- [ ] Dark mode
- [x] ~~Internationalization (i18n)~~ (Implemented - EN/PT)

---

## Version History

### Recent Changes (from Git History)
- **PR #15:** Add language selection button for all users
- **PR #14:** Add calendar sync button for external calendar integration
- **PR #13:** Add admin vacation and days off management tab
- **PR #12:** Add multi-shift selection for swap requests
- **PR #11:** Show full month view for user schedule
- **PR #10:** Replace browser alerts with custom toast notifications
- **PR #9:** Add export schedule to PDF button
- **PR #8:** Review code for improvements and best practices
- **PR #7:** Add mobile profile modal for logout and profile access
- **PR #6:** Add mock API call for loading profile data
- **PR #5:** Add comprehensive CLAUDE.md documentation
- **PR #4:** Add shift selection to swap request modal
- **PR #3:** Add schedule generation button and modal
- **PR #2:** Add user profile page with edit functionality
- **PR #1:** Fix request card layout for mobile portrait mode

### Version 2.0.0 (Current)
- User authentication (mock)
- Role-based dashboard
- Team schedule view (week/month for all users)
- Personal calendar view
- Multi-shift swap requests
- Profile management
- Schedule generation (admin/team leader)
- PDF schedule export
- External calendar sync (mock)
- Toast notification system
- Admin time-off management
- Multi-language support (EN/PT)
- Mobile-responsive design
- Share functionality

---

## Resources & References

### Documentation
- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [i18next Docs](https://www.i18next.com/)
- [jsPDF Docs](https://artskydj.github.io/jsPDF/docs/jsPDF.html)

### Internal Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind settings
- `vite.config.ts` - Build configuration
- `.gitignore` - Ignored files

---

**Last Updated:** December 12, 2024
**Document Version:** 3.0
**Maintained By:** Development Team & AI Assistants

**For Questions or Updates:**
- Review recent git commits for changes
- Check inline TODO comments in code
- Refer to PR descriptions for context
- Update this document when making significant changes

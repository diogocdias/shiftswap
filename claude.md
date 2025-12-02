# ShiftSwap Application Documentation

## Project Overview

ShiftSwap is a healthcare shift management application built with React, TypeScript, and Tailwind CSS. It enables healthcare staff to view schedules, request shift swaps, and manage team coordination across different roles (users, team leaders, and administrators).

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Custom navigation system (not React Router)

## Project Structure

```
src/
├── App.tsx                          # Main app entry point
├── App.css                          # Legacy styles (minimal usage)
├── index.css                        # Tailwind imports
├── main.tsx                         # React root renderer
├── public/
│   └── ShiftSwapHome.tsx           # Landing/login page
├── components/
│   └── LoadingOverlay.tsx          # Reusable loading component
└── [dashboard files]
    ├── Dashboard.tsx                # Main dashboard container
    └── ScheduleTab.tsx              # Schedule view component
```

## Core Components

### 1. ShiftSwapHome (Login/Landing Page)
- Handles user authentication (mock implementation)
- Supports three user roles: user, teamleader, admin
- Stores session data in sessionStorage
- Mock users:
    - User: user@hospital.com / password
    - Team Leader: leader@hospital.com / password
    - Admin: admin@hospital.com / password

### 2. Dashboard (Main Application View)
**Purpose**: Primary container for all authenticated functionality

**Key Features**:
- Role-based menu system (dynamically loaded via mock CMS API)
- Responsive sidebar navigation with icons and badges
- User profile with logout functionality
- Tab-based content switching

**Tabs/Views**:
- **Overview**: Dashboard with stats, quick actions, upcoming shifts
- **Schedule**: Full team schedule with calendar view
- **Team**: Team member list with status indicators
- **Requests**: Shift swap request management
- **Analytics**: Performance metrics and statistics
- **Settings**: System configuration (admin only)

**Role-Based Menu Items**:
```typescript
user: ['overview', 'schedule', 'requests']
teamleader: ['overview', 'schedule', 'team', 'requests', 'analytics']
admin: ['overview', 'schedule', 'team', 'requests', 'analytics', 'settings']
```

### 3. ScheduleTab
**Purpose**: Display and manage weekly team schedules

**Features**:
- 7-day week view (Monday-Sunday)
- Name-based filtering
- Week navigation (prev/next/today)
- Multiple shifts per day support
- Hover tooltips for shift details

**Shift Types**:
- **M** (Morning): 6:00 AM - 2:00 PM - Yellow
- **A** (Afternoon): 2:00 PM - 10:00 PM - Orange
- **N** (Night): 10:00 PM - 6:00 AM - Blue
- **R** (Rest Day): No work - Green (dim)
- **D** (Day Off): Personal day - Gray (dim)

**Data Structure**:
```typescript
interface ShiftData {
    [personId: string]: {
        [date: string]: Array<'M' | 'A' | 'N' | 'R' | 'D'>;
    };
}
```

### 4. LoadingOverlay
**Purpose**: Reusable loading indicator with timeout handling

**Props**:
- `isLoading`: boolean - Show/hide overlay
- `timeout`: number (default: 5000ms) - Time before showing timeout error
- `onTimeout`: () => void - Callback when timeout occurs

**Usage**:
```tsx
<LoadingOverlay
    isLoading={isLoadingMenu}
    timeout={5000}
    onTimeout={handleTimeout}
/>
```

## State Management

### Session Storage
- Key: `'mockUser'`
- Contains: `{ name, email, role, sessionId }`
- Used for: User authentication and role-based features

### Local Component State
- Dashboard: `activeTab`, `menuItems`, `isLoadingMenu`
- ScheduleTab: `currentWeekStart`, `shifts`, `hoveredShift`, `nameFilter`

## Mock Data & APIs

### Mock CMS API (mockFetchMenuItems)
```typescript
// Simulates backend CMS for menu configuration
// Returns role-specific menu items
// Includes 300ms simulated API delay
```

### Mock Team Members
```typescript
const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: '1', name: 'Sarah Johnson', role: 'RN' },
    { id: '2', name: 'Mike Chen', role: 'RN' },
    // ... 7 total members
];
```

### Mock Shift Generation
```typescript
// generateMockShifts(startDate: Date): ShiftData
// Randomly generates shifts for the week
// 30% chance of double shifts per day
// Avoids duplicate shift types on same day
```

## Design System

### Color Palette
- **Primary**: Blue-600 (#2563EB)
- **Success**: Green-600 (#059669)
- **Warning**: Yellow-600 (#D97706)
- **Danger**: Red-600 (#DC2626)
- **Gray Scale**: gray-50 through gray-900

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Component Patterns
- Sticky headers for scrollable content
- Hover tooltips for additional info
- Badge indicators for notifications
- Status pills for state display
- Card-based layouts for sections

## Key UX Features

### Responsive Sidebar
- Collapsed on mobile (icons only, 56px width)
- Expanded on desktop (icons + labels, 80px width)
- Sticky user profile at bottom
- Active tab highlighting

### User Profile Tooltip
- Hover-activated on avatar
- Shows: Name, Role, Logout button
- Prevents accidental closure with gap management

### Schedule Interactions
- Multi-shift badges per cell
- Color-coded shift types
- Hover for detailed shift info
- Responsive table with horizontal scroll

### Loading States
- Full-page overlay during async operations
- Timeout detection (5s default)
- Error state display

## TODO Items & Future Enhancements

### Immediate TODOs
1. **Replace Mock CMS API**: Connect to real backend endpoint
   ```typescript
   // Location: Dashboard.tsx, mockFetchMenuItems function
   // Replace with: fetch('/api/cms/menu', { ... })
   ```

2. **Remove Mock Session Handling**: Implement real authentication
   ```typescript
   // Current: sessionStorage.getItem('mockUser')
   // Replace with: JWT tokens or session cookies
   ```

### Backend Integration Points
- `/api/auth/login` - User authentication
- `/api/cms/menu` - Role-based menu configuration
- `/api/schedule/week` - Fetch weekly schedules
- `/api/shifts/swap` - Submit swap requests
- `/api/team/members` - Get team member list

### Planned Features
- Real-time notifications
- Shift swap approval workflow
- Calendar export (iCal)
- Mobile app version
- Team chat integration
- Analytics dashboard with charts

## Development Notes

### Running the Application
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Environment Variables
```
VITE_API_URL=your_backend_url
VITE_CMS_ENDPOINT=cms_api_endpoint
```

## Accessibility Considerations

- Semantic HTML structure
- ARIA labels for icon-only buttons
- Keyboard navigation support
- Color contrast ratios meet WCAG AA
- Focus indicators on interactive elements

## Performance Optimizations

- Lazy loading for tabs (potential)
- Memoized shift calculations
- Debounced name filtering
- Optimized re-renders with React keys
- Efficient date calculations

## Security Considerations

### Current Implementation (Mock)
- Client-side session storage (NOT secure)
- No encryption
- No CSRF protection
- Role validation on frontend only

### Production Requirements
- Server-side session validation
- JWT token authentication
- HTTPS only
- CSRF tokens
- Rate limiting on APIs
- Input sanitization
- XSS prevention

## Testing Strategy (Recommended)

### Unit Tests
- Component rendering
- State management logic
- Date/time calculations
- Filter functions

### Integration Tests
- Authentication flow
- Tab navigation
- Schedule data loading
- Shift swap workflow

### E2E Tests
- Complete user journeys
- Role-based access control
- Cross-browser compatibility
- Mobile responsiveness

## Contributing Guidelines

1. Follow TypeScript strict mode
2. Use Tailwind utility classes (no custom CSS)
3. Maintain component modularity
4. Document props with TypeScript interfaces
5. Handle loading and error states
6. Ensure mobile responsiveness
7. Add comments for complex logic
8. Update this documentation for major changes

## Known Issues

1. **SessionStorage persistence**: Data lost on browser close
2. **No offline support**: Requires active connection
3. **Mock data randomization**: Shifts regenerate on navigation
4. **No data validation**: Trust all inputs (mock implementation)
5. **Timezone handling**: Assumes local timezone

## Version History

- **v1.0.0** (Current): Initial implementation with mock data
    - User authentication (mock)
    - Role-based dashboard
    - Schedule viewer
    - Basic swap request UI

---

**Last Updated**: December 2024  
**Maintained By**: Development Team  
**Contact**: dev@shiftswap.com
# DITS Application Mockups

This directory contains comprehensive mockups for the DITS (Developer Issue Tracking System) application, designed specifically for individual software developers.

## Overview

DITS is a purpose-built issue tracker that eliminates the "collaboration tax" imposed by team-oriented tools while providing deep integration with developer ecosystems. The mockups demonstrate a keyboard-first, sub-100ms interface optimized for flow state.

## Desktop Mockups

### 1. Main Dashboard (`01-main-dashboard.html`)
- **Primary interface** showing the Inbox smart view
- **Left sidebar** with Smart Views (Inbox, Today, Upcoming, Logbook), Projects, and Areas
- **Issue list** with checkboxes, titles, metadata, labels, priorities, and status indicators
- **Top header** with search bar, view toggles (List/Board/Calendar), and "New Issue" button
- **Keyboard shortcuts** displayed throughout the interface

**Key Features:**
- Clean, minimalist design with high information density
- Color-coded priority indicators (red=urgent, orange=high, yellow=medium, green=low)
- Status indicators with dots (gray=todo, blue=in progress, orange=review)
- Label system with distinct colors for different types (bug, feature, enhancement)

### 2. Issue Editor (`02-issue-editor.html`)
- **Modal overlay** for creating/editing issues
- **Comprehensive form** with all issue attributes:
  - Title (required)
  - Status, Priority, Project dropdowns
  - Start Date and Due Date pickers
  - Labels with tag-based input and removal
  - Rich Markdown description editor with Write/Preview tabs
  - Relationships section (Blocked By, Related To)
- **Action buttons** for Delete, Cancel, and Save with keyboard shortcuts

**Key Features:**
- Form validation and required field indicators
- Inline priority selection with visual dots
- Markdown support for rich text descriptions
- Relationship management between issues
- Keyboard shortcuts for all actions (⌘S to save, Esc to cancel)

### 3. Kanban Board (`03-kanban-board.html`)
- **Column-based layout** with customizable workflow states
- **Draggable issue cards** with hover effects and visual feedback
- **Card details** including ID, priority indicator, title, labels, due dates, and avatars
- **Add card buttons** in each column for quick issue creation
- **Column headers** with status dots and issue counts

**Key Features:**
- Visual workflow representation (Backlog → To Do → In Progress → Review → Done)
- Drag-and-drop interaction hints with hover states
- Rich card information without cluttering
- Horizontal scrolling for additional columns
- Color-coded due date indicators (red=overdue, orange=today, gray=future)

### 4. Command Palette (`04-command-palette.html`)
- **Overlay interface** activated by ⌘K keyboard shortcut
- **Fuzzy search** across actions, issues, navigation, and recent items
- **Categorized results** with icons and descriptions
- **Keyboard navigation** with arrow keys and Enter to select
- **Smart sections**: Actions, Issues, Navigation, Recent

**Key Features:**
- Instant search with real-time filtering
- Comprehensive action coverage (create, navigate, settings)
- Recent items for quick access to frequently used features
- Visual hierarchy with icons and secondary text
- Full keyboard operation with helpful footer hints

### 5. Advanced Search (`05-advanced-search.html`)
- **Dual search interface** with text input and visual filter builder
- **Saved filters** in left sidebar with edit/delete actions
- **Search syntax** with examples (label:bug, priority:high, status:open)
- **Visual filter builder** with dropdown selections and remove buttons
- **Results area** with sorting options and filtered issue list

**Key Features:**
- Powerful query language for complex searches
- Visual filter builder for non-technical users
- Saved filter management with quick access
- Real-time result counts and sorting options
- Comprehensive filter options (priority, status, labels, dates, projects)

## Mobile Mockups

### 1. Mobile Inbox (`mobile/01-mobile-inbox.html`)
- **Touch-optimized interface** designed for iPhone screen dimensions (390px)
- **Status bar** with time and battery indicators
- **Navigation header** with hamburger menu and action buttons
- **Search functionality** with prominent search bar
- **Filter pills** for quick issue filtering with horizontal scroll
- **Touch-friendly issue list** with larger touch targets
- **Floating Action Button** for quick issue creation
- **Bottom tab navigation** with badges for unread counts

**Key Features:**
- Pull-to-refresh functionality
- Large, thumb-friendly touch targets
- Horizontal scrolling filter pills
- Native mobile interactions (swipe, tap, hold)
- Bottom navigation for easy thumb access

### 2. Mobile Issue Creation (`mobile/02-mobile-create-issue.html`)
- **Full-screen modal** for issue creation
- **Section-based form** with clear visual groupings
- **Quick capture features**: Voice notes and photo attachments
- **Touch-friendly priority selector** with visual selection states
- **Smart label input** with quick-action pills
- **Template selection** for common issue types
- **Bottom action bar** with Save Draft and Create Issue buttons

**Key Features:**
- Voice note recording for quick thoughts
- Camera integration for bug screenshots
- Touch-optimized form controls
- Template system for rapid issue creation
- Visual priority selection with color coding

## Design Principles

### Visual Design
- **Clean, modern aesthetic** with careful attention to typography and spacing
- **Consistent color system** using Tailwind CSS color palette
- **High contrast ratios** for excellent readability
- **Subtle shadows and borders** for depth without distraction
- **Icon usage** for quick visual recognition

### Interaction Design
- **Keyboard-first approach** with comprehensive shortcuts
- **Sub-100ms response times** through optimized animations
- **Progressive disclosure** to avoid overwhelming interfaces
- **Contextual actions** appearing on hover/focus
- **Consistent interaction patterns** across all screens

### Information Architecture
- **Smart Views** for automated issue organization
- **Project vs Area distinction** for finite vs ongoing work
- **Hierarchical navigation** with clear breadcrumbs
- **Search-first approach** with powerful filtering capabilities

## Technical Implementation Notes

### Responsive Design
- Desktop mockups optimized for screens 1280px+
- Mobile mockups designed for 390px viewport (iPhone standard)
- Touch targets minimum 44px for accessibility
- Scalable typography using relative units

### Accessibility Features
- High contrast color ratios (WCAG AA compliant)
- Keyboard navigation for all interactive elements
- Screen reader compatible markup structure
- Focus indicators for keyboard users

### Performance Considerations
- Minimal CSS animations for smooth 60fps interactions
- Efficient hover states and transitions
- Optimized for fast rendering and paint times
- Progressive enhancement for advanced features

## File Structure

```
mockups/
├── README.md                    # This documentation
├── desktop/
│   ├── 01-main-dashboard.html   # Primary inbox interface
│   ├── 02-issue-editor.html     # Issue creation/editing
│   ├── 03-kanban-board.html     # Board view with drag-drop
│   ├── 04-command-palette.html  # ⌘K command interface
│   └── 05-advanced-search.html  # Search and filtering
├── mobile/
│   ├── 01-mobile-inbox.html     # Touch-optimized inbox
│   └── 02-mobile-create-issue.html # Mobile issue creation
└── components/                  # Reusable component examples
```

## Usage

To view the mockups:

1. Open any `.html` file in a modern web browser
2. For mobile mockups, use browser developer tools to simulate mobile viewport
3. Recommended browsers: Chrome, Firefox, Safari (latest versions)
4. For desktop mockups, use screen resolution 1280px+ for optimal viewing

## Next Steps

These mockups serve as the visual foundation for:
- Frontend development (React components)
- User experience testing and validation
- Design system creation
- API requirements definition
- Mobile app development guidelines

The mockups align with the comprehensive requirements in `design_docs/requirements.md` and support the implementation plan outlined in `design_docs/plan.md`.
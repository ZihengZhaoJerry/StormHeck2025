# Song Request System - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing primary inspiration from Spotify's design language, with influences from Apple Music and modern music streaming interfaces. This creates familiarity for users while maintaining a professional, stage-ready aesthetic for performers.

**Key Design Principles:**
- Dark-first design optimized for stage/performance environments
- Album artwork as primary visual driver
- Instant recognition and quick interaction patterns
- Professional, high-contrast displays for performer visibility

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 18 10% 8% (deep charcoal, near-black)
- Surface: 18 10% 12% (elevated cards/panels)
- Primary/Brand: 141 73% 42% (Spotify-inspired green)
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 70%
- Accent/Active: 141 73% 52% (brighter green for interactions)

**Light Mode (User Interface Option):**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 141 76% 38% (darker green for contrast)
- Text: 0 0% 10%

### B. Typography

**Font Stack:**
- Primary: 'Inter' via Google Fonts - clean, modern sans-serif
- Display: 'DM Sans' for headings - slightly condensed, bold weights

**Hierarchy:**
- Hero/Display: text-4xl to text-6xl, font-bold (DM Sans)
- Song Titles: text-lg to text-xl, font-semibold
- Artist Names: text-sm to text-base, font-medium
- Metadata: text-xs to text-sm, font-normal
- Queue Numbers: text-5xl to text-7xl, font-black (performer display)

### C. Layout System

**Spacing Scale**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 for consistent rhythm
- Mobile padding: p-4 to p-6
- Desktop padding: p-8 to p-12
- Section gaps: gap-4 (mobile), gap-6 to gap-8 (desktop)
- Card spacing: p-4 to p-6

**Grid Systems:**
- User Interface: Single column mobile (w-full max-w-2xl mx-auto)
- Search Results: grid-cols-1 sm:grid-cols-2 gap-4
- Performer Queue: Single column, full-width cards with generous spacing

### D. Component Library

**User Interface Components:**

1. **Search Bar**: Full-width sticky header with frosted glass effect (backdrop-blur-xl bg-surface/80), rounded-full input with search icon, instant search feedback

2. **Song Cards**: 
   - Horizontal layout with square album artwork (80x80px on mobile)
   - Song title (font-semibold), artist (text-secondary), album (text-xs)
   - Tap-to-request interaction with subtle scale transform
   - Added indicator (green checkmark) after selection

3. **Request Button**: Primary green CTA, fixed bottom position on mobile (bottom-6), full-width with shadow-lg, "Request This Song" text

4. **Queue Preview**: Compact list showing "Your Requests" with dismiss option

**Performer Interface Components:**

1. **Now Playing Display**: 
   - Large album artwork (400x400px minimum)
   - Oversized song title and artist
   - Visual equalizer/pulse animation during active song
   - Progress indicator if applicable

2. **Queue List**: 
   - Numbered cards (large numbers in accent color)
   - Album artwork thumbnail (100x100px)
   - Song/artist details
   - Requested by indicator (subtle, anonymous or with requester name)
   - Auto-scroll for long queues

3. **QR Code Section**: Permanently visible corner position with "Scan to Request" instruction, medium size QR (200x200px)

4. **Stats Display**: Request count, active users counter (top corner, subtle)

**Navigation:**
- User: Minimal - back button only when in search/detail view
- Performer: Tab system - "Queue" / "Now Playing" / "Settings"

**Forms:**
- Search input with autocomplete dropdown
- Minimal form fields (song selection is primary interaction)
- Instant validation and feedback

**Data Display:**
- Card-based song listings
- Real-time queue updates with smooth transitions
- Empty states with illustrations/icons and clear CTAs

**Overlays:**
- Request confirmation toast (bottom, green background, 3s duration)
- Error messages (red accent, dismissible)
- Loading states (skeleton cards matching layout)

### E. Animations

**Sparingly Used:**
- Card hover: subtle scale(1.02) and shadow elevation
- Request submission: success pulse animation
- Queue updates: slide-in-up for new items
- Now playing: gentle pulse on album artwork
- Transitions: 200-300ms ease-in-out

**Avoid:**
- Page transition animations
- Excessive scroll effects
- Distracting background animations

## Images

**Hero Section (User Interface Landing):**
- Full-width hero image: Concert crowd/stage atmosphere with gradient overlay (from transparent to dark background)
- Height: 40vh on mobile, 50vh on desktop
- Overlay text: "Request Your Song" centered, large display typography
- QR code functionality embedded in hero CTA

**Album Artwork:**
- Primary visual element throughout both interfaces
- Always square aspect ratio, rounded corners (rounded-lg)
- Lazy-loaded with blur placeholder
- High-resolution sources from Spotify API

**Empty States:**
- Illustrated icons (use Heroicons or similar) for:
  - No search results: musical note icon
  - Empty queue: queue list icon
  - Connection errors: wifi-off icon

## Platform-Specific Considerations

**Mobile (User Interface Primary):**
- Touch-optimized tap targets (minimum 44px height)
- Bottom-sheet style overlays
- Thumb-zone friendly primary actions
- Swipe gestures for dismissing requests

**Desktop/Display (Performer Interface):**
- Large typography for stage visibility
- High contrast for bright stage lighting
- Keyboard shortcuts for queue management
- Fullscreen mode toggle

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop/Display: > 1024px
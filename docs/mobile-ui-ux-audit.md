# Mobile UI/UX audit

Audit date: 7 August 2026  
Target: iOS and Android app-quality experience, while retaining the Eagles & Eaglets emerald, navy, and community-led identity.

## Executive summary

The frontend is responsive and usable at narrow widths, but its mobile presentation still follows desktop-web conventions. The biggest opportunity is not another breakpoint pass; it is a mobile information-architecture and interaction pass. The app should feel designed around one-handed use, safe areas, persistent task navigation, concise page hierarchy, and native-feeling sheets.

The public homepage, authentication, store, shared layout, dashboard shell, chat, core controls, and modal patterns were reviewed at an iPhone-sized 390 × 844 viewport. The interactive concept is available at `/mobile-prototype`.

## Priority findings

### P0 — Establish a mobile application shell

- The authenticated layout uses a desktop sidebar hidden behind a menu on mobile. Frequent destinations therefore require an extra interaction and are not continuously visible.
- The top bar gives menu, notifications, help, and logout similar visual weight. This reads like reduced desktop chrome rather than a task-focused mobile app.
- Adopt a role-aware bottom tab bar with four or five stable destinations. Keep secondary and account actions in the profile screen.
- Apply `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to app chrome, sticky actions, chat composition, and sheets.

### P0 — Replace centered mobile modals with task-appropriate sheets

- The shared modal is vertically centered and capped at 90vh on every viewport. This is suitable for desktop but less natural for short mobile tasks and can conflict with the software keyboard.
- Use bottom sheets for filters, confirmations, quick actions, session details, and creation flows. Reserve full-screen covers for multi-step forms and document-heavy work.
- Keep destructive confirmation actions explicit and provide a visible drag indicator only when the sheet is actually dismissible by gesture.

### P1 — Strengthen hierarchy and reduce decorative density

- Several screens use small headings, many bordered cards, pills, gradients, shadows, and motion at once. On mobile this weakens the scan path.
- Use large contextual page titles, one dominant card per screen, grouped lists for related settings/actions, and subtle dividers instead of a card around every item.
- Maintain emerald as the action/accent colour and navy as the high-contrast brand surface. Use role colours only where they communicate role state.

### P1 — Standardize touch and form ergonomics

- Shared button sizes do not guarantee a 44 px minimum target, especially the small variant and icon actions outside the dashboard header.
- Standardize interactive controls at 44–48 px minimum height, add 8 px spacing between adjacent targets, and retain a visible focus state.
- Keep form text at 16 px or larger on iOS to avoid input zoom. Use the correct `inputMode`, `autoComplete`, and content type for email, phone, numeric, and password fields.
- Put the primary form action above the home indicator/keyboard safe area when the keyboard is visible.

### P1 — Make overlays less obstructive

- The cookie notice occupies a large portion of the first mobile viewport and competes with primary calls to action on the homepage and login page.
- Convert it to a compact bottom notice with a single primary action, a clear secondary text action, and safe-area padding. Avoid covering form submit controls.
- Notification dropdowns should become a full-width sheet or dedicated screen on mobile instead of behaving like a desktop dropdown.

### P1 — Upgrade chat to a mobile messaging model

- Mobile chat should use a conversation list screen and a separate message detail screen instead of preserving a desktop split view.
- Keep the composer attached above the keyboard and bottom safe area, preserve draft state, show upload progress inline, and use a compact navigation title with the participant status.
- Ensure marking a conversation read happens once per meaningful state change, not from repeated render or socket events.

### P2 — Refine public and auth surfaces

- The homepage hero is visually strong but places two equal-width actions above the fold. Make the primary action dominant and the story action lower emphasis.
- The mobile login logo is small and visually detached from the form. Use a compact navigation-style brand header or deliberately centre the mark with the form title.
- Progressive disclosure will help long registration, KYC, and onboarding flows: one decision group per screen, clear progress, persistent back navigation, and saved state.

### P2 — Platform readiness

- Define semantic tokens for mobile navigation, elevated sheets, grouped backgrounds, separators, pressed states, keyboard-safe spacing, and role accents.
- Honour reduced motion and avoid hover-dependent feedback. Add pressed states and optional light haptics in the native wrapper.
- Test Dynamic Type/text scaling, VoiceOver/TalkBack order, landscape, 320 px width, iPhone safe areas, Android gesture navigation, and on-screen keyboards.

## Recommended implementation sequence

1. Introduce the mobile shell and bottom navigation behind a feature flag.
2. Add safe-area and keyboard-safe primitives, then migrate chat and primary actions.
3. Add mobile variants for modal/sheet, grouped list, navigation title, icon button, and segmented control.
4. Migrate the Eaglet dashboard, learning centre, nest, and profile first; validate the pattern before the Eagle and admin experiences.
5. Run device-level visual regression at 320 × 568, 390 × 844, 430 × 932, and a representative Android viewport.

## Prototype scope

The sample demonstrates:

- Public, Eaglet, Eagle, Admin, and shared content modes.
- Customizable emerald, forest, and teal accents.
- Comfortable and compact spacing.
- Four persistent task destinations.
- Native-style large titles, grouped surfaces, status chrome, safe-area layout, and bottom sheets.
- Responsive presentation as a framed device on desktop and a full-screen app surface on mobile.

The prototype provides two sources. **Live app** mode renders the actual production route at the device width for guaranteed visual parity and uses the active session/API data. **iOS concept** mode remains isolated and uses static sample data for architecture exploration.

## Complete route-family audit

The expanded audit covers every routed page through its owning layout, shared primitives, source-level page structure, and representative runtime state. Dynamic detail routes inherit the same architecture as their corresponding list/detail family.

| Family | Screens reviewed | Mobile architecture decision |
| --- | ---: | --- |
| Public and marketing | 5 | Safe-area top chrome, focused primary action, editorial sections, compact legal notice |
| Authentication and account recovery | 11 | Navigation-style brand header, 16 px fields, keyboard-safe primary action, one task per screen |
| Store and orders | 5 | Search-first catalogue, horizontal category filters, bottom-sheet options, persistent checkout action |
| Donations | 3 | Campaign-led hierarchy, amount selector, Apple Pay-ready action location, grouped transparency data |
| Eaglet dashboard and onboarding | 5 | Next-best-action dashboard, progress hierarchy, full-screen step flows, persistent bottom navigation |
| Eaglet learning, points, badges, and resources | 9 | Library/list architecture, focused viewers, sticky submission actions, grouped achievements |
| Eagle dashboard and mentoring | 7 | Review queues, nest-first navigation, compact mentee status, action sheets for approvals |
| Nest and community | 12 | Native feed rhythm, segmented local navigation, member sheets, focused post composition |
| Chat and notifications | 2 | Separate list/detail states, keyboard-safe composer, dedicated inbox instead of desktop dropdown |
| Admin operations | 13 | Priority queue dashboard, searchable grouped lists, full-screen review/detail flows, guarded actions |
| Settings | 9 | iOS grouped-list hierarchy, role-aware sections, destructive actions separated from preferences |
| Legal, support, and system states | 8 | Readable document typography, native navigation title, clear recovery and completion actions |

## Production architecture implemented

- Added a role-aware five-position mobile tab bar to the authenticated shell. It exposes the four most frequent destinations for each role and keeps the complete route tree under **More**.
- Removed logout from primary mobile chrome; account and destructive actions remain in the full navigation/profile hierarchy.
- Added safe-area-aware authenticated and public headers, page content, tab bars, cookie notices, and modal actions.
- Converted the shared mobile modal presentation into an iOS-style bottom sheet while retaining centered desktop dialogs.
- Raised shared button and form-control ergonomics to mobile touch/input standards.
- Added reduced-motion handling for the authenticated application shell.
- Normalized mobile page backgrounds, large-title hierarchy, elevated grouped surfaces, table density, and scroll padding across every `DashboardLayout` page.
- Expanded `/mobile-prototype` into a role- and screen-selectable catalogue covering public, Eaglet, Eagle, Admin, and shared page families.
- Added Live app parity mode. It embeds the real routed page rather than maintaining a duplicate visual implementation, so subsequent production-page changes automatically appear in the prototype.

## Prototype coverage

The prototype catalogue contains 76 selectable screen states:

- Public: landing, about, donations, store, product, cart, orders, confirmation, authentication, recovery, verification, FAQ, and legal screens.
- Eaglet: dashboard, onboarding, profile, nest, community, mentor discovery, requests, assignments, viewers, quizzes, points, badges, application, messages, resources, and settings.
- Eagle: dashboard, profile, nest management, grading, requests, program editing, enrollment, content, Eaglets, messages, resources, and settings.
- Admin: dashboard, KYC, users, team, role requests, mentor applications, nests, messages, content, store, orders, donations, points, and platform settings.
- Shared: notifications, account/profile/notification/privacy settings, pending approval, and recovery states.

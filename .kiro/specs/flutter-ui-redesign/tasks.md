# Implementation Plan

- [x] 1. Create minimalist theme and constants




  - [ ] 1.1 Create `lib/theme/app_theme.dart` with color palette and text styles
    - Define colors: white, black, textMuted, border, hover




    - Define text styles: heading, body, small, monospace
    - _Requirements: 1.1, 1.2, 1.4_


- [ ] 2. Redesign LoginScreen with Supabase layout
  - [ ] 2.1 Create new layout structure with narrow sidebar + main content
    - 50px sidebar with icon navigation
    - Header with title and Login/Servers toggle




    - Main content area
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 2.2 Create minimal login form

    - Centered card with white background
    - Simple PIN input with thin border
    - Black "Login" button
    - _Requirements: 1.1, 1.2, 1.3_


- [ ] 3. Redesign DevRunnerPanel as compact table
  - [x] 3.1 Create table-like server list layout





    - Single row per server
    - Columns: status dot, name, path, actions
    - Thin border separators
    - _Requirements: 2.1, 2.4_
  - [ ] 3.2 Create minimal status indicators
    - Filled black dot (●) for running
    - Empty circle (○) for stopped
    - 6px size
    - _Requirements: 2.2_
  - [ ] 3.3 Create compact action buttons
    - Small text "Start"/"Stop" button
    - Menu icon (⋮) for folder select and edit command
    - _Requirements: 2.3_

- [ ] 4. Update HomeScreen sidebar to match
  - [ ] 4.1 Make sidebar narrow (50px) with icon-only navigation
    - White background, black icons
    - Light gray background on selected
    - _Requirements: 3.1, 3.2, 3.3_

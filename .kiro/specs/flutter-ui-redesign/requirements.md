# Requirements Document

## Introduction

This feature redesigns the Flutter desktop application UI with a super minimalist, compact aesthetic. The design uses white backgrounds, black text, small font sizes, tight spacing, and a condensed layout that feels like viewing from a distance - clean and uncluttered.

## Glossary

- **Desktop App**: The Flutter-based Windows application that manages the tabulation system
- **DevRunnerPanel**: The widget that manages server processes (Backend, Reverb, Frontend)
- **Compact UI**: Small fonts (11-13px), tight padding (8-12px), minimal spacing

## Requirements

### Requirement 1

**User Story:** As a user, I want a compact minimalist interface, so that everything fits cleanly without wasted space.

#### Acceptance Criteria

1. WHEN displaying the app THEN the Desktop App SHALL use white (#fff) background throughout
2. WHEN displaying text THEN the Desktop App SHALL use small font sizes (11-13px) with black color
3. WHEN displaying spacing THEN the Desktop App SHALL use tight padding (8-12px) between elements
4. WHEN displaying borders THEN the Desktop App SHALL use thin 1px light gray (#e0e0e0) lines

### Requirement 2

**User Story:** As a user, I want the DevRunnerPanel to be compact and dense, so that all three servers fit without scrolling.

#### Acceptance Criteria

1. WHEN displaying server rows THEN the Desktop App SHALL use a single-line compact layout per server
2. WHEN displaying status THEN the Desktop App SHALL use a tiny dot (6px) indicator
3. WHEN displaying buttons THEN the Desktop App SHALL use small text buttons (no icons) or tiny icon buttons
4. WHEN displaying paths THEN the Desktop App SHALL truncate long paths with ellipsis

### Requirement 3

**User Story:** As a user, I want the sidebar to be narrow and minimal, so that more space is available for content.

#### Acceptance Criteria

1. WHEN displaying the sidebar THEN the Desktop App SHALL use a narrow width (50-60px) with icon-only navigation
2. WHEN displaying sidebar icons THEN the Desktop App SHALL use small (18-20px) black icons on white
3. WHEN an item is selected THEN the Desktop App SHALL use a subtle underline or light gray background

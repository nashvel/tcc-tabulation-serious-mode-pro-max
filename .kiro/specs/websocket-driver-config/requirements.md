# Requirements Document

## Introduction

This feature adds Reverb server support to the Flutter desktop application's DevRunnerPanel. The panel now manages three servers: Backend (Laravel), Reverb (WebSocket), and Frontend (Vite). This allows users to run all necessary services for real-time communication from a single interface.

## Glossary

- **Desktop App**: The Flutter-based Windows application that manages and runs the tabulation system servers
- **DevRunnerPanel**: The Flutter widget that manages server processes
- **Backend Server**: The Laravel PHP application (`php artisan serve`)
- **Reverb Server**: Laravel's local WebSocket server (`php artisan reverb:start`)
- **Frontend Server**: The Vite development server (`npm run dev`)

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to start and stop the Reverb WebSocket server from the DevRunnerPanel, so that I can manage real-time communication alongside other servers.

#### Acceptance Criteria

1. WHEN the DevRunnerPanel loads THEN the Desktop App SHALL display three server sections: Backend, Reverb, and Frontend
2. WHEN a user clicks "Start" on the Reverb section THEN the Desktop App SHALL execute `php artisan reverb:start` in the backend directory
3. WHEN a user clicks "Stop" on the Reverb section THEN the Desktop App SHALL terminate the Reverb server process
4. WHEN the Reverb server is running THEN the Desktop App SHALL display a "Running" indicator

### Requirement 2

**User Story:** As a system administrator, I want to customize server commands, so that I can adjust startup parameters as needed.

#### Acceptance Criteria

1. WHEN a user right-clicks on any server's Start button THEN the Desktop App SHALL display a dialog to edit the command
2. WHEN a user saves a custom command THEN the Desktop App SHALL persist the command to local storage
3. WHEN the DevRunnerPanel loads THEN the Desktop App SHALL restore previously saved custom commands

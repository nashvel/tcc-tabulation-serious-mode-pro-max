# Event Tabulation System - Conceptual Framework

## Conceptual Framework

The conceptual framework of the Event Tabulation System is anchored on the Input–Process–Output (IPO) Model, illustrating how user inputs are transformed into meaningful event outputs through systematic processing.

Figure XX. Conceptual Framework using IPO Model

```
┌──────────────────────────┐      ┌─────────────────────┐      ┌──────────────────────────┐
│          INPUT           │      │       PROCESS       │      │         OUTPUT           │
├──────────────────────────┤      ├─────────────────────┤      ├──────────────────────────┤
│                          │      │                     │      │                          │
│ • Event Data             │      │                     │      │ • Live Scoreboard        │
│   - Name, date, venue    │      │                     │      │   - Real-time rankings   │
│   - Rounds & schedules   │      │                     │      │   - Visual indicators    │
│                          │      │                     │      │                          │
│ • Candidate Information  │      │  Event Tabulation   │      │ • Real-Time Score        │
│   - Personal details     │ ───▶ │      System         │ ───▶ │   Updates                │
│   - Category assignment  │      │                     │      │   - Judge dashboard      │
│                          │      │                     │      │   - Public displays      │
│ • Judge Scores           │      │                     │      │                          │
│   - Individual ratings   │      │                     │      │ • Event Results &        │
│   - Per-criterion scores │      │                     │      │   Rankings               │
│                          │      │                     │      │   - Final placements     │
│ • Criteria & Round Setup │      │                     │      │   - Leaderboards         │
│   - Scoring criteria     │      │                     │      │   - Best in awards       │
│   - Percentage weights   │      │                     │      │                          │
│   - Round categories     │      │                     │      │ • Certificates & Reports │
│                          │      │                     │      │   - Digital certificates │
│                          │      │                     │      │   - Official documents   │
└──────────────────────────┘      └─────────────────────┘      └──────────────────────────┘
```

### Input

The input stage consists of data provided by administrators and judges during their interaction with the system. This includes:

• Event Data – Information describing the competition or pageant including event name, description, date, and important persons such as organizers or sponsors.

• Candidate Information – Details of participants including candidate numbers, names, course/department affiliations, and partnership assignments for paired events.

• Judge Scores – Numerical ratings submitted by judges for each candidate based on defined scoring criteria and percentage weights.

• Criteria and Round Setup – Configuration data defining competition rounds, scoring categories, percentage allocations, and judging parameters.

These inputs form the primary dataset used by the system to calculate rankings, determine winners, and generate comprehensive event documentation.

### Process

The process stage involves the transformation of inputs into actionable results through system intelligence and automated calculations, including:

• Score Processing – The system receives judge scores, validates them against defined criteria weights, and computes weighted averages and totals for each candidate.

• Real-Time Broadcasting – Using WebSocket technology, the system instantly pushes score updates to all connected devices including admin dashboards, judge interfaces, and live scoreboards.

• Voting Control – The system manages the flow of competition rounds, controlling when judges can submit scores, locking/unlocking scoring interfaces, and advancing through event categories.

• Session Management – The system maintains judge sessions, tracks scoring progress, and ensures data integrity throughout the event duration.

This stage ensures real-time score tabulation, synchronized updates across all platforms, and seamless coordination between administrators and judges.

### Output

The output stage represents the direct results of system processing, which includes:

• Live Scoreboard – Real-time display of candidate rankings, individual judge scores, and computed totals that update automatically as judges submit their ratings.

• Real-Time Score Updates – Instant notifications and score changes broadcast to all connected web browsers and desktop applications without requiring page refreshes.

• Event Results and Rankings – Final competition standings showing overall rankings, round-by-round scores, and winner determinations including special awards.

• Certificates and Reports – Generated documentation including winner certificates, participation certificates, and comprehensive event reports for record-keeping and distribution.


## System Architecture

The system follows a Three-Tier Client–Server Architecture where the presentation layer (users accessing through web browsers and desktop application) interacts with a centralized backend responsible for processing business logic, managing data, and handling real-time WebSocket communications. The backend is structured into modular components including admin authentication, event management, voting control, judge management, and scoring services, enabling clear separation of responsibilities and efficient system scalability.

Figure XX. Three-Tier Client-Server Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SYSTEM ARCHITECTURE                                  │
│                        Event Tabulation System                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────┐
                              │       USERS         │
                              │     ┌───┐ ┌───┐     │
                              │     │ A │ │ J │     │
                              │     └───┘ └───┘     │
                              │    Admin  Judge     │
                              └──────────┬──────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                                   │
│  ┌─────────────────────────────────┐    ┌─────────────────────────────────┐     │
│  │       Web Application           │    │      Desktop Application        │     │
│  │   Laravel │ Vue.js │ Tailwind   │    │       Flutter │ Dart            │     │
│  └─────────────────────────────────┘    └─────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         │                               │
                    HTTP/REST                      WebSocket
                         │                               │
                         ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION LAYER                                    │
│                          (Laravel PHP Framework)                                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         Business Logic                                   │   │
│  │   Controllers │ Models │ Services │ Routes │ Middleware                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Real-Time Broadcasting                                │   │
│  │   Laravel Reverb │ Pusher Protocol │ Event Broadcasting                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                         │
│                           (MySQL Database)                                      │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │   Events │ Candidates │ Rounds │ Criteria │ Judges │ Points             │   │
│  │   VotingStates │ Sessions │ AdminSettings                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Project Design

Figure XX. Admin Login

The image shows the official login interface for the Event Tabulation System. It presents a clean and professional design featuring the system logo with a secure login panel. The panel includes a field for admin PIN entry and a prominent login button, emphasizing authorized access and system security for event administrators.

Figure XX. Dashboard / Setup

The image shows the Admin Dashboard interface, designed for administrators to manage event operations. The dashboard provides an overview of key event metrics such as active events, total candidates, registered judges, and current voting status, enabling quick assessment of event operations. It includes sections for event selection, quick action buttons, and navigation to frequently used features.

Figure XX. Event Creation Interface

The image displays the Event Creation interface, which serves as the primary event setup screen for administrators. It presents form fields for event name, description, event date, and important persons (such as event organizers or sponsors). The interface allows administrators to configure all aspects of a new competition or pageant before adding candidates and criteria.

Figure XX. Candidate Management

The image shows the Candidate Management interface, which allows administrators to manage the participant roster. It presents a searchable table containing candidate numbers, names, course/department, and partnership information for paired events. Action buttons allow users to view, edit, or delete individual candidate records, while options such as "Add Candidate" and bulk operations support roster management.

Figure XX. Categories/Rounds Management

The image displays the Categories Management interface, designed for organizing competition rounds and scoring categories. It presents a comprehensive view of all rounds with their criteria, percentage weights, and status indicators. The interface includes features for adding new rounds, defining scoring criteria with percentage allocations, and organizing the event sequence through drag-and-drop functionality.

Figure XX. Criteria Management

The image shows the Criteria Management interface, which allows administrators to define scoring criteria for each round. It displays a list of criteria with their descriptions, percentage weights, and the round they belong to. Users can add new criteria, edit existing ones, or reorganize criteria to ensure fair and comprehensive judging standards.

Figure XX. Voting Control Panel

The image presents the Voting Control interface, which provides comprehensive event control capabilities. It displays the current voting state including active round, lock status, and judge participation. Control buttons for starting/stopping voting, locking/unlocking judge screens, advancing to next categories, and clearing judge selections enable real-time event management.

Figure XX. Judge Scoring Interface  

The image shows the Judge Scoring interface, which provides the scoring portal for judges. It displays the current active round, candidate list with photos, and scoring fields for each criterion. Judges can enter scores that are automatically validated against percentage weights and submitted in real-time via WebSocket connection.

Figure XX. Live Scoreboard

The image displays the Live Scoreboard interface, which provides real-time score display for audience viewing. It shows candidate rankings, individual judge scores, and computed totals that update automatically as judges submit scores. The interface supports different display modes for various competition formats.

Figure XX. Results & Rankings

The image shows the Results interface, which provides comprehensive competition results and analytics. It displays final rankings, individual round scores, and overall standings. Export options for printing certificates and generating reports enable thorough documentation of event outcomes.

Figure XX. Best In Awards

The image displays the Best In Awards interface, which showcases special category winners based on specific criteria performance. It presents category tabs for different award types (such as Best in Swimwear, Best in Talent, Best in Evening Gown) with winner cards displaying the top-performing candidate for each category. The interface includes a rankings list showing runner-up positions, enabling recognition of outstanding performances in individual competition segments.

Figure XX. Certificates Generation

The image displays the Certificates interface, which allows administrators to generate and print certificates for winners and participants. It provides templates for different award categories and supports customization of certificate content based on event results.


## Tools and Technologies

Table XX. Tools and Technologies used for Development

| Component   | Tools / Languages                    | Description                                    |
|-------------|--------------------------------------|------------------------------------------------|
| Web App     | Laravel, Vue.js, JavaScript          | Web-based user interface and presentation      |
| Desktop App | Flutter, Dart                        | Cross-platform desktop application             |
| Styling     | Tailwind CSS                         | Responsive design and styling framework        |
| Build Tool  | Vite                                 | Fast development server and build tool         |
| Back-end    | PHP / Laravel Framework              | Server-side logic and business processes       |
| Real-Time   | Laravel Reverb, Pusher Protocol      | WebSocket communication and broadcasting       |
| Database    | MySQL                                | Relational data storage                        |
| Others      | Figma, VS Code, Git, Postman         | Design, development, and version control       |

The Event Tabulation System utilizes a combination of modern web and desktop technologies to ensure efficient performance, real-time synchronization, user accessibility, and reliable data management.

The web application front-end is developed using Laravel with Vue.js, which together create the user interface where administrators and judges interact with the system through web browsers. Vue.js provides a component-based architecture that enables efficient UI updates and state management. Tailwind CSS controls the visual design, layout, colors, and responsive behavior across different screen sizes. Vite serves as the build tool, providing fast hot module replacement during development and optimized production builds.

The desktop application is developed using Flutter with Dart programming language, providing a native cross-platform experience for Windows, macOS, and Linux. Flutter enables the creation of a high-performance desktop interface with smooth animations and responsive controls. The desktop application communicates with the backend through RESTful APIs and WebSocket connections, ensuring real-time synchronization with the web application.

The back-end of the system is powered by PHP using the Laravel Framework, which handles the core business logic, data processing, and system operations. Laravel provides a robust Model-View-Controller (MVC) architecture that organizes code efficiently and promotes maintainability. The framework includes built-in features for database migrations, form validation, and security measures such as CSRF protection. Controllers manage user requests and coordinate between the user interface and database, while Models define data structures and relationships. The Events system enables broadcasting of real-time updates to connected clients.

For real-time communication, the system employs Laravel Reverb for WebSocket broadcasting using the Pusher protocol. This architecture enables instant score updates across all connected devices including both web browsers and desktop applications, allowing judges to submit scores that immediately appear on the live scoreboard and admin dashboard without page refreshes.

For data storage, the system employs MySQL as the relational database management system to ensure secure and organized information management. MySQL stores all structured data including events, candidates, rounds, criteria, judges, scores, and voting states. The database design follows normalization principles to minimize redundancy and maintain data integrity. Laravel's Eloquent ORM (Object-Relational Mapping) simplifies database interactions by allowing developers to work with database records as PHP objects.

Supporting tools such as Figma, Visual Studio Code, Git, and Postman are used throughout the development process to enhance design quality and implementation efficiency. Figma assists in creating interface mockups and visual prototypes. Visual Studio Code serves as the primary integrated development environment for writing, editing, and debugging code. Git provides version control capabilities, enabling collaborative development and change tracking. Postman facilitates API testing and documentation. Together, these tools contribute to a well-designed, functional, and maintainable system that effectively supports the operational needs of event tabulation and judging.

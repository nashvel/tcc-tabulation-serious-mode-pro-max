<!DOCTYPE html>
<html lang="en">
<head> 
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TCC Tabulation System - Flow Diagrams</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #ffffff;
            color: #1a1a1a;
        }
        .header {
            background: #1a1a1a;
            color: white;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid #e5e5e5;
        }
        .header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0;
        }
        .header p {
            display: none;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        .nav {
            background: white;
            padding: 1rem 0;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e5e5e5;
            display: flex;
            gap: 0;
            flex-wrap: wrap;
        }
        .nav-btn {
            padding: 0.5rem 1rem;
            background: transparent;
            color: #666;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
            text-decoration: none;
        }
        .nav-btn:hover {
            color: #1a1a1a;
            border-bottom-color: #1a1a1a;
        }
        .nav-btn.active {
            color: #1a1a1a;
            border-bottom-color: #1a1a1a;
        }
        .diagram-section {
            background: white;
            padding: 2rem 0;
            margin-bottom: 3rem;
            border-bottom: 1px solid #f0f0f0;
        }
        .diagram-section h2 {
            color: #1a1a1a;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            padding-bottom: 0;
            border-bottom: none;
        }
        .diagram-section p {
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.6;
            font-size: 0.9rem;
        }
        .mermaid {
            background: #fafafa;
            padding: 2rem;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
            overflow-x: auto;
        }
        .info-box {
            background: #f9f9f9;
            border-left: 2px solid #1a1a1a;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 0;
        }
        .info-box h3 {
            color: #1a1a1a;
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
            font-weight: 600;
        }
        .legend {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .legend-box {
            width: 40px;
            height: 30px;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 2rem;
            color: #999;
            background: white;
            margin-top: 2rem;
            border-top: 1px solid #e5e5e5;
            font-size: 0.85rem;
        }
        .footer a {
            color: #1a1a1a;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>TCC Tabulation System - Flow Diagrams</h1>
            <p>Visual documentation of system workflows and processes</p>
        </div>
    </div>

    <div class="container">
        <div class="nav">
            <a href="#desktop-app" class="nav-btn">Desktop App</a>
            <a href="#admin-setup" class="nav-btn">Admin Setup</a>
            <a href="#judge-flow" class="nav-btn">Judge Flow</a>
            <a href="#event-lifecycle" class="nav-btn">Event Lifecycle</a>
            <a href="#websocket-flow" class="nav-btn">WebSocket</a>
            <a href="#system-architecture" class="nav-btn">System Architecture</a>
            <a href="#database-schema" class="nav-btn">Database Schema</a>
            <a href="/api/documentation" class="nav-btn">API Docs (Swagger)</a>
            <a href="/erd" class="nav-btn">ERD</a>
        </div>

        <!-- Desktop App Flow -->
        <div id="desktop-app" class="diagram-section">
            <h2>VB.NET Desktop Application Flow</h2>
            <p>Event management and web server launch via the desktop application, with QR code and IP address display for mobile access.</p>
            
            <div class="mermaid">
flowchart TD
    Start([Admin Runs Desktop App]) --> Login{Admin<br/>Logged In?}
    
    Login -->|No| DesktopLogin[Enter Admin Credentials<br/>- Email<br/>- Password<br/>- API URL]
    DesktopLogin --> ValidateLogin[POST /api/login]
    ValidateLogin --> LoginSuccess{Login<br/>Success?}
    
    LoginSuccess -->|No| ShowError[Show Error Message]
    ShowError --> DesktopLogin
    
    LoginSuccess -->|Yes| MainForm[Show Main Form<br/>- Event List<br/>- Create Event Button<br/>- Run Event Button]
    
    MainForm --> EventAction{Action?}
    
    EventAction -->|Create| CreateEventForm[Show Create Event Form<br/>- Event Title<br/>- Number of Judges]
    CreateEventForm --> SubmitEvent[POST /api/events]
    SubmitEvent --> EventCreated[Event Added to List]
    EventCreated --> MainForm
    
    EventAction -->|Run| SelectEvent[Select Event from List]
    SelectEvent --> SetDistPath[Set Website Dist Path<br/>or Browse]
    SetDistPath --> StartServer[Start HTTP Server<br/>http-server -p 5173]
    
    StartServer --> GetIP[Get Local IP Address<br/>e.g., 192.168.1.100]
    GetIP --> GenerateQR[Generate QR Code<br/>URL: http://192.168.1.100:5173]
    
    GenerateQR --> ShowQRForm[Show QR Code Form<br/>- QR Code Image<br/>- IP Address<br/>- Port Number<br/>- Copy URL Button]
    
    ShowQRForm --> LaunchBrowser[Open Website in<br/>Default Browser<br/>http://localhost:5173]
    
    LaunchBrowser --> AdminAccess[Admin Accesses Web App<br/>- View Dashboard<br/>- Manage Rounds<br/>- Monitor Judges]
    
    AdminAccess --> MobileAccess[Mobile Users Scan QR<br/>or Enter IP Address<br/>Judges Access Scoring Form]
    
    MobileAccess --> RunEvent[Event Running]
    
    RunEvent --> EventAction2{Admin Action?}
    
    EventAction2 -->|Switch Round| SwitchRound[Click NEXT Button<br/>POST /api/voting/activate-round]
    SwitchRound --> RunEvent
    
    EventAction2 -->|Lock Screen| LockScreen[Click LOCK Button<br/>POST /api/voting/lock]
    LockScreen --> RunEvent
    
    EventAction2 -->|Clear Judges| ClearJudges[Click CLEAR Button<br/>POST /api/clear-occupied-judges]
    ClearJudges --> RunEvent
    
    EventAction2 -->|Close App| StopServer[Stop HTTP Server]
    StopServer --> End([End])
    
    style Start fill:#4CAF50,color:#fff
    style MainForm fill:#2196F3,color:#fff
    style StartServer fill:#FF9800,color:#fff
    style ShowQRForm fill:#9C27B0,color:#fff
    style AdminAccess fill:#2196F3,color:#fff
    style MobileAccess fill:#4CAF50,color:#fff
    style End fill:#607D8B,color:#fff
            </div>

            <div class="info-box">
                <h3>Key Features:</h3>
                <ul>
                    <li><strong>Admin Login:</strong> Secure authentication with backend API</li>
                    <li><strong>Event Management:</strong> Create and manage events from desktop</li>
                    <li><strong>Server Launch:</strong> Automatically starts HTTP server on available port</li>
                    <li><strong>QR Code:</strong> Generate QR code for easy mobile access</li>
                    <li><strong>IP Display:</strong> Show network IP and port for LAN access</li>
                    <li><strong>Browser Launch:</strong> Automatically open website in default browser</li>
                </ul>
            </div>
        </div>

        <!-- Admin Setup Flow -->
        <div id="admin-setup" class="diagram-section">
            <h2>Admin Setup & Event Management Flow</h2>
            <p>Complete workflow from event creation to completion, including candidate setup, round configuration, and judging management.</p>
            
            <div class="mermaid">
flowchart TD
    Start([Admin Opens System]) --> Login{Admin<br/>Logged In?}
    
    Login -->|No| AdminLogin[Enter Admin PIN<br/>POST /api/admin/login]
    AdminLogin --> Dashboard[Admin Dashboard]
    Login -->|Yes| Dashboard
    
    Dashboard --> EventCheck{Event<br/>Exists?}
    
    EventCheck -->|No| CreateEvent[Create New Event]
    CreateEvent --> SelectTemplate[Select Template<br/>GET /api/event-templates]
    SelectTemplate --> EventDetails[Enter Event Details<br/>- Title, Year, Date<br/>- Number of Judges]
    EventDetails --> SaveEvent[POST /api/events/create-full<br/>status: draft]
    
    EventCheck -->|Yes| LoadEvent[Load Event<br/>from voting_state]
    SaveEvent --> SetupCandidates
    LoadEvent --> SetupCandidates[Setup Candidates]
    
    SetupCandidates --> AddCandidates[Add Candidates<br/>- Number<br/>- Name<br/>- Gender/Category]
    AddCandidates --> SetupRounds
    
    SetupRounds[Setup Rounds] --> AddRounds[Add Rounds<br/>- Spot/Order<br/>- Round Name]
    AddRounds --> SetupCriteria
    
    SetupCriteria[Setup Criteria] --> AddCriteria[Add Criteria per Round<br/>- Criteria Name<br/>- Max Points]
    AddCriteria --> ConfigureJudges
    
    ConfigureJudges[Configure Judges] --> SetLoginMode[Set Login Mode<br/>POST /api/voting/display-settings<br/>auto or manual]
    SetLoginMode --> AddJudges[Add Judges<br/>POST /api/judges]
    AddJudges --> BuildSequence
    
    BuildSequence[Build Event Sequence] --> SelectRounds[Select Rounds from List]
    SelectRounds --> OrderRounds[Drag to Reorder<br/>or Use Move Up/Down]
    OrderRounds --> ConfirmSequence[Confirm Event Sequence]
    
    ConfirmSequence --> LaunchDesktop[Launch via Desktop App<br/>or Direct Web Access]
    
    LaunchDesktop --> ActivateFirstRound[Activate First Round<br/>POST /api/voting/activate-round]
    
    ActivateFirstRound --> SetActiveRound[Update active_round_id]
    
    SetActiveRound --> BroadcastWS[Broadcast WebSocket<br/>VotingStateChanged Event]
    BroadcastWS --> JudgesActivated[Judges See Scoring Form]
    
    JudgesActivated --> MonitorJudging[Monitor Judging<br/>- View Live Scores<br/>- Lock/Unlock Screens<br/>- Show Judge Numbers]
    
    MonitorJudging --> RoundComplete{Round<br/>Complete?}
    
    RoundComplete -->|Yes| NextRound{More Rounds?}
    RoundComplete -->|No| MonitorJudging
    
    NextRound -->|Yes| SelectNextRound[Click NEXT Button<br/>Select Next Round]
    SelectNextRound --> ActivateFirstRound
    
    NextRound -->|No| EventComplete[Event Complete<br/>All Rounds Finished]
    
    EventComplete --> ReviewScores[Review Final Scores<br/>and Results]
    ReviewScores --> PrintCertificates[Print Certificates<br/>/admin/certificates]
    PrintCertificates --> End([End])
    
    MonitorJudging -.->|Emergency| LockScreens[Lock All Screens<br/>POST /api/voting/lock]
    LockScreens -.-> MonitorJudging
    
    MonitorJudging -.->|Identify| ShowNumbers[Show Judge Numbers<br/>POST /api/voting/show-judge-numbers]
    ShowNumbers -.-> MonitorJudging
    
    MonitorJudging -.->|Sync| RefreshAll[Refresh All Screens<br/>POST /api/voting/refresh-screens]
    RefreshAll -.-> MonitorJudging
    
    style Start fill:#4CAF50,color:#fff
    style Dashboard fill:#2196F3,color:#fff
    style JudgesActivated fill:#4CAF50,color:#fff
    style End fill:#607D8B,color:#fff
    style LockScreens fill:#f44336,color:#fff
    style BroadcastWS fill:#9C27B0,color:#fff
            </div>

            <div class="info-box">
                <h3>Key APIs Used:</h3>
                <ul>
                    <li><code>POST /api/admin/login</code> - Admin authentication with PIN</li>
                    <li><code>POST /api/events/create-full</code> - Create event with all data</li>
                    <li><code>GET /api/event-templates</code> - Get available event templates</li>
                    <li><code>POST /api/voting/activate-round</code> - Activates a specific round for judging</li>
                    <li><code>POST /api/voting/lock</code> - Locks all judge screens</li>
                    <li><code>POST /api/voting/unlock</code> - Unlocks all judge screens</li>
                    <li><code>POST /api/voting/display-settings</code> - Set judge login mode (auto/manual)</li>
                    <li><code>POST /api/voting/show-judge-numbers</code> - Display chair numbers on judge screens</li>
                    <li><code>POST /api/voting/refresh-screens</code> - Force refresh all judge screens</li>
                    <li><code>POST /api/judges/swap-chairs</code> - Swap chair numbers between judges</li>
                    <li><code>POST /api/clear-occupied-judges</code> - Clears judge assignments</li>
                    <li><code>GET /api/event-sequence</code> - Gets the ordered list of rounds</li>
                    <li><code>GET /api/voting/state</code> - Gets current voting state and active round</li>
                </ul>
            </div>
        </div>

        <!-- Judge Flow -->
        <div id="judge-flow" class="diagram-section">
            <h2>Judge Scoring Flow</h2>
            <p>Step-by-step process of how judges log in, view candidates, and submit scores. Supports both Auto-Assign and Manual login modes.</p>
            
            <div class="mermaid">
flowchart TD
    Start([Judge Opens Judge Portal]) --> CheckLoginMode[GET /api/voting/display-settings<br/>Check judge_login_mode]
    
    CheckLoginMode --> LoginMode{Login Mode?}
    
    LoginMode -->|Auto-Assign| RegisterScreen[POST /api/judge/register-screen<br/>device_id, event_id]
    LoginMode -->|Manual| CheckOccupied[GET /api/occupied-judges]
    
    RegisterScreen --> AutoAssigned{Screen<br/>Registered?}
    AutoAssigned -->|Yes| SaveJudgeId[Save judge_id<br/>to localStorage]
    AutoAssigned -->|No| ShowWaiting[Show Waiting Screen<br/>All judges assigned]
    ShowWaiting --> RetryRegister[Retry after delay]
    RetryRegister --> RegisterScreen
    
    CheckOccupied --> SelectJudge[Select Judge Number<br/>from Available List]
    SelectJudge --> CheckAvailable{Judge Slot<br/>Available?}
    CheckAvailable -->|No| ShowError[Show Error:<br/>Judge Already Occupied]
    ShowError --> SelectJudge
    CheckAvailable -->|Yes| OccupyJudge[POST /api/occupy-judge<br/>judge_id]
    OccupyJudge --> SaveJudgeId
    
    SaveJudgeId --> WaitForRound[Wait for Admin<br/>to Start Event]
    
    WaitForRound --> WSListen[Listen to WebSocket<br/>voting-state.{eventId} channel<br/>scores.{eventId} channel]
    
    WSListen --> RoundActivated{Round<br/>Activated?}
    
    RoundActivated -->|No| WaitForRound
    RoundActivated -->|Yes| LoadRoundData[Load Active Round Data<br/>- Candidates<br/>- Criteria<br/>- Max Points]
    
    LoadRoundData --> ShowScoringForm[Display Scoring Form]
    
    ShowScoringForm --> SelectCandidate[Judge Selects Candidate]
    SelectCandidate --> EnterScores[Enter Scores for Each Criteria]
    
    EnterScores --> ValidateScore{Score<br/>Valid?}
    
    ValidateScore -->|No| ShowValidation[Show Validation Error]
    ShowValidation --> EnterScores
    
    ValidateScore -->|Yes| SubmitScore[POST /api/points/batch<br/>Submit All Scores at Once]
    
    SubmitScore --> SaveResponse{Save<br/>Success?}
    
    SaveResponse -->|No| ShowError2[Show Error Message]
    ShowError2 --> EnterScores
    
    SaveResponse -->|Yes| BroadcastScore[WebSocket Broadcast<br/>ScoreUpdated Event]
    BroadcastScore --> ShowSuccess[Show Success Toast]
    ShowSuccess --> MoreCandidates{More Candidates<br/>to Score?}
    
    MoreCandidates -->|Yes| SelectCandidate
    MoreCandidates -->|No| WaitNextRound[Wait for Next Round]
    
    WaitNextRound --> NextRoundActivated{Next Round<br/>Activated?}
    
    NextRoundActivated -->|Yes| LoadRoundData
    NextRoundActivated -->|No| EventStopped{Event<br/>Stopped?}
    
    EventStopped -->|Yes| ShowThankYou[Show Thank You Screen]
    EventStopped -->|No| WaitNextRound
    
    ShowThankYou --> End([End Session])
    
    WSListen -.->|Locked| ShowLockScreen[Display Lock Screen<br/>Cannot View/Submit]
    ShowLockScreen -.->|Unlocked| ShowScoringForm
    
    WSListen -.->|ShowJudgeNumbers| ShowNumber[Display Chair Number<br/>Overlay for X seconds]
    ShowNumber -.-> ShowScoringForm
    
    WSListen -.->|RefreshScreen| RefreshPage[Force Page Refresh]
    RefreshPage -.-> Start
    
    style Start fill:#4CAF50,color:#fff
    style ShowScoringForm fill:#2196F3,color:#fff
    style SubmitScore fill:#FF9800,color:#fff
    style ShowSuccess fill:#4CAF50,color:#fff
    style End fill:#607D8B,color:#fff
    style ShowLockScreen fill:#f44336,color:#fff
    style BroadcastScore fill:#9C27B0,color:#fff
            </div>

            <div class="info-box">
                <h3>Key APIs Used:</h3>
                <ul>
                    <li><code>GET /api/voting/display-settings</code> - Get login mode (auto/manual)</li>
                    <li><code>POST /api/judge/register-screen</code> - Auto-assign judge number to device</li>
                    <li><code>GET /api/judge/screen-status</code> - Check if device is registered</li>
                    <li><code>GET /api/occupied-judges</code> - Check which judge slots are occupied (manual mode)</li>
                    <li><code>POST /api/occupy-judge</code> - Occupy a judge slot (manual mode)</li>
                    <li><code>GET /api/voting/state</code> - Get current voting state and active round</li>
                    <li><code>POST /api/points/batch</code> - Submit all scores at once (optimized)</li>
                    <li><code>GET /api/candidates?event_id=1</code> - Get list of candidates</li>
                    <li><code>GET /api/criteria?event_id=1</code> - Get criteria for active round</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>WebSocket Channels:</h3>
                <ul>
                    <li><code>voting-state.{eventId}</code> - Round changes, lock/unlock, show judge numbers</li>
                    <li><code>scores.{eventId}</code> - Real-time score updates (ScoreUpdated event)</li>
                    <li><code>screen-registration.{eventId}</code> - Screen registration changes</li>
                </ul>
            </div>
        </div>

        <!-- Event Lifecycle -->
        <div id="event-lifecycle" class="diagram-section">
            <h2>Event Status Lifecycle</h2>
            <p>How event status changes throughout its lifecycle, including testing and final archival.</p>
            
            <div class="mermaid">
stateDiagram-v2
    [*] --> draft: Event Created
    
    draft --> active: Launch via Desktop App<br/>or Web Access
    
    active --> completed: Admin Marks Complete<br/>(manual)
    
    completed --> active: Restart for Testing<br/>(allowed)
    
    completed --> archived: Final Archival<br/>(manual)
    
    archived --> [*]: Cannot Restart
    
    note right of draft
        Event being set up
        - Adding candidates
        - Configuring rounds
        - Building sequence
    end note
    
    note right of active
        Event is running
        - Rounds being activated
        - Judges can score
        - Admin can switch rounds
        - Data preserved in real-time
    end note
    
    note right of completed
        Event marked as complete
        - All data preserved
        - Can restart for testing
        - Manual marking only
    end note
    
    note right of archived
        Event permanently locked
        - Cannot restart
        - Historical record
        - For final completed events
    end note
            </div>

            <div class="legend">
                <div class="legend-item">
                    <div class="legend-box" style="background: #90CAF9;"></div>
                    <span><strong>draft</strong> - Initial setup phase</span>
                </div>
                <div class="legend-item">
                    <div class="legend-box" style="background: #81C784;"></div>
                    <span><strong>active</strong> - Event is live</span>
                </div>
                <div class="legend-item">
                    <div class="legend-box" style="background: #FFB74D;"></div>
                    <span><strong>completed</strong> - Testing done, can restart</span>
                </div>
                <div class="legend-item">
                    <div class="legend-box" style="background: #E57373;"></div>
                    <span><strong>archived</strong> - Permanently locked</span>
                </div>
            </div>
        </div>

        <!-- WebSocket Real-time Flow -->
        <div id="websocket-flow" class="diagram-section">
            <h2>WebSocket Real-time Communication</h2>
            <p>Real-time event broadcasting using Laravel Reverb for instant updates across all connected clients.</p>
            
            <div class="mermaid">
flowchart TD
    subgraph Backend["Backend Events"]
        ScoreSubmit[Judge Submits Score<br/>POST /api/points/batch]
        RoundChange[Admin Changes Round<br/>POST /api/voting/activate-round]
        LockChange[Admin Locks/Unlocks<br/>POST /api/voting/lock]
        ShowNumbers[Admin Shows Numbers<br/>POST /api/voting/show-judge-numbers]
        RefreshCmd[Admin Refreshes<br/>POST /api/voting/refresh-screens]
    end
    
    subgraph Events["Laravel Events"]
        ScoreUpdated[ScoreUpdated Event<br/>scores.eventId]
        VotingStateChanged[VotingStateChanged Event<br/>voting-state.eventId]
        ScreenRegChanged[ScreenRegistrationChanged<br/>screen-registration.eventId]
    end
    
    subgraph Reverb["Laravel Reverb Server"]
        WSServer[WebSocket Server<br/>Port 8080]
    end
    
    subgraph Clients["Connected Clients"]
        AdminPanel[Admin Panel<br/>ResultsTab, JudgesScoringTab<br/>PrintingZoneTab]
        JudgeScreens[Judge Screens<br/>JudgePage.vue]
        DisplayScreens[Display Screens<br/>Scoreboard]
    end
    
    ScoreSubmit --> ScoreUpdated
    RoundChange --> VotingStateChanged
    LockChange --> VotingStateChanged
    ShowNumbers --> VotingStateChanged
    RefreshCmd --> VotingStateChanged
    
    ScoreUpdated --> WSServer
    VotingStateChanged --> WSServer
    ScreenRegChanged --> WSServer
    
    WSServer --> AdminPanel
    WSServer --> JudgeScreens
    WSServer --> DisplayScreens
    
    AdminPanel -->|Updates| LiveScores[Live Score Updates<br/>No Polling Required]
    JudgeScreens -->|Updates| RoundUI[Round Changes<br/>Lock Screen<br/>Show Number Overlay]
    DisplayScreens -->|Updates| ScoreboardUI[Real-time Scoreboard]
    
    style Backend fill:#FFF3E0
    style Events fill:#E8F5E9
    style Reverb fill:#9C27B0,color:#fff
    style Clients fill:#E3F2FD
    style WSServer fill:#9C27B0,color:#fff
            </div>

            <div class="info-box">
                <h3>WebSocket Events:</h3>
                <ul>
                    <li><code>ScoreUpdated</code> - Broadcast when judge submits scores (channel: scores.{eventId})</li>
                    <li><code>VotingStateChanged</code> - Broadcast on round change, lock/unlock, show numbers (channel: voting-state.{eventId})</li>
                    <li><code>ScreenRegistrationChanged</code> - Broadcast when judge screen registers/unregisters (channel: screen-registration.{eventId})</li>
                    <li><code>ActivityLogCreated</code> - Broadcast for activity log updates (channel: activity-logs.{eventId})</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>Configuration:</h3>
                <ul>
                    <li><strong>Driver:</strong> Laravel Reverb (BROADCAST_CONNECTION=reverb)</li>
                    <li><strong>Port:</strong> 8080 (configurable via REVERB_PORT)</li>
                    <li><strong>Host:</strong> 0.0.0.0 for LAN access</li>
                    <li><strong>Frontend:</strong> Laravel Echo with Pusher.js client</li>
                </ul>
            </div>
        </div>

        <!-- System Architecture -->
        <div id="system-architecture" class="diagram-section">
            <h2>System Architecture</h2>
            <p>High-level overview of the TCC Tabulation System components and data flow.</p>
            
            <div class="mermaid">
graph TB
    subgraph Frontend["Frontend - Vue.js 3"]
        Admin["Admin Panel<br/>AdminPage.vue"]
        Judge["Judge Portal<br/>JudgePage.vue"]
        Configure["Configure Judges<br/>JudgesConfigurePage.vue"]
        Certificates["Certificates<br/>CertificatesPage.vue"]
    end
    
    subgraph Backend["Backend - Laravel 11"]
        API["REST API<br/>Controllers"]
        WS["Laravel Reverb<br/>WebSocket Server"]
        Events["Event Broadcasting<br/>ScoreUpdated, VotingStateChanged"]
        DB[("MySQL Database")]
    end
    
    subgraph Database["Database Tables"]
        EventsTable["events<br/>id, title, status<br/>visual_settings"]
        Judges["judges<br/>id, event_id<br/>name, chair_number"]
        Candidates["candidates<br/>id, name, gender<br/>department"]
        Rounds["rounds<br/>id, event_id<br/>name, spot"]
        Criteria["criteria<br/>id, round_id<br/>name, points"]
        Points["points<br/>candidate_id, judge_id<br/>round_id, criteria_id<br/>points"]
        VotingState["voting_states<br/>event_id, is_locked<br/>active_round_id<br/>display_settings"]
        Templates["event_templates<br/>id, name<br/>config JSON"]
        ActivityLogs["activity_logs<br/>event_id, judge_id<br/>action, details"]
    end
    
    Admin -->|HTTP| API
    Judge -->|HTTP| API
    Configure -->|HTTP| API
    Certificates -->|HTTP| API
    
    Admin -.->|WebSocket| WS
    Judge -.->|WebSocket| WS
    Configure -.->|WebSocket| WS
    
    API --> DB
    API --> Events
    Events --> WS
    
    DB --> EventsTable
    DB --> Judges
    DB --> Candidates
    DB --> Rounds
    DB --> Criteria
    DB --> Points
    DB --> VotingState
    DB --> Templates
    DB --> ActivityLogs
    
    style Frontend fill:#E3F2FD
    style Backend fill:#FFF3E0
    style Database fill:#F3E5F5
    style Admin fill:#2196F3,color:#fff
    style Judge fill:#4CAF50,color:#fff
    style API fill:#FF9800,color:#fff
    style WS fill:#9C27B0,color:#fff
            </div>

            <div class="info-box">
                <h3>Technology Stack:</h3>
                <ul>
                    <li><strong>Frontend:</strong> Vue.js 3, Vue Router, TailwindCSS, SweetAlert2, Lucide Icons</li>
                    <li><strong>Backend:</strong> Laravel 11, Laravel Reverb (WebSocket), Sanctum</li>
                    <li><strong>Database:</strong> MySQL 8.0</li>
                    <li><strong>WebSocket:</strong> Laravel Reverb (native Laravel WebSocket server)</li>
                    <li><strong>Build Tool:</strong> Vite</li>
                    <li><strong>API Documentation:</strong> Swagger/OpenAPI (L5-Swagger)</li>
                </ul>
            </div>
        </div>

        <!-- Database Schema & Normalization -->
        <div id="database-schema" class="diagram-section">
            <h2>Database Schema & Normalization (3NF)</h2>
            <p>Normalized database design with proper relationships and data integrity constraints.</p>
            
            <div class="info-box">
                <h3>Recent Schema Updates (Dec 2025):</h3>
                <ul>
                    <li><strong>New Tables:</strong>
                        <ul>
                            <li><code>event_templates</code> - Reusable event configurations</li>
                            <li><code>event_themes</code> - Visual themes for events</li>
                            <li><code>activity_logs</code> - Judge activity tracking</li>
                        </ul>
                    </li>
                    <li><strong>Updated Tables:</strong>
                        <ul>
                            <li><code>voting_states</code> - Added display_settings JSON, registered_screens JSON, show_judge_numbers</li>
                            <li><code>events</code> - Added visual_settings JSON for header images</li>
                            <li><code>points</code> - Added unique constraint (candidate_id, judge_id, round_id, criteria_id)</li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div class="mermaid">
graph TB
    subgraph Core["Core Tables"]
        Events["events<br/>id, title, year, status<br/>visual_settings JSON<br/>unique_id"]
        Templates["event_templates<br/>id, name, description<br/>config JSON"]
        Themes["event_themes<br/>id, name<br/>colors JSON"]
    end
    
    subgraph Judging["Judging System"]
        Judges["judges<br/>id, event_id<br/>name, chair_number<br/>status"]
        Points["points<br/>id, candidate_id<br/>judge_id, round_id<br/>criteria_id, points<br/>UNIQUE constraint"]
        ActivityLogs["activity_logs<br/>id, event_id, judge_id<br/>action, details JSON<br/>created_at"]
    end
    
    subgraph Candidates["Candidate Management"]
        CandidatesTable["candidates<br/>id, event_id<br/>number, name, gender<br/>department, order"]
    end
    
    subgraph Rounds["Round & Criteria"]
        RoundsTable["rounds<br/>id, event_id<br/>spot, name"]
        Criteria["criteria<br/>id, round_id<br/>name, points"]
    end
    
    subgraph Voting["Voting State"]
        VotingState["voting_states<br/>id, event_id<br/>active_round_id<br/>is_locked<br/>display_settings JSON<br/>registered_screens JSON<br/>show_judge_numbers"]
    end
    
    subgraph Sequences["Event Sequences"]
        EventSeq["event_sequences<br/>id, event_id<br/>round_id, order"]
    end
    
    Events --> Judges
    Events --> CandidatesTable
    Events --> RoundsTable
    Events --> VotingState
    Events --> EventSeq
    Events --> ActivityLogs
    
    Templates -.-> Events
    Themes -.-> Events
    
    Judges --> Points
    Judges --> ActivityLogs
    
    CandidatesTable --> Points
    
    RoundsTable --> Criteria
    RoundsTable --> Points
    RoundsTable --> EventSeq
    
    Criteria --> Points
    
    VotingState --> RoundsTable
    
    style Core fill:#E3F2FD
    style Judging fill:#FFF3E0
    style Candidates fill:#F3E5F5
    style Rounds fill:#E8F5E9
    style Voting fill:#FCE4EC
    style Sequences fill:#FFF9C4
            </div>

            <div class="info-box">
                <h3>Key Relationships:</h3>
                <ul>
                    <li><strong>events</strong> → judges, candidates, rounds, voting_states (one-to-many)</li>
                    <li><strong>judges</strong> → points, activity_logs (one-to-many)</li>
                    <li><strong>candidates</strong> → points (one-to-many)</li>
                    <li><strong>rounds</strong> → criteria, points, event_sequences (one-to-many)</li>
                    <li><strong>voting_states.active_round_id</strong> → rounds (FK)</li>
                    <li><strong>points</strong> - UNIQUE(candidate_id, judge_id, round_id, criteria_id)</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>JSON Columns:</h3>
                <ul>
                    <li><strong>voting_states.display_settings</strong> - judge_login_mode, show_candidate_name, show_team_department</li>
                    <li><strong>voting_states.registered_screens</strong> - Array of {device_id, judge_id, registered_at}</li>
                    <li><strong>events.visual_settings</strong> - header_image, logo_image, background_image</li>
                    <li><strong>event_templates.config</strong> - rounds, criteria, judge_count configuration</li>
                </ul>
            </div>
        </div>

        <!-- API Reference -->
        <div id="api-reference" class="diagram-section">
            <h2>Complete API Reference</h2>
            <p>All available API endpoints organized by category.</p>
            
            <div class="info-box">
                <h3>Authentication</h3>
                <ul>
                    <li><code>POST /api/admin/login</code> - Admin login with PIN</li>
                    <li><code>POST /api/admin/change-pin</code> - Change admin PIN</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>Events</h3>
                <ul>
                    <li><code>GET /api/events</code> - List all events</li>
                    <li><code>GET /api/events/active</code> - Get active event</li>
                    <li><code>GET /api/events/{id}</code> - Get event details</li>
                    <li><code>POST /api/events</code> - Create event</li>
                    <li><code>POST /api/events/create-full</code> - Create event with all data</li>
                    <li><code>PUT /api/events/{id}</code> - Update event</li>
                    <li><code>DELETE /api/events/{id}</code> - Delete event</li>
                    <li><code>POST /api/events/{id}/activate</code> - Activate event</li>
                    <li><code>POST /api/events/{id}/complete</code> - Mark event complete</li>
                    <li><code>POST /api/events/{id}/archive</code> - Archive event</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>Judges</h3>
                <ul>
                    <li><code>GET /api/judges</code> - List judges for event</li>
                    <li><code>POST /api/judges</code> - Create judge</li>
                    <li><code>PUT /api/judges/{id}</code> - Update judge</li>
                    <li><code>DELETE /api/judges/{id}</code> - Delete judge</li>
                    <li><code>POST /api/judges/swap-chairs</code> - Swap chair numbers</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>Judge Screen Registration</h3>
                <ul>
                    <li><code>POST /api/judge/register-screen</code> - Auto-assign judge to device</li>
                    <li><code>GET /api/judge/screen-status</code> - Check device registration</li>
                    <li><code>POST /api/judge/unregister-screen</code> - Remove screen registration</li>
                    <li><code>GET /api/judge/registered-screens</code> - List registered screens</li>
                    <li><code>POST /api/judge/clear-screens</code> - Clear all registrations</li>
                    <li><code>POST /api/judge/swap-screens</code> - Swap screen assignments</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>Voting State & Control</h3>
                <ul>
                    <li><code>GET /api/voting/state</code> - Get current voting state</li>
                    <li><code>POST /api/voting/activate-round</code> - Activate a round</li>
                    <li><code>POST /api/voting/lock</code> - Lock all judge screens</li>
                    <li><code>POST /api/voting/unlock</code> - Unlock all judge screens</li>
                    <li><code>GET /api/voting/display-settings</code> - Get display settings</li>
                    <li><code>POST /api/voting/display-settings</code> - Update display settings</li>
                    <li><code>POST /api/voting/show-judge-numbers</code> - Show numbers on screens</li>
                    <li><code>POST /api/voting/hide-judge-numbers</code> - Hide numbers</li>
                    <li><code>POST /api/voting/refresh-screens</code> - Force refresh all screens</li>
                    <li><code>POST /api/clear-event-scores</code> - Clear all scores for event</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>Scoring</h3>
                <ul>
                    <li><code>GET /api/points</code> - Get all scores</li>
                    <li><code>POST /api/points</code> - Submit single score</li>
                    <li><code>POST /api/points/batch</code> - Submit batch scores (optimized)</li>
                    <li><code>PUT /api/points/{id}</code> - Update score</li>
                    <li><code>DELETE /api/points/{id}</code> - Delete score</li>
                    <li><code>GET /api/scoreboard</code> - Get scoreboard data</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>Candidates, Rounds & Criteria</h3>
                <ul>
                    <li><code>GET /api/candidates</code> - List candidates</li>
                    <li><code>POST /api/candidates</code> - Create candidate</li>
                    <li><code>PUT /api/candidates/{id}</code> - Update candidate</li>
                    <li><code>DELETE /api/candidates/{id}</code> - Delete candidate</li>
                    <li><code>GET /api/rounds</code> - List rounds</li>
                    <li><code>POST /api/rounds</code> - Create round</li>
                    <li><code>PUT /api/rounds/{id}</code> - Update round</li>
                    <li><code>DELETE /api/rounds/{id}</code> - Delete round</li>
                    <li><code>GET /api/criteria</code> - List criteria</li>
                    <li><code>POST /api/criteria</code> - Create criteria</li>
                    <li><code>PUT /api/criteria/{id}</code> - Update criteria</li>
                    <li><code>DELETE /api/criteria/{id}</code> - Delete criteria</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>Templates & Themes</h3>
                <ul>
                    <li><code>GET /api/event-templates</code> - List event templates</li>
                    <li><code>GET /api/event-templates/{id}</code> - Get template details</li>
                    <li><code>POST /api/event-templates</code> - Create template</li>
                    <li><code>POST /api/event-templates/{id}/create-event</code> - Create event from template</li>
                    <li><code>GET /api/event-themes</code> - List themes</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>Reports & Activity</h3>
                <ul>
                    <li><code>GET /api/reports/judge-scores</code> - Get judge scores report</li>
                    <li><code>GET /api/activity-logs</code> - Get activity logs</li>
                    <li><code>POST /api/activity-logs</code> - Create activity log</li>
                    <li><code>GET /api/activity-logs/stats</code> - Get activity stats</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>TCC Tabulation System Documentation</strong></p>
            <p>Access API Documentation: <a href="/api/documentation">Swagger API Docs</a> | <a href="/erd">ERD Diagrams</a></p>
            <p>Database Normalized: 3NF | Last Updated: {{ date('Y-m-d H:i:s') }}</p>
        </div>
    </div>

    <script>
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });

        // Smooth scroll for navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const href = btn.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>

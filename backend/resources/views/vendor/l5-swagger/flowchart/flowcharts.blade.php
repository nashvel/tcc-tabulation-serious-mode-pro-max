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
            <a href="#system-architecture" class="nav-btn">System Architecture</a>
            <a href="/api/documentation" class="nav-btn">API Docs (Swagger)</a>
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
    
    Login -->|No| AdminLogin[Enter Admin PIN]
    AdminLogin --> Dashboard[Admin Dashboard]
    Login -->|Yes| Dashboard
    
    Dashboard --> EventCheck{Event<br/>Exists?}
    
    EventCheck -->|No| CreateEvent[Create New Event]
    CreateEvent --> EventDetails[Enter Event Details<br/>- Title, Year, Date<br/>- Number of Judges]
    EventDetails --> SaveEvent[Save Event<br/>status: draft]
    
    EventCheck -->|Yes| LoadEvent[Load Event<br/>from voting_state]
    SaveEvent --> SetupCandidates
    LoadEvent --> SetupCandidates[Setup Candidates]
    
    SetupCandidates --> AddCandidates[Add Candidates<br/>- Number<br/>- Name<br/>- Gender/Category]
    AddCandidates --> SetupRounds
    
    SetupRounds[Setup Rounds] --> AddRounds[Add Rounds<br/>- Spot/Order<br/>- Round Name]
    AddRounds --> SetupCriteria
    
    SetupCriteria[Setup Criteria] --> AddCriteria[Add Criteria per Round<br/>- Criteria Name<br/>- Max Points]
    AddCriteria --> BuildSequence
    
    BuildSequence[Build Event Sequence] --> SelectRounds[Select Rounds from List]
    SelectRounds --> OrderRounds[Drag to Reorder<br/>or Use Move Up/Down]
    OrderRounds --> ConfirmSequence[Confirm Event Sequence]
    
    ConfirmSequence --> LaunchDesktop[Launch via Desktop App<br/>or Direct Web Access]
    
    LaunchDesktop --> ActivateFirstRound[Activate First Round<br/>POST /api/voting/activate-round]
    
    ActivateFirstRound --> SetActiveRound[Update active_round_id<br/>and active_round_name]
    
    SetActiveRound --> BroadcastWS[Broadcast WebSocket<br/>voting-state channel]
    BroadcastWS --> JudgesActivated[Judges See Scoring Form]
    
    JudgesActivated --> MonitorJudging[Monitor Judging<br/>- View Scores<br/>- Lock/Unlock Screens<br/>- Clear Judges]
    
    MonitorJudging --> RoundComplete{Round<br/>Complete?}
    
    RoundComplete -->|Yes| NextRound{More Rounds?}
    RoundComplete -->|No| MonitorJudging
    
    NextRound -->|Yes| SelectNextRound[Click NEXT Button<br/>Select Next Round]
    SelectNextRound --> ActivateFirstRound
    
    NextRound -->|No| EventComplete[Event Complete<br/>All Rounds Finished]
    
    EventComplete --> ReviewScores[Review Final Scores<br/>and Results]
    
    ReviewScores --> End([End])
    
    MonitorJudging -.->|Emergency| LockScreens[Lock All Screens]
    LockScreens -.-> MonitorJudging
    
    style Start fill:#4CAF50,color:#fff
    style Dashboard fill:#2196F3,color:#fff
    style StartEvent fill:#FF9800,color:#fff
    style JudgesActivated fill:#4CAF50,color:#fff
    style End fill:#607D8B,color:#fff
    style LockScreens fill:#f44336,color:#fff
            </div>

            <div class="info-box">
                <h3>Key APIs Used:</h3>
                <ul>
                    <li><code>POST /api/voting/activate-round</code> - Activates a specific round for judging</li>
                    <li><code>POST /api/voting/lock</code> - Locks all judge screens</li>
                    <li><code>POST /api/voting/unlock</code> - Unlocks all judge screens</li>
                    <li><code>POST /api/clear-occupied-judges</code> - Clears judge assignments</li>
                    <li><code>GET /api/event-sequence</code> - Gets the ordered list of rounds</li>
                    <li><code>GET /api/voting/state</code> - Gets current voting state and active round</li>
                </ul>
            </div>
        </div>

        <!-- Judge Flow -->
        <div id="judge-flow" class="diagram-section">
            <h2>Judge Scoring Flow</h2>
            <p>Step-by-step process of how judges log in, view candidates, and submit scores.</p>
            
            <div class="mermaid">
flowchart TD
    Start([Judge Opens Judge Portal]) --> CheckOccupied[GET /api/occupied-judges]
    
    CheckOccupied --> SelectJudge[Select Judge Number<br/>1, 2, 3, 4, or 5]
    
    SelectJudge --> CheckAvailable{Judge Slot<br/>Available?}
    
    CheckAvailable -->|No| ShowError[Show Error:<br/>Judge Already Occupied]
    ShowError --> SelectJudge
    
    CheckAvailable -->|Yes| OccupyJudge[POST /api/occupy-judge<br/>judge_id]
    
    OccupyJudge --> SaveLocal[Save judge_id<br/>to localStorage]
    SaveLocal --> WaitForRound[Wait for Admin<br/>to Start Event]
    
    WaitForRound --> WSListen[Listen to WebSocket<br/>voting-state channel]
    
    WSListen --> RoundActivated{Round<br/>Activated?}
    
    RoundActivated -->|No| WaitForRound
    RoundActivated -->|Yes| LoadRoundData[Load Active Round Data<br/>- Candidates<br/>- Criteria<br/>- Max Points]
    
    LoadRoundData --> ShowScoringForm[Display Scoring Form]
    
    ShowScoringForm --> SelectCandidate[Judge Selects Candidate]
    SelectCandidate --> EnterScores[Enter Scores for Each Criteria]
    
    EnterScores --> ValidateScore{Score<br/>Valid?}
    
    ValidateScore -->|No| ShowValidation[Show Validation Error]
    ShowValidation --> EnterScores
    
    ValidateScore -->|Yes| SubmitScore[POST /api/points<br/>Submit Score]
    
    SubmitScore --> SaveResponse{Save<br/>Success?}
    
    SaveResponse -->|No| ShowError2[Show Error Message]
    ShowError2 --> EnterScores
    
    SaveResponse -->|Yes| ShowSuccess[Show Success Toast]
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
    
    style Start fill:#4CAF50,color:#fff
    style ShowScoringForm fill:#2196F3,color:#fff
    style SubmitScore fill:#FF9800,color:#fff
    style ShowSuccess fill:#4CAF50,color:#fff
    style End fill:#607D8B,color:#fff
    style ShowLockScreen fill:#f44336,color:#fff
            </div>

            <div class="info-box">
                <h3>Key APIs Used:</h3>
                <ul>
                    <li><code>GET /api/occupied-judges</code> - Check which judge slots are occupied</li>
                    <li><code>POST /api/occupy-judge</code> - Occupy a judge slot</li>
                    <li><code>GET /api/voting/state</code> - Get current voting state and active round</li>
                    <li><code>POST /api/points</code> - Submit judge score (creates or updates)</li>
                    <li><code>GET /api/candidates?event_id=1</code> - Get list of candidates</li>
                    <li><code>GET /api/criteria?event_id=1</code> - Get criteria for active round</li>
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

        <!-- System Architecture -->
        <div id="system-architecture" class="diagram-section">
            <h2>System Architecture</h2>
            <p>High-level overview of the TCC Tabulation System components and data flow.</p>
            
            <div class="mermaid">
graph TB
    subgraph Frontend["Frontend - React"]
        Admin[Admin Panel<br/>AdminTools.jsx]
        Judge[Judge Portal<br/>Judge.jsx]
        Display[Display Screen<br/>Scoreboard]
    end
    
    subgraph Backend["Backend - Laravel"]
        API[REST API<br/>Controllers]
        WS[WebSocket Server<br/>Laravel Echo]
        DB[(MySQL Database)]
    end
    
    subgraph Database["Database Tables"]
        Events[events<br/>- id, title, status]
        Candidates[candidates<br/>- id, name, gender]
        Rounds[rounds<br/>- id, name, spot]
        Criteria[criteria<br/>- id, name, points]
        Points[points<br/>- candidate_id<br/>- judge_id<br/>- points]
        VotingState[voting_states<br/>- is_active<br/>- active_round_id]
        EventSeq[event_sequences<br/>- round_id<br/>- order]
    end
    
    Admin -->|HTTP Requests| API
    Judge -->|HTTP Requests| API
    Display -->|HTTP Requests| API
    
    Admin -.->|WebSocket| WS
    Judge -.->|WebSocket| WS
    Display -.->|WebSocket| WS
    
    API --> DB
    WS --> DB
    
    DB --> Events
    DB --> Candidates
    DB --> Rounds
    DB --> Criteria
    DB --> Points
    DB --> VotingState
    DB --> EventSeq
    
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
                    <li><strong>Frontend:</strong> React, React Router, TailwindCSS, React Hot Toast</li>
                    <li><strong>Backend:</strong> Laravel 10, Laravel Echo, Sanctum (optional)</li>
                    <li><strong>Database:</strong> MySQL 8.0</li>
                    <li><strong>WebSocket:</strong> Pusher / Laravel Reverb</li>
                    <li><strong>API Documentation:</strong> Swagger/OpenAPI (L5-Swagger)</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>TCC Tabulation System Documentation</strong></p>
            <p>Access API Documentation: <a href="/api/documentation">Swagger API Docs</a></p>
            <p>Generated: {{ date('Y-m-d H:i:s') }}</p>
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

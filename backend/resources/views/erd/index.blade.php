<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TCC Tabulation System - Entity Relationship Diagram</title>
    <script src="https://cdn.jsdelivr.net/npm/viz.js@2.1.2/viz.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/viz.js@2.1.2/full.render.js"></script>
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

        .info-box ul {
            list-style: none;
            padding-left: 0;
        }

        .info-box li {
            padding: 0.5rem 0;
            color: #555;
            line-height: 1.6;
            font-size: 0.9rem;
        }

        .info-box li:before {
            content: "• ";
            color: #1a1a1a;
            font-weight: bold;
            margin-right: 0.5rem;
        }

        .table-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .table-card {
            background: #f9f9f9;
            border: 1px solid #e5e5e5;
            padding: 1rem;
            border-radius: 4px;
            font-size: 0.85rem;
        }

        .table-card h3 {
            color: #1a1a1a;
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .table-card p {
            color: #666;
            font-size: 0.8rem;
            margin-bottom: 0.75rem;
        }

        .columns {
            list-style: none;
            padding: 0;
        }

        .columns li {
            padding: 0.25rem 0;
            font-size: 0.8rem;
            color: #555;
            border-bottom: 1px solid #e5e5e5;
        }

        .columns li:last-child {
            border-bottom: none;
        }

        .column-name {
            font-weight: 600;
            color: #333;
        }

        .column-type {
            color: #999;
            font-size: 0.75rem;
            margin-left: 0.5rem;
        }

        .tabs {
            display: flex;
            gap: 0;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #e5e5e5;
        }

        .tab-btn {
            padding: 0.5rem 1rem;
            background: transparent;
            color: #666;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
        }

        .tab-btn:hover {
            color: #1a1a1a;
        }

        .tab-btn.active {
            color: #1a1a1a;
            border-bottom-color: #1a1a1a;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .erd-tab-content {
            display: none;
        }

        .erd-tab-content.active {
            display: block;
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
            <h1>TCC Tabulation System - Entity Relationship Diagram</h1>
        </div>
    </div>

    <div class="container">
        <div class="nav">
            <a href="/" class="nav-btn">Home</a>
            <a href="/flowcharts" class="nav-btn">Flowcharts</a>
            <a href="/api/documentation" class="nav-btn">API Docs</a>
            <a href="/erd" class="nav-btn active">ERD</a>
        </div>

        <!-- ERD Diagram -->
        <div class="diagram-section">
            <h2>Database Schema</h2>
            <p>Entity relationships and table structure for the TCC Tabulation System.</p>

            <div class="tabs">
                <button class="tab-btn active" onclick="switchERDTab('erd')">ER Model (Chen's)</button>
                <button class="tab-btn" onclick="switchERDTab('conceptual')">Conceptual</button>
                <button class="tab-btn" onclick="switchERDTab('logical')">Logical Data Model</button>
                <button class="tab-btn" onclick="switchERDTab('physical')">Physical Data Model</button>
            </div>

            @include('erd.erd')
            @include('erd.conceptual')
            @include('erd.logical')
            @include('erd.physical')
        </div>

        <!-- Table Details -->
        <div class="diagram-section">
            <h2>Table Details</h2>
            <p>Schema information for all database tables.</p>

            <div class="tabs">
                <button class="tab-btn active" onclick="switchTab('overview')">Overview</button>
                <button class="tab-btn" onclick="switchTab('relationships')">Relationships</button>
            </div>

            <!-- Overview Tab -->
            <div id="overview" class="tab-content active">
                <div class="table-grid">
                    <div class="table-card">
                        <h3>EVENTS</h3>
                        <p>Stores event information and overall status.</p>
                        <ul class="columns">
                            <li><span class="column-name">id</span> <span class="column-type">INT PK</span></li>
                            <li><span class="column-name">title</span> <span class="column-type">VARCHAR</span></li>
                            <li><span class="column-name">year</span> <span class="column-type">INT</span></li>
                            <li><span class="column-name">date</span> <span class="column-type">DATE</span></li>
                            <li><span class="column-name">status</span> <span class="column-type">VARCHAR</span></li>
                            <li><span class="column-name">created_at</span> <span class="column-type">TIMESTAMP</span></li>
                            <li><span class="column-name">updated_at</span> <span class="column-type">TIMESTAMP</span></li>
                        </ul>
                    </div>

                    <div class="table-card">
                        <h3>CANDIDATES</h3>
                        <p>Stores participant/candidate information.</p>
                        <ul class="columns">
                            <li><span class="column-name">id</span> <span class="column-type">INT PK</span></li>
                            <li><span class="column-name">event_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">number</span> <span class="column-type">INT</span></li>
                            <li><span class="column-name">name</span> <span class="column-type">VARCHAR</span></li>
                            <li><span class="column-name">gender</span> <span class="column-type">VARCHAR</span></li>
                            <li><span class="column-name">created_at</span> <span class="column-type">TIMESTAMP</span></li>
                            <li><span class="column-name">updated_at</span> <span class="column-type">TIMESTAMP</span></li>
                        </ul>
                    </div>

                    <div class="table-card">
                        <h3>ROUNDS</h3>
                        <p>Stores judging rounds/categories.</p>
                        <ul class="columns">
                            <li><span class="column-name">id</span> <span class="column-type">INT PK</span></li>
                            <li><span class="column-name">event_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">name</span> <span class="column-type">VARCHAR</span></li>
                            <li><span class="column-name">spot</span> <span class="column-type">INT</span></li>
                            <li><span class="column-name">created_at</span> <span class="column-type">TIMESTAMP</span></li>
                            <li><span class="column-name">updated_at</span> <span class="column-type">TIMESTAMP</span></li>
                        </ul>
                    </div>

                    <div class="table-card">
                        <h3>CRITERIA</h3>
                        <p>Stores scoring criteria for each round.</p>
                        <ul class="columns">
                            <li><span class="column-name">id</span> <span class="column-type">INT PK</span></li>
                            <li><span class="column-name">round_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">name</span> <span class="column-type">VARCHAR</span></li>
                            <li><span class="column-name">max_points</span> <span class="column-type">INT</span></li>
                            <li><span class="column-name">created_at</span> <span class="column-type">TIMESTAMP</span></li>
                            <li><span class="column-name">updated_at</span> <span class="column-type">TIMESTAMP</span></li>
                        </ul>
                    </div>

                    <div class="table-card">
                        <h3>JUDGES</h3>
                        <p>Stores judge information and occupation status.</p>
                        <ul class="columns">
                            <li><span class="column-name">id</span> <span class="column-type">INT PK</span></li>
                            <li><span class="column-name">event_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">judge_number</span> <span class="column-type">INT</span></li>
                            <li><span class="column-name">name</span> <span class="column-type">VARCHAR</span></li>
                            <li><span class="column-name">pin</span> <span class="column-type">VARCHAR</span></li>
                            <li><span class="column-name">occupied</span> <span class="column-type">BOOLEAN</span></li>
                        </ul>
                    </div>

                    <div class="table-card">
                        <h3>VOTING_POINTS</h3>
                        <p>Stores individual judge scores for candidates.</p>
                        <ul class="columns">
                            <li><span class="column-name">id</span> <span class="column-type">INT PK</span></li>
                            <li><span class="column-name">judge_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">candidate_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">round_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">criteria_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">points</span> <span class="column-type">DECIMAL</span></li>
                        </ul>
                    </div>

                    <div class="table-card">
                        <h3>VOTING_STATES</h3>
                        <p>Tracks current voting state and active round.</p>
                        <ul class="columns">
                            <li><span class="column-name">id</span> <span class="column-type">INT PK</span></li>
                            <li><span class="column-name">event_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">is_active</span> <span class="column-type">BOOLEAN</span></li>
                            <li><span class="column-name">is_locked</span> <span class="column-type">BOOLEAN</span></li>
                            <li><span class="column-name">active_round_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">active_round_name</span> <span class="column-type">VARCHAR</span></li>
                        </ul>
                    </div>

                    <div class="table-card">
                        <h3>EVENT_SEQUENCES</h3>
                        <p>Stores the ordered sequence of rounds for an event.</p>
                        <ul class="columns">
                            <li><span class="column-name">id</span> <span class="column-type">INT PK</span></li>
                            <li><span class="column-name">event_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">round_id</span> <span class="column-type">INT FK</span></li>
                            <li><span class="column-name">order</span> <span class="column-type">INT</span></li>
                            <li><span class="column-name">created_at</span> <span class="column-type">TIMESTAMP</span></li>
                            <li><span class="column-name">updated_at</span> <span class="column-type">TIMESTAMP</span></li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Relationships Tab -->
            <div id="relationships" class="tab-content">
                <div class="info-box">
                    <h3>One-to-Many Relationships</h3>
                    <ul>
                        <li><strong>EVENTS → CANDIDATES</strong> - One event has many candidates</li>
                        <li><strong>EVENTS → ROUNDS</strong> - One event has many rounds</li>
                        <li><strong>ROUNDS → CRITERIA</strong> - One round has many criteria</li>
                        <li><strong>EVENTS → JUDGES</strong> - One event has many judges</li>
                        <li><strong>JUDGES → VOTING_POINTS</strong> - One judge submits many scores</li>
                        <li><strong>CANDIDATES → VOTING_POINTS</strong> - One candidate receives many scores</li>
                        <li><strong>ROUNDS → VOTING_POINTS</strong> - One round has many scores</li>
                        <li><strong>CRITERIA → VOTING_POINTS</strong> - One criteria has many scores</li>
                        <li><strong>EVENTS → VOTING_STATES</strong> - One event has one voting state</li>
                        <li><strong>EVENTS → EVENT_SEQUENCES</strong> - One event has many sequence entries</li>
                    </ul>
                </div>
            </div>

            </div>
        </div>
    </div>

    <div class="footer">
        <p>TCC Tabulation System - Entity Relationship Diagram</p>
        <p>Access <a href="/api/documentation">API Documentation</a> or <a href="/flowcharts">Flowcharts</a></p>
    </div>

    <script>
        function switchERDTab(tabName) {
            // Hide all ERD tab contents
            document.querySelectorAll('.erd-tab-content').forEach(el => el.classList.remove('active'));
            
            // Remove active class from all ERD tab buttons (first diagram-section)
            const firstDiagramSection = document.querySelector('.diagram-section');
            if (firstDiagramSection) {
                firstDiagramSection.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            }
            
            // Show selected tab
            const tabElement = document.getElementById(tabName);
            if (tabElement) {
                tabElement.classList.add('active');
            }
            
            // Add active class to clicked button
            if (event && event.target) {
                event.target.classList.add('active');
            }
        }

        function switchTab(tabName) {
            // Hide all table detail tab contents
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            
            // Remove active class from all table detail tab buttons (last diagram-section)
            const allDiagramSections = document.querySelectorAll('.diagram-section');
            if (allDiagramSections.length > 1) {
                const lastDiagramSection = allDiagramSections[allDiagramSections.length - 1];
                lastDiagramSection.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            }
            
            // Show selected tab
            const tabElement = document.getElementById(tabName);
            if (tabElement) {
                tabElement.classList.add('active');
            }
            
            // Add active class to clicked button
            if (event && event.target) {
                event.target.classList.add('active');
            }
        }
    </script>
</body>
</html>

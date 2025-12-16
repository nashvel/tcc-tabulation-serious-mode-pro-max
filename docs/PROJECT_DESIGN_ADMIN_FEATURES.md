# Scope of the Study

This study focuses on the design and development of an Event Tabulation and Judging System for institutional events and competitions. The system covers the following functional components:

**Judge Scoring Interface** – Provides judges with a dedicated, real-time scoring screen where they can select their judge number and enter scores per candidate and criterion. Scores are automatically computed and summarized with a progress counter showing scores entered versus total required inputs per round.

**Desktop Event Creation and Continuation** – The system allows administrators to create and configure events through a desktop application built using the Flutter framework. Once created, the event can be continued, managed, and monitored within the same Flutter-based environment, ensuring consistency, flexibility, and cross-platform accessibility.

**Candidate, Criteria, and Round Management** – Allows authorized users to manage candidates, judging criteria, and rounds or segments of the event, ensuring that all scoring is based on a predefined structure.

**Automated Tabulation and Results Display** – Automatically aggregates and computes scores from all judges to generate rankings and summaries, reducing manual calculations and helping organizers identify winners efficiently.

**Event and Voting Control Panel** – Enables administrators to start and stop judging, activate or lock rounds, and monitor the status of scoring during the event through a centralized dashboard.

**Configure Judges** – Allows administrators to manage the panel of judges for an event through a modal interface where they can add new judges with name and chair number assignments, edit existing judge information, set judge status as active, idle, or locked, and delete judges from the event.

**Printing Zone** – Serves as the official result generation center where administrators can select a specific round to view a formatted result sheet displaying all candidates with their scores from each judge and calculated averages, automatically identifying winners based on highest scores with tie detection support, and providing both direct printing and PDF export functionality with customizable footer settings.

**UI Templates** – Enables administrators to create and manage reusable templates for event components including Header templates for multiple logo arrangements on judge screens with drag-and-drop reordering, and Lock Screen templates for custom voting lock images supporting various image formats.

**Themes** – Provides color customization for event branding through three configurable properties—primary, secondary, and accent colors—with visual color pickers, hex code input, and live preview, allowing administrators to create multiple custom themes stored in a library for reuse across events.

**Activity Logs** – Provides real-time monitoring of all scoring activities displaying statistics for total actions, scores entered, scores updated, and judge logins, with a filterable log list showing action icons, descriptions, judge numbers, relative timestamps, IP addresses, and point values, supporting both manual and auto-refresh modes.

**Settings** – Provides configuration for judge screen display with toggles for showing candidate names and team information along with live preview, plus a Registered Screens section displaying all connected judge devices with their assignments, IP addresses, and connection times, offering actions to swap judge assignments between screens, kick individual devices, or reset all registrations.

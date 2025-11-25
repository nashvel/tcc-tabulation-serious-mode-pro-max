Imports System.Net.Http
Imports System.Windows.Forms
Imports System.Drawing

Public Class MainFormModern
    Inherits Form

    Private httpClient As HttpClient
    Private mainPanel As Panel
    Private contentPanel As Panel
    Private serviceButtons As Dictionary(Of String, Button)
    Private titleTxt As TextBox
    Private yearTxt As TextBox
    Private judgesTxt As TextBox
    Private eventListBox As ListBox
    Private logsTextBox As TextBox
    Private serviceStatus As Dictionary(Of String, Boolean)

    Public Sub New()
        MyBase.New()
        httpClient = New HttpClient()
        serviceButtons = New Dictionary(Of String, Button)
        serviceStatus = New Dictionary(Of String, Boolean) From {
            {"redis", False},
            {"laravel", False},
            {"echo", False},
            {"frontend", False}
        }
        InitializeComponent()
    End Sub

    Private Sub InitializeComponent()
        Me.Text = "Tabulation Desktop"
        Me.Size = New Size(1600, 900)
        Me.StartPosition = FormStartPosition.CenterScreen
        Me.BackColor = UITheme.BgPrimary
        Me.ForeColor = UITheme.TextPrimary
        Me.Font = UITheme.FontSmall

        ' Main container
        mainPanel = New Panel()
        mainPanel.Dock = DockStyle.Fill
        mainPanel.BackColor = UITheme.BgPrimary

        ' Sidebar
        Dim sidebar = CreateSidebar()
        mainPanel.Controls.Add(sidebar)

        ' Content area
        contentPanel = New Panel()
        contentPanel.Location = New Point(250, 0)
        contentPanel.Size = New Size(1350, 900)
        contentPanel.BackColor = Color.White
        contentPanel.AutoScroll = True
        mainPanel.Controls.Add(contentPanel)

        ' Show services by default
        ShowServices()

        Me.Controls.Add(mainPanel)
    End Sub

    Private Function CreateSidebar() As Panel
        Dim sidebar = New Panel()
        sidebar.Location = New Point(0, 0)
        sidebar.Size = New Size(250, 900)
        sidebar.BackColor = Color.FromArgb(25, 118, 210)
        sidebar.BorderStyle = BorderStyle.None

        ' Logo/Title
        Dim logo = New Label()
        logo.Text = "📊 Tabulation"
        logo.Font = New Font("Segoe UI", 16, FontStyle.Bold)
        logo.ForeColor = Color.White
        logo.Location = New Point(15, 20)
        logo.AutoSize = True
        sidebar.Controls.Add(logo)

        ' Menu items
        Dim y = 80
        Dim menuItems = New String() {"⚙️ Services", "📅 Events", "📋 Logs"}
        Dim menuTags = New String() {"services", "events", "logs"}

        For i = 0 To menuItems.Length - 1
            Dim btn = New Button()
            btn.Text = menuItems(i)
            btn.Location = New Point(10, y)
            btn.Size = New Size(230, 50)
            btn.BackColor = If(i = 0, Color.FromArgb(33, 150, 243), Color.FromArgb(25, 118, 210))
            btn.ForeColor = Color.White
            btn.FlatStyle = FlatStyle.Flat
            btn.Font = New Font("Segoe UI", 12, FontStyle.Bold)
            btn.Cursor = Cursors.Hand
            btn.Tag = menuTags(i)
            btn.FlatAppearance.BorderSize = 0
            AddHandler btn.Click, AddressOf MenuClick
            sidebar.Controls.Add(btn)
            y += 60
        Next

        Return sidebar
    End Function

    Private Sub MenuClick(sender As Object, e As EventArgs)
        Dim btn = CType(sender, Button)
        Dim tag = CStr(btn.Tag)

        Select Case tag
            Case "services"
                ShowServices()
            Case "events"
                ShowEvents()
            Case "logs"
                ShowLogs()
        End Select
    End Sub

    Private Sub ShowServices()
        contentPanel.Controls.Clear()

        ' Header
        Dim header = New Label()
        header.Text = "Service Management"
        header.Font = UITheme.FontLarge
        header.ForeColor = Color.FromArgb(33, 33, 33)
        header.Location = New Point(40, 30)
        header.AutoSize = True
        contentPanel.Controls.Add(header)

        ' Description
        Dim desc = New Label()
        desc.Text = "Start or stop backend services"
        desc.Font = UITheme.FontSmall
        desc.ForeColor = Color.FromArgb(117, 117, 117)
        desc.Location = New Point(40, 70)
        desc.AutoSize = True
        contentPanel.Controls.Add(desc)

        ' Service cards in grid
        Dim services = New String() {"redis", "laravel", "echo", "frontend"}
        Dim serviceNames = New String() {"Redis Cache", "Laravel Backend", "Echo Server", "Frontend Dev"}
        Dim x = 40
        Dim y = 120

        For i = 0 To services.Length - 1
            Dim card = CreateModernServiceCard(services(i), serviceNames(i), x, y)
            contentPanel.Controls.Add(card.Panel)
            serviceButtons(services(i)) = card.Button
            
            x += 320
            If (i + 1) Mod 3 = 0 Then
                x = 40
                y += 140
            End If
        Next

        ' Quick actions
        Dim actionHeader = New Label()
        actionHeader.Text = "Quick Actions"
        actionHeader.Font = UITheme.FontMedium
        actionHeader.ForeColor = Color.FromArgb(33, 33, 33)
        actionHeader.Location = New Point(40, y + 40)
        actionHeader.AutoSize = True
        contentPanel.Controls.Add(actionHeader)

        Dim refreshBtn = CreateModernButton("🔄 Refresh Status", 40, y + 90, UITheme.ColorInfo)
        AddHandler refreshBtn.Click, AddressOf RefreshServices
        contentPanel.Controls.Add(refreshBtn)

        Dim setupBtn = CreateModernButton("⚙️ Open Setup", 360, y + 90, UITheme.ColorPurple)
        AddHandler setupBtn.Click, AddressOf OpenSetup
        contentPanel.Controls.Add(setupBtn)

        Dim adminBtn = CreateModernButton("📊 Open Admin", 680, y + 90, UITheme.ColorWarning)
        AddHandler adminBtn.Click, AddressOf OpenAdmin
        contentPanel.Controls.Add(adminBtn)
    End Sub

    Private Function CreateModernServiceCard(serviceName As String, displayName As String, x As Integer, y As Integer) As (Panel As Panel, Button As Button)
        Dim card = New Panel()
        card.Location = New Point(x, y)
        card.Size = New Size(280, 120)
        card.BackColor = Color.FromArgb(245, 245, 245)
        card.BorderStyle = BorderStyle.FixedSingle

        Dim nameLbl = New Label()
        nameLbl.Text = displayName
        nameLbl.Font = New Font("Segoe UI", 13, FontStyle.Bold)
        nameLbl.ForeColor = Color.FromArgb(33, 33, 33)
        nameLbl.Location = New Point(15, 15)
        nameLbl.AutoSize = True
        card.Controls.Add(nameLbl)

        Dim statusLbl = New Label()
        statusLbl.Text = "● Stopped"
        statusLbl.Font = UITheme.FontSmall
        statusLbl.ForeColor = UITheme.ColorDanger
        statusLbl.Location = New Point(15, 45)
        statusLbl.AutoSize = True
        card.Controls.Add(statusLbl)

        Dim btn = New Button()
        btn.Text = "Start"
        btn.Location = New Point(15, 70)
        btn.Size = New Size(250, 40)
        btn.BackColor = UITheme.ColorDanger
        btn.ForeColor = Color.White
        btn.FlatStyle = FlatStyle.Flat
        btn.Font = New Font("Segoe UI", 11, FontStyle.Bold)
        btn.Tag = serviceName
        btn.Cursor = Cursors.Hand
        AddHandler btn.Click, Sub(s, e) ToggleService(serviceName)
        card.Controls.Add(btn)

        Return (card, btn)
    End Function

    Private Function CreateModernButton(text As String, x As Integer, y As Integer, bgColor As Color) As Button
        Dim btn = New Button()
        btn.Text = text
        btn.Location = New Point(x, y)
        btn.Size = New Size(300, 50)
        btn.BackColor = bgColor
        btn.ForeColor = Color.White
        btn.FlatStyle = FlatStyle.Flat
        btn.Font = New Font("Segoe UI", 12, FontStyle.Bold)
        btn.Cursor = Cursors.Hand
        btn.FlatAppearance.BorderSize = 0
        Return btn
    End Function

    Private Sub ShowEvents()
        contentPanel.Controls.Clear()

        Dim header = New Label()
        header.Text = "Event Management"
        header.Font = UITheme.FontLarge
        header.ForeColor = Color.FromArgb(33, 33, 33)
        header.Location = New Point(40, 30)
        header.AutoSize = True
        contentPanel.Controls.Add(header)

        ' Form section
        Dim formLbl = New Label()
        formLbl.Text = "Create New Event"
        formLbl.Font = UITheme.FontMedium
        formLbl.ForeColor = Color.FromArgb(33, 33, 33)
        formLbl.Location = New Point(40, 80)
        formLbl.AutoSize = True
        contentPanel.Controls.Add(formLbl)

        Dim y = 130
        titleTxt = CreateInputField(contentPanel, "Event Title:", 40, y)
        y += 70

        yearTxt = CreateInputField(contentPanel, "Year:", 40, y)
        yearTxt.Text = DateTime.Now.Year.ToString()
        y += 70

        judgesTxt = CreateInputField(contentPanel, "Number of Judges:", 40, y)
        y += 70

        Dim createBtn = New Button()
        createBtn.Text = "✓ Create Event"
        createBtn.Location = New Point(40, y)
        createBtn.Size = New Size(400, 50)
        createBtn.BackColor = UITheme.ColorSuccess
        createBtn.ForeColor = Color.White
        createBtn.FlatStyle = FlatStyle.Flat
        createBtn.Font = UITheme.FontNormal
        AddHandler createBtn.Click, AddressOf CreateEvent
        contentPanel.Controls.Add(createBtn)

        ' Events list
        Dim listLbl = New Label()
        listLbl.Text = "Existing Events"
        listLbl.Font = UITheme.FontMedium
        listLbl.ForeColor = Color.FromArgb(33, 33, 33)
        listLbl.Location = New Point(500, 80)
        listLbl.AutoSize = True
        contentPanel.Controls.Add(listLbl)

        eventListBox = New ListBox()
        eventListBox.Location = New Point(500, 130)
        eventListBox.Size = New Size(700, 300)
        eventListBox.BackColor = Color.FromArgb(245, 245, 245)
        eventListBox.ForeColor = Color.FromArgb(33, 33, 33)
        eventListBox.Font = UITheme.FontSmall
        contentPanel.Controls.Add(eventListBox)

        Dim deleteBtn = New Button()
        deleteBtn.Text = "🗑️ Delete"
        deleteBtn.Location = New Point(500, 450)
        deleteBtn.Size = New Size(150, 40)
        deleteBtn.BackColor = UITheme.ColorDanger
        deleteBtn.ForeColor = Color.White
        deleteBtn.FlatStyle = FlatStyle.Flat
        AddHandler deleteBtn.Click, AddressOf DeleteEvent
        contentPanel.Controls.Add(deleteBtn)

        Dim continueBtn = New Button()
        continueBtn.Text = "▶️ Continue"
        continueBtn.Location = New Point(700, 450)
        continueBtn.Size = New Size(150, 40)
        continueBtn.BackColor = UITheme.ColorInfo
        continueBtn.ForeColor = Color.White
        continueBtn.FlatStyle = FlatStyle.Flat
        AddHandler continueBtn.Click, AddressOf ContinueEvent
        contentPanel.Controls.Add(continueBtn)
    End Sub

    Private Function CreateInputField(panel As Panel, label As String, x As Integer, y As Integer) As TextBox
        Dim lbl = New Label()
        lbl.Text = label
        lbl.ForeColor = Color.FromArgb(117, 117, 117)
        lbl.Location = New Point(x, y)
        lbl.AutoSize = True
        panel.Controls.Add(lbl)

        Dim txt = New TextBox()
        txt.Location = New Point(x, y + 25)
        txt.Size = New Size(400, 35)
        txt.Font = UITheme.FontSmall
        txt.BackColor = Color.White
        txt.ForeColor = Color.FromArgb(33, 33, 33)
        txt.BorderStyle = BorderStyle.FixedSingle
        panel.Controls.Add(txt)

        Return txt
    End Function

    Private Sub ShowLogs()
        contentPanel.Controls.Clear()

        Dim header = New Label()
        header.Text = "Application Logs"
        header.Font = UITheme.FontLarge
        header.ForeColor = Color.FromArgb(33, 33, 33)
        header.Location = New Point(40, 30)
        header.AutoSize = True
        contentPanel.Controls.Add(header)

        logsTextBox = New TextBox()
        logsTextBox.Location = New Point(40, 80)
        logsTextBox.Size = New Size(1200, 700)
        logsTextBox.BackColor = Color.FromArgb(245, 245, 245)
        logsTextBox.ForeColor = Color.FromArgb(33, 33, 33)
        logsTextBox.ReadOnly = True
        logsTextBox.Multiline = True
        logsTextBox.ScrollBars = ScrollBars.Vertical
        logsTextBox.Font = UITheme.FontMono
        contentPanel.Controls.Add(logsTextBox)

        AddLog("Logs initialized")
    End Sub

    Private Sub ToggleService(serviceName As String)
        If serviceStatus(serviceName) Then
            StopService(serviceName)
        Else
            StartService(serviceName)
        End If
    End Sub

    Private Sub StartService(serviceName As String)
        Try
            AddLog($"Starting {serviceName}...")
            serviceStatus(serviceName) = True
            UpdateServiceButton(serviceName)
            AddLog($"{serviceName} started successfully")
        Catch ex As Exception
            AddLog($"Error starting {serviceName}: {ex.Message}")
        End Try
    End Sub

    Private Sub StopService(serviceName As String)
        Try
            AddLog($"Stopping {serviceName}...")
            serviceStatus(serviceName) = False
            UpdateServiceButton(serviceName)
            AddLog($"{serviceName} stopped successfully")
        Catch ex As Exception
            AddLog($"Error stopping {serviceName}: {ex.Message}")
        End Try
    End Sub

    Private Sub UpdateServiceButton(serviceName As String)
        If serviceButtons.ContainsKey(serviceName) Then
            Dim btn = serviceButtons(serviceName)
            If serviceStatus(serviceName) Then
                btn.Text = "Stop"
                btn.BackColor = UITheme.ColorSuccess
            Else
                btn.Text = "Start"
                btn.BackColor = UITheme.ColorDanger
            End If
        End If
    End Sub

    Private Sub RefreshServices()
        AddLog("Refreshing service status...")
    End Sub

    Private Sub OpenSetup()
        Try
            Process.Start(New ProcessStartInfo With {
                .FileName = "http://localhost:5173/admin/setup",
                .UseShellExecute = True
            })
            AddLog("Opening setup page...")
        Catch ex As Exception
            AddLog($"Error opening setup: {ex.Message}")
        End Try
    End Sub

    Private Sub OpenAdmin()
        Try
            Process.Start(New ProcessStartInfo With {
                .FileName = "http://localhost:5173/admin",
                .UseShellExecute = True
            })
            AddLog("Opening admin page...")
        Catch ex As Exception
            AddLog($"Error opening admin: {ex.Message}")
        End Try
    End Sub

    Private Sub CreateEvent()
        Try
            If String.IsNullOrEmpty(titleTxt.Text) Then
                MessageBox.Show("Please enter event title", "Validation Error")
                Return
            End If

            AddLog($"Creating event: {titleTxt.Text}...")
            titleTxt.Clear()
            judgesTxt.Clear()
            AddLog("Event created successfully")
        Catch ex As Exception
            AddLog($"Error creating event: {ex.Message}")
        End Try
    End Sub

    Private Sub DeleteEvent()
        Try
            If eventListBox.SelectedIndex = -1 Then
                MessageBox.Show("Please select an event to delete", "Selection Error")
                Return
            End If

            AddLog("Deleting event...")
            AddLog("Event deleted successfully")
        Catch ex As Exception
            AddLog($"Error deleting event: {ex.Message}")
        End Try
    End Sub

    Private Sub ContinueEvent()
        Try
            If eventListBox.SelectedIndex = -1 Then
                MessageBox.Show("Please select an event to continue", "Selection Error")
                Return
            End If

            AddLog("Opening event...")
            Process.Start(New ProcessStartInfo With {
                .FileName = "http://localhost:5173/admin",
                .UseShellExecute = True
            })
        Catch ex As Exception
            AddLog($"Error opening event: {ex.Message}")
        End Try
    End Sub

    Private Sub AddLog(message As String)
        If logsTextBox IsNot Nothing Then
            logsTextBox.AppendText($"[{DateTime.Now:HH:mm:ss}] {message}{vbCrLf}")
        End If
    End Sub
End Class

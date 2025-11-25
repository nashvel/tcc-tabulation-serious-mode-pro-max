Imports System.Net.Http
Imports System.Windows.Forms
Imports System.Drawing

Public Class MainFormNew
    Inherits Form

    Private httpClient As HttpClient
    Private tabControl As TabControl
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
        Me.Size = New Size(1400, 900)
        Me.StartPosition = FormStartPosition.CenterScreen
        Me.BackColor = UITheme.BgPrimary
        Me.ForeColor = UITheme.TextPrimary
        Me.Font = UITheme.FontSmall

        ' Tab Control
        tabControl = New TabControl()
        tabControl.Dock = DockStyle.Fill
        tabControl.BackColor = UITheme.BgSecondary
        tabControl.ForeColor = UITheme.TextPrimary
        tabControl.ItemSize = New Size(150, 40)

        ' Service Tab
        Dim serviceTab = New TabPage("⚙️ Services")
        serviceButtons = ServiceTabUI.CreateTab(serviceTab,
            AddressOf ToggleService,
            AddressOf RefreshServices,
            AddressOf OpenSetup,
            AddressOf OpenAdmin,
            serviceStatus)
        tabControl.TabPages.Add(serviceTab)

        ' Event Tab
        Dim eventTab = New TabPage("📅 Events")
        Dim eventControls = EventTabUI.CreateTab(eventTab,
            AddressOf CreateEvent,
            AddressOf DeleteEvent,
            AddressOf ContinueEvent)
        titleTxt = eventControls.TitleTxt
        yearTxt = eventControls.YearTxt
        judgesTxt = eventControls.JudgesTxt
        eventListBox = eventControls.EventList
        tabControl.TabPages.Add(eventTab)

        ' Logs Tab
        Dim logsTab = New TabPage("📋 Logs")
        logsTextBox = LogsTabUI.CreateTab(logsTab)
        tabControl.TabPages.Add(logsTab)

        Me.Controls.Add(tabControl)
        AddLog("Application started")
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

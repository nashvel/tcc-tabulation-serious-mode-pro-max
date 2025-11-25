Imports System.Windows.Forms
Imports System.Drawing

Public Class ServiceTabUI
    Public Shared Function CreateTab(tabPage As TabPage, 
                                    onToggleService As Action(Of String),
                                    onRefresh As Action,
                                    onOpenSetup As Action,
                                    onOpenAdmin As Action,
                                    serviceStatus As Dictionary(Of String, Boolean)) As Dictionary(Of String, Button)
        
        Dim mainPanel = New Panel()
        mainPanel.Dock = DockStyle.Fill
        mainPanel.BackColor = UITheme.BgPrimary
        mainPanel.AutoScroll = True

        ' Container panel for centering
        Dim container = New Panel()
        container.BackColor = UITheme.BgPrimary
        container.Width = 1000
        container.Height = 900
        container.Location = New Point(50, 30)

        ' Header
        Dim headerLbl = New Label()
        headerLbl.Text = "⚙️ Service Management"
        headerLbl.Font = UITheme.FontLarge
        headerLbl.ForeColor = UITheme.TextPrimary
        headerLbl.Location = New Point(0, 0)
        headerLbl.AutoSize = True
        container.Controls.Add(headerLbl)

        ' Description
        Dim descLbl = New Label()
        descLbl.Text = "Start or stop backend services"
        descLbl.Font = UITheme.FontSmall
        descLbl.ForeColor = UITheme.TextSecondary
        descLbl.Location = New Point(0, 45)
        descLbl.AutoSize = True
        container.Controls.Add(descLbl)

        ' Service cards
        Dim serviceButtons = New Dictionary(Of String, Button)
        Dim y = 90
        Dim services = New String() {"redis", "laravel", "echo", "frontend"}
        Dim serviceNames = New String() {"Redis Cache", "Laravel Backend", "Echo Server", "Frontend Dev"}
        
        For i = 0 To services.Length - 1
            Dim card = CreateServiceCard(services(i), serviceNames(i), 0, y, onToggleService, serviceStatus)
            container.Controls.Add(card.Panel)
            serviceButtons(services(i)) = card.Button
            y += 100
        Next

        ' Action buttons section
        Dim actionLbl = New Label()
        actionLbl.Text = "Quick Actions"
        actionLbl.Font = UITheme.FontMedium
        actionLbl.ForeColor = UITheme.TextPrimary
        actionLbl.Location = New Point(0, y + 30)
        actionLbl.AutoSize = True
        container.Controls.Add(actionLbl)

        Dim refreshBtn = CreateActionButton("🔄 Refresh", 0, y + 70, UITheme.ColorInfo)
        AddHandler refreshBtn.Click, Sub(s, e) onRefresh()
        container.Controls.Add(refreshBtn)

        Dim setupBtn = CreateActionButton("⚙️ Setup", 320, y + 70, UITheme.ColorPurple)
        AddHandler setupBtn.Click, Sub(s, e) onOpenSetup()
        container.Controls.Add(setupBtn)

        Dim adminBtn = CreateActionButton("📊 Admin", 640, y + 70, UITheme.ColorWarning)
        AddHandler adminBtn.Click, Sub(s, e) onOpenAdmin()
        container.Controls.Add(adminBtn)

        mainPanel.Controls.Add(container)
        tabPage.Controls.Add(mainPanel)
        Return serviceButtons
    End Function

    Private Shared Function CreateServiceCard(serviceName As String, displayName As String, x As Integer, y As Integer,
                                             onToggle As Action(Of String),
                                             serviceStatus As Dictionary(Of String, Boolean)) As (Panel As Panel, Button As Button)
        Dim card = New Panel()
        card.Location = New Point(x, y)
        card.Size = New Size(950, 90)
        card.BackColor = UITheme.BgSecondary
        card.BorderStyle = BorderStyle.None
        card.Padding = New Padding(25)

        Dim nameLbl = New Label()
        nameLbl.Text = displayName
        nameLbl.Font = New Font("Segoe UI", 14, FontStyle.Bold)
        nameLbl.ForeColor = UITheme.TextPrimary
        nameLbl.Location = New Point(25, 15)
        nameLbl.AutoSize = True
        card.Controls.Add(nameLbl)

        Dim statusLbl = New Label()
        statusLbl.Text = "● Stopped"
        statusLbl.Font = UITheme.FontSmall
        statusLbl.ForeColor = UITheme.ColorDanger
        statusLbl.Location = New Point(25, 50)
        statusLbl.AutoSize = True
        card.Controls.Add(statusLbl)

        Dim btn = New Button()
        btn.Text = "Start"
        btn.Location = New Point(850, 25)
        btn.Size = New Size(90, 45)
        btn.BackColor = UITheme.ColorDanger
        btn.ForeColor = Color.White
        btn.FlatStyle = FlatStyle.Flat
        btn.Font = New Font("Segoe UI", 11, FontStyle.Bold)
        btn.Tag = serviceName
        btn.Cursor = Cursors.Hand
        AddHandler btn.Click, Sub(s, e) onToggle(serviceName)
        card.Controls.Add(btn)

        Return (card, btn)
    End Function

    Private Shared Function CreateActionButton(text As String, x As Integer, y As Integer, bgColor As Color) As Button
        Dim btn = New Button()
        btn.Text = text
        btn.Location = New Point(x, y)
        btn.Size = New Size(290, 55)
        btn.BackColor = bgColor
        btn.ForeColor = Color.White
        btn.FlatStyle = FlatStyle.Flat
        btn.Font = New Font("Segoe UI", 13, FontStyle.Bold)
        btn.Cursor = Cursors.Hand
        btn.FlatAppearance.BorderSize = 0
        Return btn
    End Function
End Class
